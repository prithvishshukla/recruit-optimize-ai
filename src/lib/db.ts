import { supabase } from "./supabase";

// Define TypeScript interfaces for our database records
export interface DbUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface DbSubscription {
  id: string;
  user_id: string;
  plan_type: "free" | "premium";
  status: "active" | "past_due" | "canceled";
  current_period_end?: string;
  updated_at: string;
}

export interface DbResume {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  cloudinary_url: string;
  cloudinary_public_id: string;
  extracted_text: string;
  created_at: string;
}

export interface DbAnalysisReport {
  id: string;
  user_id: string;
  resume_id: string;
  job_title: string;
  job_description: string;
  ats_score: number;
  jd_match: number;
  resume_health: number;
  keyword_coverage: number;
  analysis_result: any;
  created_at: string;
}

export interface DbResumeVersion {
  id: string;
  resume_id: string;
  user_id: string;
  version_number: number;
  ats_score: number;
  jd_match: number;
  resume_health: number;
  improvement_summary?: string;
  created_at: string;
}

export interface DbPayment {
  id: string;
  user_id: string;
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  amount: number;
  plan: string;
  status: string;
  created_at: string;
}

export interface DbActivityLog {
  id: string;
  user_id: string;
  action: string;
  details?: string;
  created_at: string;
}

export interface DbKeywordAnalysis {
  id: string;
  analysis_id: string;
  keyword: string;
  type: "found" | "missing";
  created_at: string;
}

export interface DbScoreHistory {
  id: string;
  user_id: string;
  ats_score: number;
  jd_match: number;
  resume_health: number;
  created_at: string;
}

// Local Storage Helper utilities
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`tf_ats_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key ${key}:`, error);
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`tf_ats_${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing localStorage key ${key}:`, error);
  }
}

// Error checker to identify missing tables
function isMissingTableError(error: any): boolean {
  if (!error) return false;
  const message = error.message || "";
  const code = error.code || "";
  return (
    message.includes("relation") ||
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    code === "PGRST815" ||
    code === "42P01"
  );
}

// Centralized database operations with transparent LocalStorage fallbacks
export const db = {
  // 1. User profile actions
  getUserProfile: async (userId: string, userEmail?: string): Promise<DbUser> => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();

      if (error) throw error;
      return data as DbUser;
    } catch (error: any) {
      if (isMissingTableError(error)) {
        console.warn("[DB Fallback] public.users table not found, loading from local storage.");
        const users = getLocalItem<DbUser[]>("users", []);
        let localUser = users.find((u) => u.id === userId);
        if (!localUser) {
          // Initialize mock user
          localUser = {
            id: userId,
            email: userEmail || "developer@example.com",
            full_name: (userEmail || "Developer").split("@")[0],
            role: "admin", // Default local dev to admin so they can test everything
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          users.push(localUser);
          setLocalItem("users", users);
        }
        return localUser;
      }
      throw error;
    }
  },

  // 2. Subscription actions
  getUserSubscription: async (userId: string): Promise<DbSubscription> => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data as DbSubscription;
    } catch (error: any) {
      if (isMissingTableError(error)) {
        console.warn(
          "[DB Fallback] public.subscriptions table not found, loading from local storage.",
        );
        const subs = getLocalItem<DbSubscription[]>("subscriptions", []);
        let localSub = subs.find((s) => s.user_id === userId);
        if (!localSub) {
          localSub = {
            id: "sub_" + Math.random().toString(36).substr(2, 9),
            user_id: userId,
            plan_type: "free",
            status: "active",
            updated_at: new Date().toISOString(),
          };
          subs.push(localSub);
          setLocalItem("subscriptions", subs);
        }
        return localSub;
      }
      throw error;
    }
  },

  upsertSubscription: async (
    userId: string,
    planType: "free" | "premium",
    periodEnd?: string,
  ): Promise<DbSubscription> => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: userId,
          plan_type: planType,
          status: "active",
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as DbSubscription;
    } catch (error: any) {
      if (isMissingTableError(error)) {
        console.warn(
          "[DB Fallback] public.subscriptions table not found, saving to local storage.",
        );
        const subs = getLocalItem<DbSubscription[]>("subscriptions", []);
        const index = subs.findIndex((s) => s.user_id === userId);
        const sub: DbSubscription = {
          id: subs[index]?.id || "sub_" + Math.random().toString(36).substr(2, 9),
          user_id: userId,
          plan_type: planType,
          status: "active",
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        };

        if (index > -1) {
          subs[index] = sub;
        } else {
          subs.push(sub);
        }
        setLocalItem("subscriptions", subs);
        return sub;
      }
      throw error;
    }
  },

  // 3. Resume actions
  insertResume: async (resume: Omit<DbResume, "id" | "created_at">): Promise<DbResume> => {
    try {
      const { data, error } = await supabase.from("resumes").insert(resume).select().single();

      if (error) throw error;
      return data as DbResume;
    } catch (error: any) {
      if (isMissingTableError(error)) {
        console.warn("[DB Fallback] public.resumes table not found, saving to local storage.");
        const resumes = getLocalItem<DbResume[]>("resumes", []);
        const newResume: DbResume = {
          ...resume,
          id: "res_" + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
        };
        resumes.push(newResume);
        setLocalItem("resumes", resumes);
        return newResume;
      }
      throw error;
    }
  },

  // 4. Analysis Reports actions
  getUserReports: async (userId: string): Promise<DbAnalysisReport[]> => {
    try {
      const { data, error } = await supabase
        .from("analysis_reports")
        .select("*, resumes(file_name, file_size)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DbAnalysisReport[];
    } catch (error: any) {
      if (isMissingTableError(error)) {
        console.warn(
          "[DB Fallback] public.analysis_reports table not found, loading from local storage.",
        );
        const reports = getLocalItem<DbAnalysisReport[]>("analysis_reports", []);
        const userReports = reports.filter((r) => r.user_id === userId);

        // Mock the relationship with resumes
        const resumes = getLocalItem<DbResume[]>("resumes", []);
        return userReports.map((r) => {
          const matchResume = resumes.find((res) => res.id === r.resume_id);
          return {
            ...r,
            resumes: matchResume
              ? { file_name: matchResume.file_name, file_size: matchResume.file_size }
              : null,
          };
        }) as any[];
      }
      throw error;
    }
  },

  getReportDetail: async (reportId: string): Promise<DbAnalysisReport> => {
    try {
      const { data, error } = await supabase
        .from("analysis_reports")
        .select("*, resumes(file_name, file_size)")
        .eq("id", reportId)
        .single();

      if (error) throw error;
      return data as DbAnalysisReport;
    } catch (error: any) {
      if (isMissingTableError(error)) {
        console.warn(
          "[DB Fallback] public.analysis_reports table not found, loading detail from local storage.",
        );
        const reports = getLocalItem<DbAnalysisReport[]>("analysis_reports", []);
        const report = reports.find((r) => r.id === reportId);
        if (!report) throw new Error("Report not found in local storage fallback");

        const resumes = getLocalItem<DbResume[]>("resumes", []);
        const matchResume = resumes.find((res) => res.id === report.resume_id);
        return {
          ...report,
          resumes: matchResume
            ? { file_name: matchResume.file_name, file_size: matchResume.file_size }
            : null,
        } as any;
      }
      throw error;
    }
  },

  insertAnalysisReport: async (
    report: Omit<DbAnalysisReport, "id" | "created_at">,
  ): Promise<DbAnalysisReport> => {
    try {
      const { data, error } = await supabase
        .from("analysis_reports")
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      return data as DbAnalysisReport;
    } catch (error: any) {
      if (isMissingTableError(error)) {
        console.warn(
          "[DB Fallback] public.analysis_reports table not found, saving to local storage.",
        );
        const reports = getLocalItem<DbAnalysisReport[]>("analysis_reports", []);
        const newReport: DbAnalysisReport = {
          ...report,
          id: "rep_" + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
        };
        reports.push(newReport);
        setLocalItem("analysis_reports", reports);

        // Also populate keyword_analysis table locally
        const keywords = getLocalItem<DbKeywordAnalysis[]>("keyword_analysis", []);
        const found = report.analysis_result?.foundKeywords || [];
        const missing = report.analysis_result?.missingKeywords || [];

        found.forEach((k: string) => {
          keywords.push({
            id: "kw_" + Math.random().toString(36).substr(2, 9),
            analysis_id: newReport.id,
            keyword: k,
            type: "found",
            created_at: new Date().toISOString(),
          });
        });

        missing.forEach((k: string) => {
          keywords.push({
            id: "kw_" + Math.random().toString(36).substr(2, 9),
            analysis_id: newReport.id,
            keyword: k,
            type: "missing",
            created_at: new Date().toISOString(),
          });
        });

        setLocalItem("keyword_analysis", keywords);

        // Also populate score_history table locally
        const scoreHistories = getLocalItem<DbScoreHistory[]>("score_history", []);
        scoreHistories.push({
          id: "sh_" + Math.random().toString(36).substr(2, 9),
          user_id: report.user_id,
          ats_score: report.ats_score,
          jd_match: report.jd_match,
          resume_health: report.resume_health,
          created_at: new Date().toISOString(),
        });
        setLocalItem("score_history", scoreHistories);

        return newReport;
      }
      throw error;
    }
  },

  // 5. Resume Versions actions
  insertResumeVersion: async (
    version: Omit<DbResumeVersion, "id" | "created_at">,
  ): Promise<DbResumeVersion> => {
    try {
      const { data, error } = await supabase
        .from("resume_versions")
        .insert(version)
        .select()
        .single();

      if (error) throw error;
      return data as DbResumeVersion;
    } catch (error: any) {
      if (isMissingTableError(error)) {
        console.warn(
          "[DB Fallback] public.resume_versions table not found, saving to local storage.",
        );
        const versions = getLocalItem<DbResumeVersion[]>("resume_versions", []);
        const newVersion: DbResumeVersion = {
          ...version,
          id: "ver_" + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
        };
        versions.push(newVersion);
        setLocalItem("resume_versions", versions);
        return newVersion;
      }
      throw error;
    }
  },

  // 6. Payments actions
  insertPayment: async (payment: Omit<DbPayment, "id" | "created_at">): Promise<DbPayment> => {
    try {
      const { data, error } = await supabase.from("payments").insert(payment).select().single();

      if (error) throw error;
      return data as DbPayment;
    } catch (error: any) {
      if (isMissingTableError(error)) {
        console.warn("[DB Fallback] public.payments not found, saving to local storage.");
        const payments = getLocalItem<DbPayment[]>("payments", []);
        const newPayment: DbPayment = {
          ...payment,
          id: "pay_" + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
        };
        payments.push(newPayment);
        setLocalItem("payments", payments);
        return newPayment;
      }
      throw error;
    }
  },

  getAdminPayments: async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*, profiles(email)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error: any) {
      if (isMissingTableError(error)) {
        console.warn("[DB Fallback] public.payments loading history from local storage.");
        const payments = getLocalItem<DbPayment[]>("payments", []);
        const users = getLocalItem<DbUser[]>("users", []);

        return payments.map((p) => {
          const matchUser = users.find((u) => u.id === p.user_id);
          return {
            ...p,
            profiles: matchUser ? { email: matchUser.email } : { email: "local@example.com" },
          };
        });
      }
      throw error;
    }
  },

  // 7. Activity Log actions
  insertActivityLog: async (
    log: Omit<DbActivityLog, "id" | "created_at">,
  ): Promise<DbActivityLog> => {
    try {
      const { data, error } = await supabase.from("activity_logs").insert(log).select().single();

      if (error) throw error;
      return data as DbActivityLog;
    } catch (error: any) {
      if (isMissingTableError(error)) {
        console.warn(
          "[DB Fallback] public.activity_logs table not found, saving to local storage.",
        );
        const logs = getLocalItem<DbActivityLog[]>("activity_logs", []);
        const newLog: DbActivityLog = {
          ...log,
          id: "log_" + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
        };
        logs.push(newLog);
        setLocalItem("activity_logs", logs);
        return newLog;
      }
      throw error;
    }
  },

  // 8. Admin KPI stats aggregation
  getAdminStats: async (): Promise<{
    totalUsers: number;
    totalRevenue: number;
    totalAnalyses: number;
    activeSubscribers: number;
  }> => {
    try {
      const { count: usersCount } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true });

      const { count: reportsCount } = await supabase
        .from("analysis_reports")
        .select("id", { count: "exact", head: true });

      const { count: activePremium } = await supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("plan_type", "premium");

      const { data: paymentsData } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "success");

      const totalRevenuePaise = paymentsData?.reduce((acc, p) => acc + p.amount, 0) || 0;
      const totalRevenue = totalRevenuePaise / 100;

      return {
        totalUsers: usersCount || 1,
        totalRevenue: totalRevenue || 0,
        totalAnalyses: reportsCount || 0,
        activeSubscribers: activePremium || 0,
      };
    } catch (error: any) {
      if (isMissingTableError(error)) {
        console.warn("[DB Fallback] Aggregating admin stats from local storage.");
        const users = getLocalItem<DbUser[]>("users", []);
        const reports = getLocalItem<DbAnalysisReport[]>("analysis_reports", []);
        const subs = getLocalItem<DbSubscription[]>("subscriptions", []);
        const payments = getLocalItem<DbPayment[]>("payments", []);

        const totalUsers = Math.max(users.length, 1);
        const totalAnalyses = reports.length;
        const activeSubscribers = subs.filter(
          (s) => s.plan_type === "premium" && s.status === "active",
        ).length;
        const totalRevenue =
          payments.filter((p) => p.status === "success").reduce((acc, p) => acc + p.amount, 0) /
          100;

        return {
          totalUsers,
          totalRevenue,
          totalAnalyses,
          activeSubscribers,
        };
      }
      throw error;
    }
  },
};

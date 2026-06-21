import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/db";
import { optimizeBulletPoint } from "@/lib/gemini";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Award,
  Sparkles,
  Lock,
  Download,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  FileText,
  Activity,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

export const Route = createFileRoute("/dashboard/report/$reportId")({
  component: ReportPage,
});

function ReportPage() {
  const { reportId } = useParams({ from: "/dashboard/report/$reportId" });
  const { user } = useAuth();

  // Bullet point optimizer state
  const [inputBullet, setInputBullet] = useState("");
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedBullets, setOptimizedBullets] = useState<string[]>([]);

  // Fetch report
  const {
    data: report,
    isLoading: reportLoading,
    error,
  } = useQuery({
    queryKey: ["reportDetail", reportId],
    queryFn: async () => {
      return db.getReportDetail(reportId);
    },
    enabled: !!reportId,
  });

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return { full_name: "" };
      return db.getUserProfile(user.id, user.email || "");
    },
    enabled: !!user?.id,
  });

  // Fetch subscription
  const { data: subscription } = useQuery({
    queryKey: ["userSubscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return db.getUserSubscription(user.id);
    },
    enabled: !!user?.id,
  });

  const planType = subscription?.plan_type || "free";
  const isPremium = planType === "premium";

  const handleOptimizeBullet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPremium) {
      toast.error("Premium feature", {
        description: "Upgrade to Premium to optimize bullet points.",
      });
      return;
    }
    if (!inputBullet.trim() || inputBullet.length < 10) {
      toast.error("Input too short", {
        description: "Enter a bullet point of at least 10 characters.",
      });
      return;
    }

    setOptimizing(true);
    try {
      const alternatives = await optimizeBulletPoint(inputBullet);
      setOptimizedBullets(alternatives);
      toast.success("Bullet optimized!");
    } catch (err: any) {
      toast.error("Optimization failed", { description: err.message || err });
    } finally {
      setOptimizing(false);
    }
  };

  const handlePrint = () => {
    if (!isPremium) {
      toast.error("Premium feature", {
        description: "Upgrade to Premium to export reports as PDF.",
      });
      return;
    }
    window.print();
  };

  if (reportLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-zinc-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-zinc-800 rounded-2xl" />
          <div className="h-44 bg-zinc-800 rounded-2xl" />
          <div className="h-44 bg-zinc-800 rounded-2xl" />
        </div>
        <div className="h-96 bg-zinc-800 rounded-2xl" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white">Report not found</h2>
        <p className="text-sm text-zinc-400 mt-2">
          The requested analysis report does not exist or you do not have permission to view it.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black mt-6"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const analysis = report.analysis_result;

  // Prepare radar chart data
  const sectionChartData = [
    { subject: "Summary", score: analysis.sectionScores?.summary || 0 },
    { subject: "Skills", score: analysis.sectionScores?.skills || 0 },
    { subject: "Projects", score: analysis.sectionScores?.projects || 0 },
    { subject: "Experience", score: analysis.sectionScores?.experience || 0 },
    { subject: "Education", score: analysis.sectionScores?.education || 0 },
    { subject: "Achievements", score: analysis.sectionScores?.achievements || 0 },
  ];

  return (
    <div className="space-y-10 antialiased selection:bg-[#B8924A]/30">
      {/* Printable Report Styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          aside, header, nav, button, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-card {
            border: 1px solid #e4e4e7 !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }
          .print-text {
            color: #3f3f46 !important;
          }
          .print-title {
            color: black !important;
          }
        }
      `}</style>

      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#B8924A]">
            ATS Audit Report
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white mt-1">
            {report.job_title}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Audited on{" "}
            {new Date(report.created_at).toLocaleDateString(undefined, {
              dateStyle: "medium",
            })}{" "}
            · Resume: {report.resumes?.file_name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-5 text-sm font-semibold text-white transition ${!isPremium && "opacity-50 cursor-not-allowed"}`}
          >
            <Download size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Branded print header */}
      <div className="hidden print:block border-b-2 border-zinc-900 pb-6 mb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-black">TalentForge AI</h1>
            <p className="text-xs text-zinc-600">Applicant Tracking System audit report</p>
          </div>
          <div className="text-right text-xs text-zinc-600">
            <p>
              <strong>Candidate:</strong> {profile?.full_name || user?.email}
            </p>
            <p>
              <strong>Audited Role:</strong> {report.job_title}
            </p>
            <p>
              <strong>Date:</strong> {new Date(report.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Score Blocks */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* ATS Score */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0d0d10] p-6 text-center print-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#B8924A] text-xl font-bold text-white print-text">
            {analysis.atsScore}
          </div>
          <h3 className="mt-4 font-display text-sm font-semibold text-zinc-400 print-text">
            ATS Core Score
          </h3>
          <p className="mt-1 text-[11px] text-zinc-500">
            Overall parser alignment and readability.
          </p>
        </div>

        {/* JD Match */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0d0d10] p-6 text-center print-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#2A8F8B] text-xl font-bold text-white print-text">
            {analysis.jdMatch}%
          </div>
          <h3 className="mt-4 font-display text-sm font-semibold text-zinc-400 print-text">
            Job Match Index
          </h3>
          <p className="mt-1 text-[11px] text-zinc-500">
            Target qualifications and skill set matching.
          </p>
        </div>

        {/* Health */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0d0d10] p-6 text-center print-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-indigo-500 text-xl font-bold text-white print-text">
            {analysis.resumeHealth}
          </div>
          <h3 className="mt-4 font-display text-sm font-semibold text-zinc-400 print-text">
            Resume Health
          </h3>
          <p className="mt-1 text-[11px] text-zinc-500">
            Action verbs density and quantified impact.
          </p>
        </div>

        {/* Keyword Coverage */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0d0d10] p-6 text-center print-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-500 text-xl font-bold text-white print-text">
            {analysis.keywordCoverage}%
          </div>
          <h3 className="mt-4 font-display text-sm font-semibold text-zinc-400 print-text">
            Keyword Coverage
          </h3>
          <p className="mt-1 text-[11px] text-zinc-500">
            Percentage of target description terms matched.
          </p>
        </div>
      </div>

      {/* Main Analysis Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Keywords */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0d0d10] p-6 lg:col-span-2 print-card">
          <h2 className="font-display text-lg font-bold text-white print-title">
            Target Keyword Analysis
          </h2>
          <p className="text-xs text-zinc-400 mb-6 print-text">
            We extracted matching keywords and surfaced critical skill gaps.
          </p>

          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2A8F8B]">
                Matching Keywords ({analysis.foundKeywords?.length || 0})
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.foundKeywords?.map((k: string) => (
                  <span
                    key={k}
                    className="rounded-lg border border-[#2A8F8B]/30 bg-[#2A8F8B]/5 px-3 py-1.5 text-xs font-medium text-[#2A8F8B]"
                  >
                    {k}
                  </span>
                ))}
                {!analysis.foundKeywords?.length && (
                  <span className="text-sm text-zinc-500">No matching keywords detected.</span>
                )}
              </div>
            </div>

            <div className="border-t border-zinc-800/80 pt-5">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                Missing Keywords ({analysis.missingKeywords?.length || 0})
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.missingKeywords?.map((k: string) => (
                  <span
                    key={k}
                    className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-400"
                  >
                    {k}
                  </span>
                ))}
                {!analysis.missingKeywords?.length && (
                  <span className="text-sm text-zinc-500">
                    No missing keywords found! Excellent job.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section Radar chart */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0d0d10] p-6 flex flex-col items-center justify-center print-card">
          <h2 className="w-full text-left font-display text-lg font-bold text-white print-title">
            Section Breakdowns
          </h2>
          <p className="w-full text-left text-xs text-zinc-400 mb-6 print-text">
            Analysis of score distribution across sections.
          </p>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sectionChartData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#52525b" />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#B8924A"
                  fill="#B8924A"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strengths, Weaknesses, Risks */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Strengths */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0d0d10] p-6 print-card">
          <h3 className="font-display text-base font-bold text-white flex items-center gap-2 print-title">
            <CheckCircle2 size={18} className="text-emerald-500" />
            Core Strengths
          </h3>
          <ul className="mt-4 space-y-3 text-xs leading-relaxed text-zinc-300 print-text">
            {analysis.strengths?.map((item: string, i: number) => (
              <li key={i} className="flex gap-2">
                <span className="text-[#B8924A] font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0d0d10] p-6 print-card">
          <h3 className="font-display text-base font-bold text-white flex items-center gap-2 print-title">
            <AlertTriangle size={18} className="text-amber-500" />
            Areas to Improve
          </h3>
          <ul className="mt-4 space-y-3 text-xs leading-relaxed text-zinc-300 print-text">
            {analysis.weaknesses?.map((item: string, i: number) => (
              <li key={i} className="flex gap-2">
                <span className="text-[#B8924A] font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risks */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0d0d10] p-6 print-card">
          <h3 className="font-display text-base font-bold text-white flex items-center gap-2 print-title">
            <AlertTriangle size={18} className="text-red-500" />
            ATS Risks
          </h3>
          <ul className="mt-4 space-y-3 text-xs leading-relaxed text-zinc-300 print-text">
            {analysis.atsRisks?.map((item: string, i: number) => (
              <li key={i} className="flex gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggestions block */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0d0d10] p-6 print-card">
        <h2 className="font-display text-lg font-bold text-white print-title">
          Optimization Advice
        </h2>
        <ol className="mt-4 space-y-4 text-sm text-zinc-300 leading-relaxed print-text">
          {analysis.suggestions?.map((item: string, i: number) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-white print-card">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* AI Resume Rewriter Panel */}
      <div className="relative rounded-2xl border border-zinc-800 bg-[#0d0d10] p-6 no-print">
        {/* Lock screen overlay for free users */}
        {!isPremium && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#09090b]/80 p-6 text-center backdrop-blur-sm rounded-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#B8924A]/10 border border-[#B8924A]/20 text-[#B8924A] mb-4">
              <Lock size={22} />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              Unlock AI Rewrites & Optimization
            </h3>
            <p className="mt-2 max-w-sm text-xs text-zinc-400">
              Upgrade to Premium for side-by-side AI resume section rewrites and ATS bullet point
              optimizations.
            </p>
            <Link
              to="/price"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#B8924A] hover:bg-[#B8924A]/90 px-4 text-xs font-semibold text-black transition mt-4"
            >
              Upgrade Now
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-1 mb-6">
          <h2 className="font-display text-lg font-bold text-white">AI Section Rewriter</h2>
          <p className="text-xs text-zinc-400">
            Recruiter-grade section rewrites generated from your target role requirements.
          </p>
        </div>

        <div className="space-y-6">
          {/* Summary Rewrite */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#B8924A]">
              Optimized Summary Rewrite
            </h4>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm leading-relaxed text-zinc-300">
              {analysis.rewrites?.summary || "No summary rewrite generated."}
            </div>
          </div>

          {/* Side-by-side lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills rewrites */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#B8924A]">
                Skills Bullet Improvements
              </h4>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-2 text-xs leading-relaxed text-zinc-300">
                {analysis.rewrites?.skills?.map((item: string, i: number) => (
                  <p key={i}>• {item}</p>
                ))}
              </div>
            </div>

            {/* Experience rewrites */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#B8924A]">
                Work Experience Optimization
              </h4>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-2 text-xs leading-relaxed text-zinc-300">
                {analysis.rewrites?.experience?.map((item: string, i: number) => (
                  <p key={i}>• {item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bullet Point Optimizer Tool */}
      <div className="relative rounded-2xl border border-zinc-800 bg-[#0d0d10] p-6 no-print">
        {/* Lock screen overlay for free users */}
        {!isPremium && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#09090b]/80 p-6 text-center backdrop-blur-sm rounded-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#B8924A]/10 border border-[#B8924A]/20 text-[#B8924A] mb-4">
              <Lock size={22} />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              Unlock Bullet Point Optimizer
            </h3>
            <p className="mt-2 max-w-sm text-xs text-zinc-400">
              Transform weak experience descriptions into quantified action points with 3 customized
              alternatives.
            </p>
            <Link
              to="/price"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#B8924A] hover:bg-[#B8924A]/90 px-4 text-xs font-semibold text-black transition mt-4"
            >
              Upgrade Now
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-1 mb-6">
          <h2 className="font-display text-lg font-bold text-white">
            Interactive Bullet Optimizer
          </h2>
          <p className="text-xs text-zinc-400">
            Paste a weak resume bullet point to rewrite it using action verbs and metrics.
          </p>
        </div>

        <form onSubmit={handleOptimizeBullet} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. Worked on frontend application and fixed bugs."
            value={inputBullet}
            onChange={(e) => setInputBullet(e.target.value)}
            className="flex-1 h-11 rounded-xl border border-zinc-800 bg-zinc-950/30 px-4 text-sm text-white placeholder-zinc-500 focus:border-[#B8924A] focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={optimizing || !inputBullet}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black hover:bg-zinc-100 transition duration-200 shrink-0"
          >
            {optimizing ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Optimizing...
              </>
            ) : (
              "Optimize Bullet"
            )}
          </button>
        </form>

        {optimizedBullets.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#B8924A]">
              Optimized Alternatives
            </h4>
            <div className="space-y-2">
              {optimizedBullets.map((bullet, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-xs leading-relaxed text-zinc-300"
                >
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

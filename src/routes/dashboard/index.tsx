import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Percent,
  TrendingUp,
  Award,
  Crown,
  Calendar,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { user } = useAuth();

  // Fetch reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["userReports", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const data = await db.getUserReports(user.id);
      // Reverse to chronological order (ascending) for trend chart
      return [...data].reverse();
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

  if (reportsLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 rounded bg-zinc-800" />
          <div className="h-4 w-72 rounded bg-zinc-800" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-zinc-800" />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-zinc-800" />
      </div>
    );
  }

  // Calculate statistics
  const totalScans = reports.length;
  const avgAts = totalScans
    ? Math.round(reports.reduce((acc, r) => acc + r.ats_score, 0) / totalScans)
    : 0;
  const maxAts = totalScans ? Math.max(...reports.map((r) => r.ats_score)) : 0;
  const avgJdMatch = totalScans
    ? Math.round(reports.reduce((acc, r) => acc + r.jd_match, 0) / totalScans)
    : 0;
  const planType = subscription?.plan_type || "free";

  // Prepare chart data
  const chartData = reports.map((r, i) => ({
    name: `Scan ${i + 1}`,
    ATS: r.ats_score,
    Match: r.jd_match,
    Health: r.resume_health,
  }));

  const stats = [
    { label: "Total Scans", value: totalScans, icon: FileText, color: "var(--teal)" },
    { label: "Avg ATS Score", value: `${avgAts}/100`, icon: Award, color: "#B8924A" },
    { label: "Highest ATS", value: `${maxAts}/100`, icon: TrendingUp, color: "var(--coral)" },
    { label: "JD Match Avg", value: `${avgJdMatch}%`, icon: Percent, color: "#2A8F8B" },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Audit Workspace
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Analyze resumes against applicant tracking systems and optimize outcomes.
          </p>
        </div>
        <Link
          to="/dashboard/analyze"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#B8924A] px-5 text-sm font-semibold text-black transition hover:bg-[#B8924A]/90 active:scale-[0.98] self-start md:self-auto shadow-lg shadow-[#B8924A]/10"
        >
          <Sparkles size={16} />
          Scan New Resume
        </Link>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#0d0d10] p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {stat.label}
                </span>
                <Icon size={18} style={{ color: stat.color }} />
              </div>
              <div className="mt-4 font-display text-2xl font-bold text-white tabular-nums">
                {stat.value}
              </div>
            </div>
          );
        })}

        {/* Subscription Status Widget */}
        <div className="relative overflow-hidden rounded-2xl border border-[#B8924A]/20 bg-[#17140f] p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#e6c17e]">
              Plan Tier
            </span>
            <Crown size={18} className="text-[#B8924A]" />
          </div>
          <div className="mt-4 font-display text-2xl font-bold uppercase tracking-tight text-[#B8924A]">
            {planType}
          </div>
          <div className="mt-1.5">
            {planType === "free" ? (
              <Link
                to="/price"
                className="text-[11px] font-semibold text-[#e6c17e] hover:underline flex items-center gap-0.5"
              >
                Upgrade to Premium <ChevronRight size={10} />
              </Link>
            ) : (
              <span className="text-[11px] font-medium text-zinc-400">Unlimited scans active</span>
            )}
          </div>
        </div>
      </div>

      {totalScans === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border border-zinc-800/60 bg-[#0d0d10]/40 p-12 text-center backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800/60 text-zinc-500 mb-5">
            <FileText size={26} />
          </div>
          <h2 className="font-display text-xl font-bold text-white">No scans analyzed yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-400">
            Upload your first resume PDF and paste a job description to get score feedback and AI
            rewriting.
          </p>
          <div className="mt-6">
            <Link
              to="/dashboard/analyze"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-100"
            >
              Analyze Resume Now
            </Link>
          </div>
        </div>
      ) : (
        /* Charts & History */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Trends Chart */}
          <div className="rounded-2xl border border-zinc-800/60 bg-[#0d0d10] p-6 lg:col-span-2">
            <div className="flex flex-col gap-1 mb-6">
              <h2 className="font-display text-lg font-bold text-white">Performance Analytics</h2>
              <p className="text-xs text-zinc-400">
                Track score changes and metrics over consecutive scans.
              </p>
            </div>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B8924A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#B8924A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMatch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2A8F8B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2A8F8B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#52525b" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f0f12",
                      borderColor: "#27272a",
                      borderRadius: "12px",
                      color: "#f4f4f5",
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: "15px" }} />
                  <Area
                    type="monotone"
                    dataKey="ATS"
                    stroke="#B8924A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAts)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Match"
                    stroke="#2A8F8B"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMatch)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Audits Table */}
          <div className="rounded-2xl border border-zinc-800/60 bg-[#0d0d10] p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-display text-lg font-bold text-white">Recent Analyses</h2>
                <p className="text-xs text-zinc-400">Review scores for recent job applications.</p>
              </div>
              <Link
                to="/dashboard/history"
                className="text-xs font-semibold text-[#e6c17e] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[290px]">
              {reports
                .slice(-5)
                .reverse()
                .map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800/40 bg-zinc-900/10 p-3 hover:bg-zinc-900/30 transition duration-200"
                  >
                    <div className="min-w-0 pr-2">
                      <h3 className="text-xs font-bold text-zinc-200 truncate">
                        {report.job_title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-400">
                        <Calendar size={10} />
                        {new Date(report.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-white">
                          {report.ats_score} ATS
                        </div>
                        <div className="text-[10px] font-semibold text-[#2A8F8B]">
                          {report.jd_match}% Match
                        </div>
                      </div>
                      <Link
                        to={`/dashboard/report/${report.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                      >
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

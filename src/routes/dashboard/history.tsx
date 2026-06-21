import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  History,
  TrendingUp,
  Award,
  Sparkles,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  FileCheck,
  Plus,
  Minus,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = useAuth();
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const [isComparing, setIsComparing] = useState(false);

  // Fetch reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["userReports", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return db.getUserReports(user.id);
    },
    enabled: !!user?.id,
  });

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compareA || !compareB) {
      toast.error("Invalid selection", { description: "Please select two scans to compare." });
      return;
    }
    if (compareA === compareB) {
      toast.error("Duplicate selection", {
        description: "Please select different scans to compare.",
      });
      return;
    }
    setIsComparing(true);
  };

  const reportA = reports.find((r) => r.id === compareA);
  const reportB = reports.find((r) => r.id === compareB);

  // Calculate comparison deltas (B - A)
  const getDeltas = () => {
    if (!reportA || !reportB) return null;
    const scoreDelta = reportB.ats_score - reportA.ats_score;
    const matchDelta = reportB.jd_match - reportA.jd_match;
    const healthDelta = reportB.resume_health - reportA.resume_health;

    // Keyword comparisons
    const keywordsA = new Set(reportA.analysis_result?.foundKeywords || []);
    const keywordsB = new Set(reportB.analysis_result?.foundKeywords || []);

    const addedKeywords = [...keywordsB].filter((x) => !keywordsA.has(x));
    const removedKeywords = [...keywordsA].filter((x) => !keywordsB.has(x));

    return {
      scoreDelta,
      matchDelta,
      healthDelta,
      addedKeywords,
      removedKeywords,
    };
  };

  const deltas = getDeltas();

  if (reportsLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-zinc-800 rounded" />
        <div className="h-44 bg-zinc-800 rounded-2xl" />
        <div className="h-80 bg-zinc-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">
          Version History
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Track adjustments, compare resume versions, and audit score progress.
        </p>
      </div>

      {reports.length === 0 ? (
        /* Empty state */
        <div className="rounded-3xl border border-zinc-800 bg-[#0d0d10] p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 mb-5">
            <History size={26} />
          </div>
          <h2 className="font-display text-xl font-bold text-white">No history record</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-400">
            Audit your resume first to populate scan version records.
          </p>
          <div className="mt-6">
            <Link
              to="/dashboard/analyze"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-100"
            >
              Start Analysis
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Version comparison card */}
          {reports.length >= 2 && (
            <div className="rounded-2xl border border-zinc-800 bg-[#0d0d10] p-6 space-y-6">
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-[#B8924A]" />
                  Resume Version Comparison
                </h2>
                <p className="text-xs text-zinc-400">
                  Select two historical audit reports to track score changes and keyword shifts.
                </p>
              </div>

              <form onSubmit={handleCompare} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Base Version (Before)
                  </label>
                  <select
                    value={compareA}
                    onChange={(e) => {
                      setCompareA(e.target.value);
                      setIsComparing(false);
                    }}
                    className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-xs text-white focus:border-[#B8924A] focus:outline-none"
                  >
                    <option value="">Select baseline scan</option>
                    {reports.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.job_title} ({new Date(r.created_at).toLocaleDateString()}) - ATS:{" "}
                        {r.ats_score}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Target Version (After)
                  </label>
                  <select
                    value={compareB}
                    onChange={(e) => {
                      setCompareB(e.target.value);
                      setIsComparing(false);
                    }}
                    className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-xs text-white focus:border-[#B8924A] focus:outline-none"
                  >
                    <option value="">Select optimized scan</option>
                    {reports.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.job_title} ({new Date(r.created_at).toLocaleDateString()}) - ATS:{" "}
                        {r.ats_score}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!compareA || !compareB}
                  className="h-11 self-end bg-white hover:bg-zinc-100 text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 active:scale-[0.98] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
                >
                  Compare Audits
                </button>
              </form>

              {/* Comparison Results */}
              {isComparing && deltas && reportA && reportB && (
                <div className="border-t border-zinc-800/80 pt-6 space-y-6 animate-[fadeIn_0.3s_ease-out]">
                  {/* Scores Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* ATS score delta */}
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/10 p-4 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                          ATS Core Shift
                        </span>
                        <div className="font-display text-lg font-bold text-white mt-1">
                          {reportA.ats_score}{" "}
                          <ArrowRight className="inline h-3.5 w-3.5 mx-1 text-zinc-400" />{" "}
                          {reportB.ats_score}
                        </div>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                          deltas.scoreDelta >= 0
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {deltas.scoreDelta >= 0 ? `+${deltas.scoreDelta}` : deltas.scoreDelta}
                      </span>
                    </div>

                    {/* JD Match delta */}
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/10 p-4 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                          JD Match Shift
                        </span>
                        <div className="font-display text-lg font-bold text-white mt-1">
                          {reportA.jd_match}%{" "}
                          <ArrowRight className="inline h-3.5 w-3.5 mx-1 text-zinc-400" />{" "}
                          {reportB.jd_match}%
                        </div>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                          deltas.matchDelta >= 0
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {deltas.matchDelta >= 0 ? `+${deltas.matchDelta}` : deltas.matchDelta}
                      </span>
                    </div>

                    {/* Health delta */}
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/10 p-4 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                          Resume Health Shift
                        </span>
                        <div className="font-display text-lg font-bold text-white mt-1">
                          {reportA.resume_health}{" "}
                          <ArrowRight className="inline h-3.5 w-3.5 mx-1 text-zinc-400" />{" "}
                          {reportB.resume_health}
                        </div>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                          deltas.healthDelta >= 0
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {deltas.healthDelta >= 0 ? `+${deltas.healthDelta}` : deltas.healthDelta}
                      </span>
                    </div>
                  </div>

                  {/* Keyword updates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Added Keywords */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-5 space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#2A8F8B] flex items-center gap-1.5">
                        <Plus size={14} /> Added target keywords ({deltas.addedKeywords.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {deltas.addedKeywords.map((k) => (
                          <span
                            key={k}
                            className="rounded border border-[#2A8F8B]/30 bg-[#2A8F8B]/5 px-2 py-1 text-[11px] font-medium text-[#2A8F8B]"
                          >
                            {k}
                          </span>
                        ))}
                        {deltas.addedKeywords.length === 0 && (
                          <span className="text-xs text-zinc-500">No new keywords added.</span>
                        )}
                      </div>
                    </div>

                    {/* Removed Keywords */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-5 space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                        <Minus size={14} /> Removed keywords ({deltas.removedKeywords.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {deltas.removedKeywords.map((k) => (
                          <span
                            key={k}
                            className="rounded border border-red-500/20 bg-red-500/5 px-2 py-1 text-[11px] font-medium text-red-400"
                          >
                            {k}
                          </span>
                        ))}
                        {deltas.removedKeywords.length === 0 && (
                          <span className="text-xs text-zinc-500">No keywords removed.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Audit List Table */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d10] p-6">
            <h2 className="font-display text-lg font-bold text-white mb-6">Historical Scans</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 pb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    <th className="pb-3">Position / Job Title</th>
                    <th className="pb-3">Audit Date</th>
                    <th className="pb-3 text-center">ATS Score</th>
                    <th className="pb-3 text-center">JD Match</th>
                    <th className="pb-3 text-center">Health</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-zinc-900/10 transition duration-150">
                      <td className="py-4 font-semibold text-zinc-200">{report.job_title}</td>
                      <td className="py-4 text-zinc-400">
                        {new Date(report.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 text-center tabular-nums text-white font-semibold">
                        {report.ats_score}
                      </td>
                      <td className="py-4 text-center tabular-nums text-[#2A8F8B] font-semibold">
                        {report.jd_match}%
                      </td>
                      <td className="py-4 text-center tabular-nums text-zinc-300">
                        {report.resume_health}
                      </td>
                      <td className="py-4 text-right">
                        <Link
                          to={`/dashboard/report/${report.id}`}
                          className="inline-flex h-8 items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3.5 text-xs font-semibold text-zinc-300 hover:text-white transition"
                        >
                          View Report
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

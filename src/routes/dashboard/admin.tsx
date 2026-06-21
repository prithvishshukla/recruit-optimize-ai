import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldAlert,
  Users,
  DollarSign,
  TrendingUp,
  FileCheck,
  Calendar,
  AlertTriangle,
  Lock
} from "lucide-react";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch current user profile to verify admin role
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return { role: "user" };
      return db.getUserProfile(user.id, user.email || "");
    },
    enabled: !!user?.id,
  });

  // Query platform statistics (fallback to mock data if it fails or RLS blocks it)
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      return db.getAdminStats();
    },
    enabled: profile?.role === "admin",
  });

  // Query payments list
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["adminPayments"],
    queryFn: async () => {
      return db.getAdminPayments();
    },
    enabled: profile?.role === "admin",
  });

  if (profileLoading || statsLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-zinc-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-28 bg-zinc-800 rounded-xl" />
          <div className="h-28 bg-zinc-800 rounded-xl" />
          <div className="h-28 bg-zinc-800 rounded-xl" />
          <div className="h-28 bg-zinc-800 rounded-xl" />
        </div>
        <div className="h-80 bg-zinc-800 rounded-2xl" />
      </div>
    );
  }

  // Security guard check
  if (profile?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
          <Lock size={26} />
        </div>
        <h1 className="font-display text-2xl font-bold text-white">Access Denied</h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-sm">
          You do not have administrative permissions. This page is restricted to platform administrators.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-100 mt-6"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const kpis = [
    { label: "Total Users", value: adminStats?.totalUsers || 0, icon: Users, color: "#3b82f6" },
    { label: "Total Revenue", value: `₹${adminStats?.totalRevenue || 0}`, icon: DollarSign, color: "#10b981" },
    { label: "Total Analyses", value: adminStats?.totalAnalyses || 0, icon: FileCheck, color: "#f59e0b" },
    { label: "Active Subscribers", value: adminStats?.activeSubscribers || 0, icon: TrendingUp, color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          Admin Console
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Monitor users, subscriptions, transaction flows, and platform analytics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-2xl border border-zinc-800 bg-[#0d0d10] p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {kpi.label}
                </span>
                <Icon size={18} style={{ color: kpi.color }} />
              </div>
              <div className="mt-4 font-display text-2xl font-bold text-white tabular-nums">
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0d0d10] p-6">
        <h2 className="font-display text-lg font-bold text-white mb-6">Payment History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 pb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <th className="pb-3">User Email</th>
                <th className="pb-3">Payment ID</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Plan</th>
                <th className="pb-3 text-center">Amount</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {payments.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-zinc-900/10 transition duration-150">
                  <td className="py-4 font-semibold text-zinc-200">{payment.profiles?.email || "Unknown User"}</td>
                  <td className="py-4 font-mono text-xs text-zinc-400">{payment.razorpay_payment_id}</td>
                  <td className="py-4 text-zinc-400">
                    {new Date(payment.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td className="py-4 uppercase text-xs font-bold text-zinc-300">{payment.plan}</td>
                  <td className="py-4 text-center tabular-nums text-white">₹{payment.amount / 100}</td>
                  <td className="py-4 text-right">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      payment.status === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  FileText,
  History,
  CreditCard,
  Settings,
  LogOut,
  User,
  ShieldCheck,
  Menu,
  X,
  Compass,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  // Fetch current user profile to verify role
  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return db.getUserProfile(user.id, user.email || "");
    },
    enabled: !!user?.id,
  });

  // Fetch current user subscription
  const { data: subscription } = useQuery({
    queryKey: ["userSubscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return db.getUserSubscription(user.id);
    },
    enabled: !!user?.id,
  });

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#B8924A] border-t-transparent" />
          <p className="mt-4 text-sm font-medium">Entering dashboard…</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Analyze Resume", to: "/dashboard/analyze", icon: FileText },
    { label: "History & Versions", to: "/dashboard/history", icon: History },
    { label: "Pricing & Plans", to: "/price", icon: CreditCard },
  ];

  if (profile?.role === "admin") {
    navItems.push({ label: "Admin Console", to: "/dashboard/admin", icon: ShieldCheck });
  }

  const activePath = routerState.location.pathname;

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-border/80 bg-card/95 backdrop-blur md:flex md:flex-col">
        {/* Brand logo */}
        <div className="flex h-16 items-center px-6 border-b border-border/50">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#B8924A] flex items-center justify-center font-bold text-black text-sm">
              T
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-bold text-foreground tracking-tight">
                TalentForge
              </span>
              <span className="text-[9px] uppercase tracking-wider text-[#B8924A]">ATS AI</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePath === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition duration-200 ${
                  isActive
                    ? "bg-[#B8924A]/10 text-foreground font-semibold border border-[#B8924A]/30"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground border border-transparent"
                }`}
              >
                <Icon size={18} className={isActive ? "text-[#B8924A]" : "text-muted-foreground"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="border-t border-border/50 p-4">
          <div className="flex items-center justify-between gap-2 rounded-xl bg-secondary/30 border border-border/20 p-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-foreground font-semibold text-sm">
                {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {profile?.full_name || "ATS Analyst"}
                </p>
                <span className="inline-flex rounded-full bg-[#B8924A]/10 px-2 py-0.5 text-[9px] font-bold uppercase text-[#B8924A]">
                  {subscription?.plan_type || "free"}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground transition duration-200 p-1.5 rounded-lg hover:bg-secondary/50"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex h-16 items-center justify-between px-6 border-b border-border/50 bg-card/95 backdrop-blur md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#B8924A] flex items-center justify-center font-bold text-black text-sm">
              T
            </div>
            <span className="text-[15px] font-bold text-foreground tracking-tight">
              TalentForge
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-muted-foreground hover:text-foreground focus:outline-none p-1"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <nav className="border-b border-border bg-card px-4 py-4 space-y-1 md:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition duration-200 ${
                    isActive
                      ? "bg-[#B8924A]/10 text-[#B8924A] border border-[#B8924A]/20"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground border border-transparent"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition duration-200 border border-transparent"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </nav>
        )}

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 lg:px-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

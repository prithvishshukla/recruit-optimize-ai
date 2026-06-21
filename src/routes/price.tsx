import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle,
  HelpCircle,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Zap
} from "lucide-react";

export const Route = createFileRoute("/price")({
  component: PricingPage,
});

function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [upgrading, setUpgrading] = useState(false);
  const [simulating, setSimulating] = useState(false);

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

  // Function to load Razorpay script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Perform Upgrade Workflow
  const handleUpgrade = async () => {
    if (!user) {
      toast.error("Authentication required", { description: "Please sign in to upgrade." });
      navigate({ to: "/login" });
      return;
    }

    if (planType === "premium") {
      toast.info("Already upgraded", { description: "You are already a Premium member." });
      return;
    }

    setUpgrading(true);
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

    // Fall back to simulation if Key is missing or invalid
    const hasValidKey = keyId && !keyId.includes("your-");
    if (!hasValidKey) {
      console.warn("[Razorpay] Key not found or invalid. Triggering Simulation Mode.");
      setSimulating(true);
      setUpgrading(false);
      return;
    }

    try {
      const res = await loadRazorpay();
      if (!res) {
        toast.error("Failed to load Razorpay", { description: "Make sure you are online." });
        setUpgrading(false);
        return;
      }

      const options = {
        key: keyId,
        amount: 4900, // INR 49.00 in paise
        currency: "INR",
        name: "TalentForge AI",
        description: "Premium Platform Access",
        handler: async function (response: any) {
          try {
            await recordPaymentAndUpgrade(
              response.razorpay_payment_id || "pay_mock_" + Math.random().toString(36).substr(2, 9),
              response.razorpay_order_id || "order_mock_" + Math.random().toString(36).substr(2, 9)
            );
          } catch (err: any) {
            toast.error("Failed to update plan", { description: err.message });
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#B8924A",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      toast.error("Payment failed to initialize");
    } finally {
      setUpgrading(false);
    }
  };

  // Simulate Payment Success
  const handleSimulatedSuccess = async () => {
    if (!user) return;
    setUpgrading(true);
    try {
      await recordPaymentAndUpgrade(
        "pay_sim_" + Math.random().toString(36).substr(2, 9),
        "order_sim_" + Math.random().toString(36).substr(2, 9)
      );
      setSimulating(false);
    } catch (err: any) {
      toast.error("Failed to update plan", { description: err.message });
    } finally {
      setUpgrading(false);
    }
  };

  // Database actions
  const recordPaymentAndUpgrade = async (paymentId: string, orderId: string) => {
    // 1. Record payment
    await db.insertPayment({
      user_id: user?.id || "",
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      amount: 4900,
      plan: "premium",
      status: "success",
    });

    // 2. Update subscription to premium for 30 days
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    await db.upsertSubscription(
      user?.id || "",
      "premium",
      currentPeriodEnd.toISOString()
    );

    // Activity Log
    await db.insertActivityLog({
      user_id: user?.id || "",
      action: "upgrade_subscription",
      details: "Upgraded subscription plan to Premium.",
    });

    toast.success("Welcome to Premium!", {
      description: "All features unlocked. You have unlimited scans."
    });

    queryClient.invalidateQueries({ queryKey: ["userSubscription"] });
    navigate({ to: "/dashboard" });
  };

  const freeFeatures = [
    "1 ATS scan daily",
    "Basic ATS score parsing",
    "Standard Suggestions",
    "Online Dashboard"
  ];

  const premiumFeatures = [
    "Unlimited ATS Scans",
    "Job Match & Keyword Analysis",
    "AI Section Rewriter",
    "Interactive Bullet Point Optimizer",
    "High-Fidelity PDF Reports Export",
    "Version Comparison & Deltas Tracking",
    "Full Analytics Trends",
    "Admin Auditing logs support"
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 antialiased font-sans selection:bg-[#B8924A]/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-900/60 bg-[#09090b]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#B8924A] flex items-center justify-center font-bold text-black text-sm">
              T
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-bold text-white tracking-tight">TalentForge</span>
              <span className="text-[9px] uppercase tracking-wider text-[#B8924A]">ATS AI</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Pricing Section */}
      <main className="mx-auto max-w-7xl px-6 py-20 lg:py-28 text-center space-y-16">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B8924A]/20 bg-[#B8924A]/5 px-3 py-1 text-xs font-semibold text-[#e6c17e]">
            <Zap size={12} className="text-[#B8924A]" /> Pricing Plans
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Audit without constraints.
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-zinc-400">
            Improve your interviews chances with unlimited evaluations, section optimizations, and progress history comparison tools.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 text-left">
          {/* Free Plan */}
          <div className="rounded-3xl border border-zinc-800 bg-[#0d0d10] p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Free Tier</span>
                <div className="mt-2 font-display text-4xl font-extrabold text-white">₹0</div>
                <p className="mt-1 text-xs text-zinc-500">Basic audit capabilities</p>
              </div>

              <ul className="space-y-3.5 text-xs text-zinc-300">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <CheckCircle size={14} className="text-zinc-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <Link
                to="/dashboard"
                className="flex h-11 w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs font-semibold text-zinc-300 hover:text-white transition"
              >
                {planType === "free" ? "Active Plan" : "Downgrade is restricted"}
              </Link>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="relative rounded-3xl border border-[#B8924A] bg-[#121114] p-8 flex flex-col justify-between shadow-2xl">
            <span className="absolute -top-3 right-6 rounded-full bg-[#B8924A] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
              Recommended
            </span>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#e6c17e]">Premium Access</span>
                <div className="mt-2 font-display text-4xl font-extrabold text-[#B8924A]">₹49</div>
                <p className="mt-1 text-xs text-[#e6c17e]/80">Per user / month</p>
              </div>

              <ul className="space-y-3.5 text-xs text-zinc-300">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <CheckCircle size={14} className="text-[#B8924A] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              {planType === "premium" ? (
                <div className="flex h-11 w-full items-center justify-center rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-400">
                  Premium Active
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-100 transition active:scale-[0.98]"
                >
                  {upgrading ? "Loading payment gateway..." : "Upgrade to Premium"}
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Simulation Modal / Warning */}
        {simulating && (
          <div className="mx-auto max-w-md rounded-2xl border border-[#B8924A]/30 bg-[#17140f] p-6 text-center shadow-lg">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#B8924A]/10 text-[#B8924A] mb-4">
              <CreditCard size={18} />
            </div>
            <h3 className="font-display text-sm font-bold text-white">Razorpay Key Missing</h3>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              No public Razorpay API key (<code className="rounded bg-zinc-900 px-1 py-0.5 font-mono text-zinc-200">VITE_RAZORPAY_KEY_ID</code>) is set in your env. You can simulate a successful upgrade to test the Premium features.
            </p>
            <div className="mt-5 flex gap-2.5 justify-center">
              <button
                onClick={handleSimulatedSuccess}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-[#B8924A] px-4 text-xs font-bold text-black hover:bg-[#B8924A]/90 transition"
              >
                Simulate Successful Payment
              </button>
              <button
                onClick={() => setSimulating(false)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-xs font-semibold text-zinc-400 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

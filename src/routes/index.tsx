import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import logo from "@/assets/talentforge-logo.png";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <img src={logo} alt="TalentForge AI" className={className} width={36} height={36} />
      <div className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-bold tracking-tight text-foreground">TalentForge</span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold)] mt-0.5" style={{ color: "#B8924A" }}>
          Forge potential
        </span>
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  if (!name) return "U";
  if (name.includes("@")) {
    const parts = name.split("@")[0].split(/[\._\-]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || "U";
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0]?.toUpperCase() || "U";
}

function Nav() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return db.getUserProfile(user.id, user.email || "");
    },
    enabled: !!user?.id,
  });

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const metadata = user?.user_metadata || {};
  const fullName = metadata.full_name || metadata.name || profile?.full_name || "";
  const username = metadata.username || metadata.user_name || "";
  const email = user?.email || metadata.email || "";

  const displayName = fullName || username || email || "User";
  const avatarUrl = metadata.avatar_url || metadata.picture || profile?.avatar_url || "";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#workflow" className="hover:text-foreground transition">How it works</a>
          <Link to="/price" className="hover:text-foreground transition">Pricing</Link>
          <a href="#faq" className="hover:text-foreground transition">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-sm font-medium text-foreground backdrop-blur hover:bg-secondary/80 focus:outline-none transition cursor-pointer select-none">
                <Avatar className="h-6 w-6 border border-border/80">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[120px] truncate">{displayName}</span>
                <span className="text-[10px] text-muted-foreground">▼</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 border border-border bg-card shadow-lg rounded-xl">
                <DropdownMenuLabel className="font-medium text-xs text-muted-foreground px-3 py-2">
                  Account Settings
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="border-border/50" />
                <DropdownMenuItem asChild className="rounded-lg hover:bg-secondary cursor-pointer">
                  <Link to="/dashboard" className="w-full flex items-center px-3 py-2 text-sm text-foreground">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg hover:bg-secondary cursor-pointer">
                  <Link to="/dashboard" className="w-full flex items-center px-3 py-2 text-sm text-foreground">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg hover:bg-secondary cursor-pointer">
                  <Link to="/price" className="w-full flex items-center px-3 py-2 text-sm text-foreground">
                    Subscription
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg hover:bg-secondary cursor-pointer">
                  <Link to="/dashboard" className="w-full flex items-center px-3 py-2 text-sm text-foreground">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-border/50" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
                >
                  <span className="w-full flex items-center px-3 py-2 text-sm font-medium">
                    Logout
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login" className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-foreground hover:bg-secondary sm:inline-flex">
                Sign in
              </Link>
              <Link to="/dashboard" className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-sm transition hover:opacity-90">
                Get started
                <span aria-hidden>→</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const { user } = useAuth();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--coral)" }} />
            Trusted by recruiters, coaches & universities
          </div>
          <h1 className="mt-6 font-display text-5xl font-bold tracking-tight text-foreground text-balance sm:text-6xl lg:text-7xl">
            ATS resume intelligence,<br />
            <span className="relative inline-block">
              engineered for outcomes
              <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 300 10" fill="none" preserveAspectRatio="none">
                <path d="M2 6 Q 75 1 150 5 T 298 4" stroke="#B8924A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </span>
            .
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg text-muted-foreground text-balance">
            Score your resume against any job description, surface missing keywords, and rewrite weak sections with AI — all in a single recruiter-grade dashboard.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <>
                <Link to="/dashboard" className="inline-flex h-12 items-center gap-2 rounded-xl bg-foreground px-6 text-sm font-semibold text-background shadow-[var(--shadow-elevated)] transition hover:opacity-90">
                  Go to Dashboard
                  <span aria-hidden>→</span>
                </Link>
                <Link to="/dashboard/analyze" className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground transition hover:bg-secondary">
                  Analyze resume
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard/analyze" className="inline-flex h-12 items-center gap-2 rounded-xl bg-foreground px-6 text-sm font-semibold text-background shadow-[var(--shadow-elevated)] transition hover:opacity-90">
                  Analyze my resume
                  <span aria-hidden>→</span>
                </Link>
                <Link to="/dashboard" className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground transition hover:bg-secondary">
                  View dashboard
                </Link>
              </>
            )}
          </div>
          {!user && (
            <p className="mt-4 text-xs text-muted-foreground">Free tier · No credit card required · 1 scan / day</p>
          )}
        </div>

        <div className="relative mx-auto mt-16 max-w-6xl">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="relative rounded-3xl border border-border bg-card p-3 shadow-[var(--shadow-elevated)]">
      <div className="rounded-2xl border border-border/70 bg-background p-6 lg:p-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg" style={{ background: "var(--ink)" }} />
            <div>
              <div className="text-sm font-semibold text-foreground">Senior Product Designer · Stripe</div>
              <div className="text-xs text-muted-foreground">Last analyzed 2 minutes ago · v4</div>
            </div>
          </div>
          <span className="rounded-full bg-[oklch(0.95_0.06_150)] px-2.5 py-1 text-[11px] font-semibold text-[oklch(0.4_0.13_150)]">
            Strong match
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ScoreRing label="ATS Score" value={87} color="var(--ink)" />
          <ScoreRing label="JD Match" value={92} color="#2A8F8B" />
          <ScoreRing label="Resume Health" value={78} color="#B8924A" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="rounded-xl border border-border bg-card p-4 lg:col-span-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ATS score trend</div>
              <div className="text-xs text-muted-foreground">v1 → v4</div>
            </div>
            <TrendChart />
          </div>
          <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Missing keywords</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["design systems", "Figma variables", "A/B testing", "north-star metric", "Mixpanel", "GraphQL"].map((k) => (
                <span key={k} className="rounded-md border border-[color:var(--coral)]/30 bg-[color:var(--coral)]/10 px-2 py-1 text-[11px] font-medium" style={{ color: "#B14A26" }}>
                  {k}
                </span>
              ))}
            </div>
            <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detected</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["React", "TypeScript", "User research", "Roadmapping"].map((k) => (
                <span key={k} className="rounded-md border border-border bg-secondary px-2 py-1 text-[11px] font-medium text-foreground">{k}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ label, value, color }: { label: string; value: number; color: string }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} stroke="var(--border)" strokeWidth="6" fill="none" />
        <circle cx="36" cy="36" r={r} stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} />
      </svg>
      <div>
        <div className="font-display text-3xl font-bold text-foreground tabular-nums">{value}</div>
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function TrendChart() {
  const points = [42, 58, 71, 84, 87];
  const max = 100;
  const w = 280;
  const h = 80;
  const step = w / (points.length - 1);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`).join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-24 w-full">
      <defs>
        <linearGradient id="tg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2A8F8B" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2A8F8B" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#tg)" />
      <path d={path} fill="none" stroke="#2A8F8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={i * step} cy={h - (p / max) * h} r="3" fill="#fff" stroke="#2A8F8B" strokeWidth="2" />
      ))}
    </svg>
  );
}

function TrustBar() {
  const logos = ["Northwestern", "Acme Recruiting", "BrightPath", "Career Lab", "Helix HR", "Apex Coach"];
  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Powering resume reviews at 200+ teams
        </div>
        <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
          {logos.map((l) => (
            <div key={l} className="text-center font-display text-sm font-semibold text-muted-foreground/80">{l}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { t: "ATS compatibility engine", d: "Score every resume 0–100 against parser rules, formatting traps, and section structure.", k: "ATS" },
    { t: "Job description matching", d: "Side-by-side breakdowns for skills, experience, education, projects, and certifications.", k: "JD" },
    { t: "Keyword & skill-gap analysis", d: "Missing terms, coverage %, and skill-gap visualizations recruiters actually read.", k: "KW" },
    { t: "AI resume rewriter", d: "Rewrite summaries, bullets, and project descriptions — ATS-optimized and quantified.", k: "AI" },
    { t: "Version tracking", d: "Compare v1 → v4. See score deltas, new skills added, weak areas you fixed.", k: "v#" },
    { t: "Branded PDF reports", d: "Export recruiter-grade reports with scores, keywords, and rewritten bullets.", k: "PDF" },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-2xl">
        <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#B8924A" }}>Capabilities</div>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          The intelligence layer between your resume and the job.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Built on Google Gemini, designed for recruiters, tuned by career coaches.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <div key={it.t} className="group bg-card p-7 transition hover:bg-secondary/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background font-display text-[11px] font-bold tracking-wider text-foreground">
              {it.k}
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{it.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Workflow() {
  const steps = [
    { n: "01", t: "Upload your resume", d: "PDF up to 10MB. Stored securely on Cloudinary." },
    { n: "02", t: "Paste a job description", d: "We extract requirements, must-haves, and nice-to-haves." },
    { n: "03", t: "Gemini analyzes both", d: "Parser checks, keyword diff, section scoring, and rewrite suggestions." },
    { n: "04", t: "Get your report", d: "ATS + JD + Health scores, downloadable PDF, emailed to you." },
  ];
  return (
    <section id="workflow" className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr,1.4fr] lg:gap-20">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#B8924A" }}>Workflow</div>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              From upload to interview-ready in under 90 seconds.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Each step is fully automated — no manual review, no waiting on a coach.
            </p>
          </div>
          <ol className="space-y-px overflow-hidden rounded-2xl border border-border">
            {steps.map((s) => (
              <li key={s.n} className="flex gap-6 bg-card p-6 transition hover:bg-secondary/30">
                <div className="font-display text-2xl font-bold tabular-nums text-muted-foreground/60">{s.n}</div>
                <div>
                  <div className="font-display text-lg font-semibold text-foreground">{s.t}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: subscription } = useQuery({
    queryKey: ["userSubscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return db.getUserSubscription(user.id);
    },
    enabled: !!user?.id,
  });

  const isPremium = subscription?.plan_type === "premium";

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#B8924A" }}>Pricing</div>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Honest pricing. No hidden tiers.
        </h2>
      </div>
      <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
        <PlanCard
          name="Free"
          price="₹0"
          period="forever"
          features={["1 ATS scan per day", "Basic ATS analysis", "Limited suggestions", "Standard PDF export"]}
          cta={user ? "Go to Dashboard" : "Get started"}
          highlight={false}
          onClick={() => navigate({ to: "/dashboard" })}
        />
        <PlanCard
          name="Premium"
          price="₹49"
          period="per month"
          features={[
            "Unlimited ATS scans",
            "Unlimited JD matching",
            "AI resume rewriter",
            "Bullet point optimizer",
            "Version tracking & history",
            "Branded PDF reports",
            "Email-delivered reports",
            "Advanced analytics dashboard",
          ]}
          cta={isPremium ? "Premium Active" : "Upgrade to Premium"}
          highlight={true}
          onClick={() => navigate({ to: "/price" })}
        />
      </div>
    </section>
  );
}

function PlanCard({
  name, price, period, features, cta, highlight, onClick,
}: { name: string; price: string; period: string; features: string[]; cta: string; highlight: boolean; onClick?: () => void }) {
  return (
    <div className={`relative rounded-2xl border p-8 ${highlight ? "border-foreground bg-foreground text-background shadow-[var(--shadow-elevated)]" : "border-border bg-card"}`}>
      {highlight && (
        <span className="absolute -top-3 right-6 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: "var(--gold)", color: "#5C4A1F" }}>
          Most popular
        </span>
      )}
      <div className={`text-sm font-semibold ${highlight ? "text-background/70" : "text-muted-foreground"}`}>{name}</div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-5xl font-bold tracking-tight">{price}</span>
        <span className={`text-sm ${highlight ? "text-background/60" : "text-muted-foreground"}`}>{period}</span>
      </div>
      <ul className="mt-6 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 shrink-0" fill="none">
              <path d="M3 8.5L6.5 12L13 4.5" stroke={highlight ? "var(--gold)" : "#2A8F8B"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={highlight ? "text-background/90" : "text-foreground"}>{f}</span>
          </li>
        ))}
      </ul>
      <button onClick={onClick} className={`mt-8 w-full rounded-xl px-5 py-3 text-sm font-semibold transition ${highlight ? "bg-background text-foreground hover:opacity-90" : "border border-foreground bg-card text-foreground hover:bg-secondary"} cursor-pointer`}>
        {cta}
      </button>
    </div>
  );
}

function FAQ() {
  const qs = [
    { q: "How accurate is the ATS score?", a: "Our scoring mirrors the parsing logic of major ATS engines (Workday, Greenhouse, Lever, Taleo). It evaluates formatting, section structure, keyword density, and parse failures — calibrated against thousands of recruiter-reviewed resumes." },
    { q: "Is my resume data private?", a: "Yes. Files are stored encrypted in Cloudinary with private access, and analysis records are protected by row-level security. You can delete any version permanently from your dashboard." },
    { q: "Which file formats are supported?", a: "PDF up to 10MB. We're adding DOCX support in the next release." },
    { q: "Can I cancel Premium anytime?", a: "Yes. Cancellation is one click from your profile, and you retain Premium access until the end of the billing period." },
  ];
  return (
    <section id="faq" className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h2 className="text-center font-display text-4xl font-bold tracking-tight text-foreground">Frequently asked questions</h2>
        <div className="mt-12 space-y-3">
          {qs.map((q) => (
            <details key={q.q} className="group rounded-xl border border-border bg-card p-5 open:bg-card">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base font-semibold text-foreground">
                {q.q}
                <span className="text-xl text-muted-foreground transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{q.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const { user } = useAuth();
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-foreground p-12 text-background lg:p-16">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, var(--coral), transparent 70%)" }} />
        <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, var(--teal), transparent 70%)" }} />
        <div className="relative max-w-2xl">
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {user ? "Ready to optimize more resumes?" : "Forge potential. Build futures."}
          </h2>
          <p className="mt-4 text-lg text-background/70">
            {user
              ? "Access your candidate dashboard to analyze new resumes or track your improvement trends."
              : "Join thousands of candidates landing interviews with TalentForge AI."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {user ? (
              <Link to="/dashboard" className="inline-flex h-12 items-center gap-2 rounded-xl bg-background px-6 text-sm font-semibold text-foreground transition hover:opacity-90">
                Go to Dashboard
                <span aria-hidden>→</span>
              </Link>
            ) : (
              <>
                <Link to="/dashboard/analyze" className="inline-flex h-12 items-center gap-2 rounded-xl bg-background px-6 text-sm font-semibold text-foreground transition hover:opacity-90">
                  Analyze my resume
                </Link>
                <Link to="/price" className="inline-flex h-12 items-center rounded-xl border border-background/20 px-6 text-sm font-semibold text-background transition hover:bg-background/10">
                  View pricing
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr,3fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              ATS resume intelligence platform for the next generation of professionals.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 text-sm">
            {[
              { h: "Product", l: ["Features", "Pricing", "Demo", "Changelog"] },
              { h: "Company", l: ["About", "Blog", "Careers", "Contact"] },
              { h: "Resources", l: ["ATS guide", "Resume templates", "API docs", "Status"] },
              { h: "Legal", l: ["Privacy", "Terms", "Security", "DPA"] },
            ].map((c) => (
              <div key={c.h}>
                <div className="font-display text-xs font-semibold uppercase tracking-wider text-foreground">{c.h}</div>
                <ul className="mt-3 space-y-2 text-muted-foreground">
                  {c.l.map((x) => <li key={x}><a href="#" className="hover:text-foreground transition">{x}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <div>© 2026 TalentForge AI. All rights reserved.</div>
          <div className="uppercase tracking-[0.18em]" style={{ color: "#B8924A" }}>Forge potential · Build futures</div>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <Workflow />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

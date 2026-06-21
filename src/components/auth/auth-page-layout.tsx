import { Link } from "@tanstack/react-router";
import logo from "@/assets/talentforge-logo.png";

type AuthPageLayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthPageLayout({ title, description, children, footer }: AuthPageLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      <header className="relative z-10 border-b border-border/60 glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="TalentForge AI" className="h-9 w-9" width={36} height={36} />
            <div className="flex flex-col leading-none">
              <span className="font-display text-[17px] font-bold tracking-tight text-foreground">
                TalentForge
              </span>
              <span
                className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: "#B8924A" }}
              >
                Forge potential
              </span>
            </div>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </main>
    </div>
  );
}

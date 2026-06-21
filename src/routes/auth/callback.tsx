import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function completeSignIn() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const errorDescription = params.get("error_description");

      if (errorDescription) {
        if (active) setError(errorDescription);
        return;
      }

      // 1. Check if we already have a session (e.g. exchanged automatically by detectSessionInUrl: true)
      const {
        data: { session: existingSession },
      } = await supabase.auth.getSession();

      if (existingSession) {
        toast.success("Signed in successfully");
        navigate({ to: "/" });
        return;
      }

      // 2. Try manual exchange if session isn't populated yet but code is present
      if (code) {
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            // Re-check session in case it was exchanged concurrently in the background
            const { data: { session: backupSession } } = await supabase.auth.getSession();
            if (backupSession) {
              toast.success("Signed in successfully");
              navigate({ to: "/" });
              return;
            }
            if (active) setError(exchangeError.message);
            return;
          }
          if (data?.session) {
            toast.success("Signed in successfully");
            navigate({ to: "/" });
            return;
          }
        } catch (err: any) {
          // Re-check session on any PKCE verifier exception (e.g. verifier already consumed & deleted)
          const { data: { session: backupSession } } = await supabase.auth.getSession();
          if (backupSession) {
            toast.success("Signed in successfully");
            navigate({ to: "/" });
            return;
          }
          if (active) setError(err.message || "Failed to exchange code for session");
          return;
        }
      }

      // 3. Last check for session
      const {
        data: { session: finalSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        if (active) setError(sessionError.message);
        return;
      }

      if (finalSession) {
        toast.success("Signed in successfully");
        navigate({ to: "/" });
        return;
      }

      if (active) setError("Could not complete sign in. Please try again.");
    }

    completeSignIn();

    return () => {
      active = false;
    };
  }, [navigate]);

  if (error) {
    return (
      <AuthPageLayout
        title="Sign in failed"
        description="Something went wrong while signing you in."
        footer={
          <>
            <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </>
        }
      >
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button asChild className="mt-4 rounded-xl">
            <Link to="/login">Try again</Link>
          </Button>
        </div>
      </AuthPageLayout>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Completing sign in…</p>
    </div>
  );
}

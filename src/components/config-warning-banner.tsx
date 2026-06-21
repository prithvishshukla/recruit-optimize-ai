import { useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";

export function ConfigWarningBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (isSupabaseConfigured || dismissed) {
    return null;
  }

  return (
    <div className="relative z-50 w-full border-b border-[#B8924A]/20 bg-[#17140f] px-6 py-3.5 text-[#e6c17e] antialiased">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#B8924A]/10 border border-[#B8924A]/20 text-[#B8924A] mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#B8924A]">
              Supabase Configuration Notice
            </span>
            <p className="mt-0.5 text-sm leading-relaxed text-zinc-300">
              The application is running in{" "}
              <strong className="text-white">Offline/Mock Mode</strong>. To connect to your Supabase
              project, make sure{" "}
              <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-[12px] font-mono text-zinc-200">
                VITE_SUPABASE_URL
              </code>{" "}
              and{" "}
              <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-[12px] font-mono text-zinc-200">
                VITE_SUPABASE_ANON_KEY
              </code>{" "}
              are correctly set in your{" "}
              <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-[12px] font-mono text-zinc-200">
                .env
              </code>{" "}
              file. Authentication and database connections will be mocked.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition duration-200"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

import { createClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(url: string | undefined): string {
  if (!url) return "";
  return url
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/auth\/v1\/?$/, "")
    .replace(/\/$/, "");
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = normalizeSupabaseUrl(rawUrl);
const supabaseAnonKey = rawKey?.trim() ?? "";

// A valid config must have both URL and key, and not be default placeholder values
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("your-project") &&
  !supabaseAnonKey.includes("your-anon-or-publishable-key"),
);

if (!isSupabaseConfigured) {
  console.error(
    "[Supabase] Missing or invalid VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env — auth requests will fail. Please configure them.",
  );
} else if (rawUrl?.includes("/rest/v1")) {
  console.warn(
    "[Supabase] VITE_SUPABASE_URL should be the project URL (https://xxx.supabase.co), not the REST API path (/rest/v1).",
  );
}

// Use safe placeholders to avoid throwing during initialization
const clientUrl = isSupabaseConfigured ? supabaseUrl : "https://placeholder-project.supabase.co";
const clientKey = isSupabaseConfigured
  ? supabaseAnonKey
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIn0.signature";

export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    flowType: "pkce",
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export function getAuthCallbackUrl() {
  return `${window.location.origin}/auth/callback`;
}

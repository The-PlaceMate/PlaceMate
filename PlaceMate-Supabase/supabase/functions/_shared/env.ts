export function requireEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseUrl() {
  return requireEnv("SUPABASE_URL");
}

export function getSupabaseAnonKey() {
  return requireEnv("SUPABASE_ANON_KEY");
}

export function getSupabaseServiceRoleKey() {
  return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function getResendApiKey() {
  return requireEnv("RESEND_API_KEY");
}

export function getAppBaseUrl() {
  return (
    Deno.env.get("APP_PUBLIC_URL") ||
    Deno.env.get("SITE_URL") ||
    "http://localhost:5173"
  ).replace(/\/+$/, "");
}

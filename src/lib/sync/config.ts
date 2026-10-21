// Cloud sync is off unless both variables are set when the app is built.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const syncConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

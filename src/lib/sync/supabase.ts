// Supabase wiring for the optional sync. Loaded with a dynamic import only when both
// NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set at build time.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserState } from "../store";
import type { PushResult, Remote, RemoteDoc } from "./engine";

export const TABLE = "waypoint_progress";

let client: SupabaseClient | null = null;

export async function getClient(url: string, anonKey: string): Promise<SupabaseClient> {
  if (client) return client;
  const { createClient } = await import("@supabase/supabase-js");
  client = createClient(url, anonKey, { auth: { persistSession: true, detectSessionInUrl: true, storageKey: "aet:supabase-auth" } });
  return client;
}

export function supabaseRemote(sb: SupabaseClient, userId: string, now = () => new Date()): Remote {
  return {
    async pull(): Promise<RemoteDoc | null> {
      const { data, error } = await sb.from(TABLE).select("state, updated_at").eq("user_id", userId).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? { state: data.state, updatedAt: data.updated_at } : null;
    },
    async push(state: UserState, expectedAt: string | null): Promise<PushResult> {
      const updated_at = now().toISOString();
      if (expectedAt === null) {
        const { data, error } = await sb.from(TABLE).insert({ user_id: userId, state, updated_at }).select("updated_at").single();
        if (error) {
          if (error.code === "23505") return { ok: false }; // another device created the row first
          throw new Error(error.message);
        }
        return { ok: true, updatedAt: data.updated_at };
      }
      // Optimistic concurrency: only overwrite the version we last saw.
      const { data, error } = await sb.from(TABLE).update({ state, updated_at }).eq("user_id", userId).eq("updated_at", expectedAt).select("updated_at");
      if (error) throw new Error(error.message);
      return data.length ? { ok: true, updatedAt: data[0].updated_at } : { ok: false };
    },
  };
}

// Browser-side owner of the optional sync: auth session, the engine, and a snapshot for React.
import { store } from "../store";
import { SUPABASE_ANON_KEY, SUPABASE_URL, syncConfigured } from "./config";
import { CONFLICT_KEY, META_KEY, createSync, type KeyValue, type Sync, type SyncStatus } from "./engine";

export interface SyncSnapshot {
  configured: boolean;
  ready: boolean; // auth state is known
  email: string | null;
  status: SyncStatus;
  hasConflictCopy: boolean;
}

const localKV: KeyValue = {
  get: (k) => {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      window.localStorage.setItem(k, v);
    } catch {
      // blocked storage: sync metadata lives only for this page view
    }
  },
  remove: (k) => {
    try {
      window.localStorage.removeItem(k);
    } catch {
      // ignore
    }
  },
};

const IDLE: SyncStatus = { phase: "idle", lastSyncedAt: null, error: null, conflict: null };
let snapshot: SyncSnapshot = { configured: syncConfigured, ready: !syncConfigured, email: null, status: IDLE, hasConflictCopy: false };
const listeners = new Set<() => void>();
let engine: Sync | null = null;
let userId: string | null = null;
let booted = false;

function set(patch: Partial<SyncSnapshot>) {
  snapshot = { ...snapshot, ...patch, hasConflictCopy: Boolean(localKV.get(CONFLICT_KEY)) };
  listeners.forEach((l) => l());
}

async function client() {
  const { getClient } = await import("./supabase");
  return getClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function onSession(user: { id: string; email?: string } | null) {
  if (user?.id === userId) return set({ ready: true });
  engine?.stop();
  engine = null;
  userId = user?.id ?? null;
  if (!user) return set({ ready: true, email: null, status: IDLE });
  // Show who is signed in first, so the header never depends on the sync engine starting cleanly.
  set({ ready: true, email: user.email ?? null });
  try {
    const { supabaseRemote } = await import("./supabase");
    // A different account on this device: forget the other account's sync position.
    const owner = localKV.get("aet:sync-user");
    if (owner && owner !== user.id) localKV.remove(META_KEY);
    localKV.set("aet:sync-user", user.id);
    engine = createSync({ store, remote: supabaseRemote(await client(), user.id), kv: localKV });
    engine.onStatus((status) => set({ status }));
    void engine.start();
  } catch (err) {
    set({ status: { ...IDLE, phase: "error", error: err instanceof Error ? err.message : String(err) } });
  }
}

export const syncClient = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => snapshot,
  /** Idempotent. Does nothing unless Supabase is configured. */
  async boot() {
    if (!syncConfigured || booted) return;
    booted = true;
    const sb = await client();
    const { data } = await sb.auth.getSession();
    await onSession(data.session?.user ?? null);
    sb.auth.onAuthStateChange((_event, session) => void onSession(session?.user ?? null));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void engine?.syncNow();
    });
  },
  async sendMagicLink(email: string): Promise<string | null> {
    const sb = await client();
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/settings` } });
    return error ? error.message : null;
  },
  async signOut() {
    const sb = await client();
    await sb.auth.signOut();
  },
  syncNow: () => engine?.syncNow(),
  /** The copy a conflict didn't keep, as an export file the Import button accepts. */
  conflictCopy: () => localKV.get(CONFLICT_KEY),
  clearConflict() {
    localKV.remove(CONFLICT_KEY);
    engine?.dismissConflict();
    set({});
  },
};

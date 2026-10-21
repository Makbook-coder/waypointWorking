// Optional cloud sync. localStorage stays the source the UI reads; this engine copies the whole
// state document to a remote row and back. Conflicts are resolved last-writer-wins on the whole
// document, and the losing copy is kept locally so it can be downloaded. See README decision 35.
import type { Store, UserState } from "../store";

export interface RemoteDoc {
  state: unknown;
  updatedAt: string;
}

export type PushResult = { ok: true; updatedAt: string } | { ok: false };

export interface Remote {
  pull(): Promise<RemoteDoc | null>;
  /** Write only if the row is still at `expectedAt` (null = no row yet). */
  push(state: UserState, expectedAt: string | null): Promise<PushResult>;
}

export interface SyncMeta {
  remoteAt: string | null; // updatedAt of the remote row we last saw or wrote
  dirty: boolean; // local changes not yet pushed
  localAt: string | null; // when the oldest unpushed local change happened
}

export interface KeyValue {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

export type SyncPhase = "idle" | "syncing" | "error";

export interface SyncStatus {
  phase: SyncPhase;
  lastSyncedAt: string | null;
  error: string | null;
  /** Set when a conflict kept one copy and stashed the other */
  conflict: { kept: "this device" | "cloud"; at: string } | null;
}

export const META_KEY = "aet:sync-meta";
export const CONFLICT_KEY = "aet:sync-conflict";

type Scheduler = (fn: () => void, ms: number) => () => void;
const defaultSchedule: Scheduler = (fn, ms) => {
  const t = setTimeout(fn, ms);
  return () => clearTimeout(t);
};

export function readMeta(kv: KeyValue): SyncMeta {
  try {
    const m = JSON.parse(kv.get(META_KEY) ?? "null");
    if (m && typeof m === "object")
      return { remoteAt: typeof m.remoteAt === "string" ? m.remoteAt : null, dirty: m.dirty !== false, localAt: typeof m.localAt === "string" ? m.localAt : null };
  } catch {
    // fall through
  }
  // Never synced: whatever is local counts as unpushed.
  return { remoteAt: null, dirty: true, localAt: null };
}

const hasProgress = (s: UserState) => s.activity.length > 0 || Object.keys(s.topics).length > 0 || Object.keys(s.notes).length > 0;
const lastActive = (s: UserState) => (s.activity.length ? `${s.activity[s.activity.length - 1]}T23:59:59.999Z` : null);

export function createSync({
  store,
  remote,
  kv,
  now = () => new Date(),
  delayMs = 1500,
  schedule = defaultSchedule,
}: {
  store: Pick<Store, "getState" | "subscribe" | "importJSON">;
  remote: Remote;
  kv: KeyValue;
  now?: () => Date;
  delayMs?: number;
  schedule?: Scheduler;
}) {
  let status: SyncStatus = { phase: "idle", lastSyncedAt: null, error: null, conflict: null };
  const listeners = new Set<(s: SyncStatus) => void>();
  let applying = false;
  let cancelPending: (() => void) | null = null;
  let unsubscribe: (() => void) | null = null;
  let running: Promise<void> | null = null;
  let edits = 0; // bumps on every local change, so a push can tell if more changes arrived meanwhile

  const setStatus = (patch: Partial<SyncStatus>) => {
    status = { ...status, ...patch };
    listeners.forEach((l) => l(status));
  };
  const writeMeta = (m: SyncMeta) => kv.set(META_KEY, JSON.stringify(m));

  function adopt(doc: RemoteDoc) {
    applying = true;
    try {
      store.importJSON(JSON.stringify(doc.state));
    } finally {
      applying = false;
    }
    writeMeta({ remoteAt: doc.updatedAt, dirty: false, localAt: null });
  }

  async function push(expectedAt: string | null): Promise<boolean> {
    const before = edits;
    const r = await remote.push(store.getState(), expectedAt);
    if (!r.ok) return false;
    const changedMeanwhile = edits !== before;
    writeMeta({ remoteAt: r.updatedAt, dirty: changedMeanwhile, localAt: changedMeanwhile ? now().toISOString() : null });
    if (changedMeanwhile) schedulePush();
    return true;
  }

  async function reconcile(depth = 0): Promise<void> {
    const meta = readMeta(kv);
    const doc = await remote.pull();
    if (!doc) {
      if (!(await push(null)) && depth < 2) return reconcile(depth + 1);
      return;
    }
    const remoteChanged = doc.updatedAt !== meta.remoteAt;
    if (!remoteChanged) {
      if (meta.dirty && !(await push(meta.remoteAt)) && depth < 2) return reconcile(depth + 1);
      return;
    }
    const local = store.getState();
    if (!meta.dirty || !hasProgress(local)) {
      adopt(doc);
      return;
    }
    // Both sides changed since the last sync: keep the newer copy whole, stash the other.
    const localAt = meta.localAt ?? lastActive(local) ?? "";
    const at = now().toISOString();
    if (localAt > doc.updatedAt) {
      kv.set(CONFLICT_KEY, JSON.stringify({ app: "ai-engineering-tracker", exportedAt: at, source: "cloud", state: doc.state }));
      setStatus({ conflict: { kept: "this device", at } });
      if (!(await push(doc.updatedAt)) && depth < 2) return reconcile(depth + 1);
    } else {
      kv.set(CONFLICT_KEY, JSON.stringify({ app: "ai-engineering-tracker", exportedAt: at, source: "this device", state: local }));
      setStatus({ conflict: { kept: "cloud", at } });
      adopt(doc);
    }
  }

  /** Pull, reconcile and push. Concurrent calls share one run. */
  function syncNow(): Promise<void> {
    if (running) return running;
    cancelPending?.();
    cancelPending = null;
    setStatus({ phase: "syncing", error: null });
    running = reconcile()
      .then(() => setStatus({ phase: "idle", lastSyncedAt: now().toISOString() }))
      .catch((err: unknown) => setStatus({ phase: "error", error: err instanceof Error ? err.message : String(err) }))
      .finally(() => {
        running = null;
      });
    return running;
  }

  function schedulePush() {
    cancelPending?.();
    cancelPending = schedule(() => {
      cancelPending = null;
      void syncNow();
    }, delayMs);
  }

  function onLocalChange() {
    if (applying) return;
    edits++;
    const meta = readMeta(kv);
    writeMeta({ ...meta, dirty: true, localAt: meta.dirty && meta.localAt ? meta.localAt : now().toISOString() });
    schedulePush();
  }

  return {
    start() {
      unsubscribe ??= store.subscribe(onLocalChange);
      return syncNow();
    },
    stop() {
      unsubscribe?.();
      unsubscribe = null;
      cancelPending?.();
      cancelPending = null;
    },
    syncNow,
    getStatus: () => status,
    onStatus(l: (s: SyncStatus) => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    dismissConflict() {
      setStatus({ conflict: null });
    },
  };
}

export type Sync = ReturnType<typeof createSync>;

import { describe, expect, it } from "vitest";
import { createStore, emptyState, memoryStorage, type UserState } from "@/lib/store";
import { CONFLICT_KEY, META_KEY, createSync, readMeta, type KeyValue, type Remote, type RemoteDoc } from "@/lib/sync/engine";

function memKV(init: Record<string, string> = {}): KeyValue & { data: Record<string, string> } {
  const data = { ...init };
  return { data, get: (k) => data[k] ?? null, set: (k, v) => void (data[k] = v), remove: (k) => void delete data[k] };
}

/** An in-memory stand-in for the Supabase row, with the same optimistic-concurrency rule. */
function fakeRemote(initial: RemoteDoc | null = null) {
  let row = initial;
  let clock = 0;
  const calls = { pull: 0, push: 0 };
  const remote: Remote = {
    async pull() {
      calls.pull++;
      return row && { state: structuredClone(row.state), updatedAt: row.updatedAt };
    },
    async push(state, expectedAt) {
      calls.push++;
      if ((row?.updatedAt ?? null) !== expectedAt) return { ok: false };
      row = { state: structuredClone(state), updatedAt: `2026-03-10T10:00:${String(++clock).padStart(2, "0")}.000Z` };
      return { ok: true, updatedAt: row.updatedAt };
    },
  };
  return { remote, calls, get row() { return row; }, set row(r) { row = r; } };
}

function manualScheduler() {
  const queue: (() => void)[] = [];
  return {
    schedule: (fn: () => void) => {
      queue.push(fn);
      return () => {
        const i = queue.indexOf(fn);
        if (i >= 0) queue.splice(i, 1);
      };
    },
    flush: () => queue.splice(0).forEach((f) => f()),
    get size() { return queue.length; },
  };
}

const stateWith = (topic: string, day = "2026-03-09"): UserState => ({ ...emptyState(), topics: { [topic]: { done: true } }, activity: [day] });

function setup(opts: { local?: UserState; remote?: RemoteDoc | null; meta?: object; now?: string } = {}) {
  const storage = memoryStorage(opts.local ? JSON.stringify(opts.local) : null);
  const now = () => new Date(opts.now ?? "2026-03-10T09:00:00Z");
  const store = createStore({ storage, now });
  const fr = fakeRemote(opts.remote ?? null);
  const kv = memKV(opts.meta ? { [META_KEY]: JSON.stringify(opts.meta) } : {});
  const sch = manualScheduler();
  const sync = createSync({ store, remote: fr.remote, kv, now, schedule: sch.schedule });
  return { store, fr, kv, sch, sync };
}

describe("sync engine", () => {
  it("uploads local progress when the cloud has no row", async () => {
    const { fr, kv, sync } = setup({ local: stateWith("a") });
    await sync.start();
    expect((fr.row!.state as UserState).topics.a.done).toBe(true);
    expect(readMeta(kv)).toMatchObject({ dirty: false, remoteAt: fr.row!.updatedAt });
    expect(sync.getStatus().phase).toBe("idle");
  });

  it("adopts the cloud copy on a fresh device", async () => {
    const { store, sync } = setup({ remote: { state: stateWith("cloud"), updatedAt: "2026-03-09T12:00:00.000Z" } });
    await sync.start();
    expect(store.getState().topics.cloud.done).toBe(true);
  });

  it("adopts cloud changes when this device has none pending", async () => {
    const { store, fr, sync } = setup({
      local: stateWith("old"),
      remote: { state: stateWith("new"), updatedAt: "2026-03-10T08:00:00.000Z" },
      meta: { remoteAt: "2026-03-09T08:00:00.000Z", dirty: false, localAt: null },
    });
    await sync.start();
    expect(store.getState().topics.new).toBeTruthy();
    expect(store.getState().topics.old).toBeUndefined();
    expect(fr.calls.push).toBe(0);
  });

  it("debounces local changes into one push", async () => {
    const { store, fr, sch, sync } = setup();
    await sync.start();
    const pushes = fr.calls.push;
    store.setTopicDone("x", true);
    store.setTopicDone("y", true);
    expect(sch.size).toBe(1);
    sch.flush();
    await sync.syncNow();
    expect(fr.calls.push).toBe(pushes + 1);
    expect(Object.keys((fr.row!.state as UserState).topics).sort()).toEqual(["x", "y"]);
  });

  it("doesn't treat adopting the cloud copy as a local change", async () => {
    const { sch, sync } = setup({ remote: { state: stateWith("cloud"), updatedAt: "2026-03-09T12:00:00.000Z" } });
    await sync.start();
    expect(sch.size).toBe(0);
  });

  it("on a conflict keeps the newer local copy and stashes the cloud one", async () => {
    const { store, fr, kv, sync } = setup({
      local: stateWith("mine"),
      remote: { state: stateWith("theirs"), updatedAt: "2026-03-10T07:00:00.000Z" },
      meta: { remoteAt: "2026-03-09T00:00:00.000Z", dirty: true, localAt: "2026-03-10T08:30:00.000Z" },
    });
    await sync.start();
    expect(store.getState().topics.mine).toBeTruthy();
    expect((fr.row!.state as UserState).topics.mine).toBeTruthy();
    expect(JSON.parse(kv.data[CONFLICT_KEY]).state.topics.theirs).toBeTruthy();
    expect(sync.getStatus().conflict?.kept).toBe("this device");
  });

  it("on a conflict keeps the newer cloud copy and stashes this device's", async () => {
    const { store, kv, sync } = setup({
      local: stateWith("mine"),
      remote: { state: stateWith("theirs"), updatedAt: "2026-03-10T08:45:00.000Z" },
      meta: { remoteAt: "2026-03-09T00:00:00.000Z", dirty: true, localAt: "2026-03-10T08:30:00.000Z" },
    });
    await sync.start();
    expect(store.getState().topics.theirs).toBeTruthy();
    expect(JSON.parse(kv.data[CONFLICT_KEY]).state.topics.mine).toBeTruthy();
    expect(sync.getStatus().conflict?.kept).toBe("cloud");
  });

  it("re-reads the cloud when another device wrote first", async () => {
    const { store, fr, sch, sync } = setup();
    await sync.start();
    // another device writes, then this one changes something
    fr.row = { state: stateWith("other"), updatedAt: "2026-03-10T08:59:00.000Z" };
    store.setTopicDone("mine", true);
    sch.flush();
    await sync.syncNow();
    expect(sync.getStatus().conflict).not.toBeNull();
    expect(fr.row!.updatedAt).not.toBe("2026-03-10T08:59:00.000Z");
  });

  it("reports errors without throwing and keeps local state", async () => {
    const { store, fr, sync } = setup({ local: stateWith("a") });
    fr.remote.pull = async () => {
      throw new Error("offline");
    };
    await sync.start();
    expect(sync.getStatus()).toMatchObject({ phase: "error", error: "offline" });
    expect(store.getState().topics.a.done).toBe(true);
  });

  it("treats unreadable metadata as never synced", () => {
    expect(readMeta(memKV({ [META_KEY]: "{bad" }))).toEqual({ remoteAt: null, dirty: true, localAt: null });
  });
});

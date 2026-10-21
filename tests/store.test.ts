import { describe, expect, it } from "vitest";
import { SCHEMA_VERSION, createStore, emptyState, loadState, memoryStorage, migrate } from "@/lib/store";

function setup(initial: string | null = null, day = "2026-03-10T09:00:00") {
  const storage = memoryStorage(initial);
  let now = new Date(day);
  const store = createStore({ storage, now: () => now });
  return { store, storage, setNow: (d: string) => (now = new Date(d)) };
}

describe("loadState", () => {
  it("returns empty state for missing data", () => {
    expect(loadState(null)).toEqual(emptyState());
    expect(loadState("")).toEqual(emptyState());
  });

  it.each([
    ["not json", "{nope"],
    ["a number", "42"],
    ["null", "null"],
    ["an array", "[1,2,3]"],
    ["a string", '"hello"'],
  ])("never throws on %s", (_label, raw) => {
    expect(loadState(raw)).toEqual(emptyState());
  });

  it("drops invalid fields but keeps valid ones", () => {
    const raw = JSON.stringify({
      version: 2,
      topics: { good: { done: true, confidence: 2 }, bad: { done: "yes" }, worse: 7, conf: { done: false, confidence: 9 } },
      reviews: { good: { step: 1, due: "2026-03-12" }, bad: { step: 1, due: "tomorrow" } },
      activity: ["2026-03-01", "garbage", "2026-03-01", 5],
      settings: { theme: "neon", targetRole: "genai-ds" },
      lastVisited: { href: "https://evil.example", title: "x" },
      bookmarks: "oops",
    });
    const s = loadState(raw);
    expect(s.topics).toEqual({ good: { done: true, confidence: 2 }, conf: { done: false } });
    expect(s.reviews).toEqual({ good: { step: 1, due: "2026-03-12" } });
    expect(s.activity).toEqual(["2026-03-01"]);
    expect(s.settings).toEqual({ theme: "system", targetRole: "genai-ds", weeklyHours: 6 });
    expect(s.lastVisited).toBeNull();
    expect(s.bookmarks).toEqual({});
  });

  it("ignores data written by a newer schema", () => {
    expect(loadState(JSON.stringify({ version: SCHEMA_VERSION + 1, topics: { a: { done: true } } }))).toEqual(emptyState());
  });
});

describe("migrations", () => {
  it("migrates v1 flat lists to v2", () => {
    const v1 = { version: 1, completed: ["t1", "t2", 3], bookmarks: ["t1", "module:M4.6"], notes: { "M4.6": "hello", x: 5 }, theme: "dark" };
    const s = loadState(JSON.stringify(v1));
    expect(s.version).toBe(SCHEMA_VERSION);
    expect(Object.keys(s.topics)).toEqual(["t1", "t2"]);
    expect(s.topics.t1.done).toBe(true);
    expect(Object.keys(s.bookmarks).sort()).toEqual(["module:M4.6", "topic:t1"]);
    expect(s.notes["module:M4.6"].text).toBe("hello");
    expect(s.settings.theme).toBe("dark");
  });

  it("treats unversioned data as v1", () => {
    expect(migrate({ completed: ["a"] }).version).toBe(SCHEMA_VERSION);
  });
});

describe("store actions", () => {
  it("marking a topic done persists it and schedules a review", () => {
    const { store, storage } = setup();
    store.setTopicDone("t1", true);
    const s = store.getState();
    expect(s.topics.t1.done).toBe(true);
    expect(s.reviews.t1).toEqual({ step: 0, due: "2026-03-11" });
    expect(JSON.parse(storage.read()!).topics.t1.done).toBe(true);
  });

  it("unmarking removes the review", () => {
    const { store } = setup();
    store.setTopicDone("t1", true);
    store.setTopicDone("t1", false);
    expect(store.getState().topics.t1.done).toBe(false);
    expect(store.getState().reviews.t1).toBeUndefined();
  });

  it("confidence is independent of done", () => {
    const { store } = setup();
    store.setConfidence("t1", 3);
    expect(store.getState().topics.t1).toEqual({ done: false, confidence: 3 });
    store.setConfidence("t1", null);
    expect(store.getState().topics.t1.confidence).toBeUndefined();
  });

  it("reviewing advances the schedule", () => {
    const { store, setNow } = setup();
    store.setTopicDone("t1", true);
    setNow("2026-03-11T10:00:00");
    store.reviewTopic("t1", true);
    expect(store.getState().reviews.t1).toEqual({ step: 1, due: "2026-03-14" });
  });

  it("a wrong quiz answer reschedules the module's completed topics sooner", () => {
    const { store, setNow } = setup();
    store.setTopicDone("t1", true);
    setNow("2026-03-11T10:00:00");
    store.reviewTopic("t1", true); // due 03-14
    store.recordQuiz("q1", false, ["t1", "t2"]);
    const s = store.getState();
    expect(s.reviews.t1).toEqual({ step: 0, due: "2026-03-12" });
    expect(s.reviews.t2).toBeUndefined(); // not done, so nothing to review
    expect(s.quiz.q1).toMatchObject({ attempts: 1, correct: 0, lastCorrect: false });
    store.recordQuiz("q1", true, ["t1"]);
    expect(store.getState().quiz.q1).toMatchObject({ attempts: 2, correct: 1, lastCorrect: true });
  });

  it("records each active day once", () => {
    const { store, setNow } = setup();
    store.setTopicDone("a", true);
    store.toggleBookmark("topic:a");
    setNow("2026-03-11T08:00:00");
    store.setTopicDone("b", true);
    expect(store.getState().activity).toEqual(["2026-03-10", "2026-03-11"]);
  });

  it("visiting a page or changing settings does not count as activity", () => {
    const { store } = setup();
    store.visit("/level/4", "L4 RAG");
    store.setTheme("dark");
    expect(store.getState().activity).toEqual([]);
    expect(store.getState().lastVisited?.href).toBe("/level/4");
  });

  it("toggles bookmarks and removes empty notes", () => {
    const { store } = setup();
    store.toggleBookmark("module:M4.6");
    expect(store.getState().bookmarks["module:M4.6"]).toBeTruthy();
    store.toggleBookmark("module:M4.6");
    expect(store.getState().bookmarks["module:M4.6"]).toBeUndefined();
    store.setNote("module:M4.6", "# hi");
    expect(store.getState().notes["module:M4.6"].text).toBe("# hi");
    store.setNote("module:M4.6", "   ");
    expect(store.getState().notes["module:M4.6"]).toBeUndefined();
  });

  it("clamps scenario self-scores to 1..5", () => {
    const { store } = setup();
    store.recordScenario("s1", 9);
    store.recordScenario("s1", 0);
    expect(store.getState().scenarios.s1.map((r) => r.score)).toEqual([5, 1]);
  });

  it("notifies subscribers", () => {
    const { store } = setup();
    let calls = 0;
    const off = store.subscribe(() => calls++);
    store.setTopicDone("a", true);
    off();
    store.setTopicDone("b", true);
    expect(calls).toBe(1);
  });
});

describe("export, import, reset", () => {
  it("round-trips through export and import", () => {
    const a = setup();
    a.store.setTopicDone("t1", true);
    a.store.setNote("module:M1.1", "note");
    const file = a.store.exportJSON();

    const b = setup();
    expect(b.store.importJSON(file)).toEqual({ ok: true });
    expect(b.store.getState()).toEqual(a.store.getState());
  });

  it("accepts a bare state object and old versions", () => {
    const { store } = setup();
    expect(store.importJSON(JSON.stringify({ version: 1, completed: ["x"] }))).toEqual({ ok: true });
    expect(store.getState().topics.x.done).toBe(true);
  });

  it("rejects bad files without touching state", () => {
    const { store } = setup();
    store.setTopicDone("keep", true);
    const before = store.getState();
    expect(store.importJSON("not json").ok).toBe(false);
    expect(store.importJSON("[]").ok).toBe(false);
    expect(store.importJSON(JSON.stringify({ version: 99 })).ok).toBe(false);
    expect(store.getState()).toBe(before);
  });

  it("reset clears everything", () => {
    const { store, storage } = setup();
    store.setTopicDone("t1", true);
    store.reset();
    expect(store.getState()).toEqual(emptyState());
    expect(JSON.parse(storage.read()!)).toEqual(emptyState());
  });

  it("survives a storage adapter that throws", () => {
    const store = createStore({
      storage: {
        read: () => {
          throw new Error("blocked");
        },
        write: () => {
          throw new Error("full");
        },
      },
    });
    expect(store.getState()).toEqual(emptyState());
    store.setTopicDone("t1", true);
    expect(store.getState().topics.t1.done).toBe(true); // keeps working in memory
  });
});

describe("coding records (v4)", () => {
  it("migrates v3 data without losing it and adds an empty coding map", () => {
    const s = loadState(JSON.stringify({ version: 3, topics: { a: { done: true } }, studyMinutes: { "2026-03-01": 30 } }));
    expect(s.version).toBe(SCHEMA_VERSION);
    expect(s.topics.a.done).toBe(true);
    expect(s.studyMinutes).toEqual({ "2026-03-01": 30 });
    expect(s.coding).toEqual({});
  });

  it("saves drafts without counting activity, and records the first pass", () => {
    const { store, setNow } = setup();
    store.saveCode("t1", "print(1)");
    expect(store.getState().coding.t1).toEqual({ code: "print(1)" });
    expect(store.getState().activity).toEqual([]);
    store.markCodingPassed("t1");
    const first = store.getState().coding.t1.passedAt;
    expect(first).toBeTruthy();
    expect(store.getState().activity).toEqual(["2026-03-10"]);
    setNow("2026-03-12T09:00:00");
    store.markCodingPassed("t1");
    expect(store.getState().coding.t1.passedAt).toBe(first);
    store.saveCode("t1", "");
    expect(store.getState().coding.t1).toEqual({ passedAt: first });
    store.saveCode("t2", "x");
    store.saveCode("t2", "");
    expect(store.getState().coding.t2).toBeUndefined();
  });

  it("sanitizes coding records", () => {
    const s = loadState(
      JSON.stringify({ version: 4, coding: { ok: { code: "x".repeat(30_000), passedAt: "2026-03-01T00:00:00Z" }, empty: {}, bad: 5, num: { code: 7 } } }),
    );
    expect(Object.keys(s.coding)).toEqual(["ok"]);
    expect(s.coding.ok.code!.length).toBe(20_000);
  });
});

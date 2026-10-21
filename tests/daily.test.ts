import { describe, expect, it } from "vitest";
import { levels, moduleHref } from "@/lib/data";
import { dailyGoal, nextBestStep, topicsDoneOn } from "@/lib/daily";
import { toDay } from "@/lib/dates";
import { DEFAULT_DAILY_GOAL, createStore, emptyState, loadState, memoryStorage, type UserState } from "@/lib/store";

const TODAY = "2026-10-21";
const at = (day: string, hour = 12) => new Date(`${day}T${String(hour).padStart(2, "0")}:00:00`).toISOString();
const withTopics = (ids: string[], day = TODAY): UserState => ({
  ...emptyState(),
  topics: Object.fromEntries(ids.map((id) => [id, { done: true, doneAt: at(day) }])),
});

describe("daily goal", () => {
  it("defaults to 2 topics and migrates v8 data to it", () => {
    expect(emptyState().settings.dailyGoal).toBe(DEFAULT_DAILY_GOAL);
    const s = loadState(JSON.stringify({ version: 8, settings: { theme: "dark", weeklyHours: 4 } }));
    expect(s.version).toBe(9);
    expect(s.settings).toEqual({ theme: "dark", targetRole: "none", weeklyHours: 4, dailyGoal: 2 });
  });

  it("keeps a valid goal, including 0 (off), and drops bad values", () => {
    expect(loadState(JSON.stringify({ version: 9, settings: { dailyGoal: 0 } })).settings.dailyGoal).toBe(0);
    expect(loadState(JSON.stringify({ version: 9, settings: { dailyGoal: 5 } })).settings.dailyGoal).toBe(5);
    expect(loadState(JSON.stringify({ version: 9, settings: { dailyGoal: 99 } })).settings.dailyGoal).toBe(2);
    expect(loadState(JSON.stringify({ version: 9, settings: { dailyGoal: "3" } })).settings.dailyGoal).toBe(2);
  });

  it("setDailyGoal clamps and is not counted as study activity", () => {
    const store = createStore({ storage: memoryStorage() });
    store.setDailyGoal(50);
    expect(store.getState().settings.dailyGoal).toBe(20);
    store.setDailyGoal(-3);
    expect(store.getState().settings.dailyGoal).toBe(0);
    expect(store.getState().activity).toEqual([]);
  });

  it("counts only topics ticked done today", () => {
    const s = withTopics(["a", "b"]);
    s.topics.c = { done: true, doneAt: at("2026-10-20") };
    s.topics.d = { done: false };
    expect(topicsDoneOn(s, TODAY)).toBe(2);
    expect(dailyGoal(s, TODAY)).toEqual({ goal: 2, done: 2, met: true });
    expect(dailyGoal({ ...s, settings: { ...s.settings, dailyGoal: 0 } }, TODAY).met).toBe(false);
    expect(toDay(new Date(at(TODAY, 23)))).toBe(TODAY);
  });
});

describe("next best step", () => {
  const first = levels[0].modules[0];

  it("starts at the very first topic", () => {
    const step = nextBestStep(levels, emptyState(), TODAY);
    expect(step).toMatchObject({ kind: "topic", title: first.topics[0].title, href: `/topic/${first.topics[0].id}` });
  });

  it("puts due reviews first", () => {
    const s = { ...emptyState(), reviews: { x: { step: 0, due: "2026-10-20" }, y: { step: 0, due: "2026-10-30" } } };
    expect(nextBestStep(levels, s, TODAY)).toMatchObject({ kind: "review", title: "Review 1 topic due today", href: "/flashcards" });
  });

  it("continues the module you were last in", () => {
    const mod = levels[4].modules[2];
    const s = { ...withTopics([mod.topics[0].id]), lastVisited: { href: moduleHref(mod.id), title: mod.title, at: at(TODAY) } };
    const step = nextBestStep(levels, s, TODAY);
    expect(step.href).toBe(`/topic/${mod.topics[1].id}`);
    expect(step.why).toContain(`1 of ${mod.topics.length} done`);
    const viaTopic = { ...s, lastVisited: { href: `/topic/${mod.topics[0].id}`, title: "", at: at(TODAY) } };
    expect(nextBestStep(levels, viaTopic, TODAY).href).toBe(`/topic/${mod.topics[1].id}`);
  });

  it("suggests the exam once a level is fully ticked, until it is passed", () => {
    const l0 = levels[0];
    const s = withTopics(l0.modules.flatMap((m) => m.topics.map((t) => t.id)));
    expect(nextBestStep(levels, s, TODAY)).toMatchObject({ kind: "exam", href: "/exam/0" });
    const passed = { ...s, exams: [{ id: "e", levelId: 0, startedAt: "", finishedAt: at(TODAY), score: 80, passed: true, quiz: { correct: 8, total: 10 }, coding: { itemId: "", passed: 0, total: 0 }, scenario: { itemId: "", score: 0 }, wrongQuizIds: [], weakModules: [] }] };
    expect(nextBestStep(levels, passed, TODAY).kind).toBe("topic");
  });

  it("ends with interview practice when everything is done", () => {
    const all = levels.flatMap((l) => l.modules.flatMap((m) => m.topics.map((t) => t.id)));
    const exams = levels.map((l) => ({ id: `e${l.id}`, levelId: l.id, startedAt: "", finishedAt: at(TODAY), score: 90, passed: true, quiz: { correct: 9, total: 10 }, coding: { itemId: "", passed: 0, total: 0 }, scenario: { itemId: "", score: 0 }, wrongQuizIds: [], weakModules: [] }));
    expect(nextBestStep(levels, { ...withTopics(all), exams }, TODAY).kind).toBe("interview");
  });
});

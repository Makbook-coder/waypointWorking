// The single home of all user state. Everything the learner does is read and written
// through this module, so swapping localStorage for a backend (e.g. Supabase) means
// replacing the StorageAdapter below and nothing else. See README "Optional Supabase sync".
import { toDay, isDay, type DayString } from "./dates";
import { applyLapse, applyReview, scheduleFirst, type ReviewEntry } from "./review";

export const STORAGE_KEY = "aet:state";
export const SCHEMA_VERSION = 6;

export type Confidence = 1 | 2 | 3;
export type Theme = "system" | "light" | "dark";
export type TargetRole = "none" | "ai-engineer" | "genai-ds";

export interface TopicProgress {
  done: boolean;
  doneAt?: string;
  confidence?: Confidence;
}

export interface QuizRecord {
  attempts: number;
  correct: number;
  lastCorrect: boolean;
  lastAt: string;
}

export interface ScenarioRecord {
  score: number; // 1..5 self-score
  at: string;
}

export interface Note {
  text: string;
  updatedAt: string;
}

export interface LastVisited {
  href: string;
  title: string;
  at: string;
}

/**
 * Bookmark and note keys are "<kind>:<id>":
 *   topic:m4-6-hybrid-retrieval-with-rrf · module:M4.6 · level:4 · practice:m4-6-q1 · resource:M4.6|https://…
 */
export type ItemKey = string;

export interface CodingRecord {
  code?: string; // the learner's draft
  passedAt?: string; // first time every test passed
}

export const MAX_CODE_LENGTH = 20_000;

export interface InterviewAttempt {
  score: number; // 1..5 self-score against the model answer
  at: string;
  answer?: string; // what the learner typed, if anything
}

export interface MockSession {
  id: string;
  startedAt: string;
  finishedAt: string;
  secondsPerQuestion: number;
  itemIds: string[];
  scores: number[]; // aligned with itemIds; 0 = skipped
}

export const MAX_ANSWER_LENGTH = 4_000;
export const MAX_ATTEMPTS_PER_QUESTION = 10;
export const MAX_MOCK_SESSIONS = 50;
export const MAX_FOCUS_SESSIONS = 500;

export interface FocusSession {
  at: string; // when the focus block ended
  minutes: number;
  moduleId: string | null;
}

export interface UserState {
  version: typeof SCHEMA_VERSION;
  topics: Record<string, TopicProgress>;
  quiz: Record<string, QuizRecord>;
  exercises: Record<string, string>; // id -> completedAt
  projectChecks: Record<string, string>; // "<projectId>#<index>" -> checkedAt (level projects, mini-project steps, coding checklists)
  coding: Record<string, CodingRecord>; // coding task id -> draft and first pass
  interview: Record<string, InterviewAttempt[]>; // interview question id -> self-scored attempts, oldest first
  mocks: MockSession[]; // finished mock interviews, oldest first
  focus: FocusSession[]; // finished Pomodoro focus blocks, oldest first
  scenarios: Record<string, ScenarioRecord[]>;
  bookmarks: Record<ItemKey, string>; // key -> addedAt
  notes: Record<ItemKey, Note>;
  reviews: Record<string, ReviewEntry>; // topicId -> next review
  activity: DayString[]; // distinct active days, ascending
  lastVisited: LastVisited | null;
  studyMinutes: Record<DayString, number>; // focused minutes per day (tab visible and recently used)
  log: Record<DayString, Note>; // one study-log entry per day
  settings: { theme: Theme; targetRole: TargetRole; weeklyHours: number };
}

export const DEFAULT_WEEKLY_HOURS = 6;

export function emptyState(): UserState {
  return {
    version: SCHEMA_VERSION,
    topics: {},
    quiz: {},
    exercises: {},
    projectChecks: {},
    coding: {},
    interview: {},
    mocks: [],
    focus: [],
    scenarios: {},
    bookmarks: {},
    notes: {},
    reviews: {},
    activity: [],
    lastVisited: null,
    studyMinutes: {},
    log: {},
    settings: { theme: "system", targetRole: "none", weeklyHours: DEFAULT_WEEKLY_HOURS },
  };
}

// ---------------------------------------------------------------------------
// Migration & sanitizing. Anything unreadable is dropped field by field, so a
// corrupt or hand-edited blob degrades to partial (or empty) state, never a crash.

type Json = Record<string, unknown>;
const isObj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);
const num = (v: unknown, fallback = 0): number => (typeof v === "number" && Number.isFinite(v) ? v : fallback);

/**
 * v1 (the first release format) stored flat lists:
 *   { version: 1, completed: string[], bookmarks: string[], notes: Record<string,string>, theme }
 * Data with no version at all is treated as v1.
 */
function migrateV1(v1: Json): Json {
  const now = new Date().toISOString();
  const completed = Array.isArray(v1.completed) ? v1.completed.filter((x) => typeof x === "string") : [];
  const bookmarks = Array.isArray(v1.bookmarks) ? v1.bookmarks.filter((x) => typeof x === "string") : [];
  const notes = isObj(v1.notes) ? v1.notes : {};
  return {
    version: 2,
    topics: Object.fromEntries(completed.map((id) => [id, { done: true, doneAt: now }])),
    bookmarks: Object.fromEntries(bookmarks.map((k) => [k.includes(":") ? k : `topic:${k}`, now])),
    notes: Object.fromEntries(
      Object.entries(notes)
        .filter(([, t]) => typeof t === "string")
        .map(([k, t]) => [k.includes(":") ? k : `module:${k}`, { text: t, updatedAt: now }]),
    ),
    settings: { theme: v1.theme },
  };
}

/** v3 added studyMinutes, log and settings.weeklyHours; their defaults come from sanitize. */
const migrateV2 = (v2: Json): Json => ({ ...v2, version: 3 });
/** v4 added coding; its default comes from sanitize. */
const migrateV3 = (v3: Json): Json => ({ ...v3, version: 4 });
/** v5 added interview and mocks; defaults come from sanitize. */
const migrateV4 = (v4: Json): Json => ({ ...v4, version: 5 });
/** v6 added focus; its default comes from sanitize. */
const migrateV5 = (v5: Json): Json => ({ ...v5, version: 6 });

const MIGRATIONS: Record<number, (s: Json) => Json> = {
  1: migrateV1,
  2: migrateV2,
  3: migrateV3,
  4: migrateV4,
  5: migrateV5,
};

export function migrate(raw: unknown): Json {
  let s: Json = isObj(raw) ? raw : {};
  let v = num(s.version, 1);
  if (v > SCHEMA_VERSION) return {}; // from a newer app: ignore rather than misread
  while (v < SCHEMA_VERSION) {
    const step = MIGRATIONS[v];
    if (!step) return {};
    s = step(s);
    v = num(s.version, v + 1);
  }
  return s;
}

function mapValues<T>(v: unknown, fn: (x: unknown) => T | undefined): Record<string, T> {
  const out: Record<string, T> = {};
  if (!isObj(v)) return out;
  for (const [k, x] of Object.entries(v)) {
    const r = fn(x);
    if (r !== undefined) out[k] = r;
  }
  return out;
}

export function sanitize(s: Json): UserState {
  const base = emptyState();
  const settings = isObj(s.settings) ? s.settings : {};
  const theme = settings.theme;
  const role = settings.targetRole;
  const last = isObj(s.lastVisited) ? s.lastVisited : null;
  return {
    version: SCHEMA_VERSION,
    topics: mapValues(s.topics, (x) => {
      if (!isObj(x) || typeof x.done !== "boolean") return undefined;
      const c = x.confidence;
      return {
        done: x.done,
        ...(typeof x.doneAt === "string" ? { doneAt: x.doneAt } : {}),
        ...(c === 1 || c === 2 || c === 3 ? { confidence: c } : {}),
      };
    }),
    quiz: mapValues(s.quiz, (x) =>
      isObj(x) && typeof x.lastCorrect === "boolean"
        ? { attempts: num(x.attempts, 1), correct: num(x.correct), lastCorrect: x.lastCorrect, lastAt: str(x.lastAt) }
        : undefined,
    ),
    exercises: mapValues(s.exercises, (x) => (typeof x === "string" ? x : undefined)),
    projectChecks: mapValues(s.projectChecks, (x) => (typeof x === "string" ? x : undefined)),
    coding: mapValues(s.coding, (x) => {
      if (!isObj(x)) return undefined;
      const r: CodingRecord = {};
      if (typeof x.code === "string") r.code = x.code.slice(0, MAX_CODE_LENGTH);
      if (typeof x.passedAt === "string") r.passedAt = x.passedAt;
      return r.code !== undefined || r.passedAt ? r : undefined;
    }),
    interview: mapValues(s.interview, (x) => {
      if (!Array.isArray(x)) return undefined;
      const list = x
        .filter((r): r is Json => isObj(r) && num(r.score) >= 1 && num(r.score) <= 5)
        .map((r) => ({
          score: Math.round(num(r.score)),
          at: str(r.at),
          ...(typeof r.answer === "string" && r.answer ? { answer: r.answer.slice(0, MAX_ANSWER_LENGTH) } : {}),
        }))
        .slice(-MAX_ATTEMPTS_PER_QUESTION);
      return list.length ? list : undefined;
    }),
    mocks: (Array.isArray(s.mocks) ? s.mocks : [])
      .filter((m): m is Json => isObj(m) && Array.isArray(m.itemIds) && Array.isArray(m.scores) && m.itemIds.length === m.scores.length)
      .map((m) => ({
        id: str(m.id),
        startedAt: str(m.startedAt),
        finishedAt: str(m.finishedAt),
        secondsPerQuestion: Math.max(0, Math.round(num(m.secondsPerQuestion))),
        itemIds: (m.itemIds as unknown[]).map((x) => str(x)),
        scores: (m.scores as unknown[]).map((x) => Math.max(0, Math.min(5, Math.round(num(x))))),
      }))
      .slice(-MAX_MOCK_SESSIONS),
    focus: (Array.isArray(s.focus) ? s.focus : [])
      .filter((f): f is Json => isObj(f) && typeof f.at === "string" && num(f.minutes) > 0)
      .map((f) => ({ at: f.at as string, minutes: Math.min(180, Math.round(num(f.minutes))), moduleId: typeof f.moduleId === "string" ? f.moduleId : null }))
      .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
      .slice(-MAX_FOCUS_SESSIONS),
    scenarios: mapValues(s.scenarios, (x) => {
      if (!Array.isArray(x)) return undefined;
      return x
        .filter((r): r is Json => isObj(r) && num(r.score) >= 1 && num(r.score) <= 5)
        .map((r) => ({ score: Math.round(num(r.score)), at: str(r.at) }));
    }),
    bookmarks: mapValues(s.bookmarks, (x) => (typeof x === "string" ? x : undefined)),
    notes: mapValues(s.notes, (x) =>
      isObj(x) && typeof x.text === "string" ? { text: x.text, updatedAt: str(x.updatedAt) } : undefined,
    ),
    reviews: mapValues(s.reviews, (x) =>
      isObj(x) && isDay(x.due) ? { step: Math.max(0, Math.min(3, Math.floor(num(x.step)))), due: x.due as string } : undefined,
    ),
    activity: Array.isArray(s.activity) ? [...new Set(s.activity.filter(isDay))].sort() : [],
    lastVisited: last && typeof last.href === "string" && last.href.startsWith("/")
      ? { href: last.href, title: str(last.title), at: str(last.at) }
      : null,
    studyMinutes: Object.fromEntries(
      Object.entries(isObj(s.studyMinutes) ? s.studyMinutes : {})
        .filter(([d, m]) => isDay(d) && typeof m === "number" && Number.isFinite(m) && m > 0)
        .map(([d, m]) => [d, Math.min(24 * 60, Math.round(m as number))]),
    ),
    log: Object.fromEntries(
      Object.entries(isObj(s.log) ? s.log : {})
        .filter(([d, n]) => isDay(d) && isObj(n) && typeof n.text === "string")
        .map(([d, n]) => [d, { text: (n as Json).text as string, updatedAt: str((n as Json).updatedAt) }]),
    ),
    settings: {
      theme: theme === "light" || theme === "dark" || theme === "system" ? theme : base.settings.theme,
      targetRole: role === "ai-engineer" || role === "genai-ds" || role === "none" ? role : base.settings.targetRole,
      weeklyHours: (() => {
        const h = num(settings.weeklyHours, base.settings.weeklyHours);
        return h >= 1 && h <= 80 ? Math.round(h) : base.settings.weeklyHours;
      })(),
    },
  };
}

/** Parse whatever is in storage into a valid, current-version state. Never throws. */
export function loadState(raw: string | null | undefined): UserState {
  if (!raw) return emptyState();
  try {
    return sanitize(migrate(JSON.parse(raw)));
  } catch {
    return emptyState();
  }
}

// ---------------------------------------------------------------------------
// Storage adapter: the swap point for a real backend.

export interface StorageAdapter {
  read(): string | null;
  write(value: string): void;
}

export const memoryStorage = (initial: string | null = null): StorageAdapter => {
  let value = initial;
  return { read: () => value, write: (v) => void (value = v) };
};

export const browserStorage: StorageAdapter = {
  read() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },
  write(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // storage full or blocked: keep working in memory
    }
  },
};

// ---------------------------------------------------------------------------
// Store

export interface StoreOptions {
  storage?: StorageAdapter;
  now?: () => Date;
}

export type Store = ReturnType<typeof createStore>;

export function createStore({ storage = browserStorage, now = () => new Date() }: StoreOptions = {}) {
  let state: UserState | null = null;
  const listeners = new Set<() => void>();

  const today = () => toDay(now());
  const stamp = () => now().toISOString();

  const read = () => {
    try {
      return storage.read();
    } catch {
      return null;
    }
  };

  function get(): UserState {
    if (!state) state = loadState(read());
    return state;
  }

  function commit(next: UserState, { active = true } = {}) {
    if (active) {
      const d = today();
      if (next.activity[next.activity.length - 1] !== d && !next.activity.includes(d)) {
        next = { ...next, activity: [...next.activity, d].sort() };
      }
    }
    state = next;
    try {
      storage.write(JSON.stringify(next));
    } catch {
      // a failing backend must not break the UI; state stays in memory
    }
    listeners.forEach((l) => l());
  }

  function update(fn: (s: UserState) => UserState, opts?: { active?: boolean }) {
    commit(fn(get()), opts);
  }

  return {
    getState: get,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** Re-read storage (e.g. after another tab changed it). */
    reload() {
      state = loadState(read());
      listeners.forEach((l) => l());
    },

    setTopicDone(topicId: string, done: boolean) {
      update((s) => {
        const prev = s.topics[topicId];
        const reviews = { ...s.reviews };
        if (done) reviews[topicId] = scheduleFirst(today());
        else delete reviews[topicId];
        return {
          ...s,
          topics: { ...s.topics, [topicId]: { ...prev, done, ...(done ? { doneAt: stamp() } : { doneAt: undefined }) } },
          reviews,
        };
      });
    },
    setConfidence(topicId: string, confidence: Confidence | null) {
      update((s) => {
        const prev = s.topics[topicId] ?? { done: false };
        const next: TopicProgress = { ...prev };
        if (confidence) next.confidence = confidence;
        else delete next.confidence;
        return { ...s, topics: { ...s.topics, [topicId]: next } };
      });
    },
    reviewTopic(topicId: string, remembered: boolean) {
      update((s) => {
        const entry = s.reviews[topicId];
        if (!entry) return s;
        const reviews = { ...s.reviews };
        const next = applyReview(entry, remembered, today());
        if (next) reviews[topicId] = next;
        else delete reviews[topicId];
        return { ...s, reviews };
      });
    },
    /** Record a quiz answer. Wrong answers pull the module's completed topics back into review sooner. */
    recordQuiz(itemId: string, correct: boolean, moduleTopicIds: string[] = []) {
      update((s) => {
        const prev = s.quiz[itemId];
        const quiz = {
          ...s.quiz,
          [itemId]: {
            attempts: (prev?.attempts ?? 0) + 1,
            correct: (prev?.correct ?? 0) + (correct ? 1 : 0),
            lastCorrect: correct,
            lastAt: stamp(),
          },
        };
        if (correct) return { ...s, quiz };
        const reviews = { ...s.reviews };
        for (const t of moduleTopicIds) if (s.topics[t]?.done) reviews[t] = applyLapse(reviews[t], today());
        return { ...s, quiz, reviews };
      });
    },
    setExerciseDone(id: string, done: boolean) {
      update((s) => {
        const exercises = { ...s.exercises };
        if (done) exercises[id] = stamp();
        else delete exercises[id];
        return { ...s, exercises };
      });
    },
    setProjectCheck(projectId: string, index: number, checked: boolean) {
      update((s) => {
        const projectChecks = { ...s.projectChecks };
        const key = `${projectId}#${index}`;
        if (checked) projectChecks[key] = stamp();
        else delete projectChecks[key];
        return { ...s, projectChecks };
      });
    },
    /** Save a coding draft. Typing is not study activity on its own; passing the tests is. */
    saveCode(id: string, code: string) {
      update(
        (s) => {
          const coding = { ...s.coding };
          const prev = coding[id] ?? {};
          const next: CodingRecord = { ...prev };
          if (code) next.code = code.slice(0, MAX_CODE_LENGTH);
          else delete next.code;
          if (next.code === undefined && !next.passedAt) delete coding[id];
          else coding[id] = next;
          return { ...s, coding };
        },
        { active: false },
      );
    },
    /** Mark a coding task passed. Keeps the first pass time. */
    markCodingPassed(id: string) {
      update((s) => {
        const prev = s.coding[id] ?? {};
        if (prev.passedAt) return s;
        return { ...s, coding: { ...s.coding, [id]: { ...prev, passedAt: stamp() } } };
      });
    },
    /** Self-score an interview answer. Keeps the last few attempts per question. */
    recordInterview(id: string, score: number, answer = "") {
      const clamped = Math.max(1, Math.min(5, Math.round(score)));
      const text = answer.trim().slice(0, MAX_ANSWER_LENGTH);
      update((s) => {
        const attempt: InterviewAttempt = { score: clamped, at: stamp(), ...(text ? { answer: text } : {}) };
        const list = [...(s.interview[id] ?? []), attempt].slice(-MAX_ATTEMPTS_PER_QUESTION);
        return { ...s, interview: { ...s.interview, [id]: list } };
      });
    },
    saveMock(session: Omit<MockSession, "id" | "finishedAt">) {
      update((s) => {
        const finishedAt = stamp();
        const mock: MockSession = { ...session, id: `mock-${finishedAt}`, finishedAt };
        return { ...s, mocks: [...s.mocks, mock].slice(-MAX_MOCK_SESSIONS) };
      });
    },
    /** Save a finished focus block. A block with the same end time is only saved once (two tabs can both see it end). */
    recordFocus(session: FocusSession) {
      update((s) => {
        if (s.focus.some((f) => f.at === session.at)) return s;
        return { ...s, focus: [...s.focus, session].sort((a, b) => (a.at < b.at ? -1 : 1)).slice(-MAX_FOCUS_SESSIONS) };
      });
    },
    recordScenario(id: string, score: number) {
      const clamped = Math.max(1, Math.min(5, Math.round(score)));
      update((s) => ({ ...s, scenarios: { ...s.scenarios, [id]: [...(s.scenarios[id] ?? []), { score: clamped, at: stamp() }] } }));
    },
    toggleBookmark(key: ItemKey) {
      update((s) => {
        const bookmarks = { ...s.bookmarks };
        if (bookmarks[key]) delete bookmarks[key];
        else bookmarks[key] = stamp();
        return { ...s, bookmarks };
      });
    },
    setNote(key: ItemKey, text: string) {
      update((s) => {
        const notes = { ...s.notes };
        if (text.trim()) notes[key] = { text, updatedAt: stamp() };
        else delete notes[key];
        return { ...s, notes };
      });
    },
    visit(href: string, title: string) {
      update((s) => ({ ...s, lastVisited: { href, title, at: stamp() } }), { active: false });
    },
    setTheme(theme: Theme) {
      update((s) => ({ ...s, settings: { ...s.settings, theme } }), { active: false });
    },
    setTargetRole(targetRole: TargetRole) {
      update((s) => ({ ...s, settings: { ...s.settings, targetRole } }), { active: false });
    },
    setWeeklyHours(hours: number) {
      const weeklyHours = Math.max(1, Math.min(80, Math.round(hours)));
      update((s) => ({ ...s, settings: { ...s.settings, weeklyHours } }), { active: false });
    },
    /** Add focused study minutes to today. Does not count as an activity on its own. */
    addStudyMinutes(minutes: number) {
      if (!(minutes > 0)) return;
      update((s) => {
        const d = today();
        return { ...s, studyMinutes: { ...s.studyMinutes, [d]: Math.min(24 * 60, (s.studyMinutes[d] ?? 0) + minutes) } };
      }, { active: false });
    },
    /** Write the study-log entry for a day (default today). Empty text removes it. */
    setLog(text: string, day: DayString = today()) {
      update((s) => {
        const log = { ...s.log };
        if (text.trim()) log[day] = { text, updatedAt: stamp() };
        else delete log[day];
        return { ...s, log };
      });
    },

    exportJSON(): string {
      return JSON.stringify({ app: "ai-engineering-tracker", exportedAt: stamp(), state: get() }, null, 2);
    },
    /** Accepts an export file or a bare state object. Invalid input leaves state untouched. */
    importJSON(text: string): { ok: true } | { ok: false; error: string } {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        return { ok: false, error: "That file is not valid JSON." };
      }
      const payload = isObj(parsed) && isObj(parsed.state) ? parsed.state : parsed;
      if (!isObj(payload)) return { ok: false, error: "No progress data found in that file." };
      const migrated = migrate(payload);
      if (Object.keys(migrated).length === 0) return { ok: false, error: "This file was made by an unsupported version." };
      commit(sanitize(migrated), { active: false });
      return { ok: true };
    },
    reset() {
      commit(emptyState(), { active: false });
    },
  };
}

/** The app-wide store, backed by localStorage. */
export const store = createStore();

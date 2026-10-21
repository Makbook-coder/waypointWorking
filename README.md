# Waypoint: AI engineering learning tracker

A personal tracker for a 16-level AI engineering curriculum (L0 to L15, seven phases). It covers 165 modules and 1,062 topics. Each module has curated resources, plus quizzes, exercises, interview scenarios and level projects. Progress stays in your browser. There is no backend in v1.

- **Dashboard (`/`)**: shows overall and per-phase progress, where you left off, your daily streak, reviews due today, a recommended focus list and your bookmarks.
- **Roadmap (`/roadmap`)**: a transit-style map with seven colored lines, one per phase. Each level card shows progress, interview and job weight badges, and prerequisite hints. The hints never lock anything.
- **Level (`/level/[id]`)**: modules with topic checkboxes, the level outcome, the project checklist with its definition of done, and level notes.
- **Module (`/module/[id]`)**: four tabs.
  - **Learn**: topics, with done, confidence 1 to 3, a note, a bookmark and a YouTube search link on each, plus the module's verified videos.
  - **Resources**
  - **Practice**: a quiz runner, Python coding tasks that run in the browser, a mini project or exercise, scenarios and the level project.
  - **Notes**: Markdown with autosave and a preview.
- **Practice (`/practice`)**: filter by level, type, difficulty, not attempted or wrong answers. There is a Random 10 quiz mode and an interview mode, which serves timed scenarios with a self-score from 1 to 5.
- **Flashcards (`/flashcards`)**: one card per topic. There are three decks:
  - **Due today**: driven by the spaced-review schedule.
  - **Shaky topics**: topics you rated 1.
  - **A module**: every topic in one module.

  The keyboard shortcuts are Space to flip, 1 for forgot and 2 for remembered.
- **Weekly plan (`/plan`)**: pick your hours per week, and the remaining modules are spread across dated weeks, with an estimated finish date.
- **Progress (`/progress`)**:
  - Focused study time for today, this week and in total, plus a 14-day chart.
  - Quiz accuracy, weak modules and shaky topics.
  - A "what to study next" list.
  - A daily study log and 21 milestone badges.
- **Other pages**: `/bookmarks`, `/search` (client-side fuzzy search over topics, modules, your notes and resources) and `/settings` (export, import, reset, theme and target role).

## Setup

```bash
npm install
npm run dev          # http://localhost:3000
```

Node 20 or newer is required.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server. |
| `npm run build` / `npm start` | Make a production build and serve it. Every roadmap, level and module page is statically generated (191 pages). |
| `npm test` | Run the Vitest unit tests (store, migrations, progress, spaced review, data validation). |
| `npm run lint` / `npm run typecheck` | Run ESLint (next/core-web-vitals) and `tsc --noEmit`. |
| `npm run check` | Run lint, typecheck, test and build in sequence. |
| `npm run scrape` | Regenerate `data/roadmap.json` from the live roadmap site. If a level can't be fetched or parsed, it falls back to that level's snapshot. |
| `npm run scrape:offline` | Rebuild `data/roadmap.json` from the snapshots in `data/raw/` only. |
| `npm run build:resources` | Rebuild `data/resources.json` from `scripts/build-resources.ts`. |
| `npm run build:practice` | Rebuild `data/practice.json` from `content/practice/*.ts`. |
| `npm run build:data` | Run all three data builds. |

Every data script validates its output and exits non-zero on errors. The scrape prints `phases=7 levels=16 modules=165 topics=1062 sessions=286 projects=14`. The practice build prints counts per type and the spread of correct answers across positions A to D.

## Data formats

All data lives in `/data`, and the types are in `src/lib/types.ts`. The app treats this data as read-only.

### `data/roadmap.json`

```ts
{ source, generatedAt, phases: Phase[] }
Phase  { id, order, title, color, levels: Level[] }
Level  { id: 0..15, title, phase, summary, interviewWeight, jobWeight, sessionCount,
         prerequisites: number[], outcome, project: { title, deliverables[] } | null, modules: Module[] }
Module { id: "M4.6", levelId, title, sessionCount, topics: Topic[], tryIt, outcome, mentalModel, isCapstone }
Topic  { id: "m4-6-hybrid-retrieval-with-rrf", title, description }
```

Topic ids are `<module slug>-<slugified title>`, so they stay stable while titles stay stable. All progress is keyed by these ids. `data/raw/level-N.json` holds the per-level snapshots that the scrape builds from.

### `data/resources.json`

`Record<moduleId, Resource[]>`, with 3 to 6 resources per module.

```ts
Resource { type: "video" | "docs" | "article" | "course" | "repo" | "paper", title, url, free: boolean, searchLink?: true }
```

### `data/practice.json`

`Record<moduleId, PracticeItem[]>`. Every item has `{ id, moduleId, levelId, difficulty: "easy" | "medium" | "hard" }` plus one of these shapes:

- `quiz`: `question`, `options` (4), `answer` (0 to 3), `explanation`
- `exercise`: `title`, `task`, `acceptance[]`
- `mini`: `title`, `brief`, `steps[]` (one per module topic, plus a NOTES.md step), `doneWhen` (the module outcome)
- `coding`: `title`, `topicIds[]`, `prompt`, `starter`, `solution`, `tests[]` (`{ name, code }`, Python using `assert`), `checklist[]`
- `scenario`: `title`, `prompt`, `hints[]` (what a strong answer covers)
- `project`: `title`, `checklist[]` (taken from the level deliverables), `definitionOfDone`

The source for practice items is `content/practice/*.ts`, written in a compact tuple format, and `content/coding/tasks.ts` for coding tasks. `scripts/build-practice.ts` adds ids and shuffles quiz options deterministically, seeded by item id.

### User state (localStorage key `aet:state`)

```ts
UserState {
  version: 4,
  topics:        Record<topicId, { done, doneAt?, confidence?: 1|2|3 }>,
  quiz:          Record<quizId, { attempts, correct, lastCorrect, lastAt }>,
  exercises:     Record<exerciseId, completedAt>,
  projectChecks: Record<"<itemId>#<index>", checkedAt>,     // level projects, mini-project steps, coding checklists
  coding:        Record<codingId, { code?, passedAt? }>,     // draft and first full pass
  scenarios:     Record<scenarioId, { score: 1..5, at }[]>,
  bookmarks:     Record<"<kind>:<id>", addedAt>,          // kind: topic | module | level | practice | resource
  notes:         Record<"<kind>:<id>", { text, updatedAt }>,
  reviews:       Record<topicId, { step: 0..3, due: "YYYY-MM-DD" }>,
  activity:      "YYYY-MM-DD"[],                          // distinct active days, used for the streak
  lastVisited:   { href, title, at } | null,
  studyMinutes:  Record<"YYYY-MM-DD", minutes>,          // focused time per day
  log:           Record<"YYYY-MM-DD", { text, updatedAt }>, // study log, one entry per day
  settings:      { theme: "system"|"light"|"dark", targetRole: "none"|"ai-engineer"|"genai-ds", weeklyHours: 1..80 }
}
```

Loading is defensive. The raw string is JSON-parsed and migrated step by step from its version (the `MIGRATIONS` table in `src/lib/store.ts`), then sanitized field by field. Invalid entries are dropped. Unreadable data or data from a newer schema becomes an empty state. Loading never throws.

## Spaced review

When you mark a topic done, its first review is scheduled for tomorrow. Answering "Remembered" moves it through intervals of 1, 3, 7 and 21 days, each counted from the day you review. After the 21-day review the topic graduates. "Forgot" restarts it at 1 day.

A wrong quiz answer pulls every completed topic in that module back one interval, and makes it due tomorrow at the latest. Topics that had already graduated come back into review.

## Deploying to Vercel

1. Push the repo to GitHub.
2. In Vercel, choose **Add New → Project** and import the repo. The framework is detected as Next.js automatically. Build command: `next build`. Output: `.next`.
3. You don't need any environment variables.

You can also deploy with `npx vercel` from the project root. The data JSON is bundled at build time, so to update the content you regenerate the data, commit and redeploy.

## Swapping localStorage for Supabase

All user state goes through `src/lib/store.ts`. Components only call `store.*` actions and read state through `useUserState()`. The persistence boundary is one interface:

```ts
interface StorageAdapter { read(): string | null; write(value: string): void }
```

To move to Supabase:

1. Create a table, for example `progress(user_id uuid primary key references auth.users, state jsonb, updated_at timestamptz)`. Add a row-level-security policy `user_id = auth.uid()`.
2. Write an adapter that keeps the synchronous contract by serving reads from memory. Hydrate it once after sign-in, then write through in the background (debounced):

   ```ts
   export function supabaseStorage(client: SupabaseClient, userId: string, initial: string | null): StorageAdapter {
     let cache = initial;                 // fetched with select state from progress where user_id = …
     let timer: ReturnType<typeof setTimeout> | undefined;
     return {
       read: () => cache,
       write(value) {
         cache = value;
         clearTimeout(timer);
         timer = setTimeout(() => {
           client.from("progress").upsert({ user_id: userId, state: JSON.parse(value), updated_at: new Date().toISOString() });
         }, 800);
       },
     };
   }
   ```

3. After sign-in, create the store with `createStore({ storage: supabaseStorage(...) })` instead of the default `browserStorage`, and call `store.reload()`. On first sign-in you can upload the existing localStorage blob so nobody loses progress. Migrations and sanitizing still run on whatever the server returns.

Nothing else changes. If you later want per-row tables, for example to query progress across users, split the `UserState` maps into tables behind the same adapter.

## Project layout

```
content/practice/   authored quizzes, exercises, scenarios, project definitions of done
content/coding/     authored Python coding tasks (starter, solution, tests)
data/               generated JSON (roadmap, resources, practice) + data/raw snapshots
scripts/            scrape.ts, build-resources.ts, build-practice.ts, copy-pyodide.mjs
public/py-worker.js Web Worker that runs coding tests in Pyodide
src/app/            routes (App Router)
src/components/     UI; client components are marked "use client"
src/lib/            store, review scheduler, progress, focus ranking, search, data access
tests/              Vitest
```

## Decisions

These decisions were made while building v1, without stopping to ask:

1. **Snapshot-based scrape.** The build sandbox couldn't reach the roadmap host directly; the proxy returned 403. The content was extracted level by level through a fetch tool into `data/raw/level-N.json`. `npm run scrape` still tries the live site first, using a heuristic cheerio parser for headings like `M4.6` and `li` topics, and falls back per level to the snapshot. When a live parse succeeds, it refreshes the snapshot.
2. **Paraphrased wording.** Topic descriptions, summaries and outcomes are paraphrased rather than copied. The UI copy (headings, empty states, page intros) is original and never reuses the source site's marketing text. The source is credited in `roadmap.json` (`source`).
3. **Normalized ids.**
   - Level 14 uses `P14.x` ids on the source. They were renamed to `M14.x` so every module follows `M<level>.<n>`.
   - Topic slugs that collide get a `-2` suffix.
4. **Session counts.**
   - Module M3.9 is listed with 0 sessions, so the L3 module sessions add up to the level's stated 11.
   - The session total is 286.
5. **Projects.**
   - L1 and L7 have no level project on the source, so none was invented.
   - L15's project is the full mock interview loop from its capstone module.
   - That gives 14 projects. Each definition of done was written for this app.
6. **Weights and prerequisites** come from the level pages. Prerequisite hints count a prerequisite as "covered" at 80% of its topics, and they never block navigation.
7. **Phase grouping.** The seven phases are Foundations (L0 to L3), Retrieval (L4), Agentic (L5 and L6), Evaluation & Trust (L7 and L8), Production (L9 to L11), Frontier & Proof (L12 to L14) and Interview (L15). They map to the seven color tokens `--phase-1` to `--phase-7`.
8. **Resource verification.**
   - Network access to arbitrary hosts was blocked, so a URL counts as verified only if it appeared in a web search or fetch result during the build. 224 unique URLs were verified this way, mostly official docs, papers and free courses.
   - CampusX links that appear on the roadmap pages are included.
   - Paid items (CampusX One courses and one book) are marked `free: false`.
   - No deep link was guessed.
9. **One search link per module.** Each of the 165 modules gets exactly one YouTube search link (`searchLink: true`, titled "YouTube search: …"). This is in addition to its verified resources, so every module has at least one video entry point without inventing video URLs. These are the only search links in `resources.json`.

   **A YouTube link beside every topic.** Each topic row on module and level pages has a small YouTube button. It opens a YouTube search for the topic title plus the module title for context, so short topic names still find relevant videos. These links are generated at runtime by `src/lib/youtube.ts`, are flagged `searchLink`, and never point at a guessed video. When a module has verified videos (CampusX, Karpathy, 3Blue1Brown), they're listed under "Watch first" at the top of its Learn tab.
10. **Quizzes** cover L0 to L13, with 5 per module (740 in total). They are written to be factually checkable and tied to each module's topics. Answer positions are shuffled deterministically. L14 is a set of portfolio projects and L15 is interview practice, so they get exercises and scenarios instead of quizzes.
11. **Exercises.**
    - 47 modules have a "Try it" prompt on the source. Each was rewritten by hand as a concrete task with acceptance criteria.
    - The other 95 non-capstone modules (L0 to L14) get a mini project instead (see 25).
    - Capstones are covered by the level project instead.
12. **Scenarios** total 67. Most are in L9 (system design, 20) and L15 (interview prep, 30), with a few in L4 to L8 and L10 to L13. The four required scenarios are all present: "RAG quality dropped after a week", "Agent in a costly loop", "Provider latency doubled" and "Design an enterprise support assistant". The quality-drop, costly-loop and latency scenarios have both a design version (L9) and an interview version (L15).
13. **Spaced review.**
    - The unit is the topic, because quizzes are per module.
    - A wrong quiz answer lapses the completed topics of that module, rather than scheduling the question itself.
    - Days are local calendar days.
14. **Recommended focus** ranks unfinished levels by `interview × wI + job × wJ`.
    - The role weights are: Balanced 0.5 / 0.5, AI Engineer 0.35 / 0.65 and GenAI Data Scientist 0.7 / 0.3.
    - Small role boosts apply: LLMOps and platforms for AI Engineers; evaluations, fine-tuning and multimodal for GenAI Data Scientists.
    - The score is multiplied by the remaining fraction, with a 0.6 penalty when prerequisites aren't covered.
15. **The streak** counts days with a learning action, meaning a topic, quiz, exercise, review, note or bookmark. Visiting pages or changing settings doesn't count. A streak stays alive until the end of the following day.
16. **Schema v2 with a v1 migration.** v1 is the simple flat format (`completed[]`, `bookmarks[]`, `notes{}`). It is kept as the reference migration so the migration path is exercised by tests from day one.
17. **No external fonts.** The app uses system font stacks, so builds don't depend on reaching a font CDN. The visual identity comes from the transit-map motif, the phase colors and monospace ids.
18. **Bundling.** The data JSON is imported at build time. Roadmap data and content data (resources and practice) are split, so the roadmap and settings pages don't ship the practice bank.
19. **Flashcards reuse the review schedule.** A flashcard is a topic: the front shows the topic title and the back shows its description plus the module's mental model. Nothing new is stored for cards.
    - In the Due deck, the answer goes through the same `reviewTopic` call as the dashboard.
    - In the Shaky and Module decks, "Forgot" rates the topic 1 (Shaky), and "Remembered" lifts a Shaky topic to 2. These decks don't change the review schedule.
20. **The weekly plan** assumes 1.5 hours per roadmap session, which covers watching plus practice. Modules listed with 0 sessions still get at least 1 hour.
    - Remaining time is scaled by each module's unfinished topics.
    - Modules are scheduled in roadmap order (L0 to L15). This order already respects the prerequisites.
    - A module can span two weeks, and weeks start on Monday.
    - The default pace is 6 hours a week, adjustable from 1 to 40 on the page and up to 80 if stored.
21. **Study time** goes up by one minute for each minute the tab is visible, as long as there was a click, key press or scroll in the last 3 minutes. It's an honest estimate of focused time, not a stopwatch. Logging minutes doesn't count as streak activity on its own; writing in the study log does.
22. **Weak spots** are judged on each question's most recent answer. A module counts as weak when at least two of its questions have been tried and fewer than 60% are currently right.
23. **Badges** are calculated from existing progress and never stored, so they can't drift out of sync. Streak badges use your longest run ever, not just the current one.
24. **Schema v3.** It adds `studyMinutes`, `log` and `settings.weeklyHours`. The v2 to v3 migration only bumps the version, and `sanitize` fills in the defaults.
25. **Mini projects replace the templated exercises.** Each of the 95 modules without a hand-written exercise gets a mini project with one step per topic (title and description), a final NOTES.md step, and "done when" set to the module outcome. Every module's topics are covered, not just the first three. Mini projects keep the old `-ex1` ids, so anything already marked done still counts. Steps are stored in `projectChecks`, and "Project complete" uses `exercises`, so no new state was needed.
26. **Coding tasks run Python in the browser with Pyodide.** There are 37 hand-written tasks across L0 to L13. Each is tied to specific topics, and each `topics` entry must match a topic title in its module or the build fails. Only the standard library is used, because extra Pyodide packages would need more self-hosted wheels.
27. **Pyodide is self-hosted.** `pyodide@0.26.4` is pinned in `package.json`. `scripts/copy-pyodide.mjs` runs before `dev` and `build` and copies the runtime (about 14 MB, mostly the wasm file) into the git-ignored `public/pyodide/`. Nothing loads from a CDN, and the runtime downloads only when you first press Run.
28. **Tests run in a Web Worker with a 10 second limit.** If a run goes over, the worker is terminated and restarted, so an infinite loop never freezes the page. The harness in `src/lib/coding.ts` runs your code once, then runs each test against a fresh copy of its globals. It allows top-level `await`, so async tasks can be tested; Pyodide can't call `asyncio.run`.
29. **Every coding task is checked twice in CI-style tests.** `tests/coding.test.ts` runs every task with local `python3` through the same harness: the reference solution must pass all of its tests and the starter must fail at least one. The tasks were also run once under real Pyodide in Node. That check found two tasks that would have broken in the browser: one needed `sqlite3`, which isn't in the base runtime, and one used `asyncio.run`. Both were rewritten.
30. **Schema v4** adds `coding: { [taskId]: { code?, passedAt? } }`. Drafts save as you type, are capped at 20,000 characters, and don't count as streak activity. The first time all tests pass is recorded once and counts as activity. Checklist ticks reuse `projectChecks`.

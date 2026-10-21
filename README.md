# Waypoint: AI engineering learning tracker

A personal tracker for a 16-level AI engineering curriculum (L0 to L15, seven phases). It covers 165 modules and 1,062 topics. Each module has a short built-in study note, curated resources, plus quizzes, exercises, interview scenarios and level projects. Progress stays in your browser. There is no backend in v1.

- **Dashboard (`/`)**: shows overall and per-phase progress, where you left off, your daily streak, reviews due today, a recommended focus list and your bookmarks.
- **Roadmap (`/roadmap`)**: a transit-style map with seven colored lines, one per phase. Each level card shows progress, interview and job weight badges, and prerequisite hints. The hints never lock anything.
- **Level (`/level/[id]`)**: the five most common beginner mistakes for that level (each opens to show how to spot it and how to fix it), modules with topic checkboxes, the level outcome, the project checklist with its definition of done, and level notes.
- **Module (`/module/[id]`)**: four tabs.
  - **Learn**: an "Understand it" note (what it is, why it matters, a tiny example, common mistakes), a "Picture it" diagram of how the module's main pieces fit, a worked example you step through one line at a time followed by a similar "Your turn" problem with two hints, then topics. Each topic has an "Explain simply" note for beginners and can be marked done, confidence 1 to 3, a note, a bookmark and a YouTube search link on each, plus the module's verified videos.
  - **Resources**
  - **Practice**: a quiz runner, Python coding tasks that run in the browser, a mini project or exercise, an interview question, scenarios and the level project.
  - **Notes**: Markdown with autosave and a preview.
- **Practice (`/practice`)**: filter by level, type, difficulty, not attempted or wrong answers. There is a Random 10 quiz mode and an interview mode, which serves timed scenarios with a self-score from 1 to 5.
- **Mock interview (`/interview`)**: timed runs of 5, 10 or 15 questions from a 151-question bank (one per module). You type an answer (optional), reveal the model answer, tick the key points you covered and self-score 1 to 5. Weak answers come back first. Every mock is saved, with your average, and the page lists your weakest answers.
- **Flashcards (`/flashcards`)**: one card per topic. There are three decks:
  - **Due today**: driven by the spaced-review schedule.
  - **Shaky topics**: topics you rated 1.
  - **A module**: every topic in one module.

  The keyboard shortcuts are Space to flip, 1 for forgot and 2 for remembered.
- **Focus timer (`/focus`)**: Pomodoro blocks of 25/5, 50/10 or 15/3 minutes, tied to a module if you like. The timer keeps running across pages, shows its countdown in the header, chimes when a block ends (with an optional browser notification) and logs every finished block.
- **Cheat sheets (`/cheatsheet`)**: one printable page per level with each module's gist, mental model, topics, traps to avoid and interview key points. Linked from every level page and the roadmap.
- **Weekly plan (`/plan`)**: pick your hours per week, and the remaining modules are spread across dated weeks, with an estimated finish date.
- **Progress (`/progress`)**:
  - Focused study time for today, this week and in total, plus a 14-day chart.
  - Quiz accuracy, weak modules and shaky topics.
  - A "what to study next" list.
  - A daily study log and 21 milestone badges.
- **Start here (`/start`)**: a beginner on-ramp with the daily study loop, a setup checklist (Python, editor, terminal, git), links to the refresher modules and an in-browser Python warm-up lab.
- **Guided labs (`/labs`, and first in each module's Practice tab)**: 15 step-by-step builds, one per level from L0 to L13 plus the warm-up. Each lab is one Python file that grows over four or five steps. Steps go from *guided* (fill the gaps) to *partial* (a signature and a docstring) to *open* (just the spec), and each ends with a checkpoint that runs the tests in the browser. You can download your file as a `.py` with its tests, or run it in Colab.
- **"Stuck? start here" hints**: every coding task, lab step, scenario, mini project and exercise reveals help one rung at a time (hint 1, hint 2, then the solution) so you try first and only see as much as you need. Some coding tasks are "debug this" tasks, where the starter is broken code to fix.
- **Level exams (`/exam`)**: a 30-minute timed exam for each level from L0 to L13, with 10 quiz questions across the level's modules, one coding task and one scenario. The pass mark is 70%. Afterwards you review every mistake, and the topics of modules you were weak on come back for spaced review the next day. Your best score is kept.
- **Capstone guides**: each level project has milestones with concrete tasks, a definition of done and a self-review rubric (1 to 4 per criterion) that is saved.
- **Readiness (`/readiness`)**: for your target role, a score per level built from exams, quizzes, coding, labs, scenarios, projects, topics and mock interviews, plus a ranked list of gaps with links. It is a guide to what to practise next. Practice improves your readiness, but no score here guarantees passing an exam or interview.
- **Optional AI tutor**: connect a free Gemini key (or a local Ollama model) in Settings to get AI grading of written answers, an "Ask tutor" chat on every topic and module, extra AI-written quiz questions and scenarios, hints on your coding drafts, and an AI interviewer that asks follow-up questions. See [Optional AI tutor](#optional-ai-tutor). Everything else works without it.
- **Glossary (`/glossary`)**: about 250 terms in plain words, each linked to the module that teaches it, with search and an A to Z jump. In the "Understand it" and "Explain simply" notes, the first mention of a glossary term has a dotted underline: hover or tap it for the definition without leaving the page.
- **Explanation levels and topic pages**: every "Explain simply" panel has a Beginner / Developer / Interview switch that is remembered across the app. Each topic also has its own page (`/topic/<id>`) in a fixed order: what it is, why it matters, how it works step by step, a tiny example, the mistake to avoid and where it's used, then the analogy and where it breaks, a before/after view, a key takeaway, a "before this" prerequisite check and the words on the page.
- **Other pages**: `/bookmarks`, `/search` (client-side fuzzy search over topics, modules, your notes and resources) and `/settings` (export, import, reset, theme, target role, AI tutor and optional cloud sync).

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
- `interview`: `question`, `answer` (model answer), `keyPoints[]` (3 to 5 points a strong answer covers)
- `coding`: `title`, `topicIds[]`, `prompt`, `starter`, `solution`, `tests[]` (`{ name, code }`, Python using `assert`), `checklist[]`, `hints` (two strings, the first two rungs of the hint ladder), `kind: "build" | "debug"`
- `scenario`: `title`, `prompt`, `hints[]` (what a strong answer covers)
- `project`: `title`, `checklist[]` (taken from the level deliverables), `definitionOfDone`

The source for practice items is `content/practice/*.ts`, written in a compact tuple format, `content/coding/tasks.ts` and `tasks-extra.ts` for coding tasks (hints for the original tasks are in `content/coding/hints.ts`) and `content/interview/*.ts` for interview questions. `scripts/build-practice.ts` adds ids and shuffles quiz options deterministically, seeded by item id. The build fails if a coding task has no hints, or if any level from L0 to L13 has fewer than 2 coding tasks or 3 scenarios.

### Labs and capstones

Labs are not in `practice.json`. They are TypeScript in `content/labs/` (`LabSrc`: `id`, `moduleId`, `title`, `goal`, `preamble`, `steps[]`, `stretch[]`; each step has `title`, `mode`, `instructions`, `scaffold`, `solution`, `tests[]` and two `hints`). A step's checkpoint runs the tests of that step and every step before it. `tests/labs.test.ts` runs every step with real Python and checks that the reference passes and the scaffold alone fails.

Capstone guides are in `content/capstones.ts`: per level, `days`, four `milestones` (`title`, `tasks[]`) and two level-specific rubric criteria added to the four shared ones.

### User state (localStorage key `aet:state`)

```ts
UserState {
  version: 8,
  topics:        Record<topicId, { done, doneAt?, confidence?: 1|2|3 }>,
  quiz:          Record<quizId, { attempts, correct, lastCorrect, lastAt }>,
  exercises:     Record<exerciseId, completedAt>,
  projectChecks: Record<"<itemId>#<index>", checkedAt>,     // level projects, mini-project steps, coding checklists
  coding:        Record<codingId, { code?, passedAt? }>,     // draft and first full pass; labs use "lab:<id>" and "lab:<id>#<step>"
  interview:     Record<questionId, { score: 1..5, at, answer?, ai?: true }[]>, // last 10 attempts; ai = scored by the AI tutor
  mocks:         { id, startedAt, finishedAt, secondsPerQuestion, itemIds[], scores[] }[], // last 50; score 0 = skipped
  focus:         { at, minutes, moduleId }[],               // finished Pomodoro blocks, last 500
  scenarios:     Record<scenarioId, { score: 1..5, at, ai?: true }[]>,
  generated:     Record<moduleId, (QuizItem | ScenarioItem)[]>, // AI-written practice, last 60 per module
  exams:         { id, levelId, startedAt, finishedAt, score, passed, quiz, coding, scenario, wrongQuizIds[], weakModules[] }[], // last 100
  rubrics:       Record<"<projectId>#<criterion>", 1..4>,   // capstone self-review
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

## Optional Supabase sync

Sync is **off by default**. With no configuration the app is fully local, and the Settings page says so. To sync progress across devices:

1. Create a free project at supabase.com.
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql). It creates a `waypoint_progress` table with one row per user, and row-level security so each user can only read and write their own row.
3. Under Authentication → URL configuration, set the Site URL to your deployed URL, for example `https://your-app.vercel.app`, and add `https://your-app.vercel.app/settings` to the redirect URLs. Email sign-in is on by default.
4. Set two environment variables in Vercel (Project → Settings → Environment Variables), or in `.env.local` for local dev. Copy them from Project Settings → API:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

   The anon key is designed to be public. Row-level security is what protects the data, so never put the `service_role` key in the app.
5. Redeploy. Settings now shows **Cloud sync**: enter your email, open the sign-in link, and your progress uploads. On another device, sign in with the same email and it downloads.

How it works:
- localStorage stays the copy the app reads, so everything works offline and stays instant.
- `src/lib/sync/engine.ts` pulls the cloud row on start and whenever the tab becomes visible. It pushes about 1.5 seconds after you stop making changes.
- A push only overwrites the version it last saw. If another device wrote in between, it re-reads first.
- When both sides changed, the newer copy is kept whole. The other copy is saved locally and offered as a download that the Import button accepts (see decision 35).
- The Supabase library is loaded only when sync is configured, so the default build doesn't ship it.

The persistence boundary inside the store is still the `StorageAdapter` (`read()` / `write()`), if you'd rather replace localStorage outright.

## Optional AI tutor

The AI features are **off until you add a provider** in Settings → AI tutor. There is no server: the browser calls the provider directly, so nothing is proxied or logged by this app.

### Get a free Gemini key

1. Go to [Google AI Studio → API keys](https://aistudio.google.com/apikey) and sign in with a Google account.
2. Click **Create API key**. The free tier needs no credit card.
3. In Waypoint, open **Settings → AI tutor**, keep **Google Gemini** selected, paste the key, press **Save**, then **Test connection**.

### Choosing a model

The default model is `gemini-flash-latest`, an alias Google keeps pointed at its newest Flash model, which is what the free tier covers. To use a different one, go to Settings → AI tutor:

- type any model id into the **Model** field, or click one of the suggestions (for example `gemini-flash-lite-latest`, which is faster and has higher free limits, or `gemini-2.5-pro`, which is stronger but usually needs billing);
- or press **Fetch my models** to list exactly the chat models your key or local server can use (Gemini's `models` endpoint, or `/models` for Ollama and OpenAI-compatible APIs), then pick one.

**Test connection** uses the model in the field, so you can try a model before you save it. Every AI panel shows which model is answering, and the model name links back to Settings. If a model doesn't exist or your key can't use it, the app tells you to pick another one.

### Other providers

- **Ollama (fully local, free):** install [Ollama](https://ollama.com), run `ollama pull llama3.2`, then start it so the browser may call it: `OLLAMA_ORIGINS=* ollama serve` (or set it to your site's address). Pick **Ollama** in Settings. The default URL is `http://localhost:11434/v1`. Nothing leaves your computer. Smaller local models grade less reliably.
- **Any OpenAI-compatible API:** enter a base URL (the part before `/chat/completions`), a model and a key. This works with services that allow browser (CORS) requests, for example Groq (`https://api.groq.com/openai/v1`), OpenRouter (`https://openrouter.ai/api/v1`) or LM Studio. Many of them have free tiers.

### What it does

| Where | Feature |
| --- | --- |
| Interview questions (module Practice tab, `/interview`, company questions) | **Grade my answer with AI**: a 1 to 5 score using the same scale as self-scoring, what worked, what to improve, and a comparison with the model answer. It ticks the key points you covered. **Save AI score** adds it to your score history (marked `ai`), or you can still pick your own score. |
| Scenarios | Write an answer and have it graded against what a strong answer covers. |
| Interview questions, company drills, scenarios, system-design prompts and debug snippets | **Ask AI about this question**: ask anything about that item (what the interviewer wants, a hint without the answer, whether your draft is on track). The chat knows the question, its model answer or key points, and your draft. |
| Every topic row and every module's Learn tab | **Ask tutor**: a short chat that explains in beginner language. The prompt includes that topic's or module's own notes so answers match the course. Chats aren't saved. |
| Module Practice tab | **Generate 5 quiz questions / 2 interview scenarios** for that module. They're checked (4 distinct options, a valid answer, no repeats of existing questions), saved in your progress (so they're exported and synced), marked **AI**, and removable. |
| Coding tasks | **Get a hint from AI**: reviews your draft and your last test run, and gives up to three hints without the solution. The reference solution is never sent, and any code block longer than four lines in the reply is hidden. |
| Mock interview | **AI interviewer** (on by default when AI is set up): after your answer it asks up to three follow-up questions, and grading then takes the whole exchange into account. Any interview card also has **Practice follow-ups**. |

AI buttons are never greyed out without a reason. If no key is set, clicking one explains how to add it. If grading needs an answer, it says to write one first.

### Privacy

- The key is stored in this browser's localStorage under its own key (`aet:ai`). It is **not** part of `aet:state`, so it never appears in a JSON export or in cloud sync. **Forget key** removes it.
- When you use an AI feature, what you typed (your answer, code or question) and the relevant course notes are sent to the provider you chose, and nothing else. No progress data, notes or bookmarks are sent.
- Google's terms allow it to use **free-tier** Gemini API traffic to improve its products, and humans may review it. Don't paste anything private. Use Ollama if you want everything to stay on your machine.
- A key in localStorage can be read by anyone with access to the browser profile, or by a script running on the page. Use **Forget key** on shared computers.

### Limits

- Free tiers allow only a handful of requests per minute and a daily cap, and Google changes the numbers from time to time. When you hit one, the app says so (with the wait time when the provider gives it) and nothing is lost. Wait a minute and try again.
- Requests time out after 60 seconds and can be cancelled.
- AI grading and AI-written questions can be wrong. Self-scoring stays available everywhere, and AI items are labeled.

The code lives in `src/lib/ai/`: `config.ts` (settings storage), `provider.ts` (Gemini and OpenAI-compatible clients, error handling), `tasks.ts` (prompts and response parsing for each feature) and `use-ai.ts` (React hooks). Tests use a mocked `fetch` and a mocked provider (`tests/ai.test.ts`).

## Project layout

```
content/practice/   authored quizzes, exercises, scenarios, project definitions of done
content/coding/     authored Python coding tasks (starter, solution, tests, hints)
content/labs/       guided labs, one evolving Python file per lab, verified step by step
content/mistakes.ts five common beginner mistakes per level, with how to spot and fix each
content/capstones.ts milestones and rubric criteria for each level project
docs/               practice-plan.md (the practice audit and plan)
content/interview/  authored interview questions, model answers and key points
content/notes/      authored "Understand it" study notes, one per non-capstone module
content/topic-notes/ authored beginner "Explain simply" notes, one per topic
content/glossary/   authored plain-word glossary terms, each tied to the module that teaches it
content/explainers/ authored diagram, worked example and "your turn" problem per non-capstone module
content/topic-depth/ authored per-topic depth: why, steps, uses, analogy limits, before/after, developer and interview wording, takeaway
data/               generated JSON (roadmap, resources, practice) + data/raw snapshots
scripts/            scrape.ts, build-resources.ts, build-practice.ts, copy-pyodide.mjs
public/py-worker.js Web Worker that runs coding tests in Pyodide
src/app/            routes (App Router)
src/components/     UI; client components are marked "use client"
src/lib/            store, review scheduler, progress, focus ranking, Pomodoro timer, search, data access
src/lib/sync/       optional Supabase sync (engine, remote, browser client)
src/lib/ai/         optional AI tutor (settings, provider clients, prompts and parsers)
supabase/schema.sql table and row-level-security policies for sync
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
   - Network access to arbitrary hosts was blocked, so a URL counts as verified only if it appeared in a web search or fetch result during the build. 224 unique URLs were verified this way at first, and 231 after the re-check in decision 38, mostly official docs, papers and free courses.
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
31. **One interview question per module.** All 151 non-capstone modules, L0 to L15, have one hand-written conceptual question. Each has a model answer of a few sentences and 3 to 5 key points. Capstones are covered by level projects. Scenarios stay separate: they are open-ended design prompts, and the practice page's timed scenario drill (renamed from "Interview mode") still serves them.
32. **Self-grading is guided, not automatic.** After you reveal the model answer, you tick the key points you covered. The card then suggests a score from 1 (none covered) to 5 (all covered), but you choose the score. Automatic grading of free text would need an LLM call and a backend, so it's out of scope for a local-only app. Typed answers are optional and are saved with the score.
33. **Mock question order.** A mock takes questions with a latest score of 1 or 2 first, then questions you haven't tried, then the rest by rising score. Ties are random, so repeat mocks vary. The timer counts down and warns you when time is up, but it never submits or skips for you.
34. **Schema v5** adds `interview` (the last 10 attempts per question) and `mocks` (the last 50 sessions). Both are capped so localStorage stays small, and answers are capped at 4,000 characters. The text-answer mock interview from the second feature list is built here.
35. **Sync is whole-document, last writer wins, with a safety copy.** Progress is one JSON document of a few hundred KB at most, so syncing it as one row is simple and cheap. Merging every field (ticks, unticks, notes, attempts) would need per-field timestamps and tombstones throughout the schema. When both sides changed, the copy with the later change is kept. The other copy is never silently dropped: it's saved locally as an export file the user can download and re-import.
36. **localStorage stays primary even when sync is on.** The UI never waits on the network. A failed sync shows an error in Settings and retries on the next change or focus, and nothing is lost.
37. **Magic-link sign-in only.** There are no passwords to store or reset, and it works with Supabase's default email auth. Signing in with a different account on the same device resets the sync position, so one account's data is never pushed into another's row without the usual conflict check.
38. **Resource re-check (October 2026).** All 224 verified links were fetched again. None were dead, but 8 had moved or been renamed and were updated: Pydantic models, the LangChain quickstart, Google ADK (now adk.dev) and its multi-agent page, the E2B quickstart, MLflow model versions (now the `latest` docs path), Microsoft Foundry (renamed from Azure AI Foundry) and the one paid book (now a bookshop.org link instead of a retailer). A LiveKit voice page was dropped in favor of the LiveKit Agents docs. 52 resources were added to the 43 modules that had only two verified links, using 8 new verified URLs (tiktoken, the OpenAI and Claude batch APIs, OpenAI prompt caching, GitHub's Python guide, TRL GRPO and GKD trainers, and GitHub profile READMEs) plus existing ones that fit. The total is now 705 resources and 231 unique verified URLs. Every module except M15.9 has at least three verified links.
39. **Built-in "Understand it" notes.** Each of the 151 non-capstone modules has a short note written for this app, in `content/notes/`, shown at the top of its Learn tab. It has four parts: what it is, why it matters, a tiny example and common mistakes. Notes are plain sentences with `backticks` for code, kept to a few lines so they orient you before the resources rather than replace them. The 14 capstone modules have no note, since they are build projects rather than concepts. A data test checks that every non-capstone module has exactly one complete note.
40. **The focus timer lives outside user state.** Its ticking state sits in its own localStorage key (`aet:pomodoro`), so it survives reloads and is shared by open tabs without rewriting the whole progress document every second. Only finished focus blocks reach `UserState` (schema v6 adds `focus`, the last 500 blocks). The tab that notices a block ending writes the new timer state before saving the block, and blocks are de-duplicated by end time, so two open tabs log it once.
41. **Focus blocks and study minutes stay separate.** The passive study timer already counts minutes you're active in the app. A Pomodoro block can include reading elsewhere, so it is reported on its own as blocks and minutes instead of being added to study minutes, which would double-count. A block only counts if it runs to the end. Pausing is fine, but resetting drops it. After a block, the break starts automatically; after a break, the timer waits for you.
42. **Cheat sheets are assembled, not separately written.** Each sheet is built at build time from content the app already has: the module notes, mental models, topic titles and the first four key points of the module's interview question. Capstones use their outcome as the gist. This keeps one source of truth, so fixing a note fixes its sheet. Print styles hide the navigation, switch to black on white whatever the theme, and keep each module together on a page.
43. **"Explain simply" notes per topic.** Each topic has a short beginner note in four parts: what it means in plain words, an everyday analogy (left out when none fits), a tiny example and one common mistake. They're written for this app in `content/topic-notes/`, one file per level, and keyed by topic id. A data test rejects unknown ids, empty sections and half-finished levels, so a level ships with all its notes or none. The module page passes only that module's notes to the client, so the full set (about 1,000 notes) stays out of the browser bundle. Every topic in L0 to L15 has one.
44. **AI tutor is bring-your-own-key, called from the browser.** A server proxy would need hosting and would hold a shared key, so instead each learner pastes their own free key, stored in a separate localStorage key so exports and sync never carry it. Gemini is the default because its free tier needs no card. Ollama and any OpenAI-compatible URL share one client. Prompts put learner text inside tags and tell the model to treat it as material, never instructions. Replies that must be structured (grades, generated questions) are requested as JSON, then validated and clamped, so a bad reply becomes a friendly "try again" rather than broken state. AI scores go into the existing history with an `ai` flag (schema v7), and the learner chooses whether to save them.
45. **Practice-first work ships as one PR with focused commits.** Hints, extra practice, labs, exams, capstones, the on-ramp and readiness each landed as their own commit with tests, so any one can be reviewed or reverted alone. The audit and plan are in `docs/practice-plan.md`.
46. **The hint ladder reveals one rung at a time.** Hint 1 points at the approach, hint 2 at the tricky part, and the solution comes last. Coding tasks and lab steps have two hand-written hints each, and the build fails without them. Mini projects and exercises build their ladder from the module's own "Understand it" note, so nothing needs writing twice. Scenarios reveal their strong-answer points in stages.
47. **"Debug this" is a coding task kind, not a new item type.** The starter is plausible but broken code, and the tests are the bug report. It reuses the runner, the progress and the practice filters.
48. **A lab is one evolving file with cumulative checkpoints.** Each step appends its scaffold to the learner's file, and its checkpoint runs every earlier step's tests too, so a later change can't quietly break earlier work. Progress reuses the `coding` map (`lab:<id>` for the draft, `lab:<id>#<step>` per checkpoint), so labs needed no schema change and sync for free.
49. **One lab per level, not one per module.** Fifteen verified labs (the level's core module plus a Python warm-up) were worth more than 128 thin ones. Every other module's mini project now has "run it locally or in Colab" steps and the hint ladder instead.
50. **Exams mix the level's own items with fixed weights.** Quiz 60%, coding 25% and scenario 15%, pass mark 70%, 30 minutes. Questions are sampled round-robin across the level's modules from a seed, putting questions you got wrong before first. The scenario is self-scored against its points, as everywhere else. Modules you were weak on have their topics lapsed in the review schedule so they are due the next day. Exams are stored in `exams` (schema v8, the last 100 kept).
51. **No exam for L14 and L15.** L14 is the portfolio capstone and L15 is interview prep, which the mock interviews and the L15 scenarios already test.
52. **Capstones are judged with a saved self-review rubric.** Four shared criteria (works end to end, evidence not vibes, handles failure, you can explain it) plus two per level, on a 1 to 4 scale. Milestone ticks reuse `projectChecks`. Scores go in `rubrics`.
53. **Readiness is a weighted guide, and says so.** Per level: exam 30, mocks 20 (L15 only), quizzes 15, coding 15, labs 15, scenarios 10, project 10, topics 5, normalised to what that level has. Levels are weighted by the target role's importance. The page and the README both say that practice improves readiness but guarantees nothing.
54. **Glossary terms are found, not tagged.** Notes stay plain sentences; `src/lib/glossary.ts` builds one matcher from every term and spelling and finds them at render time, longest phrase first. Acronyms and mixed-case names (RAG, LoRA, LangChain) must match their capitals so ordinary words never light up, hyphenated words count as one word so "agent" doesn't fire inside "multi-agent", and code spans are skipped. Only the first mention per note is underlined. The definition card is positioned against the viewport so it stays on screen on a phone, and a data test rejects duplicate spellings and unknown modules.
55. **Diagrams are data, drawn with HTML.** Each module's "Picture it" diagram is a short list of steps (`Label :: detail`, with `|` for side-by-side options) and a shape: flow, loop or hub. One component draws all 151, as boxes and arrows that run across on wide screens and down on phones, so they are real text (searchable, readable by screen readers, themed and printable) rather than 151 hand-drawn images. Worked examples reveal one step at a time so you can predict the next line before you see it, and each ends with a similar problem whose hints and answer use the same hint ladder as practice. Only the current module's explainer is sent to the browser.
56. **Mistakes are per level, with a symptom.** The module notes already list mistakes in passing; the level page adds the five that trip beginners up most, each with "how to spot it" written as something you can observe in your own work (a log line, a symptom, a test result), because naming a mistake doesn't help if you can't tell you're making it. Each links to the module that teaches the fix. A data test requires exactly five per level.
57. **Explanation levels share one switch, and a topic page has a fixed order.** Beginner is the existing "Explain simply" note; Developer and Interview wording, plus why it matters, steps, where it's used, where the analogy breaks, before/after and a takeaway, live in `content/topic-depth/`. The chosen level is a display preference in its own localStorage key, not progress, so it needs no schema bump. Every `/topic/<id>` page reads top to bottom as what it is, why it matters, how it works, tiny example, mistake to avoid, where it's used. Depth is written a level at a time; a validation test rejects a half-written level, and topics in unwritten levels show the sections they have.

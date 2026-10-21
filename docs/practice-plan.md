# Practice plan: making Waypoint hands-on

Goal: someone who starts as a beginner and works through Waypoint should finish with a lot of real practice behind them, enough to walk into AI engineering interviews and exams prepared. Practice improves readiness. Nothing here guarantees passing any particular exam or interview, and the app says so wherever it shows a score.

## What exists today (audit, 2026-10-21)

| Practice type | Count | Where | Notes |
| --- | --- | --- | --- |
| Quizzes | 740 (5 per module, L0 to L13) | Module Practice tab, `/practice` | Good spread. Wrong answers pull topics back into review. |
| Coding tasks (in-browser Python) | 38 | Module Practice tab | Strong format (tests, reference solution). Thin: L1 has 2 for 12 modules, L7, L8, L11 and L12 have 1, L10 has 0. No debugging tasks. |
| Mini projects | 114 | Module Practice tab | One per non-capstone module, generated from topic titles. A checklist, not a guided build. No starter code or setup steps. |
| Exercises | 47 | L1, L10 to L13 | Hand-written task and acceptance criteria. No starter or checkpoints. |
| Interview bank | 151 + sourced company questions | `/interview`, Practice tab | Self-scored mock runs. Solid. |
| Scenarios | 67 | Mostly L9 (20) and L15 (30) | None for L0 to L3. One or two for L4 to L8, L10 to L13. |
| Level projects | 14 | Level page | Deliverables checklist and a one-line definition of done. No milestones or rubric. |
| Flashcards, Explain simply notes, cheat sheets | 1,062 topics | Learn tab, `/flashcards`, `/cheatsheet` | Learning support, not practice. |

## Biggest gaps

1. **No hand-holding when stuck.** Coding tasks jump from "prompt" to "full solution". Beginners need small nudges first.
2. **No guided builds.** Mini projects say *what* to build but not *how*, step by step, with a check that each step works.
3. **No way to prove a level is learned.** There is no timed, mixed assessment with a pass mark, so "done" means "ticked the topics".
4. **Level projects are vague.** A deliverables list and one sentence of done is not enough for a beginner to plan a multi-day build or judge their own result.
5. **No on-ramp.** L0 assumes Python, a terminal and git. A complete beginner has nowhere to start.
6. **No view of readiness.** Progress shows topics ticked, not practice done, scores or what is still missing for a target role.
7. **Uneven practice volume.** Coding and scenarios are thin outside a few levels.

## What we build, in priority order

Each item is a separate commit with tests, so it can be reviewed or reverted on its own.

1. **Hint ladder on all practice ("Stuck? start here").** Hint 1, hint 2, then the solution, one click at a time. Coding tasks get two authored hints each. Scenarios reveal their strong-answer points in stages. Mini projects and exercises get a ladder built from the module's own notes (what it is, common mistakes, then the done-when and try-it).
2. **More practice volume.** New coding tasks for the thinnest levels (L1, L7, L8, L10, L11, L12, L13), a new "debug this" task kind where the starter is broken code to fix, and scenarios for every level from L0 to L13 so each level exam has one to draw from.
3. **Guided labs.** One lab per level for L0 to L13, on the level's core module, runnable in the browser. Each lab is one evolving Python file built over four or five steps, with a checkpoint (tests) after each step. Steps move from *guided* (most code given, fill the gaps) to *partial* (a signature and a docstring) to *open* (just the spec and the tests). Every other module's mini project gets "run it locally or in Colab" setup steps.
4. **Level exams.** A 30-minute timed exam per level (L0 to L13): 10 quiz questions sampled across the level's modules, one coding task and one scenario. Pass mark 70%. Afterwards you review every mistake, and the topics of modules you missed are scheduled for spaced review the next day. Best score per level is kept.
5. **Capstone guides.** For each level project: milestones with concrete tasks, the definition of done, and a self-review rubric (4-point scale per criterion) that is saved.
6. **Beginner on-ramp.** A `/start` page with a prerequisite refresher (setup checklist and in-browser Python warmups), how to use Waypoint day to day, and the hint ladder explained.
7. **Readiness dashboard.** `/readiness` per target role: practice coverage per level (quizzes, coding, labs, scenarios, projects), exam scores, and a ranked list of gaps with links.

## Out of scope here

- The AI tutor (another thread adds it with a free LLM).
- More sourced company interview questions (another thread).
- Grading free-text answers automatically. Scenario and interview answers stay self-scored against the listed points.

## Status

All seven items shipped in one PR (decisions 45 to 53 in the README):

- Hint ladder on coding tasks, lab steps, scenarios, mini projects and exercises.
- 23 more coding tasks (8 of them "debug this") and 22 more scenarios. Coding is now 60 tasks and scenarios 89, and every level from L0 to L13 has at least 2 coding tasks and 3 scenarios.
- 15 guided labs (L0 to L13 plus a Python warm-up), every step verified with real Python in the tests.
- Timed exams for L0 to L13 with mistake review and spaced review of weak modules.
- Capstone guides with milestones and a saved rubric for every level project.
- `/start` on-ramp and `/readiness` dashboard.

Still open:

- Labs cover the core module of each level, not every module. Other modules rely on their mini project.
- L14 and L15 have no exam. L15 is covered by mock interviews.
- Quiz questions have no hint ladder. They show an explanation after you answer.
- Scenario, interview and rubric scores are self-assessed unless the AI tutor is connected.

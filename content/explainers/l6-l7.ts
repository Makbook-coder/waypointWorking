import type { ExplainerSrc } from "./types";

export const EXPLAINERS_L6_L7: ExplainerSrc[] = [
  {
    id: "M6.1",
    diagram: {
      kind: "flow",
      steps: ["Budget :: e.g. 100k tokens", "Instructions :: 3k", "Tools :: 5k", "History + docs :: what's left", "Reply room :: always reserved"],
      caption: "Treat context like a budget. More isn't free: long contexts cost more, run slower and get used less well.",
    },
    example: {
      title: "Inspect what really goes in",
      problem: "An agent's answers got worse over a long session. See what's in its context.",
      steps: [
        ["Log the exact message list sent on a bad turn.", "dump(messages)  # turn 37"],
        ["Count tokens per part.", "system 2k | tools 9k | history 61k | tool outputs 48k"],
        ["Most of it is old tool output nobody needs now.", "48k of raw search results from turns 3 to 20"],
        ["Set a budget per part and enforce it each turn.", "BUDGET = {\"tools\": 6_000, \"history\": 20_000, \"tool_outputs\": 10_000}"],
      ],
      result: "Context drops from 120k to about 40k tokens, answers improve, and each call is cheaper and faster.",
    },
    yourTurn: {
      task: "The key instruction is in the middle of a 90k-token prompt and is often ignored. Name two fixes.",
      hints: ["Where do models pay the most attention?", "Can the prompt be shorter?"],
      answer: "Move the instruction to the start or repeat it near the end, and cut the context so there's less middle to get lost in.",
    },
  },
  {
    id: "M6.2",
    diagram: {
      kind: "flow",
      steps: ["Always :: rules, goal", "Retrieved :: only what this step needs", "Excluded :: stale or duplicate", "Order :: labelled sections", "Window"],
      caption: "Assembling context is a decision each turn: what must always be there, what to fetch now, and what to leave out.",
    },
    example: {
      title: "Assemble context for a support agent turn",
      problem: "Build the prompt for \"Where's my order?\" from many possible sources.",
      steps: [
        ["Always include rules and the user's goal.", "parts = [SYSTEM_RULES, f\"<goal>{goal}</goal>\"]"],
        ["Fetch what this question needs: the order, not the whole account history.", "parts.append(f\"<order>{get_order(user)}</order>\")"],
        ["Leave out old, irrelevant turns and duplicate tool results.", "history = last_n_turns(6)"],
        ["Label each section so sources stay distinguishable.", "<policy>…</policy>\n<order>…</order>\n<conversation>…</conversation>"],
      ],
      result: "A short, clearly labelled prompt with exactly what the model needs to answer this one question.",
    },
    yourTurn: {
      task: "Two retrieved chunks contradict each other: one from 2022, one from 2026. What do you do when assembling?",
      hints: ["Is the old one still useful?", "Can metadata help?"],
      answer: "Drop the stale one, or keep both with dates in their labels and tell the model to prefer the newest. Better still, filter by date at retrieval.",
    },
  },
  {
    id: "M6.3",
    diagram: {
      kind: "flow",
      steps: ["Long history :: 80 turns", "Summarise :: keep goal, decisions, open items", "Keep exact :: ids, numbers, code", "Recent turns :: unchanged", "Smaller context"],
      caption: "Compaction shrinks history but must keep the goal, decisions and exact data. A vague summary loses the important details.",
    },
    example: {
      title: "Compact a long conversation safely",
      problem: "A coding session has used 150k tokens. Compact it without losing the plot.",
      steps: [
        ["Keep the last few turns exactly as they are.", "recent = messages[-6:]"],
        ["Summarise older turns with a fixed template.", "summary = llm(\"\"\"Summarise for continuing the work:\nGOAL:\nDECISIONS MADE:\nFILES CHANGED:\nOPEN PROBLEMS:\nEXACT VALUES (ids, paths, numbers):\n\"\"\" + render(messages[:-6]))"],
        ["Check exact values survived (e.g. the branch name).", "assert \"fix/login-timeout\" in summary"],
        ["Replace the old turns with the summary.", "messages = [SYSTEM, {\"role\": \"user\", \"content\": \"<summary>\" + summary + \"</summary>\"}, *recent]"],
      ],
      result: "Context drops to around 15k tokens, and the agent still knows the goal, what's done, and the exact names it needs.",
    },
    yourTurn: {
      task: "Why not ask for \"a short summary\" with no template?",
      hints: ["What might a short summary drop?", "What can't be paraphrased?"],
      answer: "It may drop decisions, open problems or exact ids and numbers that can't be reconstructed. A template forces the essentials to stay.",
    },
  },
  {
    id: "M6.4",
    diagram: {
      kind: "flow",
      steps: ["Agent", "Write :: notes.md, plan.json", "Context freed :: drop details", "Read back :: when needed"],
      caption: "Offloading moves information out of the context into files or stores, and brings it back only when it's needed.",
    },
    example: {
      title: "A note-taking research agent",
      problem: "An agent reads 40 sources. Keeping them all in context overflows it.",
      steps: [
        ["Give the agent file tools.", "tools = [write_file, read_file, list_files]"],
        ["After each source, it writes a short note and drops the full text.", "write_file(\"notes/source-12.md\", \"- claim… (url)\\n- figure… (url)\")"],
        ["It keeps a plan file with progress.", "write_file(\"plan.json\", {\"done\": 12, \"todo\": [...]})"],
        ["When writing the report, it reads only the notes.", "notes = [read_file(f) for f in list_files(\"notes/\")]"],
      ],
      result: "Context stays small throughout, and the run could even resume tomorrow from the files.",
    },
    yourTurn: {
      task: "What's the trade-off of offloading?",
      hints: ["Is the information still visible to the model?", "What does reading it back cost?"],
      answer: "Offloaded data isn't in view, so the agent must remember to read it, which costs a tool call. You trade instant recall for a smaller, cleaner context.",
    },
  },
  {
    id: "M6.5",
    diagram: {
      kind: "flow",
      steps: ["Big document set", "Stuff :: everything in | Retrieve :: relevant parts | Summarise :: map then reduce", "Answer"],
      caption: "A big window doesn't remove the choice: stuffing, retrieving and summarising each fit different questions.",
    },
    example: {
      title: "Pick a strategy for three questions",
      problem: "A 300-page contract. Questions: (a) \"termination notice period?\", (b) \"summarise all obligations\", (c) \"compare this 5-page NDA with our template\".",
      steps: [
        ["(a) One specific fact somewhere in 300 pages.", "retrieve the few relevant clauses"],
        ["(b) Needs the whole document but not every word.", "map: summarise each section -> reduce: combine summaries"],
        ["(c) Two short documents compared side by side.", "stuff both whole into the context"],
        ["Check each against a few known answers.", "notice period found: yes; obligations complete: 11/12; NDA diffs: all found"],
      ],
      result: "Three questions, three strategies. More context is not the same as better context.",
    },
    yourTurn: {
      task: "Why might stuffing 300 pages into a 1M-token window still give a worse answer to (a)?",
      hints: ["Where is the clause?", "What happens in the middle of long contexts?"],
      answer: "The clause may be buried in the middle where the model attends less, and the rest is distracting noise. Retrieval puts it front and centre.",
    },
  },
  {
    id: "M6.6",
    diagram: {
      kind: "flow",
      steps: ["60 tools available", "Select :: 6 relevant to this step", "Call tool", "Filter output :: keep 20 lines", "Full result :: saved outside, by id"],
      caption: "Tool definitions and results both eat context. Show only the tools that fit the step, and keep big results outside.",
    },
    example: {
      title: "Tame a tool-heavy agent",
      problem: "An agent has 60 tools (15k tokens of definitions) and a log tool that returns 50k tokens.",
      steps: [
        ["Group tools and expose only the group for the current task.", "if task == \"billing\": tools = BILLING_TOOLS  # 6 tools"],
        ["Or let the agent search for tools by description first.", "find_tools(\"refund\") -> [\"issue_refund\", \"get_payment\"]"],
        ["Return a filtered view of large outputs.", "def read_logs(service, grep=None, tail=50): ..."],
        ["Store the full output and return a handle.", "save(\"logs/run-88.txt\", full)\nreturn {\"summary\": top_errors, \"full_ref\": \"logs/run-88.txt\"}"],
      ],
      result: "Tool definitions drop from 15k to 2k tokens, results are small, and the agent can still fetch full detail when needed.",
    },
    yourTurn: {
      task: "After 30 steps, the context is mostly old observations. What's one fix?",
      hints: ["Are old tool results still needed in full?", "Could they be shortened?"],
      answer: "Clear or summarise old tool results (keep a one-line note of each), keeping only recent ones in full.",
    },
  },
  {
    id: "M6.7",
    diagram: {
      kind: "flow",
      steps: ["Stable first :: system, tools, examples", "Cache breakpoint", "Changing last :: state, question", "Measure :: cached tokens per call"],
      caption: "Structure prompts so the big unchanging part comes first and can be cached. Then measure the hit rate.",
    },
    example: {
      title: "Reorder a prompt for cache hits",
      problem: "An agent prompt is [current time, system rules, tool list, history]. Cache hits are 0%.",
      steps: [
        ["The timestamp at the start changes every call, so the prefix never matches.", "[\"Now: 10:42:03\", SYSTEM, TOOLS, *history]"],
        ["Move stable parts first, in a fixed order.", "[SYSTEM, TOOLS, *history, \"Now: 10:42:03\"]"],
        ["Keep tool order stable; sorting by name avoids accidental reshuffles.", "TOOLS = sorted(TOOLS, key=lambda t: t[\"name\"])"],
        ["Log cache stats per call.", "cached / total input tokens: 0% -> 86%"],
      ],
      result: "86% of input tokens cached, which cuts input cost a lot and speeds up the first token.",
    },
    yourTurn: {
      task: "You add a new tool in the middle of the tool list. What happens to caching?",
      hints: ["Caching matches from the start.", "Everything after a change is different."],
      answer: "Everything after the insertion point no longer matches, so the cache misses until the new prefix is cached. Append tools at the end or change them rarely.",
    },
  },
  {
    id: "M6.8",
    diagram: {
      kind: "loop",
      steps: ["Harness :: loads tools, rules, files", "Model step", "Harness checks :: limits, tests, permissions", "Save :: progress file, git commit"],
      back: "next step, possibly in a fresh context",
      caption: "The harness is everything around the model: it runs the loop, enforces limits, and keeps durable progress so work can span many context windows.",
    },
    example: {
      title: "A harness for a long coding task",
      problem: "An agent must migrate 120 files, far more than one context can hold.",
      steps: [
        ["Write the plan to a file that is the source of truth.", "progress.md: [ ] file_001.py ... [ ] file_120.py"],
        ["Each session starts fresh and reads only the plan and the next file.", "context = [RULES, read(\"progress.md\"), read(next_file)]"],
        ["After each change, the harness runs tests, not the model.", "ok = run(\"pytest -q\").returncode == 0"],
        ["On success, commit and tick the plan.", "git commit -am \"migrate file_017\"; tick(\"file_017.py\")"],
        ["Enforce limits outside the model.", "if steps > 40 or cost > 2.0: stop_and_report()"],
      ],
      result: "The migration finishes across many short sessions, with every step tested and committed, and a crash loses at most one file's work.",
    },
    yourTurn: {
      task: "The agent keeps forgetting the project's test command. Is that a model problem or a harness problem? Fix it.",
      hints: ["Who decides what's in the context?", "Where could the command live?"],
      answer: "A harness problem. Put the command in the always-loaded project instructions (or have the harness run tests itself after every edit).",
    },
  },

  // L7 Evals
  {
    id: "M7.1",
    diagram: {
      kind: "loop",
      steps: ["Define :: what good looks like", "Dataset :: real examples", "Run :: app on every case", "Score :: metrics", "Read failures :: improve"],
      back: "re-run after every change",
      caption: "An eval replaces \"looks fine to me\" with a fixed set of cases and a score you can compare across versions.",
    },
    example: {
      title: "Replace vibe testing with a tiny eval",
      problem: "Is the new summary prompt better? Two people disagree after trying a few emails each.",
      steps: [
        ["Collect 30 real emails with what a good summary must contain.", "cases = [{\"email\": e, \"must_mention\": [\"deadline\", \"amount\"]}, ...]"],
        ["Run both prompt versions on all 30.", "out_a = [summarise_v1(c[\"email\"]) for c in cases]\nout_b = [summarise_v2(c[\"email\"]) for c in cases]"],
        ["Score each output with a simple check.", "def score(out, case):\n    return all(k in out.lower() for k in case[\"must_mention\"])"],
        ["Compare totals.", "v1: 21/30, v2: 26/30"],
      ],
      result: "v2 wins 26 to 21 on the same cases. The argument is settled by data, and the 30 cases are reused next time.",
    },
    yourTurn: {
      task: "Why can't you test an LLM app with exact-match asserts like normal code?",
      hints: ["Does the same input always give the same words?", "Are there many right answers?"],
      answer: "Outputs vary and many different wordings are correct, so you score properties (facts present, format valid, judge rating) rather than exact strings.",
    },
  },
  {
    id: "M7.2",
    diagram: {
      kind: "hub",
      steps: ["What to check", "Code checks :: format, keywords, exact match", "Human review :: nuanced quality", "LLM judge :: rubric at scale", "Golden answers :: compare to reference"],
      caption: "Pick the cheapest method that can judge the behaviour: code for format, a judge for tone, humans to calibrate both.",
    },
    example: {
      title: "Build an LLM judge with a rubric",
      problem: "Score support replies for politeness and correctness at scale.",
      steps: [
        ["Write a specific rubric, not \"is it good?\".", "1 = rude or wrong; 3 = correct but curt; 5 = correct, polite, offers next step"],
        ["Give the judge the question, reply and policy.", "judge_prompt = RUBRIC + f\"<q>{q}</q><reply>{r}</reply><policy>{p}</policy>Return JSON {{score, reason}}\""],
        ["Ask for a reason before the score.", "{\"reason\": \"correct refund window, no next step\", \"score\": 3}"],
        ["Check the judge against 30 human-scored replies.", "agreement within 1 point: 27/30"],
      ],
      result: "A judge that agrees with people 90% of the time, so you can score thousands of replies cheaply and spot-check the rest.",
    },
    yourTurn: {
      task: "Which method for: (a) \"output is valid JSON\", (b) \"reply sounds empathetic\"?",
      hints: ["Can code decide it?", "Is it subjective?"],
      answer: "(a) a code check (parse it). (b) an LLM judge with a rubric, calibrated against human ratings.",
    },
  },
  {
    id: "M7.3",
    diagram: {
      kind: "loop",
      steps: ["Offline :: test set before release", "Release", "Online :: monitor live traffic and feedback", "New failures :: add to test set"],
      back: "feed failures back into offline tests",
      caption: "Offline evals catch problems before release. Online monitoring catches what your test set missed, and those cases become new tests.",
    },
    example: {
      title: "Close the loop from production",
      problem: "Users thumbs-down some answers after launch. Use that.",
      steps: [
        ["Log every answer with its trace and the user's rating.", "log(trace_id, answer, rating)"],
        ["Each day, sample thumbs-down answers and run an online judge on a sample of all traffic.", "bad = sample(where(rating == \"down\"), 50)"],
        ["Read them and label the failure type.", "outdated doc: 18, wrong product: 9, tone: 4"],
        ["Turn real failures into offline test cases with correct answers.", "golden += [make_case(t) for t in bad if t.labelled]"],
        ["The next release must pass the bigger set.", "gate: score >= previous release"],
      ],
      result: "Your offline set grows from real failures, so the same mistake can't ship twice.",
    },
    yourTurn: {
      task: "Latency, error rate and token cost are fine, but users are unhappy. What's missing?",
      hints: ["Those are system metrics.", "What measures the answers themselves?"],
      answer: "Quality metrics: online judge scores, user feedback and failure categories. System health doesn't tell you if answers are right.",
    },
  },
  {
    id: "M7.4",
    diagram: {
      kind: "flow",
      steps: ["Capability :: reasoning, coding, knowledge", "Benchmark :: fixed questions + scoring", "Leaderboard :: compare models", "Pitfalls :: contamination, saturation"],
      caption: "Model benchmarks measure general capabilities. They're a starting point for choosing, not proof for your use case.",
    },
    example: {
      title: "Read a benchmark claim critically",
      problem: "A model card says \"92% on a coding benchmark, beating everyone\".",
      steps: [
        ["What does the benchmark test?", "short single-function Python problems"],
        ["Is it saturated? If top models all score 90%+, it no longer separates them.", "top 5 models: 89% to 93%"],
        ["How was it run? Same prompt and harness as competitors?", "self-reported, best of 5 attempts"],
        ["Could questions be in training data?", "public since 2021: contamination likely"],
      ],
      result: "The 92% says little about fixing real bugs in your codebase. Test candidates on your own tasks.",
    },
    yourTurn: {
      task: "Why do new, harder benchmarks keep appearing?",
      hints: ["What happens when every model scores 95%?", "And when questions leak?"],
      answer: "Old ones saturate and leak into training data, so they stop telling models apart. Harder, fresher sets restore the signal.",
    },
  },
  {
    id: "M7.5",
    diagram: {
      kind: "flow",
      steps: ["MMLU :: broad school-level knowledge", "MMLU-Pro :: harder, more options", "GPQA :: expert science questions", "SimpleQA :: short factual accuracy", "HLE :: frontier expert questions"],
      caption: "Knowledge benchmarks got harder as models caught up. Know what each one measures before quoting it.",
    },
    example: {
      title: "Match the benchmark to the claim",
      problem: "You need a model that doesn't make up short facts in a trivia bot. Which score matters?",
      steps: [
        ["MMLU-style tests are multiple choice: guessing helps, and it's near saturation.", "MMLU: not ideal"],
        ["GPQA tests deep expert reasoning, which a trivia bot doesn't need.", "GPQA: not the point"],
        ["SimpleQA checks short factual answers and rewards saying \"I don't know\" over guessing.", "SimpleQA: relevant"],
        ["Then test on your own trivia questions.", "your 100 questions: model A 71%, model B 78%"],
      ],
      result: "SimpleQA plus your own test, not the headline MMLU number.",
    },
    yourTurn: {
      task: "What does it mean that a benchmark uses \"human exams\" like bar or medical exams?",
      hints: ["Who wrote the questions originally?", "Does passing an exam mean doing the job?"],
      answer: "The questions come from real tests for people. A high score shows knowledge on exam-style questions, not that the model can do the professional job.",
    },
  },
  {
    id: "M7.6",
    diagram: {
      kind: "flow",
      steps: ["Your task :: real examples", "Shortlist :: 3 models", "Same set, same prompt :: run each", "Score :: quality, latency, cost", "Pick"],
      caption: "A custom eval compares models on your task, like for like, including what they'll cost at your volume.",
    },
    example: {
      title: "Compare three models on your task",
      problem: "Pick a model for classifying 50,000 tickets a month.",
      steps: [
        ["Build 100 labelled tickets from real data.", "dataset = load(\"tickets_labelled.jsonl\")  # 100"],
        ["Same prompt, temperature 0, for every model.", "for m in [\"small\", \"medium\", \"large\"]:\n    preds[m] = [classify(m, t) for t in dataset]"],
        ["Record accuracy, median latency and tokens.", "small 88% 0.4 s | medium 93% 0.9 s | large 94% 2.1 s"],
        ["Project monthly cost from tokens and prices.", "small $9 | medium $40 | large $310 per month"],
      ],
      result: "Medium: 93% for $40 a month. Large adds 1 point for almost 8× the cost, which isn't worth it here.",
    },
    yourTurn: {
      task: "Model A runs with your carefully tuned prompt; model B with a quick one. What's wrong with the comparison?",
      hints: ["Like-for-like means what?", "Which variable are you testing?"],
      answer: "It's not like-for-like: the prompt differs, so you can't tell if the model or the prompt caused the difference. Use the same prompt (or tune both).",
    },
  },
  {
    id: "M7.7",
    diagram: {
      kind: "flow",
      steps: ["Change :: prompt, model, code", "CI runs evals :: fast subset", "Compare :: with baseline", "Gate :: block if a metric drops", "Merge :: and log the results"],
      caption: "An eval suite in CI turns quality into a release gate, just like unit tests for code.",
    },
    example: {
      title: "Add a quality gate to CI",
      problem: "Stop prompt changes that lower answer accuracy from being merged.",
      steps: [
        ["Store the baseline scores from main.", "baseline.json: {\"accuracy\": 0.86, \"faithfulness\": 0.91}"],
        ["Run the eval suite on every pull request.", "python run_evals.py --subset fast > results.json"],
        ["Fail if any metric drops more than the allowed margin.", "for k, v in baseline.items():\n    if results[k] < v - 0.02:\n        sys.exit(f\"{k} dropped: {results[k]:.2f} < {v:.2f}\")"],
        ["Save results with the commit so you can trace changes.", "upload(results, commit=sha)"],
      ],
      result: "A prompt edit that drops accuracy to 0.81 fails CI with a clear message, before any user sees it.",
    },
    yourTurn: {
      task: "Scores wobble by ±1% between identical runs. How do you stop the gate failing randomly?",
      hints: ["LLM outputs vary.", "What margin is meaningful?"],
      answer: "Use temperature 0 where possible, average a few runs or use a larger set, and set the threshold beyond the normal wobble (for example a 2% margin).",
    },
  },
  {
    id: "M7.8",
    diagram: {
      kind: "flow",
      steps: ["Question", "Retriever :: context relevance, recall@k", "Generator :: faithfulness", "Answer :: relevance to question", "End to end :: correct, complete, safe"],
      caption: "Evaluate RAG in parts so you can find the broken one: did retrieval find the right text, and did the answer stick to it?",
    },
    example: {
      title: "Measure retrieval and generation separately",
      problem: "Your RAG bot is 70% correct. Find out which half is failing.",
      steps: [
        ["For 50 golden questions, record which chunk holds the answer.", "{\"q\": \"refund window?\", \"gold_chunk\": \"policy#4\", \"answer\": \"30 days\"}"],
        ["Retriever: is the gold chunk in the top 5?", "recall@5 = 0.94"],
        ["Generator: given the right chunk, is the answer faithful and correct?", "faithfulness = 0.74"],
        ["So retrieval is fine and generation is the problem.", "inspect the 13 unfaithful answers: model adds outside knowledge"],
        ["Fix the prompt (answer only from sources) and re-run.", "faithfulness 0.74 -> 0.92, end-to-end 70% -> 87%"],
      ],
      result: "Splitting the evaluation pointed straight at the generator. Tuning retrieval would have wasted time.",
    },
    yourTurn: {
      task: "Name the three checks in the RAG Triad.",
      hints: ["Question ↔ context, context ↔ answer, answer ↔ question.", "Each pair gets one check."],
      answer: "Context relevance (does the context match the question), groundedness or faithfulness (is the answer supported by the context) and answer relevance (does it answer the question).",
    },
  },
  {
    id: "M7.9",
    diagram: {
      kind: "flow",
      steps: ["Task", "Trajectory :: every step and tool call", "Check steps :: right tool, right args, no loops", "Check outcome :: task done?", "Check safety :: no forbidden actions"],
      caption: "For agents, the final answer isn't enough. Evaluate the path: tools chosen, arguments, wasted steps, recovery and safety.",
    },
    example: {
      title: "Score an agent trajectory",
      problem: "An agent booked the right meeting, but took 14 steps. Evaluate it properly.",
      steps: [
        ["Outcome: was the meeting booked correctly?", "task_success = True"],
        ["Tool selection: compare with the expected tools.", "expected {find_slots, create_event}; used find_slots ×5, list_calendars ×6, create_event ×1"],
        ["Efficiency: steps versus a reasonable minimum.", "14 steps vs 3 expected"],
        ["Loops: same call with same args repeated?", "list_calendars({}) called 6 times -> loop flag"],
        ["Safety: any action outside its permissions?", "no deletes, no external emails -> pass"],
      ],
      result: "Success, but inefficient with a loop. The fix is a clearer tool description for `list_calendars`, which a pass/fail check would have hidden.",
    },
    yourTurn: {
      task: "How do you test whether an agent recovers from failures?",
      hints: ["Failures need to happen on purpose.", "What should a good agent do then?"],
      answer: "Inject failures (tool timeouts, errors, bad data) in test runs and check it retries, falls back, replans or escalates instead of looping or giving up silently.",
    },
  },
];

// Capstone guides: a milestone plan and a self-review rubric for every level project.
// Milestones break a multi-day build into checkable pieces; each ends with a checkpoint you can show.
// The rubric is the shared criteria below plus two specific to the project, each scored 1 to 4.

export interface MilestoneSrc {
  title: string;
  tasks: string[];
  /** What you can demo when the milestone is done */
  checkpoint: string;
}

export interface RubricCriterion {
  name: string;
  /** What a 4 ("strong") looks like */
  strong: string;
}

export interface CapstoneSrc {
  levelId: number;
  /** Rough size, for planning, in focused days */
  days: string;
  milestones: MilestoneSrc[];
  rubric: RubricCriterion[];
}

/** Every project is reviewed against these, then its own criteria. */
export const SHARED_RUBRIC: RubricCriterion[] = [
  { name: "Works end to end", strong: "A stranger can run it from the README with one or two commands, and the main path works on real input." },
  { name: "Evidence, not vibes", strong: "Claims are backed by numbers from a test set or logs (quality, latency, cost), with the method written down." },
  { name: "Handles failure", strong: "Bad input, timeouts and provider errors are handled on purpose, and at least one real failure is written up." },
  { name: "You can explain it", strong: "You can walk through the architecture and every key decision in five minutes without notes, including what you'd change." },
];

export const RUBRIC_SCALE = ["Not yet", "Partly", "Solid", "Strong"] as const;

export const CAPSTONES: CapstoneSrc[] = [
  {
    levelId: 0,
    days: "5–8",
    milestones: [
      { title: "Skeleton and one endpoint", tasks: ["Pick the domain and write 3 user stories", "Create the repo, virtual env and a FastAPI app with a health endpoint", "Add one CRUD resource with a Pydantic model, in memory"], checkpoint: "curl the health endpoint and create and read one item." },
      { title: "Persistence and validation", tasks: ["Move storage to PostgreSQL with parameterized queries", "Return 404 and 422 with clear messages", "Add tests for the happy path and each error path"], checkpoint: "Tests pass locally and data survives a restart." },
      { title: "External API and robustness", tasks: ["Call one external API with a timeout and retries", "Log each request with an id", "Read config from env vars, never hard-coded"], checkpoint: "The external API failing doesn't crash your service." },
      { title: "Ship it", tasks: ["Write a Dockerfile and run it locally", "Deploy to a public URL", "Write the README and the AI-failure note"], checkpoint: "Someone else calls your deployed API from the README alone." },
    ],
    rubric: [
      { name: "API design", strong: "Resources, methods and status codes follow REST conventions, and errors have a consistent shape." },
      { name: "Reviewed AI-written code", strong: "Every AI-generated change was tested and reviewed, and the failure write-up shows a real catch." },
    ],
  },
  {
    levelId: 2,
    days: "5–7",
    milestones: [
      { title: "Chat with history and streaming", tasks: ["Call the API with a system prompt and history", "Stream tokens to the UI or terminal", "Trim history to a token budget"], checkpoint: "A multi-turn chat streams and remembers earlier turns." },
      { title: "Tools", tasks: ["Define 2–3 tools with clear descriptions", "Validate every model-generated argument", "Return tool errors to the model as text"], checkpoint: "The assistant chooses the right tool for 5 different requests." },
      { title: "Robustness", tasks: ["Timeouts on every call", "Retries with backoff for transient errors only", "Structured output where you parse results"], checkpoint: "Killing a tool mid-chat produces a graceful message." },
      { title: "Observe and deploy", tasks: ["Log tokens, latency, tool calls and cost per turn", "Deploy at a public URL", "Write how the raw tool-call loop works under LangChain"], checkpoint: "You can show the cost and latency of the last 20 turns." },
    ],
    rubric: [
      { name: "Tool safety", strong: "Arguments are validated in code, errors never crash the loop, and there's a step limit." },
      { name: "Observability", strong: "Every turn has tokens, latency, cost and tool calls recorded and easy to inspect." },
    ],
  },
  {
    levelId: 3,
    days: "3–4",
    milestones: [
      { title: "Task and test set", tasks: ["Pick one real task and define success", "Collect 30–50 real examples with expected outputs", "Include hard and edge cases"], checkpoint: "A versioned test set file with labels." },
      { title: "Baseline", tasks: ["Write the simplest reasonable prompt", "Score it on the full set", "Record tokens, latency and cost"], checkpoint: "A baseline score you can beat." },
      { title: "Competing versions", tasks: ["Write 3+ variants (few-shot, structure, reasoning)", "Run each 3 times to see variance", "Compare on correctness, format and cost"], checkpoint: "A table of every version's scores." },
      { title: "Choose and document", tasks: ["Pick the winner from the numbers", "Write why the others lost", "Note failure cases the winner still has"], checkpoint: "A one-page write-up with the table and the decision." },
    ],
    rubric: [
      { name: "Test set quality", strong: "Examples are real, labelled carefully, and cover edge cases where prompts usually break." },
      { name: "Fair comparison", strong: "Every version ran on the same set, several times, with variance and cost reported." },
    ],
  },
  {
    levelId: 4,
    days: "8–12",
    milestones: [
      { title: "Ingest and index", tasks: ["Load and clean a real corpus", "Chunk by structure, keep metadata", "Embed and index in a vector database"], checkpoint: "You can inspect any chunk and its metadata." },
      { title: "Search", tasks: ["Dense, BM25 and hybrid (RRF) retrieval", "Metadata filters", "A labelled query set and recall@k / MRR for each method"], checkpoint: "A table showing hybrid vs dense-only on your queries." },
      { title: "RAG app", tasks: ["Grounded prompt with citations", "Abstain when evidence is weak", "One improvement: reranking, query rewriting or RAG-Fusion, measured"], checkpoint: "Answers cite sources and say \"I don't know\" when they should." },
      { title: "Measure and deploy", tasks: ["Track latency, tokens and cost per request", "Deploy as an API or simple UI", "Write up results and one failure"], checkpoint: "A deployed app plus the numbers behind it." },
    ],
    rubric: [
      { name: "Retrieval quality", strong: "Retrieval is measured on labelled queries and the chosen method wins on the numbers." },
      { name: "Grounding", strong: "Answers cite real sources, citations are checked, and the app abstains on weak evidence." },
    ],
  },
  {
    levelId: 5,
    days: "8–10",
    milestones: [
      { title: "Pick and scope", tasks: ["Choose the agent type and write 5–10 tasks it must complete", "Design explicit state", "List tools and which ones are consequential"], checkpoint: "A task suite and a state diagram." },
      { title: "Core loop", tasks: ["Build 3+ tools", "Implement the loop with stopping conditions", "Log every step"], checkpoint: "The agent completes one task end to end with a readable trace." },
      { title: "Reliability", tasks: ["Budgets for steps, time and cost", "Recovery from tool errors", "Human approval before consequential actions"], checkpoint: "A failing tool and a budget hit are both handled visibly." },
      { title: "Evaluate", tasks: ["Run the full task suite", "Report success rate and cost per task", "Explain the loop from first principles"], checkpoint: "A results table and a five-minute walkthrough." },
    ],
    rubric: [
      { name: "Control", strong: "Budgets, stop conditions and approval gates are enforced in code and demonstrated." },
      { name: "Measured success", strong: "Success rate and cost per task come from a defined task suite, with failures analysed." },
    ],
  },
  {
    levelId: 6,
    days: "6–8",
    milestones: [
      { title: "Baseline that degrades", tasks: ["Pick a long task", "Run a keep-everything agent", "Record where it loses the goal or constraints"], checkpoint: "Evidence of degradation with token counts." },
      { title: "Context budget", tasks: ["Decide what to keep, retrieve, compress, offload or drop", "Pin goals and constraints", "Compress tool outputs"], checkpoint: "A written context policy." },
      { title: "Harness", tasks: ["Progress file and task list", "Compaction and external memory", "Pre-completion verification"], checkpoint: "The managed agent finishes the long task." },
      { title: "Compare", tasks: ["Same task, both versions", "Coherence, tokens, latency and cost", "Write up what mattered most"], checkpoint: "A side-by-side table." },
    ],
    rubric: [
      { name: "Goal retention", strong: "Goals and constraints survive the whole run, proven by a test that checks them late in the task." },
      { name: "Efficiency", strong: "Token cost is lower than the baseline with equal or better results, with numbers." },
    ],
  },
  {
    levelId: 8,
    days: "6–8",
    milestones: [
      { title: "Threat model", tasks: ["Map data, tools and exit paths", "List attacks to try", "Set up a test harness that records success rates"], checkpoint: "A threat model and an attack list." },
      { title: "Attack", tasks: ["Direct and indirect injection", "Poisoned documents and jailbreaks", "Data extraction and tool misuse"], checkpoint: "Attack-success rates before any fixes." },
      { title: "Defend", tasks: ["Least-privilege tools and permission checks in code", "Guardrails, PII and secret redaction", "Approval gates and sandboxing"], checkpoint: "Controls in place, each tied to a finding." },
      { title: "Prove it", tasks: ["Re-run every attack", "Turn each finding into a CI regression test", "Document residual risk"], checkpoint: "Before/after numbers and a green security test suite." },
    ],
    rubric: [
      { name: "Attack coverage", strong: "Attacks span injection, poisoning, jailbreaks, extraction and tool misuse, with measured success rates." },
      { name: "Layered defence", strong: "Several independent controls, each tested, and honest residual-risk notes." },
    ],
  },
  {
    levelId: 9,
    days: "3–5",
    milestones: [
      { title: "Requirements", tasks: ["Users, success criteria and non-goals", "Traffic, latency and cost constraints", "Risks and compliance needs"], checkpoint: "A requirements page someone else agrees with." },
      { title: "Architecture", tasks: ["Diagram of every component", "Model choice, routing and context design", "Caching and tools/agents where needed"], checkpoint: "A diagram you can explain in two minutes." },
      { title: "Operate it", tasks: ["Latency and cost budget", "Reliability, fallbacks and guardrails", "Evals, monitoring and feedback loop"], checkpoint: "Every requirement maps to a design choice." },
      { title: "Defend it", tasks: ["Rejected alternatives with trade-offs", "Scaling plan", "Get one person to review it"], checkpoint: "A reviewer could build from it." },
    ],
    rubric: [
      { name: "Traceability", strong: "Every choice links to a requirement, and numbers (traffic, budget) drive the decisions." },
      { name: "Trade-offs", strong: "Rejected alternatives are real options with honest pros and cons." },
    ],
  },
  {
    levelId: 10,
    days: "10–14",
    milestones: [
      { title: "Track and version", tasks: ["Prompt registry with a production label", "Experiment runs with params and metrics", "Baseline scores"], checkpoint: "You can say which prompt version is live and how it scored." },
      { title: "Gate", tasks: ["Eval suite in CI with thresholds", "Show it blocking a deliberately bad prompt", "Runtime guardrails with every block logged"], checkpoint: "A red CI run on a bad change." },
      { title: "Ship", tasks: ["Streaming backend and frontend in Docker Compose", "Image build and deploy pipeline", "Secrets from a secrets manager"], checkpoint: "A release reaches the server through the pipeline." },
      { title: "Operate", tasks: ["Dashboards and one working alert", "Traces with per-step cost and latency", "A rollback and a runbook"], checkpoint: "You perform a rollback using your own runbook." },
    ],
    rubric: [
      { name: "Release safety", strong: "Changes can't reach production without passing evals, and rollback is fast and practised." },
      { name: "Operability", strong: "Dashboards, alerts and traces would let someone else debug an incident." },
    ],
  },
  {
    levelId: 11,
    days: "5–7",
    milestones: [
      { title: "Move it", tasks: ["Redeploy an earlier app on a managed platform", "Cloud identity, no API keys in the app", "Private network path"], checkpoint: "The app works on the platform with least-privilege access." },
      { title: "Build or buy", tasks: ["Replace one component with a managed one", "Keep one hand-built, with a reason", "Record data location and retention"], checkpoint: "A short build-vs-buy note." },
      { title: "Re-verify", tasks: ["Re-run evals after the move", "Gateway with a working fallback", "Report quality, latency and cost changes"], checkpoint: "A before/after table." },
      { title: "Decide", tasks: ["Size capacity and set a budget alert", "Find the volume where another pricing model wins", "One-page decision record with an exit plan"], checkpoint: "The decision record." },
    ],
    rubric: [
      { name: "Security posture", strong: "Identity-based access, private networking and data handling are all set up and documented." },
      { name: "Cost reasoning", strong: "Capacity, budget alerts and the pricing break-even are worked out from real numbers." },
    ],
  },
  {
    levelId: 12,
    days: "6–8",
    milestones: [
      { title: "Pick inputs", tasks: ["Choose two modalities and a real use case", "Collect messy, real inputs", "Define what correct output looks like"], checkpoint: "A small labelled set of real inputs." },
      { title: "Build", tasks: ["A pipeline that handles both modalities", "Handle unreadable regions, silence and ambiguity", "Structured outputs you can check"], checkpoint: "It works on the clean half of your inputs." },
      { title: "Harden and measure", tasks: ["Run on the messy inputs", "Latency and cost per request by modality", "Write up one real failure and the fix"], checkpoint: "Numbers per modality and a failure write-up." },
      { title: "Package", tasks: ["README with setup and credentials", "Example inputs", "Someone else runs it"], checkpoint: "Another person runs it with their own input." },
    ],
    rubric: [
      { name: "Real-world inputs", strong: "Tested on messy real inputs, with modality-specific failures handled." },
      { name: "Cost awareness", strong: "Cost and latency per modality are measured and explain design choices (detail level, crops, models)." },
    ],
  },
  {
    levelId: 13,
    days: "8–12",
    milestones: [
      { title: "Define the gap", tasks: ["Pick a narrow task where prompting fails", "Set metric and threshold before training", "Build the strongest prompted baseline"], checkpoint: "A baseline score on a held-out set." },
      { title: "Data", tasks: ["Clean, dedupe and format the dataset", "Leak-free train/val/test splits", "Version the data"], checkpoint: "A data report with counts and split method." },
      { title: "Train", tasks: ["Reproducible LoRA/QLoRA SFT from a config", "Watch loss and read outputs", "Pick a checkpoint"], checkpoint: "A trained adapter and its config." },
      { title: "Prove and serve", tasks: ["Same held-out set, same judge as baseline", "Check off-task regressions", "Serve with the right chat template and write the decision record"], checkpoint: "Tuned beats baseline at the pre-set threshold, or you document why not." },
    ],
    rubric: [
      { name: "Fair baseline", strong: "The prompted baseline is genuinely strong and evaluated on the same set and judge." },
      { name: "Reproducibility", strong: "Data, config and seed let someone else reproduce the numbers." },
    ],
  },
  {
    levelId: 14,
    days: "15–25",
    milestones: [
      { title: "Choose three", tasks: ["Pick the three projects closest to your target role", "Write a one-paragraph brief for each", "Reuse earlier capstones where you can"], checkpoint: "Three briefs." },
      { title: "Build", tasks: ["Ship each to a public URL or runnable repo", "Add evals and numbers to each", "Note one failure per project"], checkpoint: "Three working projects." },
      { title: "Write up", tasks: ["Problem, architecture, results, failures for each", "Diagrams and short demo videos", "Clean READMEs"], checkpoint: "Public write-ups." },
      { title: "Present", tasks: ["Five-minute talk per project", "Practise follow-up questions", "Get feedback from one person"], checkpoint: "You present each project in five minutes." },
    ],
    rubric: [
      { name: "Role fit", strong: "The projects show the skills your target role asks for, in its language." },
      { name: "Story", strong: "Each write-up explains the problem, the decision and the result in plain words with numbers." },
    ],
  },
  {
    levelId: 15,
    days: "2–3",
    milestones: [
      { title: "Prepare", tasks: ["Pick a partner or set up recording", "Choose the portfolio project for round 3", "Review your weakest mock answers"], checkpoint: "Everything ready to run the loop." },
      { title: "Round 1: scenarios", tasks: ["Six production scenarios under time", "Answer out loud", "Score each 1–5"], checkpoint: "Round 1 scores." },
      { title: "Round 2: design", tasks: ["Turn a vague brief into an architecture", "Cover evals and monitoring", "Defend trade-offs"], checkpoint: "Round 2 score and notes." },
      { title: "Round 3 and review", tasks: ["Present a project and handle follow-ups", "Write three concrete improvements", "Schedule a repeat"], checkpoint: "Three improvements written down." },
    ],
    rubric: [
      { name: "Structure under time", strong: "Answers follow a clear structure and finish in time." },
      { name: "Depth on follow-ups", strong: "Follow-up questions on cost, failures and alternatives get specific, honest answers." },
    ],
  },
];

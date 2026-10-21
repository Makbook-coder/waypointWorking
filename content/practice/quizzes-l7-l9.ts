import type { QuizSrc } from "./types";

export const QUIZZES_L7_L9: QuizSrc[] = [
  // M7.1 Intro to evals
  ["M7.1", "e", "What is the main problem with \"vibe testing\" an LLM app?", "A few hand-picked tries are unrepresentative and cannot catch regressions", ["It is too expensive", "It requires labeled data", "It only works with GPT models"], "Without a fixed test set, you cannot compare versions or see what broke."],
  ["M7.1", "m", "Why are LLM tests usually probabilistic rather than exact-match?", "Outputs vary across runs and many valid answers exist", ["LLMs never repeat outputs", "Exact-match is illegal", "Tokenizers are random"], "You test properties and score distributions, not single strings."],
  ["M7.1", "m", "How do model evals differ from application evals?", "Model evals measure general capability; application evals measure your system on your task", ["They are the same", "Application evals ignore the model", "Model evals require users"], "A strong model can still power a weak application."],
  ["M7.1", "e", "What is the first step of an evaluation workflow?", "Define what good output looks like for your use case", ["Pick a leaderboard", "Fine-tune the model", "Deploy to production"], "Criteria come before datasets and metrics."],
  ["M7.1", "h", "Why run each eval case several times?", "To measure variance so small score changes are not mistaken for real differences", ["To warm the cache", "To use up budget", "APIs require it"], "Repeated runs separate signal from noise."],

  // M7.2 Methods
  ["M7.2", "e", "Which evaluation method suits checking that output is valid JSON?", "Programmatic checks", ["Human review", "LLM-as-a-judge", "User surveys"], "Deterministic properties are best tested with code."],
  ["M7.2", "m", "What is a reference-free evaluation?", "Scoring an output without a gold answer, e.g. judging faithfulness to the given context", ["Evaluating without a model", "Evaluating without inputs", "Using only BLEU"], "Reference-free checks compare against criteria or sources, not a gold answer."],
  ["M7.2", "m", "A known bias of LLM-as-a-judge is…", "Position bias: preferring the first (or second) answer in a pairwise comparison", ["It cannot read JSON", "It always gives 10/10", "It refuses to score"], "Mitigate by swapping order and averaging; also watch length and self-preference bias."],
  ["M7.2", "h", "When is a golden dataset with reference answers required?", "When correctness must be checked against known right answers, such as factual QA", ["For tone checks", "For latency measurement", "Never"], "Fact-checking needs ground truth."],
  ["M7.2", "e", "Human evaluation is best used for…", "Subjective or high-stakes judgments and calibrating automated judges", ["Every test on every commit", "Counting tokens", "Measuring latency"], "Humans are expensive, so use them where they add most."],

  // M7.3 Offline vs online
  ["M7.3", "e", "What is an offline evaluation?", "Running a fixed test suite before release", ["Evaluating with no internet", "Evaluating only in production", "User surveys"], "Offline suites gate changes before users see them."],
  ["M7.3", "m", "Which is a system metric rather than a quality metric?", "p95 latency", ["Faithfulness", "Answer relevance", "Correctness"], "System metrics describe performance; quality metrics describe answers."],
  ["M7.3", "m", "What should happen to failures found in production?", "Add them to the offline test set so they stay fixed", ["Ignore them", "Delete the logs", "Retrain immediately"], "Production failures are the best regression tests."],
  ["M7.3", "h", "How is continuous online evaluation usually done at scale?", "Sample production traffic and score it with automated judges plus user signals", ["Score every request with humans", "Only check errors", "Wait for complaints"], "Sampling keeps cost manageable."],
  ["M7.3", "e", "Why do online evals matter even with strong offline suites?", "Real users send inputs your test set never anticipated", ["Offline evals are always wrong", "Online is cheaper", "Regulations require it"], "Production traffic drifts and surprises."],

  // M7.4 Benchmarking
  ["M7.4", "e", "What is benchmark contamination?", "Test questions leaked into training data, inflating scores", ["A virus in the dataset", "Low-quality labels", "Too few questions"], "Contaminated scores overstate real capability."],
  ["M7.4", "m", "Why can public leaderboard rank mislead model choice?", "Leaderboards measure general tasks that may not match yours", ["They are always fake", "They only test speed", "They use one prompt"], "Your task decides what matters."],
  ["M7.4", "m", "What are the parts of a benchmark?", "A dataset, a task format, a scoring method and a protocol", ["Only questions", "Only a leaderboard", "A model and a GPU"], "Change any part and scores change."],
  ["M7.4", "h", "Why does prompt format affect benchmark scores?", "Small changes in templates and few-shot examples shift model performance", ["It does not", "Formats change tokenizers", "Formats change weights"], "Compare models with the same protocol."],
  ["M7.4", "e", "Benchmark saturation means…", "Top models score near the ceiling, so it no longer separates them", ["The benchmark is too hard", "No one uses it", "It has errors"], "Saturation drives creation of harder benchmarks."],

  // M7.5 Knowledge benchmarks
  ["M7.5", "e", "How many subjects does MMLU cover?", "57", ["10", "100", "1,000"], "MMLU spans 57 subjects from STEM to humanities."],
  ["M7.5", "m", "How did MMLU-Pro make questions harder?", "Expanding answer choices from 4 to 10 and focusing on reasoning-heavy questions", ["Removing all math", "Making questions shorter", "Allowing open-ended answers only"], "More distractors reduce guessing and reward reasoning."],
  ["M7.5", "m", "What is GPQA known for?", "Graduate-level science questions designed to be hard to answer with web search", ["Grammar tests", "Coding tasks", "Image captioning"], "GPQA is \"Google-proof\" expert QA."],
  ["M7.5", "h", "What does SimpleQA measure?", "Short-form factual accuracy, including whether models abstain instead of guessing", ["Code generation", "Long-form essays", "Translation"], "It tests factuality and calibration on short fact questions."],
  ["M7.5", "e", "Why do benchmarks keep getting harder?", "Models saturate older ones, so new tests are needed to separate them", ["Old ones were wrong", "Fashion", "Regulations"], "HLE (Humanity's Last Exam) is one recent response."],

  // M7.6 Custom evals
  ["M7.6", "e", "Why build a custom eval for model selection?", "Your task's quality ranking can differ from public benchmarks", ["Benchmarks are illegal", "Custom evals are free", "Models require it"], "Measure on your own data."],
  ["M7.6", "m", "What makes a model comparison like-for-like?", "Same prompts, dataset, settings and scoring for every model", ["Different prompts tuned per model only", "Same model twice", "Different datasets"], "Controlled comparisons isolate the model's effect."],
  ["M7.6", "m", "How do you estimate monthly cost for a model?", "Average input and output tokens per request × requests × per-token prices", ["Model size × users", "Latency × users", "Fixed price per model"], "Token counts drive API cost."],
  ["M7.6", "h", "Model A scores 2% higher but costs 5× more. What should decide?", "Whether the gain matters for users given the volume and budget", ["Always pick A", "Always pick the cheaper", "Flip a coin"], "Quality, latency and cost must be weighed together."],
  ["M7.6", "e", "A good custom eval dataset includes…", "Representative and tricky cases from your real task", ["Only easy examples", "Only benchmark questions", "Random text"], "Coverage of real and edge cases makes results trustworthy."],

  // M7.7 Eval suite
  ["M7.7", "e", "What is a CI quality gate for an LLM app?", "An automated eval run that blocks merges if scores fall below thresholds", ["A firewall", "A code formatter", "A billing alert"], "Gates stop regressions before release."],
  ["M7.7", "m", "Why version prompts, configs and datasets together with results?", "So any score can be traced to exactly what produced it", ["To save disk", "Git requires it", "To speed up tests"], "Without versions, regressions cannot be explained."],
  ["M7.7", "m", "What is a self-improving golden dataset?", "One that grows as new failures from production are reviewed and added", ["One that labels itself without review", "A dataset that shrinks", "A synthetic dataset only"], "Curated growth keeps the suite aligned with reality."],
  ["M7.7", "h", "Why track latency and cost in the eval suite?", "A change can improve quality while making the system unusable or unaffordable", ["They never change", "They replace quality metrics", "Only for compliance"], "Report quality with its operational cost."],
  ["M7.7", "e", "Evaluation levels include…", "Component, pipeline and application", ["Bronze, silver and gold", "Alpha, beta and GA", "Small, medium and large"], "Test each layer where failures can occur."],

  // M7.8 RAG evals
  ["M7.8", "e", "What are the three parts of the RAG Triad?", "Context relevance, groundedness (faithfulness) and answer relevance", ["Speed, cost and size", "Precision, recall and F1", "Input, output and logs"], "Each edge of the triad checks a different failure."],
  ["M7.8", "m", "What does contextual recall measure?", "Whether the retrieved context contains the information needed for the reference answer", ["Answer length", "Latency", "How many chunks were retrieved"], "Low contextual recall points to retrieval misses."],
  ["M7.8", "m", "What does contextual precision measure?", "Whether relevant chunks are ranked above irrelevant ones", ["Total token cost", "Answer tone", "Whether citations exist"], "It rewards putting relevant chunks first."],
  ["M7.8", "h", "The answer is faithful to context but wrong. Where is the problem likely?", "Retrieval returned wrong or outdated context", ["The generator hallucinated", "The UI", "The tokenizer"], "Faithful + wrong means the evidence itself was bad."],
  ["M7.8", "e", "What is indirect prompt injection in RAG?", "Malicious instructions hidden in retrieved documents", ["A user typing a jailbreak", "A slow database", "A wrong embedding"], "Retrieved content must be treated as data, not instructions."],

  // M7.9 Agent evals
  ["M7.9", "e", "Why is final-answer accuracy not enough for agents?", "An agent can reach the right answer through wasteful, unsafe or lucky steps", ["Agents never answer", "Answers cannot be scored", "It is too expensive"], "Trajectory quality and safety matter too."],
  ["M7.9", "m", "What does trajectory evaluation check?", "The sequence of tool calls and decisions the agent made", ["Only the final token", "GPU usage", "The UI layout"], "It catches loops, redundant calls and wrong tools."],
  ["M7.9", "m", "How do you test an agent's error recovery?", "Inject realistic tool failures and score how it retries, falls back or escalates", ["Only test happy paths", "Disable all tools", "Use a bigger model"], "Recovery must be measured, not assumed."],
  ["M7.9", "h", "Which metric captures agent efficiency?", "Steps, tokens and cost per successful task", ["Model parameter count", "Lines of code", "Number of tools available"], "Two agents with equal success can differ greatly in cost."],
  ["M7.9", "e", "What safety behaviour should agent evals check?", "Whether the agent refuses unauthorized or destructive actions", ["Whether it uses emoji", "Whether it is fast", "Whether it writes long answers"], "Permission boundaries must hold under pressure."],

  // M8.1 Threat model
  ["M8.1", "e", "Why must model output be treated as untrusted?", "It can contain injected or wrong content that downstream systems might execute", ["Models are always malicious", "It is encrypted", "It is too long"], "Validate output before acting on it, like any user input."],
  ["M8.1", "m", "What is a trust boundary in an AI system?", "A point where data passes from a less trusted to a more trusted component", ["A firewall rule", "A model's context limit", "A rate limit"], "Controls belong at each boundary."],
  ["M8.1", "m", "How do LLMs change the attack surface?", "Natural-language inputs from many sources can steer behaviour", ["They remove all attacks", "They only add DDoS risk", "They make SQL injection impossible"], "Any text the model reads can carry instructions."],
  ["M8.1", "h", "Rendering model output as raw HTML in a web page risks…", "Cross-site scripting through injected markup", ["Faster rendering", "Lower token costs", "Better SEO"], "Escape or sanitize output like any untrusted string."],
  ["M8.1", "e", "A threat model starts by listing…", "Assets, entry points, trust boundaries and attackers", ["Model sizes", "Prompt lengths", "GPU types"], "You cannot defend what you have not mapped."],

  // M8.2 Prompt injection
  ["M8.2", "e", "What is indirect prompt injection?", "Instructions planted in content the model reads, like a web page or email", ["A user typing commands directly", "A SQL query", "A network attack"], "The attacker never talks to the model directly."],
  ["M8.2", "m", "What is the \"lethal trifecta\" for data exfiltration?", "Access to private data, exposure to untrusted content, and a way to communicate externally", ["Large model, long context, low latency", "GPU, CPU, memory", "Auth, logging, caching"], "Remove any one leg and exfiltration becomes much harder."],
  ["M8.2", "m", "Why does adding \"ignore malicious instructions\" to the system prompt fail as a defence?", "The model cannot reliably tell legitimate instructions from injected ones", ["Models ignore system prompts", "It uses too many tokens", "It is against policy"], "Defences must be architectural, not just prompt text."],
  ["M8.2", "h", "An agent can render markdown images. Why is that an exfiltration risk?", "An injected image URL can carry private data in its query string to an attacker's server", ["Images are large", "Markdown is slow", "Images cannot be cached"], "Restrict outbound URLs and image domains."],
  ["M8.2", "e", "Layered defences against injection include…", "Least privilege, input/output filtering, approval for risky actions and limited egress", ["A single regex", "A longer prompt", "A bigger model"], "No single layer is sufficient."],

  // M8.3 Jailbreaks
  ["M8.3", "e", "How does a jailbreak differ from prompt injection?", "A jailbreak tries to bypass the model's safety training; injection hijacks the app's instructions", ["They are identical", "Jailbreaks target databases", "Injection only affects images"], "Different goals, often overlapping techniques."],
  ["M8.3", "m", "What does an output guardrail do?", "Checks model responses before they reach users or tools", ["Speeds up decoding", "Filters training data", "Encrypts prompts"], "It catches harmful or policy-violating output."],
  ["M8.3", "m", "Why test guardrails with obfuscated input such as base64 or leetspeak?", "Attackers encode payloads to slip past simple filters", ["To test speed", "For fun", "Because users always type that way"], "Filters must handle evasions."],
  ["M8.3", "h", "Why is one guardrail layer not enough?", "Every classifier has false negatives, so defences must overlap", ["Guardrails are always wrong", "They cost too much", "They are illegal"], "Defence in depth reduces combined miss rates."],
  ["M8.3", "e", "A moderation API is typically used to…", "Classify text for categories like hate, violence or self-harm", ["Translate text", "Embed text", "Summarize text"], "Moderation flags content for blocking or review."],

  // M8.4 Agent security
  ["M8.4", "e", "What does least privilege mean for an agent?", "Give it only the tools and permissions the task needs", ["Give it admin access", "Give it no tools", "Share one key for all agents"], "Limits the damage of any compromise."],
  ["M8.4", "m", "Where should tool-use policy be enforced?", "In code outside the LLM, before the tool executes", ["Only in the system prompt", "In the user interface", "Nowhere"], "The model can be manipulated; code checks cannot be argued with."],
  ["M8.4", "m", "Which action most needs human approval?", "Transferring money or deleting production data", ["Reading a public web page", "Searching documentation", "Formatting text"], "Irreversible, high-impact actions need a human gate."],
  ["M8.4", "h", "An agent's API token has broad write scopes. What is the risk?", "A successful injection can do anything the token allows", ["Higher latency", "More tokens used", "None"], "Scope credentials to the minimum."],
  ["M8.4", "e", "Why set step and cost limits on agents?", "To stop runaway loops and abuse", ["To improve accuracy", "To lower latency per call", "To satisfy HTTP"], "Budgets are security controls too."],

  // M8.5 RAG security
  ["M8.5", "e", "Retrieved documents should be treated as…", "Data, not instructions", ["System prompts", "Trusted code", "User commands"], "Never let retrieved text override your instructions."],
  ["M8.5", "m", "What is retrieval poisoning?", "Planting malicious or false documents so they get retrieved", ["Slow indexing", "Corrupted embeddings from bugs", "Deleting the index"], "Control who can write to the corpus."],
  ["M8.5", "m", "How do you prevent cross-tenant leakage in RAG?", "Enforce tenant and permission filters at retrieval time, in code", ["Ask the model not to leak", "Use separate prompts", "Use a larger k"], "Access control belongs in the retrieval query, not the prompt."],
  ["M8.5", "h", "Why preserve provenance for each chunk?", "To audit where an answer came from and remove bad sources", ["To reduce tokens", "To speed up search", "For SEO"], "Provenance enables tracing and cleanup."],
  ["M8.5", "e", "Document-level permissions ensure…", "Users only retrieve documents they are allowed to see", ["Faster retrieval", "Better embeddings", "Shorter answers"], "Same corpus, different views per user."],

  // M8.6 Privacy
  ["M8.6", "e", "What is data minimization?", "Collecting and sending only the data a task needs", ["Compressing data", "Deleting all data", "Using smaller models"], "Less data means less risk."],
  ["M8.6", "m", "Why keep PII out of logs and traces?", "Logs are widely accessed and retained, so PII there spreads risk", ["Logs are public by law", "PII is too long", "It slows logging"], "Redact before logging."],
  ["M8.6", "m", "How should API secrets be handled in an agent?", "Keep them in the tool layer, never in the prompt or model-visible context", ["Put them in the system prompt", "Ask the user for them", "Hard-code them in prompts"], "The model cannot leak what it never sees."],
  ["M8.6", "h", "What does a zero data retention agreement with a provider mean?", "The provider does not store your prompts and outputs after processing", ["Data is encrypted forever", "No logs on your side", "Models are not used"], "It reduces third-party exposure."],
  ["M8.6", "e", "Which is PII?", "A person's email address", ["A product SKU", "A city population", "A public API endpoint"], "Personal identifiers need protection."],

  // M8.7 Red teaming
  ["M8.7", "e", "What is red teaming an AI system?", "Deliberately attacking it to find weaknesses before others do", ["Monitoring uptime", "Writing unit tests for UI", "Training the model"], "Adversarial testing surfaces real vulnerabilities."],
  ["M8.7", "m", "What should happen to a vulnerability found in red teaming?", "Fix it and add the attack to a regression suite", ["Document and ignore", "Delete the logs", "Raise prices"], "Attacks become permanent tests."],
  ["M8.7", "m", "What does attack-success rate measure?", "The share of attack attempts that achieve their goal", ["Model accuracy", "Latency", "Cost per call"], "Track it over time as defences improve."],
  ["M8.7", "h", "How can you red-team a RAG app through its corpus?", "Insert documents containing injection payloads and see if they change behaviour", ["Delete the corpus", "Change the embedding model", "Ask normal questions only"], "Corpus attacks test indirect injection defences."],
  ["M8.7", "e", "Red-team suites should include…", "Direct attacks, indirect attacks and obfuscated variants", ["Only polite questions", "Only performance tests", "Only one attack"], "Breadth catches more weaknesses."],

  // M8.8 Governance
  ["M8.8", "e", "What is a model card or system card?", "Documentation of a model's intended use, limits and risks", ["An API key", "A GPU spec", "A pricing sheet"], "Transparency documentation supports governance."],
  ["M8.8", "m", "How does the EU AI Act classify systems?", "By risk level, with stricter duties for high-risk uses", ["By model size only", "By company size only", "It does not classify"], "Obligations scale with risk."],
  ["M8.8", "m", "What is India's DPDP Act about?", "Protection of digital personal data", ["AI model licensing", "Chip exports", "Telecom spectrum"], "The Digital Personal Data Protection Act governs personal data processing."],
  ["M8.8", "h", "Why does auditability matter for AI decisions?", "To explain and review decisions after the fact, especially when they affect people", ["To reduce cost", "To speed up inference", "For marketing"], "Logs, versions and provenance make audits possible."],
  ["M8.8", "e", "Human oversight means…", "People can monitor, override or stop the system", ["No humans involved", "Humans write all outputs", "Only developers use it"], "Oversight is a core responsible AI principle."],

  // M8.9 Capstone security
  ["M8.9", "m", "What evidence should the security capstone show?", "Attack-success rates before and after adding controls", ["Only a list of controls", "Model size", "Number of tests written"], "Before/after numbers prove the controls work."],
  ["M8.9", "e", "Why attack your own app first?", "You know its design, so you can target its real weak points", ["It is legal only for your app", "It is faster", "It needs no tools"], "Owning the system makes red teaming effective and authorized."],
  ["M8.9", "m", "Which control most reduces exfiltration risk in an agentic RAG app?", "Restricting outbound network and URL rendering", ["Longer prompts", "Bigger chunks", "Higher temperature"], "Cutting the exit path breaks the trifecta."],
  ["M8.9", "h", "A guardrail blocks attacks but also 20% of normal queries. What next?", "Tune for an acceptable false-positive rate using a benign test set", ["Ship it anyway", "Remove all guardrails", "Block more"], "Security must be balanced against usability."],
  ["M8.9", "e", "Security tests should run…", "Automatically in CI with every change", ["Once a year", "Never", "Only after incidents"], "Regressions can reopen old holes."],

  // M9.1 Framework
  ["M9.1", "e", "What should an AI system design start with?", "Requirements and constraints such as quality bar, latency, cost and risk", ["Picking the newest model", "Choosing a vector DB", "Writing prompts"], "Constraints drive every later choice."],
  ["M9.1", "m", "When should you pick fine-tuning over RAG?", "When you need consistent behaviour, style or format rather than fresh knowledge", ["When data changes daily", "When answers need citations", "Always"], "Fine-tuning shapes behaviour; RAG supplies knowledge."],
  ["M9.1", "m", "Why build a simple baseline first?", "It sets a measurable bar that complex designs must beat", ["Baselines are always enough", "It is required by law", "It avoids evaluation"], "Complexity must earn its place."],
  ["M9.1", "h", "Which trade-off triangle governs most AI design decisions?", "Quality, latency and cost", ["CPU, GPU and RAM", "Python, Java and Go", "Read, write and delete"], "Improving one usually costs another."],
  ["M9.1", "e", "Prompting alone is a good choice when…", "The task is simple and needs no private knowledge or actions", ["You need private data", "You need multi-step tools", "Never"], "Start simple."],

  // M9.2 Context architecture
  ["M9.2", "e", "Which knowledge belongs in the static prompt?", "Small, stable rules needed on every request", ["Large changing catalogs", "User-specific records", "All documents"], "Large or changing knowledge should be retrieved."],
  ["M9.2", "m", "How is freshness handled in a knowledge pipeline?", "Incremental re-indexing with timestamps and staleness checks", ["Retrain the model monthly", "Ignore it", "Raise k"], "Fresh data needs an update path."],
  ["M9.2", "m", "Where must access control be enforced for retrieved knowledge?", "In the retrieval layer, before content reaches the model", ["In the prompt", "In the UI only", "After generation"], "The model should never see forbidden data."],
  ["M9.2", "h", "Why combine structured lookups (SQL) with vector retrieval?", "Exact facts like prices are better queried than semantically searched", ["Vectors cannot store text", "SQL is always faster", "To avoid embeddings"], "Use the right retrieval for each data type."],
  ["M9.2", "e", "Provenance lets you…", "Show users where answers came from", ["Skip evaluation", "Use fewer tokens", "Avoid caching"], "Sources build trust."],

  // M9.3 Routing
  ["M9.3", "e", "What does a model gateway centralize?", "Auth, rate limits, routing, fallbacks and usage tracking", ["Model training", "Frontend rendering", "DNS"], "One control point for all model traffic."],
  ["M9.3", "m", "What is a model cascade?", "Trying a cheap model first and escalating to a stronger one when confidence is low", ["Running models in parallel always", "Training one model from another", "Chaining prompts"], "Cascades save cost on easy queries."],
  ["M9.3", "m", "What is a risk of automatic provider fallback?", "The fallback model may produce different quality or format", ["It never works", "It doubles cost always", "It removes logging"], "Evaluate fallbacks like primaries."],
  ["M9.3", "h", "How should a router decide which model handles a request?", "By task type, difficulty, cost and risk, validated with evals", ["Randomly", "Always the largest", "By time of day"], "Routing rules need evidence."],
  ["M9.3", "e", "Why track per-team token usage at the gateway?", "For cost attribution and budget enforcement", ["To train models", "To speed up calls", "For SEO"], "Visibility enables control."],

  // M9.4 Latency
  ["M9.4", "e", "What does streaming improve?", "Perceived latency, by showing tokens as they are generated", ["Total generation time", "Accuracy", "Cost"], "Time to first token drops; total time is similar."],
  ["M9.4", "m", "Which latency components should you measure separately?", "Retrieval, time to first token, generation time and tool calls", ["Only total time", "Only DNS", "Only GPU temperature"], "You can only optimize what you break down."],
  ["M9.4", "m", "Output tokens vs input tokens: which usually dominates latency?", "Output tokens, because they are generated sequentially", ["Input tokens", "They are equal", "Neither"], "Shorter outputs are a strong latency lever."],
  ["M9.4", "h", "When does a smaller model make sense?", "When evals show it meets the quality bar for that task", ["Never", "Always", "Only offline"], "Smaller models are faster and cheaper if good enough."],
  ["M9.4", "e", "Independent retrieval and API calls should be…", "Run in parallel", ["Run sequentially", "Skipped", "Cached forever"], "Parallelism removes avoidable waiting."],

  // M9.5 Caching
  ["M9.5", "e", "What is semantic caching?", "Reusing a response for a new query that is similar in meaning to a cached one", ["Caching by exact string only", "Caching embeddings only", "Caching model weights"], "It matches by embedding similarity."],
  ["M9.5", "m", "What is a risk of semantic caching?", "Returning a cached answer to a question that differs in an important detail", ["It is always slower", "It cannot store text", "It needs GPUs"], "Set thresholds carefully and avoid caching personalized answers."],
  ["M9.5", "m", "Which responses are unsafe to share across users from cache?", "Answers containing user-specific or permissioned data", ["Public FAQ answers", "Static docs answers", "Product descriptions"], "Cache keys must respect identity and permissions."],
  ["M9.5", "h", "Which caches commonly exist in an AI system?", "Prompt/prefix cache, exact response cache, semantic cache and retrieval/embedding cache", ["Only a CDN", "Only a browser cache", "Only DNS cache"], "Each saves a different cost."],
  ["M9.5", "e", "How do you know a cache is worth it?", "Measure hit rate and the cost and latency saved", ["Assume it helps", "Count keys", "Check memory use only"], "Hit rate tells the story."],

  // M9.6 Reliability
  ["M9.6", "e", "What does a circuit breaker do?", "Stops calling a failing dependency for a while so the system can recover", ["Breaks the model", "Cuts power", "Blocks users permanently"], "It prevents cascading failures."],
  ["M9.6", "m", "Graceful degradation for an AI feature means…", "Falling back to a simpler path, such as search results, when the model fails", ["Showing a stack trace", "Retrying forever", "Disabling the app"], "Users still get something useful."],
  ["M9.6", "m", "Why set timeouts on every model call?", "Hung requests otherwise tie up resources and users", ["To lower accuracy", "APIs require it", "To save tokens"], "Timeouts bound worst-case latency."],
  ["M9.6", "h", "Retries without backoff and jitter can cause…", "Synchronized retry storms that overload the provider", ["Lower cost", "Better accuracy", "Nothing"], "Exponential backoff with jitter spreads load."],
  ["M9.6", "e", "Queues help when…", "Work can be processed asynchronously and load spikes", ["Every request needs instant reply", "There is no load", "Using one model"], "Queues absorb bursts."],

  // M9.7 Orchestration
  ["M9.7", "e", "Which decisions should be deterministic code rather than model-delegated?", "Ones with clear rules, such as permission checks and routing by field", ["Creative writing", "Summaries", "Open-ended reasoning"], "Use the model only where judgment is needed."],
  ["M9.7", "m", "When should a task run asynchronously?", "When it takes longer than users will wait, like a deep research report", ["Always", "Never", "Only for chat"], "Long tasks belong in background jobs with status updates."],
  ["M9.7", "m", "A sign of unnecessary agentic complexity is…", "Using an agent for a fixed sequence of steps", ["Using tools", "Using retries", "Logging"], "Fixed flows are workflows."],
  ["M9.7", "h", "Why define clear component boundaries?", "So each part can be tested, scaled and replaced independently", ["To use more services", "To slow deployment", "To increase cost"], "Boundaries make systems maintainable."],
  ["M9.7", "e", "A pipeline's end-to-end flow should be…", "Documented from input to output, including failure paths", ["Left implicit", "Only in code", "Only for the happy path"], "Explicit flows are easier to reason about."],

  // M9.8 Monitoring
  ["M9.8", "e", "Which is implicit user feedback?", "A user copying the answer or rephrasing the question", ["A thumbs-down click", "A written complaint", "A survey score"], "Implicit signals come from behaviour."],
  ["M9.8", "m", "Why version prompts and models in production?", "So a quality regression can be traced to a specific change", ["To save money", "Required by APIs", "For marketing"], "Versioning makes regressions traceable."],
  ["M9.8", "m", "What should AI monitoring cover beyond uptime?", "Quality scores, cost, latency, refusals and drift", ["Only CPU", "Only errors", "Only logins"], "AI fails silently with wrong answers."],
  ["M9.8", "h", "What is the improvement loop?", "Deploy, observe, turn failures into eval cases, improve, redeploy", ["Train once and forget", "Monitor without changes", "Change without measuring"], "Continuous improvement relies on feedback."],
  ["M9.8", "e", "Thumbs-down feedback should be…", "Reviewed and turned into test cases when valid", ["Ignored", "Auto-deleted", "Used to ban users"], "Feedback fuels the eval set."],

  // M9.9 Case studies
  ["M9.9", "e", "A customer-support copilot most needs…", "Grounded answers from the help center with escalation to humans", ["Image generation", "A knowledge graph only", "Fine-tuning only"], "Grounding and handoff are central."],
  ["M9.9", "m", "A coding assistant's key context sources are…", "The open file, related files, repo structure and test results", ["Random web pages", "Only the user's question", "Model weights"], "Code context drives quality."],
  ["M9.9", "m", "A deep research agent is typically…", "Long-running and asynchronous, with many searches and a cited report", ["Synchronous and instant", "A single LLM call", "Purely retrieval"], "Research needs time, iteration and citations."],
  ["M9.9", "h", "How should a design document justify architecture choices?", "By tying each choice to a requirement and naming rejected alternatives", ["By listing technologies", "By popularity", "By cost alone"], "Trade-offs make designs defensible."],
  ["M9.9", "e", "Case studies teach you to…", "Move from requirements to architecture to trade-offs", ["Memorize diagrams", "Skip requirements", "Pick tools first"], "Reasoning matters more than the answer."],

  // M9.10 Design doc capstone
  ["M9.10", "e", "Which section should a system design document open with?", "Requirements and success criteria", ["The diagram", "The tech stack", "Pricing"], "Everything else follows from requirements."],
  ["M9.10", "m", "Why include a latency and cost budget?", "To show the design meets constraints, broken down per component", ["Reviewers like numbers", "It is optional filler", "To compare clouds"], "Budgets make feasibility concrete."],
  ["M9.10", "m", "Why list rejected alternatives?", "To show the trade-offs considered and why the chosen design wins", ["To make the doc longer", "To confuse reviewers", "It is not useful"], "Rejected options show judgment."],
  ["M9.10", "h", "Expected traffic matters because…", "It determines rate limits, caching value, cost and scaling needs", ["It does not", "Only for marketing", "Only for UI"], "Design for real load."],
  ["M9.10", "e", "The user-feedback loop section should explain…", "How feedback is collected and fed into evaluation and improvement", ["How to ignore feedback", "UI colors", "Hiring plans"], "Closing the loop is part of the design."],
];

import type { ExplainerSrc } from "./types";

export const EXPLAINERS_L14_L15: ExplainerSrc[] = [
  {
    id: "M14.1",
    diagram: {
      kind: "flow",
      steps: ["Upload :: PDF, DOCX", "Ingest :: chunk + embed + store", "Ask :: FastAPI /ask", "Hybrid retrieve + rerank", "Answer :: with clickable citations"],
      caption: "A document Q&A platform is your Level 4 pipeline behind an API, with uploads, citations and eval numbers to show.",
    },
    example: {
      title: "Plan the project in five steps",
      problem: "Turn your RAG notebook into a portfolio-ready document Q&A service.",
      steps: [
        ["Endpoints: upload and ask.", "POST /documents (file) -> doc_id\nPOST /ask {question, doc_ids} -> {answer, citations}"],
        ["Ingestion runs in the background so uploads return fast.", "202 Accepted; status: processing -> ready"],
        ["Citations include document, page and a snippet that opens the source.", "{\"doc\": \"policy.pdf\", \"page\": 4, \"quote\": \"…notice period of 30 days…\"}"],
        ["Build a 50-question eval set from your sample documents.", "faithfulness 0.91, answer accuracy 86%"],
        ["README shows a demo GIF, the architecture and the numbers.", "\"86% on 50 questions, p95 2.1 s, $0.002 per answer\""],
      ],
      result: "A deployed service with measured quality, which says far more to an employer than \"I built a chatbot\".",
    },
    yourTurn: {
      task: "What's one improvement you could add and measure on top of the baseline?",
      hints: ["Pick something from Level 4.", "Measure before and after."],
      answer: "For example: add a reranker or hybrid search and report the accuracy change on your 50-question set, along with the latency added.",
    },
  },
  {
    id: "M14.2",
    diagram: {
      kind: "flow",
      steps: ["Resume + JD", "Extract :: skills, years, evidence (schema)", "Match :: requirement by requirement", "Score + explanation", "Human decides"],
      caption: "A screening agent extracts structured facts, scores the match with evidence, and leaves the decision to a person.",
    },
    example: {
      title: "Score one requirement with evidence",
      problem: "JD requires \"3+ years Python, FastAPI experience\". Score a resume against it.",
      steps: [
        ["Extract requirements from the JD as a list.", "[{\"skill\": \"Python\", \"min_years\": 3}, {\"skill\": \"FastAPI\"}]"],
        ["Extract claims from the resume with the quote that supports each.", "{\"skill\": \"Python\", \"years\": 4, \"quote\": \"Python developer, 2021–present\"}"],
        ["Match in code where possible.", "python_ok = claim.years >= req.min_years  # True"],
        ["Use the model only for fuzzy matches, and keep the evidence.", "FastAPI: \"built REST APIs with FastAPI\" -> met"],
        ["Output a summary for the recruiter, never an automatic reject.", "2/2 requirements met, with quotes"],
      ],
      result: "A transparent score a recruiter can check in seconds, built with bias checks and a human making the call.",
    },
    yourTurn: {
      task: "How would you test this agent for bias?",
      hints: ["Change one thing about a resume.", "Should the score change?"],
      answer: "Create resume pairs that differ only in name, gender cues or age cues, and check scores don't change. Track shortlist rates across groups on a test set.",
    },
  },
  {
    id: "M14.3",
    diagram: {
      kind: "flow",
      steps: ["Planner :: splits the topic", "Researchers :: in parallel", "Notes :: claims + sources", "Writer :: combines", "Checker :: verifies citations"],
      caption: "A multi-agent report system shows orchestration. Prove it's worth it by comparing with a single-agent baseline.",
    },
    example: {
      title: "Show the multi-agent design earns its cost",
      problem: "Your LangGraph research system works. Make the project convincing.",
      steps: [
        ["Pick 10 research questions and write what a good report must cover.", "rubric: coverage, correct citations, no unsupported claims"],
        ["Run a single-agent baseline on the same questions.", "single agent: coverage 6.1/10, 3 bad citations"],
        ["Run the multi-agent system.", "multi-agent: coverage 8.4/10, 0 bad citations"],
        ["Record cost and time too.", "single $0.30, 2 min; multi $1.10, 3 min"],
        ["Put the table in the README with a trace screenshot.", "\"+2.3 coverage for 3.7× cost\""],
      ],
      result: "A clear trade-off with numbers, which is exactly what interviewers want to discuss.",
    },
    yourTurn: {
      task: "A citation checker finds a claim with no matching source. What should the system do?",
      hints: ["Don't ship unsupported claims.", "Can it fix it?"],
      answer: "Send it back to a researcher to find a source, or remove or soften the claim, and log it so you can count how often it happens.",
    },
  },
  {
    id: "M14.4",
    diagram: {
      kind: "flow",
      steps: ["MCP host :: any assistant", "Your MCP server", "Tools :: search (read) | create (write, confirm)", "Validation :: every argument", "Real system :: helpdesk API"],
      caption: "An MCP server project shows you can build a reusable, safe integration: validated inputs and confirmed writes.",
    },
    example: {
      title: "A safe write tool",
      problem: "Add `create_ticket` to your helpdesk MCP server without letting an assistant spam tickets.",
      steps: [
        ["Validate inputs strictly.", "class NewTicket(BaseModel):\n    title: str = Field(min_length=5, max_length=120)\n    priority: Literal[\"low\", \"normal\", \"high\"]"],
        ["Describe clearly that it changes things.", "\"\"\"Create a helpdesk ticket. This writes to the live system; confirm with the user first.\"\"\""],
        ["Rate-limit per session.", "if created_this_session >= 5:\n    return {\"error\": \"limit reached\"}"],
        ["Use a scoped token: can create, can't delete.", "HELPDESK_TOKEN scope: tickets:read tickets:create"],
        ["Test with a real host.", "ask an assistant to file a bug; check it confirms first"],
      ],
      result: "A tool that any MCP host can use, which can't be abused to delete or flood your helpdesk.",
    },
    yourTurn: {
      task: "Why might a host still call `create_ticket` without asking the user, even with that description?",
      hints: ["Descriptions are suggestions to the model.", "Where should hard rules live?"],
      answer: "The model may ignore the description. Enforce confirmation in the host's permission settings or with an approval step in your server, not just in text.",
    },
  },
  {
    id: "M14.5",
    diagram: {
      kind: "flow",
      steps: ["Deployed API", "Metrics :: latency, errors, tokens, cost", "Dashboard", "Alerts :: you've seen one fire", "Runbook :: what to do"],
      caption: "A monitored API proves you can operate AI, not just build it. Show the dashboard, an alert and how you'd respond.",
    },
    example: {
      title: "Make the operations story concrete",
      problem: "Your API is deployed. What do you add so it counts as \"production\"?",
      steps: [
        ["Instrument tokens, latency and errors per request.", "llm_tokens_total, llm_latency_seconds, http_errors_total"],
        ["Build a dashboard with p95 latency, error rate and cost per hour.", "Grafana: 3 panels + 7-day view"],
        ["Add two alerts that need a human.", "error rate > 5% for 5 min; hourly cost > 2× normal"],
        ["Trigger one on purpose to prove it works.", "block provider -> error alert fires -> screenshot"],
        ["Write a one-page runbook for each alert.", "check status page -> switch fallback -> verify"],
      ],
      result: "Screenshots of a real alert and the runbook that resolved it: strong evidence of production skills.",
    },
    yourTurn: {
      task: "Why does \"an alert you've seen fire\" matter?",
      hints: ["An untested alert...", "...might never fire."],
      answer: "It proves the alert actually works end to end. Many alerts are misconfigured and stay silent during real incidents.",
    },
  },
  {
    id: "M14.6",
    diagram: {
      kind: "flow",
      steps: ["Real input :: mic or camera", "Pipeline :: per-stage timing", "Failure handling :: noise, bad images", "Latency budget :: e.g. < 1 s", "Demo :: on real devices"],
      caption: "A voice or vision build should work on real inputs, report latency per stage, and handle the messy cases.",
    },
    example: {
      title: "Plan a voice booking agent",
      problem: "Build a voice agent that books appointments, measured under one second per reply.",
      steps: [
        ["Pick the architecture.", "streaming STT -> small LLM with a book_slot tool -> streaming TTS"],
        ["Log timing for every stage on every turn.", "endpoint 280 ms | STT 150 | LLM 320 | TTS 180 = 930 ms"],
        ["Handle real-world failures.", "noisy room, user interrupts, silence for 8 s"],
        ["Test with three different microphones and accents.", "laptop, phone, headset"],
        ["Record a demo and publish the latency table.", "p50 0.93 s, p95 1.4 s"],
      ],
      result: "A demo that survives real conditions, with numbers that show you understand where voice latency comes from.",
    },
    yourTurn: {
      task: "Your demo works at your desk but fails in a café. What should you measure and fix?",
      hints: ["What changed in the environment?", "Which stage suffers first?"],
      answer: "Background noise: measure STT word error rate and false end-of-turn detection in noise, then tune VAD and endpointing or add noise suppression.",
    },
  },
  {
    id: "M14.7",
    diagram: {
      kind: "flow",
      steps: ["2 to 3 strong projects", "README :: problem, architecture, results", "One-line outcome each", "Demo :: GIF or link", "Profile :: pinned and current"],
      caption: "A portfolio works when a reader understands each project and its result in under a minute.",
    },
    example: {
      title: "Rewrite a weak project line",
      problem: "Current README line: \"RAG chatbot using LangChain and Pinecone\".",
      steps: [
        ["Say the problem it solves.", "Answers HR policy questions for employees"],
        ["Add the measured result.", "87% accurate on a 60-question eval set"],
        ["Add one engineering detail that shows judgment.", "hybrid search + reranking cut wrong answers by a third"],
        ["Add cost or speed.", "p95 1.8 s, $0.002 per answer"],
        ["Link a demo.", "2-minute video + live link"],
      ],
      result: "\"HR policy assistant: 87% accurate on 60 test questions, hybrid search + reranking, 1.8 s p95. Demo ↗\" — clear in one glance.",
    },
    yourTurn: {
      task: "You have eight half-finished projects. What do you do with your GitHub profile?",
      hints: ["Quality over quantity.", "What do reviewers look at first?"],
      answer: "Finish and pin the best two or three with full READMEs and results; archive or unpin the rest.",
    },
  },

  // L15 Interview prep
  {
    id: "M15.1",
    diagram: {
      kind: "flow",
      steps: ["Job description", "Highlight :: skills and keywords", "Map :: to your projects", "Gaps :: plan to close", "Story :: why you fit"],
      caption: "Prepare per role: read the JD closely, map it to your evidence, and plan the gaps.",
    },
    example: {
      title: "Map a JD to your experience",
      problem: "JD: \"AI Engineer — RAG, evals, AWS, Python, agent frameworks\".",
      steps: [
        ["List the JD's requirements.", "RAG, evals, AWS deployment, Python, agents"],
        ["Match each to a project with a number.", "RAG: doc Q&A (87%); evals: CI gate; Python: everywhere"],
        ["Mark gaps honestly.", "AWS: only Docker locally; agents: one small LangGraph project"],
        ["Plan to close the biggest gap before interviews.", "deploy the doc Q&A to EC2 this week"],
        ["Write a 30-second positioning line.", "\"I build measured RAG systems and ship them with eval gates.\""],
      ],
      result: "A one-page prep sheet tying every requirement to evidence, with gaps turned into a short plan.",
    },
    yourTurn: {
      task: "How do AI Engineer and GenAI Data Scientist roles usually differ in focus?",
      hints: ["Building and shipping systems...", "...versus modelling and analysis."],
      answer: "AI Engineers focus on building and running LLM systems (APIs, RAG, agents, ops). GenAI Data Scientists lean toward evaluation, experiments, fine-tuning and data work.",
    },
  },
  {
    id: "M15.2",
    diagram: {
      kind: "flow",
      steps: ["Symptom :: \"quality dropped\"", "Isolate stage :: ingest, retrieve, rerank, generate", "Check what changed :: data, model, prompt", "Fix the stage", "Add tests + monitoring"],
      caption: "RAG interview scenarios reward a calm, stage-by-stage diagnosis rather than guessing a fix.",
    },
    example: {
      title: "Answer \"RAG quality dropped after a week\"",
      problem: "Talk through the scenario as you would in an interview.",
      steps: [
        ["Clarify: which questions, how measured, any changes this week?", "\"Is it all queries or one topic? Any deploys?\""],
        ["Check retrieval first with traces on failing queries.", "is the right chunk retrieved?"],
        ["Common causes: new documents not ingested, duplicates, index drift, model or prompt change.", "e.g. new policy docs failed OCR"],
        ["Fix the stage and verify on the golden set.", "re-ingest with OCR; golden set back to 88%"],
        ["Prevent it: ingestion alerts, freshness checks, daily eval run.", "alert if docs ingested = 0 or eval drops 3 points"],
      ],
      result: "A structured answer that shows debugging method, not a lucky guess.",
    },
    yourTurn: {
      task: "Name three services you'd split a production RAG system into.",
      hints: ["Think: getting data in, finding it, answering.", "Each scales differently."],
      answer: "For example: an ingestion service (with a queue), a retrieval service (search and rerank), and an answer service (generation and streaming).",
    },
  },
  {
    id: "M15.3",
    diagram: {
      kind: "flow",
      steps: ["Business task", "Workflow or agent?", "Tools + permissions", "Budgets + human checkpoints", "Debug :: from the trajectory"],
      caption: "Agent interview questions test judgment: when to use an agent, how to keep it safe, and how to debug it.",
    },
    example: {
      title: "Answer \"the agent is stuck in an expensive loop\"",
      problem: "Talk through diagnosis and fixes.",
      steps: [
        ["Get the trajectory for a looping run.", "steps 4 to 30: search_flights with the same arguments"],
        ["Find why: the tool returns an error the agent doesn't understand.", "{\"error\": \"E102\"}"],
        ["Fix the tool's error message so it's actionable.", "{\"error\": \"date must be in the future; got 2026-01-03\"}"],
        ["Add loop detection and budgets.", "same call twice -> nudge; max 10 steps; max $0.50"],
        ["Add an eval case for this scenario.", "a test where the tool returns that error once"],
      ],
      result: "Root cause, fix, safeguards and a regression test: the full answer interviewers look for.",
    },
    yourTurn: {
      task: "When should you say \"don't make this autonomous\"?",
      hints: ["High stakes?", "Known steps?"],
      answer: "When the steps are known (a workflow is simpler) or mistakes are costly and irreversible; then keep a human approving key actions.",
    },
  },
  {
    id: "M15.4",
    diagram: {
      kind: "flow",
      steps: ["Need", "Prompt :: cheapest", "RAG :: knowledge", "Fine-tune :: behaviour", "Justify :: with a measured failure"],
      caption: "Fine-tuning questions test whether you know when not to fine-tune, and how you'd investigate when a tuned model regresses.",
    },
    example: {
      title: "Answer \"accuracy dropped after deploying the fine-tune\"",
      problem: "Offline it was 93%; in production it looks like 80%.",
      steps: [
        ["Check serving matches training: template, tokenizer, system prompt.", "production used a different system prompt -> mismatch"],
        ["Check the data: are production inputs different from training data?", "new product line not in training"],
        ["Check for leakage: was the 93% inflated?", "near-duplicates between train and test -> real score ~86%"],
        ["Fix and re-evaluate on fresh production samples.", "template fixed + new data: 90% on fresh samples"],
        ["Add monitoring for drift.", "weekly sample graded; retrain trigger at -3 points"],
      ],
      result: "Three likely causes checked in order, each with a concrete test, ending in monitoring.",
    },
    yourTurn: {
      task: "Explain LoRA in one sentence for an interviewer.",
      hints: ["What's frozen?", "What's trained?"],
      answer: "LoRA freezes the base model and trains small low-rank matrices added to some layers, so fine-tuning is far cheaper and the result is a small swappable adapter.",
    },
  },
  {
    id: "M15.5",
    diagram: {
      kind: "flow",
      steps: ["Alert", "Read signals :: latency, errors, cost, quality", "Decide :: rollback, mitigate or investigate", "Act", "Review"],
      caption: "LLMOps interview questions test how you read monitoring signals and choose between rolling back, mitigating and investigating.",
    },
    example: {
      title: "Answer \"provider latency doubled\"",
      problem: "p95 went from 3 s to 6 s at 2 pm. Walk through it.",
      steps: [
        ["Confirm the scope: all models or one? all regions?", "only provider A, all endpoints"],
        ["Check the provider status page and your traffic.", "provider incident posted; our traffic normal"],
        ["Mitigate now: shift traffic to the fallback via the gateway.", "70% -> provider B"],
        ["Tell users if needed and watch quality on the fallback.", "fallback judge score within 2%"],
        ["Afterwards: review timeouts, fallback thresholds and alerting.", "auto-failover when p95 > 5 s for 3 min"],
      ],
      result: "Users are protected in minutes, and the system is improved so next time it fails over by itself.",
    },
    yourTurn: {
      task: "When do you roll back immediately instead of investigating first?",
      hints: ["Did a change just go out?", "Are users being hurt?"],
      answer: "When a recent change lines up with the problem and users are affected. Roll back first to stop the harm, then investigate.",
    },
  },
  {
    id: "M15.6",
    diagram: {
      kind: "flow",
      steps: ["Clarify :: assumptions out loud", "Simplest design first", "Walk the stack :: model, context, tools, data, serving", "Evals, security, ops", "Trade-offs + scale"],
      caption: "System-design interviews reward a clear sequence: assumptions, a simple design, then depth where the interviewer pushes.",
    },
    example: {
      title: "Open an enterprise support assistant design",
      problem: "\"Design a support assistant for a bank.\" First five minutes.",
      steps: [
        ["State assumptions.", "\"I'll assume 50k chats a day, English and Hindi, answers from policy docs, no money movement.\""],
        ["Give the simplest design.", "chat UI -> API -> hybrid RAG over policies -> model in-region -> answer with citations"],
        ["Add what a bank needs.", "PII redaction, audit logs, private networking, human handoff"],
        ["Say how you'd measure it.", "golden set of 300 questions, faithfulness, resolution rate, escalation rate"],
        ["Name the main trade-off.", "smaller model + reranker for cost vs a larger model for hard questions; route between them"],
      ],
      result: "A complete outline in five minutes, leaving the interviewer to choose where to go deeper.",
    },
    yourTurn: {
      task: "The interviewer asks \"why not just use one big model with all docs in context?\" Answer briefly.",
      hints: ["How many documents?", "Cost, freshness, access control."],
      answer: "Thousands of documents won't fit, it would be slow and costly per call, and you couldn't filter by user permissions. Retrieval sends only what's relevant and allowed.",
    },
  },
  {
    id: "M15.7",
    diagram: {
      kind: "flow",
      steps: ["New release", "Is it a capability change? :: or hype", "Your evals :: same test set", "Controlled rollout :: small traffic", "Adopt or skip"],
      caption: "Staying current is a process: check what's really new, test it on your evals, and roll out carefully.",
    },
    example: {
      title: "Evaluate a newly released model",
      problem: "A new model is announced as \"best ever at reasoning\". Should your team switch?",
      steps: [
        ["Check what changed that matters to you.", "price -40%, context 2×, reasoning claims on maths benchmarks"],
        ["Run your eval set.", "current 88%, new 89%"],
        ["Compare cost and latency.", "cost -40%, latency +10%"],
        ["Roll out to 10% behind the gateway and watch live metrics.", "a week of judge scores and feedback"],
        ["Decide and write it down.", "switch: same quality, much cheaper"],
      ],
      result: "Switched for the cost saving, backed by your own numbers rather than the launch post.",
    },
    yourTurn: {
      task: "An interviewer asks \"How do you stay current?\" Give a strong answer shape.",
      hints: ["Not \"I read Twitter\".", "Mention a process and an example."],
      answer: "Describe a few trusted sources, a habit of testing new things on your own evals, and one concrete example where that changed (or didn't change) your stack.",
    },
  },
  {
    id: "M15.8",
    diagram: {
      kind: "flow",
      steps: ["Problem", "Architecture", "Key choices :: and why", "Results :: numbers", "Failures :: what you'd change"],
      caption: "Defend a project in this order, with numbers, and be ready for \"why not X?\" questions.",
    },
    example: {
      title: "Answer \"why didn't you fine-tune?\"",
      problem: "About your document Q&A project.",
      steps: [
        ["Restate the goal.", "\"Answers had to reflect policy documents that change monthly.\""],
        ["Say what fine-tuning is for.", "\"Fine-tuning shapes behaviour; it's poor at keeping facts current.\""],
        ["Show the evidence for your choice.", "\"RAG reached 87% with citations; the failures were retrieval misses, not style.\""],
        ["Say when you would fine-tune.", "\"If answer format stayed inconsistent after prompt fixes, or for cost at higher volume.\""],
      ],
      result: "A confident answer tied to your measurements, showing you weighed the option rather than ignored it.",
    },
    yourTurn: {
      task: "\"What happens at 100× traffic?\" List what you'd check first.",
      hints: ["Which limits hit first?", "Provider, database, cost."],
      answer: "Provider rate limits and quotas, cost per month, vector DB and API scaling, caching hit rate and queueing; then say which breaks first and how you'd fix it.",
    },
  },
  {
    id: "M15.9",
    diagram: {
      kind: "flow",
      steps: ["Situation", "Task", "Action :: what you did", "Result :: with a number", "Reflection :: what you learned"],
      caption: "Behavioural answers follow STAR plus a short reflection. Be clear, specific and honest about trade-offs.",
    },
    example: {
      title: "A STAR answer about a failure",
      problem: "\"Tell me about a time something you built didn't work.\"",
      steps: [
        ["Situation: short context.", "\"Our support bot's answers got worse a week after launch.\""],
        ["Task: your responsibility.", "\"I owned the RAG pipeline.\""],
        ["Action: what you did, step by step.", "\"I traced failing questions, found new docs weren't being ingested, fixed OCR and added an ingestion alert.\""],
        ["Result: a number.", "\"Accuracy went from 74% back to 88%, and the alert caught a similar issue a month later.\""],
        ["Reflection.", "\"I now add data-freshness checks before launch, not after.\""],
      ],
      result: "Under two minutes, concrete, with a measurable result and a lesson, which is what interviewers score.",
    },
    yourTurn: {
      task: "An interviewer asks a deep implementation question you don't know. What do you do?",
      hints: ["Bluffing is risky.", "Show how you'd find out."],
      answer: "Say you haven't done that exactly, state what you do know and your assumptions, and explain how you'd work it out or measure it.",
    },
  },
];

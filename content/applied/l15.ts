import type { AppliedModule } from "./types";

const CONTEXTUAL = { label: "Anthropic: Introducing Contextual Retrieval", url: "https://www.anthropic.com/news/contextual-retrieval", kind: "blog" } as const;
const EFFECTIVE_AGENTS = { label: "Anthropic: Building effective agents", url: "https://www.anthropic.com/engineering/building-effective-agents", kind: "blog" } as const;
const GITHUB_EVALS = { label: "GitHub Blog: How we evaluate AI models for GitHub Copilot", url: "https://github.blog/ai-and-ml/generative-ai/how-we-evaluate-models-for-github-copilot/", kind: "case-study" } as const;
const HONEYCOMB = { label: "Honeycomb: All the hard stuff nobody talks about when building products with LLMs", url: "https://www.honeycomb.io/blog/hard-stuff-nobody-talks-about-llm", kind: "case-study" } as const;
const ILLUSION = { label: "Singh et al.: The Leaderboard Illusion", url: "https://arxiv.org/abs/2504.20879", kind: "paper" } as const;
const LINKEDIN = { label: "Xu et al. (LinkedIn): RAG with Knowledge Graphs for Customer Service QA", url: "https://arxiv.org/abs/2404.17723", kind: "paper" } as const;
const MANUS = { label: "Manus: Context engineering for AI agents, lessons from building Manus", url: "https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus", kind: "case-study" } as const;
const OPENAI_OUTAGE = { label: "OpenAI status: December 11, 2024 incident write-up", url: "https://status.openai.com/incidents/ctrsv3lwd797/write-up", kind: "case-study" } as const;
const RAG_TRIAD = { label: "DeepEval guide: Using the RAG triad", url: "https://deepeval.com/guides/guides-rag-triad", kind: "docs" } as const;
const RECHAT = { label: "Hamel Husain: Your AI product needs evals", url: "https://hamel.dev/blog/posts/evals/", kind: "case-study" } as const;
const RRF = { label: "Elasticsearch docs: Reciprocal rank fusion", url: "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion", kind: "docs" } as const;
const RULE_OF_TWO = { label: "Simon Willison: Agents Rule of Two and The Attacker Moves Second", url: "https://simonwillison.net/2025/Nov/2/new-prompt-injection-papers/", kind: "blog" } as const;
const SHOPIFY = { label: "Shopify Engineering: Building production-ready agentic systems", url: "https://shopify.engineering/building-production-ready-agentic-systems", kind: "case-study" } as const;
const SYCOPHANCY = { label: "OpenAI: Expanding on what we missed with sycophancy", url: "https://openai.com/index/expanding-on-sycophancy/", kind: "case-study" } as const;
const TAU = { label: "Yao et al.: tau-bench, tool-agent-user interaction in real-world domains", url: "https://arxiv.org/abs/2406.12045", kind: "paper" } as const;
const UBER = { label: "Uber Engineering: Navigating the LLM landscape with GenAI Gateway", url: "https://www.uber.com/blog/genai-gateway", kind: "case-study" } as const;
const PITFALLS = { label: "Chip Huyen: Common pitfalls when building generative AI applications", url: "https://huyenchip.com/2025/01/16/ai-engineering-pitfalls.html", kind: "blog" } as const;
const PRODUCT_EVALS = { label: "Eugene Yan: Product evals in three simple steps", url: "https://eugeneyan.com/writing/product-evals/", kind: "blog" } as const;
const OPENAI_OPT = { label: "OpenAI docs: Model optimization", url: "https://developers.openai.com/api/docs/guides/model-optimization", kind: "docs" } as const;
const LORA_LAND = { label: "Zhao et al.: LoRA Land, 310 fine-tuned LLMs that rival GPT-4", url: "https://arxiv.org/abs/2405.00732v1", kind: "paper" } as const;
const DOORDASH_BEDROCK = { label: "AWS case study: DoorDash builds a generative AI contact center with Amazon Bedrock", url: "https://aws.amazon.com/solutions/case-studies/doordash-bedrock-case-study", kind: "case-study" } as const;
const CURSOR = { label: "Cursor: Editing files at 1000 tokens per second", url: "https://cursor.com/blog/instant-apply", kind: "case-study" } as const;

export const APPLIED_L15: AppliedModule[] = [
  {
    moduleId: "M15.1",
    howItWorks:
      "Interview strategy starts with picking a target role, because AI engineer, GenAI data scientist and ML engineer loops test different things. Read job posts for the role, list the skills they ask for most, and match each to a project or story you can defend with numbers. Most loops include coding, one or two system design rounds, a project deep dive and a behavioural round. Preparing a small number of strong stories and practising out loud beats skimming many topics, and it is better to say clearly what you have not done than to overclaim.",
    uses: [
      {
        who: "Chip Huyen",
        what: "Chip Huyen lists common pitfalls in AI engineering, including using generative AI where simpler methods work, starting with complex tools before simple ones, treating an early demo as nearly done, and relying only on AI judges without human review. These are the judgement calls AI engineering work, and so the interviews for it, tend to probe.",
        source: PITFALLS,
      },
      {
        who: "Anthropic (agent design advice)",
        what: "Anthropic distinguishes workflows, where code defines the path, from agents, where the model decides. It describes prompt chaining, routing, parallelisation, orchestrator-workers and evaluator-optimiser patterns, and advises using the simplest one that works.",
        source: EFFECTIVE_AGENTS,
      },
    ],
    scenario: {
      title: "Preparing a four-week plan for an AI engineer loop",
      context:
        "A backend developer with two small LLM projects has interviews in a month for AI engineer roles. They have been reading random tutorials and do not know where to focus.",
      architecture:
        "The plan has one skills map built from five job posts, a story bank of three projects with numbers, weekly practice on one system design and one debugging scenario out loud, and a mock interview each week with feedback.",
      tools: ["five target job posts", "a spreadsheet skills map", "a story bank document", "a timer", "a practice partner or recorded answers"],
      steps: [
        "Read five job posts and count which skills appear most often.",
        "Mark each skill as strong, shaky or missing, and rank the gaps by how often they appear.",
        "Write three project stories with the problem, your decision, a number and a limit.",
        "Practise one scenario a week out loud, with a timer, and get feedback from someone.",
        "In the last week, rehearse a full loop and prepare questions for the interviewers.",
      ],
    },
    example: {
      title: "A skills map from job posts",
      lang: "yaml",
      code: `target_role: AI engineer (product company)
posts_read: 5
skills:
  - {skill: RAG design and evaluation,    in_posts: 5, me: strong,  story: "DocsQA, recall@5 71 -> 89%"}
  - {skill: agents and tool use,           in_posts: 4, me: shaky,   plan: "build one agent with a step budget"}
  - {skill: evals / LLM-as-judge,          in_posts: 4, me: shaky,   plan: "label 100 outputs, align a judge"}
  - {skill: production monitoring / cost,  in_posts: 3, me: missing, plan: "deploy the API, add dashboard"}
  - {skill: fine-tuning,                   in_posts: 1, me: missing, plan: "know when NOT to; one paragraph answer"}
week_focus: [evals, agents, monitoring, mock loop]`,
      notes:
        "Counting how often a skill appears turns a vague worry into an ordered list. Marking fine-tuning as something to explain rather than master reflects how rarely it shows up compared with evals and retrieval.",
    },
    tradeoffs: [
      { issue: "Preparing for every role at once spreads effort thin.", response: "Pick one target role and tailor stories to it." },
      { issue: "Claiming depth you do not have gets exposed in follow-up questions.", response: "Say where your experience ends and describe how you would find out." },
      { issue: "Reading is easier than practising out loud.", response: "Schedule spoken practice with timing, since interviews are spoken." },
    ],
    junior: "Applies everywhere with one generic story and reads topics in random order.",
    senior: "Targets a role, maps skills to evidence, prepares a few strong stories, and practises under interview conditions.",
    reading: [PITFALLS, EFFECTIVE_AGENTS],
  },
  {
    moduleId: "M15.2",
    howItWorks:
      "RAG interview scenarios give you a symptom ('answers got worse after we added documents') or a design ('build Q&A over our wiki') and ask how you would proceed. A strong answer follows the pipeline in order: ingestion and chunking, retrieval, reranking, generation and evaluation. It starts by diagnosing with data, for example checking whether the right passage was retrieved before blaming the model, and it names the metrics you would use. Mentioning hybrid search, metadata filters and a labelled question set shows you have done this for real.",
    uses: [
      {
        who: "Anthropic (Contextual Retrieval)",
        what: "Anthropic prepended a short, model-written context to each chunk before embedding and keyword indexing. On their tests this cut top-20 retrieval failures by about a third with embeddings alone, about half when combined with contextual BM25, and about two thirds with reranking added; prompt caching kept the one-off cost low.",
        source: CONTEXTUAL,
      },
      {
        who: "Elasticsearch",
        what: "Elasticsearch has a built-in RRF retriever that runs a BM25 query and a kNN vector query independently and merges their top results, scoring each document by summing one over a constant plus its rank in each list, with a default constant of 60.",
        source: RRF,
      },
      {
        who: "LinkedIn customer service",
        what: "LinkedIn's team found that treating past support tickets as flat text lost their structure, so they parsed tickets into a graph of sections and links instead. They report much better retrieval and a lower median time to resolve issues after deploying it.",
        source: LINKEDIN,
      },
    ],
    scenario: {
      title: "'Answers got worse after we added new documents'",
      context:
        "A company's wiki assistant worked well until the team added 3,000 new pages. Users now report wrong or off-topic answers. The interviewer asks what you would check.",
      architecture:
        "Walk the pipeline: check ingestion (were the new pages parsed and chunked properly?), retrieval (is the right chunk in the top results?), reranking, and generation (does the answer stick to the context?), measuring each with a question set.",
      tools: ["a labelled question set", "retrieval logs", "a retrieval-hit metric", "a faithfulness check", "version history of the index"],
      steps: [
        "Ask what changed and when, and whether the answers got worse for old questions or only new ones.",
        "Run the existing question set and compare retrieval hit rate before and after.",
        "If retrieval dropped, inspect the new chunks: duplicates, boilerplate, bad parsing, missing metadata.",
        "If retrieval is fine, check whether the model ignores context or conflicting documents confuse it.",
        "Fix the cause, add the failing cases to the question set, and add an ingestion check to prevent a repeat.",
      ],
    },
    example: {
      title: "How a strong answer is structured",
      lang: "text",
      code: `Q: Answers got worse after we added 3,000 new documents. What do you check?

1. Clarify: worse on which questions? Old ones, new ones, or both? Since when?
2. Measure first: run the saved question set. Is recall@5 lower than last week?
3. If retrieval is lower:
   - new docs are near-duplicates or boilerplate that crowd out good chunks
   - bad parsing (tables, headers) or no metadata to filter by
   - fix: dedupe, clean, add metadata filters, try hybrid search or reranking
4. If retrieval is fine but answers are wrong:
   - conflicting old and new versions of a policy -> add dates / prefer latest
   - model ignores context -> tighten the prompt, require citations
5. Prevent: add the failing questions to the eval set; check retrieval on every ingest.`,
      notes:
        "The answer diagnoses before fixing and uses numbers at each step. Naming concrete causes such as duplicates and conflicting versions shows experience with real document sets.",
    },
    tradeoffs: [
      { issue: "Jumping to a fix, such as a bigger model, before finding the cause.", response: "Locate the failing stage using retrieval and answer metrics first." },
      { issue: "Never mentioning evaluation.", response: "Say which question set and metrics you would use, and how you would build one if none exists." },
      { issue: "Naming techniques with no reason.", response: "Tie each technique to a failure it fixes, such as hybrid search for exact codes." },
    ],
    junior: "Suggests changing the embedding model or chunk size straight away.",
    senior: "Clarifies the symptom, measures retrieval separately from generation, names likely causes, and ends with prevention.",
    reading: [CONTEXTUAL, RRF, RAG_TRIAD],
  },
  {
    moduleId: "M15.3",
    howItWorks:
      "Agentic interview scenarios ask you to design or debug agents: choosing between a simple workflow and an agent, designing tools, setting budgets and stop rules, handling failures, and keeping actions safe. Strong answers start from the simplest design that meets the need, then add autonomy only where the task requires it. They cover step and cost limits, loop detection, tool permissions, human approval for risky actions, and traces for debugging.",
    uses: [
      {
        who: "Shopify Sidekick",
        what: "Shopify observed that around 20 tools stayed manageable, 20 to 50 made boundaries blurry, and beyond 50 the same task could be done several ways, making behaviour hard to predict. They also moved situational guidance into tool results instead of a bloated system prompt.",
        source: SHOPIFY,
      },
      {
        who: "tau-bench (research)",
        what: "tau-bench pairs an agent with a model-simulated user, domain tools and a policy, and judges success by the final database state. It also measures whether the agent succeeds on every one of several repeats; a strong model at the time solved under half the tasks, and its consistency over eight repeats was far lower.",
        source: TAU,
      },
      {
        who: "Meta (Agents Rule of Two)",
        what: "Meta published a rule that an agent should have at most two of three properties in a session: processing untrusted input, accessing sensitive systems or data, and changing state or communicating externally. If a task needs all three, it should not run without supervision.",
        source: RULE_OF_TWO,
      },
    ],
    scenario: {
      title: "'Your agent is stuck in a costly loop'",
      context:
        "A support agent that can look up orders and issue refunds sometimes keeps calling the same tool over and over, and one run cost $40. The interviewer asks how you would stop it and prevent it.",
      architecture:
        "Stop the bleeding with a step and cost budget per run and a kill switch. Then use traces to find why it loops, fix tool results and prompts, add loop detection, and keep refunds behind a limit and an approval step.",
      tools: ["traces for each run", "step and token budgets", "loop detection on repeated tool calls", "tool permissions", "human approval for refunds"],
      steps: [
        "Add a hard budget: maximum steps, tokens and money per run, with a safe failure message.",
        "Pull the traces for looping runs and find the repeating pattern, such as an unhelpful error message from a tool.",
        "Fix the root cause: clearer tool errors, better prompt, or a missing tool.",
        "Add loop detection: stop or escalate when the same call with the same arguments repeats.",
        "Add the failing runs to a test set and run it on every change.",
      ],
    },
    example: {
      title: "A run budget and loop check",
      lang: "python",
      code: `from collections import Counter

class RunGuard:
    def __init__(self, max_steps=12, max_cost_usd=0.50, max_repeats=2):
        self.max_steps, self.max_cost, self.max_repeats = max_steps, max_cost_usd, max_repeats
        self.steps, self.cost, self.calls = 0, 0.0, Counter()

    def check(self, tool: str, args: dict, step_cost: float) -> str | None:
        self.steps += 1
        self.cost += step_cost
        key = (tool, tuple(sorted(args.items())))
        self.calls[key] += 1
        if self.steps > self.max_steps:
            return "step budget exceeded"
        if self.cost > self.max_cost:
            return "cost budget exceeded"
        if self.calls[key] > self.max_repeats:
            return f"repeated call to {tool}"
        return None      # fine to continue

# in the agent loop: if (reason := guard.check(...)): escalate_to_human(reason); break`,
      notes:
        "Limits turn a runaway loop into a bounded, logged failure that hands over to a person. The guard stops the damage, but the lasting fix is to read the traces and find why the agent looped.",
    },
    tradeoffs: [
      { issue: "Strict budgets can cut off legitimate long tasks.", response: "Set budgets by task type and review the runs that hit them." },
      { issue: "More tools make agents less reliable.", response: "Keep a small set of distinct tools and group or remove overlaps." },
      { issue: "Agents with private data, untrusted input and external actions are easy to abuse.", response: "Limit the combination, require approval for risky actions, and use least privilege." },
    ],
    junior: "Designs an agent for a job that a fixed workflow would do better and forgets about stopping rules.",
    senior: "Starts simple, adds budgets, loop detection and permissions, and uses traces and test sets to improve.",
    reading: [EFFECTIVE_AGENTS, SHOPIFY, RULE_OF_TWO],
  },
  {
    moduleId: "M15.4",
    howItWorks:
      "Fine-tuning interviews test judgement more than mechanics. The best first answer to 'should we fine-tune?' is a set of questions: what is the goal, what does the prompted baseline score, is the gap about behaviour or knowledge, how much good data is there, and what does volume and cost look like. If you do fine-tune, you should be able to explain data preparation, the method (SFT, LoRA, preference tuning), and how you would prove the result beats the baseline without breaking other behaviour.",
    uses: [
      {
        who: "OpenAI model optimization guide",
        what: "OpenAI's guide recommends writing evals first, then improving prompts, and only then fine-tuning, and describes several kinds of tuning (supervised, vision, preference and reinforcement). It also notes that OpenAI is winding down its own fine-tuning platform for new users, so hosted options change.",
        source: OPENAI_OPT,
      },
      {
        who: "LoRA Land (Predibase)",
        what: "Researchers fine-tuned 310 small models with LoRA across 31 narrow tasks and found the tuned models beat their base models by about 34 points on average and beat GPT-4 by about 10, showing where fine-tuning pays off: narrow, well-defined tasks.",
        source: LORA_LAND,
      },
    ],
    scenario: {
      title: "'Should we fine-tune for our support bot?'",
      context:
        "A product manager says the support bot sometimes ignores the company's tone and answer format, and wants to fine-tune a model. The interviewer asks what you would do.",
      architecture:
        "Do not say yes or no immediately. Establish the goal and baseline, try prompt and retrieval improvements against an eval set, and only then decide whether a small tuned model is justified on quality, cost or latency.",
      tools: ["an eval set", "the current prompted baseline", "prompt and retrieval improvements", "a small model for a possible fine-tune", "a cost estimate"],
      steps: [
        "Ask what 'ignores tone and format' means, how often, and how it is measured today.",
        "Build or ask for an eval set that scores format and tone, and measure the baseline.",
        "Try clearer instructions, examples in the prompt and structured output, and measure again.",
        "If a gap remains and there are enough good examples, propose SFT with LoRA on a small model.",
        "Define success (beats the baseline on the eval, no regressions) and plan retraining and ownership.",
      ],
    },
    example: {
      title: "A strong answer to 'should we fine-tune?'",
      lang: "text",
      code: `Short answer: probably not yet. Here is how I would decide.

1. Goal and baseline: what exactly fails, and what is the prompted score on an eval set?
2. Behaviour or knowledge? Tone and format are behaviour (tuning can help).
   Missing facts are knowledge (use retrieval, not tuning).
3. Try cheaper fixes first: clearer instructions, 3-5 examples in the prompt, structured output.
4. If a gap remains, check the data: do we have ~1,000 clean, representative examples
   with no overlap with the eval set?
5. Business case: volume and cost. A small tuned model may cut cost and latency a lot at 100k+ calls a day.
6. If we go ahead: SFT with LoRA on a small model, judged on the frozen eval set
   plus a regression check, with an owner for retraining.`,
      notes:
        "The answer asks questions, separates behaviour from knowledge, and ends with how success would be judged. That order is what interviewers listen for.",
    },
    tradeoffs: [
      { issue: "Saying yes at once sounds eager but unconsidered.", response: "Ask about the goal, baseline and data before choosing." },
      { issue: "Proposing a method with no plan to evaluate it.", response: "Define the eval set and the regression checks before training." },
      { issue: "Ignoring maintenance.", response: "Mention retraining when the task or base model changes, and who owns it." },
    ],
    junior: "Says fine-tuning will fix it and explains LoRA without asking about the goal or the baseline.",
    senior: "Frames the decision with questions and numbers, tries cheaper fixes first, and plans evaluation and upkeep.",
    reading: [OPENAI_OPT, LORA_LAND],
  },
  {
    moduleId: "M15.5",
    howItWorks:
      "LLMOps and debugging interviews give a production problem such as 'costs doubled' or 'quality dropped last week' and watch how you respond. A good response mitigates first if users are being hurt (roll back, switch to a fallback, or turn a feature off), then finds the cause with data: break the problem down by feature, model, prompt version and time, compare before and after, and follow traces. It ends with prevention: alerts, tests and a written post-incident review.",
    uses: [
      {
        who: "OpenAI (December 2024 outage)",
        what: "A new telemetry service overloaded Kubernetes control planes across OpenAI's clusters and took down the API, ChatGPT and Sora for about four hours. Staging did not show it because only large clusters were affected. OpenAI committed to phased rollouts, emergency access paths and decoupling critical services.",
        source: OPENAI_OUTAGE,
      },
      {
        who: "OpenAI (GPT-4o sycophancy)",
        what: "In April 2025 an update made GPT-4o overly agreeable. Offline evals and a small A/B test looked fine, so it shipped; OpenAI rolled it back within days and changed its launch process to block on behaviour issues even when metrics look good.",
        source: SYCOPHANCY,
      },
      {
        who: "Manus",
        what: "Manus reports that its agent reads about 100 tokens for every token it writes, so input dominates both cost and latency. That is why they track the cache hit rate on that input as their single most important production metric.",
        source: MANUS,
      },
    ],
    scenario: {
      title: "'Costs doubled last week'",
      context:
        "An AI product's model bill doubled in a week with no obvious traffic increase. The interviewer asks how you would respond.",
      architecture:
        "Contain the spend, then break costs down by feature, model, prompt version and user, compare with the previous week, and look at tokens per request, retries and cache hit rate to find what changed.",
      tools: ["cost and token dashboards by feature", "traces", "prompt and deployment history", "per-key rate limits and budgets", "cache hit rate"],
      steps: [
        "Mitigate: set or tighten budgets and rate limits, and check whether one key or feature is the source.",
        "Break cost down by feature, model, prompt version and user for this week against last week.",
        "Check tokens per request, retry counts and cache hit rate for the biggest change.",
        "Look at what was deployed: a longer prompt, a new model, a changed cache prefix or a retry loop.",
        "Fix it, add a cost alert and per-feature budgets, and write a short post-incident note.",
      ],
    },
    example: {
      title: "A query to find where the extra cost came from",
      lang: "sql",
      code: `-- cost by feature and prompt version, this week vs last week
WITH weekly AS (
  SELECT
    feature,
    prompt_version,
    CASE WHEN ts >= now() - interval '7 days' THEN 'this_week' ELSE 'last_week' END AS wk,
    count(*)                       AS calls,
    avg(input_tokens)              AS avg_in,
    avg(output_tokens)             AS avg_out,
    avg(cache_read_tokens::float / NULLIF(input_tokens, 0)) AS cache_share,
    sum(cost_usd)                  AS cost
  FROM llm_calls
  WHERE ts >= now() - interval '14 days'
  GROUP BY 1, 2, 3
)
SELECT feature, prompt_version, wk, calls, round(avg_in) AS avg_in,
       round(cache_share::numeric, 2) AS cache_share, round(cost::numeric, 2) AS cost
FROM weekly
ORDER BY feature, prompt_version, wk;`,
      notes:
        "Putting calls, average tokens and cache share beside cost shows whether the rise comes from more traffic, longer prompts or a cache that stopped working. Having this table ready before an incident is what makes the answer fast.",
    },
    tradeoffs: [
      { issue: "Guessing a cause without data wastes time during an incident.", response: "Break the problem down by feature, model and version and compare before and after." },
      { issue: "Digging for the root cause while users are affected.", response: "Mitigate first with a rollback, fallback or feature switch, then investigate." },
      { issue: "Metrics can look fine while behaviour is wrong.", response: "Add behaviour checks and expert spot checks to launch reviews." },
    ],
    junior: "Starts guessing causes, or blames the model provider, before looking at any data.",
    senior: "Mitigates, narrows with data, finds the change, fixes it, and adds alerts and tests so it does not repeat.",
    reading: [OPENAI_OUTAGE, SYCOPHANCY, MANUS],
  },
  {
    moduleId: "M15.6",
    howItWorks:
      "AI system design interviews ask you to design a complete system in 40 to 60 minutes while thinking out loud. A reliable structure is: clarify requirements and constraints (users, scale, latency, data rules), propose a simple baseline, then go deeper on the parts that matter (retrieval, models, evals, guardrails, cost, operations), and say what you would measure. Interviewers care more about your reasoning and trade-offs, with rough numbers, than about a perfect diagram.",
    uses: [
      {
        who: "DoorDash",
        what: "DoorDash designed its driver voice-support system around a hard requirement of answering within 2.5 seconds, because drivers call while driving, and built automated testing that ran thousands of tests per hour before rollout.",
        source: DOORDASH_BEDROCK,
      },
      {
        who: "Cursor",
        what: "Cursor split code edits into planning by a frontier model and applying by a fine-tuned model, and used a speculative decoding method that guesses upcoming tokens from the original file. Applying edits reached about 1,000 tokens per second, many times faster than their earlier setup.",
        source: CURSOR,
      },
      {
        who: "Uber",
        what: "Uber's gateway serves models from an external API provider, a cloud platform (Vertex AI) and Uber-hosted open models through one interface, so teams can use all three ways to consume a model without changing their code.",
        source: UBER,
      },
    ],
    scenario: {
      title: "'Design a code-review assistant'",
      context:
        "The interviewer asks you to design an assistant that reviews pull requests and comments on likely bugs and style issues for a company with 500 engineers.",
      architecture:
        "A webhook triggers a review pipeline that collects the diff and relevant files, runs static checks, asks a model for comments, filters low-confidence ones, and posts them. Evaluation uses past reviews, and usage and acceptance are tracked.",
      tools: ["a GitHub app or webhook", "code search for context", "an LLM through a gateway", "a comment filter", "an eval set of past pull requests", "dashboards"],
      steps: [
        "Clarify scope: languages, size of pull requests, latency target, whether it may block merges, data rules.",
        "Sketch the baseline: diff plus a prompt, comments posted by a bot.",
        "Go deeper on context (which files to retrieve), false positives and how to filter them.",
        "Describe evaluation: past pull requests with known issues, and acceptance rate of comments in production.",
        "Cover cost and latency with rough numbers, failure handling and a gradual rollout.",
      ],
    },
    example: {
      title: "A back-of-envelope estimate to say out loud",
      lang: "text",
      code: `Assumptions: 500 engineers, ~2 PRs each per day -> 1,000 PRs/day
Average diff plus context: 8,000 input tokens; output: 600 tokens

Daily tokens: 8M input, 0.6M output
If price is ~$3 per 1M input and ~$15 per 1M output tokens:
  cost/day ~= 8*3 + 0.6*15 = $24 + $9 = $33  (~$1,000/month)
Latency target: comments within 2 minutes of opening the PR -> async queue, not a blocking call

Where it gets expensive: large PRs (50k+ tokens) and re-reviews on every push.
Mitigations: cap context, review only changed hunks on re-push, cache the shared prefix,
use a cheaper model for style checks and a stronger one for bug hunting.

Success measures: % of comments accepted or resolved (target > 40%),
developer-reported noise, time to first review.`,
      notes:
        "Rough numbers show you can reason about scale and cost, and naming where costs grow tells the interviewer you have run such a system. Use your own prices and say they are assumptions.",
    },
    tradeoffs: [
      { issue: "Skipping requirements and drawing boxes.", response: "Spend the first minutes on users, scale, latency and constraints." },
      { issue: "Naming components without trade-offs or numbers.", response: "Compare options briefly and give rough estimates." },
      { issue: "Only describing the happy path.", response: "Cover evaluation, failure handling, cost control and rollout." },
    ],
    junior: "Starts drawing a pipeline of boxes with product names and no requirements.",
    senior: "Clarifies, proposes a baseline, then deepens where risk is, with numbers, evaluation and operations.",
    reading: [DOORDASH_BEDROCK, UBER, CURSOR],
  },
  {
    moduleId: "M15.7",
    howItWorks:
      "Staying current without chasing hype means having a light routine and a fixed way to judge new things. Follow a few sources you trust (engineering blogs, papers summarised well, release notes), skip the rest, and set aside a little time each week. When a new model or tool appears, test it on your own eval set and compare quality, latency and cost with what you use now before forming an opinion. Interviewers listen for whether your views come from evidence, and whether your fundamentals are strong enough to judge new ideas.",
    uses: [
      {
        who: "The Leaderboard Illusion (research)",
        what: "The Leaderboard Illusion paper found that some providers tested many private variants on the Arena and published only the best, and that large providers received much more Arena data. The authors argue this lets models fit the leaderboard rather than improve generally.",
        source: ILLUSION,
      },
      {
        who: "Chip Huyen",
        what: "Chip Huyen lists common pitfalls in AI engineering, including using generative AI where simpler methods work, starting with complex tools before simple ones, and treating an early demo as nearly done. They are the kind of hype-driven mistakes a steady, evidence-based routine avoids.",
        source: PITFALLS,
      },
    ],
    scenario: {
      title: "'A new model just launched. Should we switch?'",
      context:
        "A new model tops the headlines and a manager asks whether the team should move to it. The interviewer asks how you would decide.",
      architecture:
        "Treat the launch as a hypothesis. Run the model on the team's own eval set, compare quality, latency and cost, check data and licensing terms, and run a small rollout before switching.",
      tools: ["the team's eval set", "a gateway for easy model swaps", "cost and latency measurements", "a staged rollout"],
      steps: [
        "Read the release notes for changes that matter to your task, such as price, context size and limits.",
        "Run the eval set with the same prompts and compare quality, latency and cost per task.",
        "Check data handling, region and licence terms.",
        "Try prompt changes only if the first result is close, to keep the comparison fair.",
        "Roll out to a small share of traffic and monitor before a full switch.",
      ],
    },
    example: {
      title: "A weekly routine that stays small",
      lang: "yaml",
      code: `weekly_time: 2 hours
sources:        # chosen on purpose, reviewed every quarter
  - two engineering blogs from teams that run AI in production
  - one eval-focused newsletter or blog
  - release notes for the model providers I actually use
rules:
  - read the original source, not only the summary or the thread about it
  - for each new model or tool: one line in a notes file: "what claim? how would I test it?"
  - test on my own eval set before forming an opinion
  - ignore leaderboards as the deciding factor; use them to build a shortlist
monthly: re-run my eval set on the current best candidates and update the cost/quality table`,
      notes:
        "Limiting the sources and requiring a testable claim keeps the routine from turning into endless reading. The monthly re-run turns opinions into numbers you can quote.",
    },
    tradeoffs: [
      { issue: "Chasing every new tool leaves no time for depth.", response: "Choose a few sources, take notes, and test only what applies to your work." },
      { issue: "Leaderboards can be gamed or measure the wrong thing.", response: "Use them for shortlisting and decide with your own eval." },
      { issue: "Strong opinions without testing sound confident but weak.", response: "Say what you tested, on what data, and what you saw, and label anything else as an untested impression." },
    ],
    junior: "Follows every new launch, tries a few prompts, and forms opinions from social posts.",
    senior: "Has a small routine, judges new things on their own eval set, and can explain why a headline result may not apply.",
    reading: [ILLUSION, PITFALLS, PRODUCT_EVALS],
  },
  {
    moduleId: "M15.8",
    howItWorks:
      "Project defense is explaining and defending your design choices while someone questions them. Interviewers pick a decision ('why hybrid search?') and keep asking why until they find where your understanding ends. Prepare each project with the problem, your key decisions with alternatives you rejected, the numbers behind them, the failures you hit, and what you would change. Answer with evidence, stay calm when challenged, and say 'I would test that' instead of bluffing.",
    uses: [
      {
        who: "Rechat",
        what: "Rechat moved from ad-hoc prompt tweaking to a test-driven loop: hundreds of fast assertion tests run on every change, logged traces reviewed by humans and a calibrated model critic, and A/B tests once the product matured. That ended the cycle of fixing one failure and breaking another.",
        source: RECHAT,
      },
      {
        who: "GitHub Copilot",
        what: "GitHub runs most of its 4,000+ offline Copilot tests as part of an automated CI pipeline built mainly on GitHub Actions, so every proposed change is tested the same way before it reaches users.",
        source: GITHUB_EVALS,
      },
    ],
    scenario: {
      title: "'Why did you use hybrid search?'",
      context:
        "In a project deep dive the interviewer asks why you used hybrid search, then why not a bigger embedding model, then how you know it worked.",
      architecture:
        "Prepare a decision log for each project: the problem, options considered, the measurement that decided it, and what you would change. Use it to answer each follow-up with a number or an honest 'not tested'.",
      tools: ["a decision log", "eval results saved per change", "a one-page architecture diagram", "a list of failures and fixes"],
      steps: [
        "For each project, list five key decisions and the alternatives you rejected.",
        "Attach the number or evidence that decided each one, from your saved eval runs.",
        "List the two or three failures you hit and what they taught you.",
        "Practise answering 'why' three levels deep for each decision.",
        "Prepare what you would change next, and what you did not test.",
      ],
    },
    example: {
      title: "A decision log entry you can defend",
      lang: "yaml",
      code: `decision: hybrid search (BM25 + vectors, fused with RRF)
problem: exact policy codes and product names were missed by vector search
alternatives_considered:
  - bigger embedding model: +2 points recall@5, 3x slower indexing, still missed codes
  - query rewriting: helped paraphrases, did not fix codes
evidence: recall@5 on 50 labelled questions went 71% -> 89%
cost: ~40 ms extra latency per query; one more index to maintain
failures_seen: RRF with equal weights hurt long natural-language questions slightly
what_i_would_try_next: weight the two lists by query type; add a reranker
not_tested: multilingual documents`,
      notes:
        "Each field answers a likely follow-up before it is asked. Listing what was not tested makes it easy to be honest under pressure, which interviewers respect more than a confident bluff.",
    },
    tradeoffs: [
      { issue: "Defensive answers when challenged.", response: "Treat questions as a chance to show your reasoning and say what you would test." },
      { issue: "Decisions made without numbers cannot be defended.", response: "Save eval results for each change so you can quote them." },
      { issue: "Overclaiming what you built.", response: "Be precise about what you did yourself and what you used from libraries or teammates." },
    ],
    junior: "Describes what the project does but cannot say why any choice was made.",
    senior: "Explains each decision with alternatives and numbers, and is open about failures and what was not tested.",
    reading: [RECHAT, GITHUB_EVALS, PRODUCT_EVALS],
  },
  {
    moduleId: "M15.9",
    howItWorks:
      "Behavioural communication covers how you explain technical work, handle disagreement and work with people who are not engineers. The standard structure is situation, task, action and result: what was happening, what you were responsible for, what you did, and what changed, ideally with a number. For AI work, good stories include explaining uncertainty to a non-technical stakeholder, pushing back on an unrealistic request, handling a failure openly, and working with legal, security or domain experts. Own your part of problems, and credit others.",
    uses: [
      {
        who: "OpenAI (GPT-4o sycophancy write-up)",
        what: "After the sycophantic GPT-4o update, OpenAI said it would treat behaviour issues such as sycophancy and hallucination as launch-blocking even when A/B results look positive, add sycophancy evaluations to deployment review, and give more weight to expert spot checks. It is a public example of owning a mistake and stating what will change.",
        source: SYCOPHANCY,
      },
      {
        who: "Honeycomb",
        what: "Honeycomb's privacy-focused and regulated customers raised concerns when it added an LLM feature. After a security audit only one provider met its requirements, and it updated its terms, added in-product disclosures and an easy off switch, and flagged customers with healthcare agreements.",
        source: HONEYCOMB,
      },
    ],
    scenario: {
      title: "'Tell me about a time a model feature failed'",
      context:
        "The interviewer asks for an example of something you shipped that did not work as expected, and how you handled it with the people affected.",
      architecture:
        "Use situation, task, action, result. Be specific about the failure, what you measured, what you told stakeholders and when, what you changed, and what you learned.",
      tools: ["a story bank with numbers", "a timeline of events", "a note of what you learned and changed afterwards"],
      steps: [
        "Pick a real story where you had a part in the problem, not only in the fix.",
        "Write the situation and your task in two sentences.",
        "Describe your actions in order, including how you communicated with others.",
        "State the result with a number, and what you changed in the process afterwards.",
        "Practise it out loud to fit in two minutes.",
      ],
    },
    example: {
      title: "A short story in situation, task, action, result form",
      lang: "text",
      code: `Situation: Our support bot started giving refund answers that contradicted policy
after a prompt change; two customers got wrong promises before we noticed.
Task: I owned the prompt and release, so I led the response.
Action: I rolled back within the hour, told support leads which conversations
were affected so they could contact customers, and wrote down the timeline.
Then I added 25 policy questions to our test set, made the release blocked on them,
and agreed a rule that policy-related changes need a second reviewer.
Result: No similar incident in the next six months, and the test caught two
regressions before release. I learned to test the prompt change, not just the model.`,
      notes:
        "The story owns the mistake, shows communication with the people affected, and ends with a measurable change in process. Keeping it to a few sentences leaves room for follow-up questions.",
    },
    tradeoffs: [
      { issue: "Rambling stories with no clear result.", response: "Practise with a timer and end every story with an outcome." },
      { issue: "Blaming others reads badly even when it is partly true.", response: "Describe your part and what you changed." },
      { issue: "Technical detail can lose non-technical listeners.", response: "Explain in plain words first, then add detail if asked." },
    ],
    junior: "Tells long stories with many details and no outcome, or says nothing has ever gone wrong.",
    senior: "Uses a clear structure, owns their part, communicates with stakeholders, and ends with a measurable change.",
    reading: [SYCOPHANCY, HONEYCOMB],
  },
];

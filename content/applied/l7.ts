import type { AppliedModule } from "./types";

const RECHAT = { label: "Hamel Husain: Your AI product needs evals", url: "https://hamel.dev/blog/posts/evals/", kind: "case-study" } as const;
const EVALS_FAQ = { label: "Hamel Husain and Shreya Shankar: AI evals FAQ", url: "https://hamel.dev/blog/posts/evals-faq/", kind: "blog" } as const;
const EVAL_PROCESS = { label: "Eugene Yan: An LLM-as-judge won't save the product", url: "https://eugeneyan.com/writing/eval-process/", kind: "blog" } as const;
const PITFALLS = { label: "Chip Huyen: Common pitfalls when building generative AI applications", url: "https://huyenchip.com/2025/01/16/ai-engineering-pitfalls.html", kind: "blog" } as const;
const GITHUB_EVALS = { label: "GitHub Blog: How we evaluate AI models for GitHub Copilot", url: "https://github.blog/ai-and-ml/generative-ai/how-we-evaluate-models-for-github-copilot/", kind: "case-study" } as const;
const SHOPIFY = { label: "Shopify Engineering: Building production-ready agentic systems", url: "https://shopify.engineering/building-production-ready-agentic-systems", kind: "case-study" } as const;
const DOORDASH = { label: "DoorDash: Path to high-quality LLM-based Dasher support automation", url: "https://careersatdoordash.com/blog/large-language-modules-based-dasher-support-automation/", kind: "case-study" } as const;
const RESEARCH = { label: "Anthropic: How we built our multi-agent research system", url: "https://www.anthropic.com/engineering/multi-agent-research-system", kind: "blog" } as const;
const WRITING_TOOLS = { label: "Anthropic: Writing effective tools for AI agents", url: "https://www.anthropic.com/engineering/writing-tools-for-agents", kind: "blog" } as const;
const ILLUSION = { label: "Singh et al.: The Leaderboard Illusion", url: "https://arxiv.org/abs/2504.20879", kind: "paper" } as const;
const AA = { label: "Artificial Analysis: LLM leaderboard", url: "https://artificialanalysis.ai/leaderboards/models", kind: "docs" } as const;
const MTEB = { label: "Hugging Face: MTEB, the Massive Text Embedding Benchmark", url: "https://huggingface.co/blog/mteb", kind: "blog" } as const;
const GPQA = { label: "Rein et al.: GPQA, a graduate-level Google-proof Q&A benchmark", url: "https://arxiv.org/abs/2311.12022", kind: "paper" } as const;
const HLE = { label: "Phan et al.: Humanity's Last Exam", url: "https://arxiv.org/abs/2501.14249", kind: "paper" } as const;
const TAU = { label: "Yao et al.: tau-bench, tool-agent-user interaction in real-world domains", url: "https://arxiv.org/abs/2406.12045", kind: "paper" } as const;
const DEEPEVAL_METRICS = { label: "DeepEval docs: Introduction to LLM evaluation metrics", url: "https://deepeval.com/docs/metrics-introduction", kind: "docs" } as const;
const DEEPEVAL_INTRO = { label: "DeepEval docs: Introduction", url: "https://deepeval.com/docs/introduction", kind: "docs" } as const;
const RAGAS = { label: "Ragas docs: Available metrics", url: "https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/", kind: "docs" } as const;
const RAG_TRIAD = { label: "DeepEval guide: Using the RAG triad", url: "https://deepeval.com/guides/guides-rag-triad", kind: "docs" } as const;
const LANGFUSE = { label: "Langfuse docs: Observability and tracing", url: "https://langfuse.com/docs/observability/overview", kind: "docs" } as const;
const GHA = { label: "GitHub docs: Quickstart for GitHub Actions", url: "https://docs.github.com/en/actions/get-started/quickstart", kind: "docs" } as const;

export const APPLIED_L7: AppliedModule[] = [
  {
    moduleId: "M7.1",
    howItWorks:
      "An eval is a repeatable way to check whether an AI feature does what it should. Because model outputs vary and there is no single right answer for most tasks, teams cannot rely on a few manual tries. In practice evaluation starts with reading real outputs and writing down what goes wrong (error analysis), turning the common failures into checks, and running those checks on every change. Mature teams spend a large share of their development time here, because without evals every prompt change is a guess and every fix can silently break something else.",
    uses: [
      {
        who: "Rechat",
        what: "Rechat's real-estate assistant stalled in a cycle of fixing one failure and causing another. Progress came back once the team built evals in layers: fast assertion tests on every change, regular review of logged traces, and A/B tests once the product was mature.",
        source: RECHAT,
      },
      {
        who: "LinkedIn (via Chip Huyen)",
        what: "Chip Huyen relays that LinkedIn reached about 80 percent of the experience it wanted within a month, then needed four more months to pass 95 percent. The last stretch is where careful evaluation does most of its work.",
        source: PITFALLS,
      },
    ],
    scenario: {
      title: "First evals for a meeting-notes summariser",
      context:
        "A startup ships an assistant that summarises sales calls into notes and next steps. Customers complain about missed action items and wrong names, but the team has no way to tell whether a prompt change helps.",
      architecture:
        "Production transcripts and summaries are logged. A domain expert reviews 50 of them and writes free-form notes on every problem, then groups the notes into failure types. Each common failure gets a check: code checks where possible (every attendee name appears in the transcript) and a calibrated judge for the rest (all action items captured).",
      tools: ["trace logging", "a spreadsheet or annotation tool", "a small eval runner in Python", "an LLM judge for subjective checks"],
      steps: [
        "Log inputs and outputs for real calls, with permission and with personal data handled.",
        "Have one expert read 50 outputs and write a short note on every problem they see.",
        "Group the notes into failure types and count how often each occurs.",
        "Write a check for each of the top failure types and run them on a fixed set of 100 calls.",
        "Run the checks before every prompt or model change and keep a history of the scores.",
      ],
    },
    example: {
      title: "From error notes to counted failure types",
      lang: "python",
      code: `from collections import Counter

# notes written by the reviewer while reading traces (open coding)
notes = [
    {"trace": "t01", "note": "missed the follow-up demo on Friday"},
    {"trace": "t02", "note": "spelled the customer's name wrong"},
    {"trace": "t03", "note": "action item assigned to the wrong person"},
    {"trace": "t04", "note": "missed the pricing question as a next step"},
]
# categories decided after reading the notes (axial coding)
category = {"t01": "missed_action_item", "t02": "wrong_name",
            "t03": "wrong_owner", "t04": "missed_action_item"}

counts = Counter(category[n["trace"]] for n in notes)
for failure, n in counts.most_common():
    print(f"{failure:20} {n}")   # the top rows become the first evals`,
      notes:
        "The categories come from reading real outputs, not from a checklist written in advance. Counting them tells you which eval to build first.",
    },
    tradeoffs: [
      { issue: "Reading traces by hand feels slow compared with building tooling.", response: "Start with 30 to 50 traces; the patterns usually appear quickly and save far more time than they cost." },
      { issue: "Generic metrics such as helpfulness scores look rigorous but miss product-specific failures.", response: "Build checks from your own observed failure types, and use generic metrics only to find traces to read." },
      { issue: "Evals go stale as users and the product change.", response: "Repeat error analysis on fresh traces every few weeks and after big changes." },
    ],
    junior: "Tries a prompt on five examples, likes the output, and ships it.",
    senior: "Starts with error analysis on real traces, builds checks for the failures that actually occur, and runs them on every change.",
    reading: [EVALS_FAQ, RECHAT, PITFALLS],
  },
  {
    moduleId: "M7.2",
    howItWorks:
      "There are three main ways to grade outputs. Code checks test things a rule can decide: valid JSON, a required field, a correct number, a tool called with the right arguments. Human review gives the most trustworthy judgement but is slow. LLM judges sit in between: a model grades outputs against a written rule. Judges are only trustworthy after you compare them with human labels and fix where they disagree. Teams prefer pass or fail labels for one specific failure over vague 1 to 5 scores, because binary labels are more consistent and easier to act on.",
    uses: [
      {
        who: "Shopify Sidekick",
        what: "Shopify built ground-truth sets from sampled merchant conversations labelled by several experts, then tuned its LLM judges until their agreement with humans came close to the agreement between human experts.",
        source: SHOPIFY,
      },
      {
        who: "GitHub Copilot",
        what: "GitHub grades simple Copilot Chat questions automatically and uses a separate, proven model as a judge for complex answers, auditing the judge against human reviewers to keep it consistent.",
        source: GITHUB_EVALS,
      },
    ],
    scenario: {
      title: "A calibrated judge for a recipe assistant",
      context:
        "A recipe app's assistant sometimes suggests dishes that break the user's stated diet. The team wants an automatic check they can trust instead of reading every conversation.",
      architecture:
        "A domain expert labels 200 conversations pass or fail for one rule: the recipe respects every stated dietary restriction. The set is split into examples for the judge prompt, a development set for tuning, and a held-out test set. The judge outputs a short critique then pass or fail.",
      tools: ["an annotation sheet", "an LLM judge prompt", "a script that computes agreement", "the eval runner"],
      steps: [
        "Collect 200 real conversations with a mix of passes and failures, labelled by one expert.",
        "Split into a few examples for the prompt, a development set and an untouched test set.",
        "Write the judge prompt for this one rule, with the examples and a critique-then-verdict format.",
        "Measure how often the judge catches real failures and how often it raises false alarms on the development set, and fix the prompt where it disagrees.",
        "Report the final agreement on the test set and only then use the judge in CI.",
      ],
    },
    example: {
      title: "Measure a judge against human labels",
      lang: "python",
      code: `def judge_agreement(examples: list[dict], judge) -> dict:
    # examples: [{"input": ..., "output": ..., "human": "pass" | "fail"}]
    tp = fn = tn = fp = 0
    for ex in examples:
        verdict = judge(ex["input"], ex["output"])   # returns "pass" or "fail"
        if ex["human"] == "fail":
            tp += verdict == "fail"
            fn += verdict == "pass"
        else:
            tn += verdict == "pass"
            fp += verdict == "fail"
    return {
        "catches_failures": tp / max(tp + fn, 1),    # true positive rate on failures
        "trusts_passes": tn / max(tn + fp, 1),       # true negative rate on passes
        "disagreements": fn + fp,
    }`,
      notes:
        "Report both numbers: a judge that calls everything a pass looks accurate when failures are rare. Read every disagreement before changing the prompt; most come from missing context or a vague rule.",
    },
    tradeoffs: [
      { issue: "LLM judges are themselves models that can be wrong, biased or inconsistent.", response: "Calibrate each judge on human labels, keep a held-out test set, and recheck agreement periodically." },
      { issue: "One judge scoring overall quality hides which failure happened.", response: "Build one narrow judge per failure type with a pass or fail verdict." },
      { issue: "Judges cost money and add time to every eval run.", response: "Use code checks wherever a rule can decide, and run judges only for failures that need judgement." },
    ],
    junior: "Asks a model to rate answers from 1 to 10 for quality and treats the average as truth.",
    senior: "Uses code checks first, builds narrow pass or fail judges, and shows how well each judge agrees with human labels before relying on it.",
    reading: [EVALS_FAQ, EVAL_PROCESS, DEEPEVAL_METRICS],
  },
  {
    moduleId: "M7.3",
    howItWorks:
      "Offline evals run before release on a fixed dataset: they are repeatable and catch regressions, but they only cover cases you thought of. Online evals run on live traffic: sampled production traces are scored by judges, guardrails or humans, and user signals (thumbs, edits, retries, escalations) are tracked. Online evaluation finds new failure types that then become offline test cases. Changes usually move through offline tests, then an internal or shadow rollout, then a small share of real users, with monitoring at each step.",
    uses: [
      {
        who: "GitHub Copilot",
        what: "GitHub runs over 4,000 offline tests, mostly in CI, including about 100 deliberately broken repositories a model must fix. Major changes then go to GitHub employees for live internal trials before wider release.",
        source: GITHUB_EVALS,
      },
      {
        who: "DoorDash",
        what: "DoorDash pairs a pre-release guardrail on every generated support reply with ongoing quality monitoring of conversations through an LLM judge and human review, feeding issues back into the system.",
        source: DOORDASH,
      },
    ],
    scenario: {
      title: "Offline and online evals for a support bot",
      context:
        "A support bot passes its offline tests, but after a model upgrade the escalation rate rose and nobody noticed for two weeks.",
      architecture:
        "Offline: a versioned set of 300 cases runs in CI on every prompt or model change. Online: every conversation is traced, 5 percent are sampled daily and scored by calibrated judges, and dashboards track escalation rate, thumbs-down rate and judge pass rate by release. Flagged traces go to a review queue and good ones get added to the offline set.",
      tools: ["an eval runner in CI", "a tracing tool such as Langfuse", "calibrated LLM judges", "a dashboard with alerts", "a human review queue"],
      steps: [
        "Freeze a versioned offline dataset from real, reviewed conversations.",
        "Tag every production trace with the prompt and model version.",
        "Sample traces daily, score them with judges, and chart results by version.",
        "Alert when escalation rate or judge pass rate moves beyond normal variation after a release.",
        "Move every new failure found online into the offline set so it is caught next time.",
      ],
    },
    example: {
      title: "Score a daily sample of production traces",
      lang: "python",
      code: `import random

def daily_online_eval(traces: list[dict], judges: dict, rate: float = 0.05) -> dict:
    sample = random.sample(traces, max(1, int(len(traces) * rate)))
    by_version: dict[str, dict] = {}
    for t in sample:
        v = by_version.setdefault(t["version"], {"n": 0, "fails": {}, "flagged": []})
        v["n"] += 1
        for name, judge in judges.items():
            if judge(t["input"], t["output"]) == "fail":
                v["fails"][name] = v["fails"].get(name, 0) + 1
                v["flagged"].append(t["id"])          # goes to the review queue
    return by_version`,
      notes:
        "Grouping by version is what lets you tie a quality change to a release. Flagged traces are reviewed by people and the real failures become new offline cases.",
    },
    tradeoffs: [
      { issue: "Offline sets miss failures that only appear with real users.", response: "Sample production traces continuously and grow the offline set from what you find." },
      { issue: "Online scoring of every trace is expensive.", response: "Sample a small percentage, plus all traces flagged by users or guardrails." },
      { issue: "User feedback is sparse and biased toward unhappy users.", response: "Combine explicit feedback with implicit signals such as retries, edits and escalations." },
    ],
    junior: "Has a test set and assumes passing it means production is fine.",
    senior: "Runs offline evals as a gate, monitors live quality by version, and feeds online failures back into the offline set.",
    reading: [LANGFUSE, EVALS_FAQ],
  },
  {
    moduleId: "M7.4",
    howItWorks:
      "Public benchmarks and leaderboards help narrow down which models to try, but they do not tell you which model is best for your task. Scores can be inflated by test data leaking into training, by tuning for a popular leaderboard, or by testing tasks unlike yours. In practice teams use leaderboards to shortlist, then run their own eval set on the shortlisted models, comparing quality together with latency and cost per task. Embedding models, rerankers and speech models have their own benchmarks and need the same treatment.",
    uses: [
      {
        who: "Chatbot Arena (research)",
        what: "The Leaderboard Illusion paper found that some providers tested many private variants on the Arena and published only the best, and that large providers received much more Arena data. The authors argue this lets models fit the leaderboard rather than improve generally.",
        source: ILLUSION,
      },
      {
        who: "MTEB",
        what: "The MTEB embedding benchmark covers 56 datasets across 8 task types, and its authors found no single embedding model leads on every task, so they advise checking results for the task you actually have.",
        source: MTEB,
      },
    ],
    scenario: {
      title: "Choosing a model for invoice extraction",
      context:
        "A finance team extracts fields from supplier invoices. A new model tops a general leaderboard and a manager asks whether to switch.",
      architecture:
        "A shortlist of four models comes from a public leaderboard filtered by price and speed. Each runs on 300 labelled invoices with the same prompt and schema. Field-level accuracy, latency and cost per invoice go into one comparison table.",
      tools: ["a public leaderboard for the shortlist", "a labelled invoice set", "an eval runner calling each provider", "a comparison table"],
      steps: [
        "Shortlist three to five models using a leaderboard and the team's price and latency limits.",
        "Run all of them on the same labelled set with the same prompt, several times to see variation.",
        "Compute field-level accuracy and break down errors by field and invoice type.",
        "Add median and tail latency and cost per invoice.",
        "Pick the cheapest model that meets the accuracy bar, and document why.",
      ],
    },
    example: {
      title: "Compare models on your own data",
      lang: "python",
      code: `import statistics, time

def compare(models: dict, dataset: list[dict], extract) -> list[dict]:
    rows = []
    for name, client in models.items():
        correct, latencies, cost = 0, [], 0.0
        for ex in dataset:
            start = time.perf_counter()
            out = extract(client, ex["pdf_text"])
            latencies.append(time.perf_counter() - start)
            cost += out.cost_usd
            correct += sum(out.fields.get(k) == v for k, v in ex["labels"].items())
        total_fields = sum(len(ex["labels"]) for ex in dataset)
        rows.append({"model": name, "field_accuracy": correct / total_fields,
                     "p50_s": statistics.median(latencies),
                     "cost_per_doc": cost / len(dataset)})
    return sorted(rows, key=lambda r: (-r["field_accuracy"], r["cost_per_doc"]))`,
      notes:
        "The leaderboard decides which models enter this table; the table decides which model ships. Accuracy, latency and cost are all in one place, because the best model on quality alone is often not the right choice.",
    },
    tradeoffs: [
      { issue: "Public scores may be contaminated or tuned for the benchmark.", response: "Treat them as a shortlist and confirm on your own private eval set." },
      { issue: "Running your own comparison costs time and money.", response: "Keep a reusable eval set and runner so comparing a new model takes an afternoon." },
      { issue: "Model behaviour changes with prompts, so a fair comparison is hard.", response: "Use the same prompt for a first pass, then give the top two a short prompt-tuning round each." },
    ],
    junior: "Switches to whichever model is top of the leaderboard this week.",
    senior: "Shortlists from leaderboards, decides with a private eval on real data, and weighs quality against latency and cost.",
    reading: [AA, ILLUSION, MTEB],
  },
  {
    moduleId: "M7.5",
    howItWorks:
      "Knowledge benchmarks keep being replaced because models saturate them. Early tests of broad school and university knowledge reached scores where they could no longer separate top models, and some had answer errors or leaked into training data. Newer benchmarks respond by using questions written and checked by experts, making them hard to look up online, adding images, hiding test sets, or moving from multiple-choice knowledge to multi-step tasks with tools. Knowing why each benchmark was created tells you what a score on it actually means.",
    uses: [
      {
        who: "GPQA",
        what: "GPQA has 448 expert-written science questions designed to be hard to search for. Domain experts scored about 65 percent, skilled non-experts with web access about 34 percent, and the strongest model the authors tested about 39 percent at the time.",
        source: GPQA,
      },
      {
        who: "Humanity's Last Exam",
        what: "Humanity's Last Exam was built because top models score above 90 percent on older tests like MMLU. It has 2,500 expert questions across many subjects, some with images, and leading models scored low on it at release.",
        source: HLE,
      },
    ],
    scenario: {
      title: "Reading a model card's benchmark table",
      context:
        "A team lead is given a vendor slide claiming a new model beats competitors on six benchmarks and has to decide whether that is relevant to a legal research product.",
      architecture:
        "A short internal guide lists each benchmark the team sees often: what it tests, when it was released, whether it is saturated, and whether its test set is public. The team maps each to their product's needs and runs their own legal eval for the final call.",
      tools: ["the benchmark papers", "an independent leaderboard", "a shared benchmark guide", "the team's own eval set"],
      steps: [
        "List the benchmarks on the slide and find each one's paper.",
        "Note for each what it measures, its format, and whether top scores are near the ceiling.",
        "Check independent results rather than vendor-reported numbers where possible.",
        "Mark which benchmarks relate to legal research and which do not.",
        "Run the team's own legal eval and decide on that, using benchmarks only as context.",
      ],
    },
    example: {
      title: "A benchmark guide entry",
      lang: "yaml",
      code: `- name: GPQA (Diamond subset is most quoted)
  tests: graduate-level biology, physics, chemistry, multiple choice
  why_created: questions that are hard to answer even with web search
  saturated: check current top scores against the 65% expert baseline
  relevance_to_us: low, we do legal research
- name: Humanity's Last Exam
  tests: expert questions across many subjects, some multimodal
  why_created: older tests like MMLU passed 90% for top models
  saturated: not at release
  relevance_to_us: medium, general reasoning signal only
- name: our_legal_eval_v3
  tests: 250 real research questions with lawyer-checked answers
  relevance_to_us: decides the choice`,
      notes:
        "Writing down why each benchmark exists stops a team from treating every score as equal, and makes clear that the team's own eval is the one that decides.",
    },
    tradeoffs: [
      { issue: "Benchmarks saturate and stop distinguishing models.", response: "Check whether top scores are near the ceiling before reading anything into small differences." },
      { issue: "Vendor-reported scores may use different settings from independent runs.", response: "Prefer independent evaluations and look at the evaluation settings." },
      { issue: "Knowledge tests say little about multi-step work with tools.", response: "Look at agent and task benchmarks, and your own task evals, for those products." },
    ],
    junior: "Reads a higher benchmark number as a better model for everything.",
    senior: "Knows what each benchmark tests and why it was made, discounts saturated ones, and decides with task-specific evals.",
    reading: [GPQA, HLE, AA],
  },
  {
    moduleId: "M7.6",
    howItWorks:
      "A custom eval measures the behaviour your product needs, on your data, with your definition of correct. It has three parts: a dataset of realistic inputs (sampled from production when possible, otherwise generated along chosen dimensions), a grading method per criterion (code checks, judges, or reference answers), and a runner that records results by version. The dataset should include hard and edge cases in proportion to their business risk, not just common ones. A pass rate near 100 percent usually means the eval is too easy.",
    uses: [
      {
        who: "Shopify Sidekick",
        what: "Shopify gates releases on its own evaluation built from sampled real merchant conversations, and added an LLM-based merchant simulator to replay realistic conversations against new versions before they ship.",
        source: SHOPIFY,
      },
      {
        who: "GitHub Copilot",
        what: "GitHub's custom eval includes about 100 containerised repositories that pass their tests, each deliberately broken, and checks whether a model can make the tests pass again. Over 1,000 technical questions cover Copilot Chat.",
        source: GITHUB_EVALS,
      },
    ],
    scenario: {
      title: "A custom eval for a travel-booking assistant",
      context:
        "A travel company's assistant answers questions about bookings, changes and refunds. Real logs are limited because the product is new.",
      architecture:
        "The team defines dimensions (intent, trip type, customer tier, complexity), writes 20 combinations by hand, then has a model generate more combinations and turn each into a natural customer message. Each case has expected facts and a required action. Code checks verify actions; a judge checks the answer contains the expected facts.",
      tools: ["a dimensions sheet", "a model for generating cases", "expert review of generated cases", "an eval runner with per-check results"],
      steps: [
        "Write the dimensions that matter and the risky values for each, with the support lead.",
        "Hand-write 20 cases covering important combinations, including edge cases.",
        "Generate combinations with a model, turn them into realistic messages, and have an expert discard bad ones.",
        "Attach expected facts and actions to each case and write the checks.",
        "Replace synthetic cases with real logged ones as traffic grows, keeping the hardest synthetic ones.",
      ],
    },
    example: {
      title: "Generate cases along dimensions, not at random",
      lang: "python",
      code: `import itertools, random

DIMENSIONS = {
    "intent": ["change_date", "cancel", "refund_status", "add_baggage"],
    "trip": ["domestic", "international", "multi_city"],
    "tier": ["basic", "gold"],
    "complexity": ["simple", "missing_info", "conflicting_info"],
}

def sample_tuples(n: int, seed: int = 7) -> list[dict]:
    combos = list(itertools.product(*DIMENSIONS.values()))
    random.Random(seed).shuffle(combos)
    return [dict(zip(DIMENSIONS, c)) for c in combos[:n]]

def to_message(llm, t: dict) -> str:
    return llm(f"Write one realistic customer message for a travel assistant. "
               f"Intent: {t['intent']}. Trip: {t['trip']}. Tier: {t['tier']}. "
               f"Make it {t['complexity'].replace('_', ' ')}. Message only.")`,
      notes:
        "Choosing dimensions first gives coverage you can explain; generating the combinations and the wording separately keeps the messages varied without losing control of what is tested.",
    },
    tradeoffs: [
      { issue: "Synthetic cases miss the strange things real users say.", response: "Use them to start, review them by hand, and replace them with real logged cases over time." },
      { issue: "A dataset that is too easy shows near-perfect scores and hides problems.", response: "Weight the set toward hard and high-risk cases and add every new failure found in production." },
      { issue: "Reference answers go stale when policies change.", response: "Version the dataset and review expected answers whenever the underlying policy changes." },
    ],
    junior: "Asks a model for 100 test questions and uses whatever comes back.",
    senior: "Defines dimensions with domain experts, controls coverage, reviews generated cases, and grows the set from real traffic.",
    reading: [EVALS_FAQ, SHOPIFY],
  },
  {
    moduleId: "M7.7",
    howItWorks:
      "An eval suite becomes a regression test when it runs automatically on every change to prompts, models, retrieval or code, and blocks the change if important checks get worse. In practice the suite has tiers: fast, cheap code checks on every commit, a larger set with judges on pull requests or nightly, and a full run before releases. Results are compared with the main branch rather than a fixed number, because small score changes are often noise. Every production bug that gets fixed adds a test case, so the same failure cannot quietly return.",
    uses: [
      {
        who: "GitHub Copilot",
        what: "GitHub runs most of its 4,000+ offline Copilot tests in an automated CI pipeline built mainly on GitHub Actions, and reruns the same tests daily against production models, triggering an audit when results degrade.",
        source: GITHUB_EVALS,
      },
      {
        who: "Rechat",
        what: "Rechat's first evaluation layer was a large set of fast assertion tests that ran on every code change, so the team could tell immediately when a fix for one feature broke another.",
        source: RECHAT,
      },
    ],
    scenario: {
      title: "Eval gates in CI for a RAG assistant",
      context:
        "A team of six edits prompts and retrieval settings several times a week. Twice last month a change that looked fine broke citation formatting in production.",
      architecture:
        "A pytest-based suite runs in GitHub Actions. Every pull request runs 50 fast cases with code checks. Pull requests that touch prompts or retrieval also run 300 cases with calibrated judges. The job compares scores with the main branch and fails if any blocking check drops beyond a set margin, posting a summary on the pull request.",
      tools: ["pytest or DeepEval", "GitHub Actions", "a versioned eval dataset", "stored baseline scores", "a pull request comment bot"],
      steps: [
        "Split checks into blocking (format, safety, citations) and informational (tone, length).",
        "Add the fast suite to CI on every pull request.",
        "Add the judge suite for changes under prompts or retrieval, with results cached by input and version.",
        "Store main-branch scores and fail when a blocking check falls more than the agreed margin.",
        "Add a regression case for every production bug before it is fixed.",
      ],
    },
    example: {
      title: "A CI job that runs evals on pull requests",
      lang: "yaml",
      code: `name: evals
on:
  pull_request:
    paths: ["prompts/**", "retrieval/**", "app/**", "evals/**"]
jobs:
  fast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r requirements.txt
      - run: pytest evals/fast -q
  judged:
    needs: fast
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r requirements.txt
      - run: python evals/run.py --suite full --compare-to main --fail-on blocking
        env:
          MODEL_API_KEY: \${{ secrets.MODEL_API_KEY }}`,
      notes:
        "The fast job catches format and logic breaks in seconds; the judged job runs only if the fast one passes and compares against main rather than a fixed threshold. The API key comes from repository secrets, never the code.",
    },
    tradeoffs: [
      { issue: "Model outputs vary, so scores move even when nothing changed.", response: "Measure normal variation by running the suite several times on main, and set margins above it." },
      { issue: "Judge-based suites are slow and cost money on every pull request.", response: "Run them only for changes that can affect quality and cache results by input and version." },
      { issue: "Blocking on too many checks makes the team ignore or bypass the gate.", response: "Block only on critical checks and report the rest as information." },
    ],
    junior: "Runs the eval notebook by hand when they remember, usually after a bug report.",
    senior: "Runs tiered evals in CI on every relevant change, compares with main, blocks on critical checks, and turns every bug into a test.",
    reading: [DEEPEVAL_INTRO, GHA],
  },
  {
    moduleId: "M7.8",
    howItWorks:
      "RAG systems fail in two places: retrieval brings back the wrong or incomplete context, or generation ignores or contradicts the context it got. RAG evals therefore score the parts separately. Retrieval metrics check whether the needed passages were found and ranked high. Generation metrics check whether the answer is supported by the retrieved context (faithfulness) and whether it actually addresses the question (relevance). Separating them tells you where to fix: chunking and search, or the prompt and model.",
    uses: [
      {
        who: "DoorDash",
        what: "DoorDash's RAG support bot runs a guardrail on every generated reply that checks it is grounded in the retrieved knowledge and follows policy, so ungrounded replies are caught before a delivery driver sees them.",
        source: DOORDASH,
      },
      {
        who: "AnkiHub (via Hamel Husain)",
        what: "Hamel Husain and Shreya Shankar describe AnkiHub using fourth-year medical students, rather than generic annotators, to judge its RAG system's medical answers, because only domain experts can tell whether an answer is correct and supported.",
        source: EVALS_FAQ,
      },
    ],
    scenario: {
      title: "Finding where an HR policy bot goes wrong",
      context:
        "An HR policy bot gives wrong answers about leave rules about one time in five. The team keeps changing the prompt without improvement.",
      architecture:
        "An eval set of 150 questions lists the policy passages that answer each one. The pipeline logs retrieved chunks and the answer. Retrieval is scored by whether the expected passages appear in the top five; generation is scored by a faithfulness judge (every claim supported by retrieved text) and an answer relevance judge.",
      tools: ["a labelled question set with source passages", "Ragas or DeepEval metrics", "retrieval and answer logs", "a comparison report"],
      steps: [
        "For each question, record which policy passages contain the answer.",
        "Score retrieval recall at five and rank of the first correct passage.",
        "Score faithfulness and answer relevance only on cases where retrieval succeeded.",
        "Sort failures into retrieval misses and generation errors and count each.",
        "Fix the larger bucket first, for example chunking and query rewriting if retrieval misses dominate.",
      ],
    },
    example: {
      title: "Score retrieval and generation separately",
      lang: "python",
      code: `def rag_eval(cases: list[dict], pipeline, faithful_judge, k: int = 5) -> dict:
    retrieval_miss, unfaithful, ok = 0, 0, 0
    for c in cases:
        chunks, answer = pipeline(c["question"])
        top_ids = {ch["id"] for ch in chunks[:k]}
        if not set(c["expected_ids"]) & top_ids:
            retrieval_miss += 1                     # fix chunking, search, query rewriting
            continue
        if faithful_judge(answer, [ch["text"] for ch in chunks]) == "fail":
            unfaithful += 1                         # fix prompt, model, or context format
            continue
        ok += 1
    n = len(cases)
    return {"retrieval_miss": retrieval_miss / n, "unfaithful": unfaithful / n, "ok": ok / n}`,
      notes:
        "Splitting failures into two buckets tells you which half of the system to work on. Changing the prompt cannot fix a passage that was never retrieved.",
    },
    tradeoffs: [
      { issue: "Labelling which passages answer each question takes expert time.", response: "Label a modest set carefully, and use model-suggested labels that an expert confirms." },
      { issue: "Faithfulness judges can pass answers that are supported but still wrong because the source is outdated.", response: "Also check against expert reference answers and keep source documents current." },
      { issue: "Off-the-shelf RAG metrics may not match what users care about.", response: "Calibrate them against expert labels on your data before trusting them." },
    ],
    junior: "Scores only the final answer and tweaks the prompt when it is wrong.",
    senior: "Measures retrieval and generation separately, sorts failures by cause, and fixes the stage that fails most.",
    reading: [RAGAS, RAG_TRIAD],
  },
  {
    moduleId: "M7.9",
    howItWorks:
      "Agents are harder to evaluate because they take many steps, can reach the right result by different paths, and change things in the world. Teams therefore check the final state where possible (was the booking made correctly, do the tests pass), check the trajectory for safety and efficiency (no forbidden tools, a sensible number of steps), and run each task several times because agents are inconsistent. Simulated users and sandboxed environments make multi-turn tasks repeatable. Cost, steps and time per task are tracked alongside success.",
    uses: [
      {
        who: "tau-bench (research)",
        what: "tau-bench pairs an agent with a model-simulated user, domain tools and a policy, and judges success by the final database state. It also measures whether the agent succeeds on every one of several repeats; a strong model at the time solved under half the tasks, and its consistency over eight repeats was far lower.",
        source: TAU,
      },
      {
        who: "Anthropic research system",
        what: "Anthropic started evaluating its research agent with about 20 queries from real usage, because early changes had large effects, and used an LLM judge with a rubric covering accuracy, citations, completeness, source quality and tool efficiency, plus human testers to catch what the judge missed.",
        source: RESEARCH,
      },
    ],
    scenario: {
      title: "Evaluating an expense-approval agent",
      context:
        "An agent reviews expense claims, looks up policy and receipts, and approves, rejects or asks for more information. Errors either cost money or annoy staff.",
      architecture:
        "Tasks run in a sandbox with a fake expense database, a policy tool and a simulated employee who answers follow-up questions. Each of 80 tasks has an expected final state. Each runs three times; the score records success on all three runs, policy violations in the trajectory, steps and cost.",
      tools: ["a sandboxed copy of the tools", "a simulated user model", "final-state checkers", "trajectory rules", "tracing"],
      steps: [
        "Write 80 tasks from real claims, each with the correct final state agreed by finance.",
        "Build the sandbox and the simulated employee with a script of facts it may reveal.",
        "Write checks for final state and trajectory rules such as never approving above a limit without a manager.",
        "Run each task three times and report the share passing all three, plus steps and cost.",
        "Read failed transcripts from the first wrong step, since later errors usually follow from it.",
      ],
    },
    example: {
      title: "Final-state and consistency scoring for agent tasks",
      lang: "python",
      code: `def eval_agent(tasks: list[dict], run_task, repeats: int = 3) -> dict:
    all_pass, any_pass, violations, steps = 0, 0, 0, []
    for task in tasks:
        results = []
        for _ in range(repeats):
            env = task["make_env"]()                      # fresh sandbox each run
            trace = run_task(task["prompt"], env)
            ok = env.state() == task["expected_state"]
            bad = [s for s in trace.steps if s.tool in task["forbidden_tools"]]
            violations += len(bad)
            steps.append(len(trace.steps))
            results.append(ok and not bad)
        all_pass += all(results)
        any_pass += any(results)
    n = len(tasks)
    return {"pass_all_runs": all_pass / n, "pass_any_run": any_pass / n,
            "violations": violations, "mean_steps": sum(steps) / len(steps)}`,
      notes:
        "The gap between passing any run and passing all runs is a direct measure of how unreliable the agent is. Checking the final state rewards correct outcomes without forcing one exact path.",
    },
    tradeoffs: [
      { issue: "Agent evals are slow and expensive because each task takes many model calls.", response: "Start with a small set of high-value tasks and grow it, and run the full set nightly rather than on every commit." },
      { issue: "Simulated users can be unrealistic or too cooperative.", response: "Script their facts and personalities from real conversations and review a sample of simulated dialogues." },
      { issue: "Strict trajectory checks punish valid alternative paths.", response: "Grade outcomes and hard safety rules, and only flag (not fail) unusual but harmless paths." },
    ],
    junior: "Runs each agent task once and counts it as solved if the final message sounds right.",
    senior: "Checks final state and safety rules in a sandbox, repeats runs to measure consistency, and tracks cost and steps with success.",
    reading: [TAU, RESEARCH, WRITING_TOOLS],
  },
];

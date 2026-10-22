import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M37: ProjectSrc[] = [
  practice("m3-7-versioning-prompts-like-code", "reimplement",
    pj("Mini prompt registry", 50, "Reimplement in miniature a prompt management tool: versions, an active pointer and a diff.",
      [
        ["Store each prompt version as a file with a name, number and note.", "A folder per prompt works."],
        ["Write commands to add a version, show the active one and promote another.", "Keep an index file."],
        ["Add a diff command that shows what changed between two versions.", "A standard diff library is fine."],
        ["Log the version used with every model call.", "A single line in the log is enough."],
        ["Compare your design with a hosted prompt tool and note what it adds.", "Think of access control, history and shared use."],
      ],
      "A tiny registry with add, promote, diff and version logging, and a comparison with a hosted tool.",
      ["Versions stored as files", "Promotion and diff work", "Version logged on each call"],
      "Look at quality, latency and cost next.", [LLM, "Python 3.11 or newer"]),
    {}),
  practice("m3-7-comparing-on-quality-latency-and-cost", "review",
    pj("Review the benchmark", 35, "Review a prompt comparison report and find where its conclusion is not supported.",
      [
        ["Read the report above and list every claim it makes.", "Note which claims have numbers behind them."],
        ["Find at least three weaknesses, such as a tiny sample, no latency spread or missing prices.", "Quote the exact sentences that overreach."],
        ["Write what extra data would settle each weakness.", "Name the exact numbers or cases you would add."],
        ["Rewrite the conclusion so it says only what the data supports.", "Keep it to three sentences."],
      ],
      "A list of unsupported claims, the data needed to settle each and a corrected conclusion.",
      ["Claims listed", "Three weaknesses found", "Conclusion rewritten honestly"],
      "Look at trimming context next.", [LLM]),
    { starter: code(
      "Report: Version B is better. On 5 test cases B scored 4 correct and A scored 3.",
      "B averaged 1.2 s and A averaged 1.5 s. B is also cheaper. We recommend shipping B",
      "to everyone, since it is clearly faster, cheaper and more accurate.") }),
  practice("m3-7-trimming-unnecessary-context", "optimise",
    pj("Halve the prompt", 40, "Cut the token count of a bloated prompt by half without losing accuracy.",
      [
        ["Count tokens in the starter and score it on the test cases above.", "That is your baseline."],
        ["Remove one section at a time and rerun to see which sections matter.", "Record tokens and score for each removal."],
        ["Shorten the sections you keep and remove duplicated instructions.", "Rerun the full set."],
        ["Report tokens, score and cost per thousand requests before and after.", "Take the prices from your provider's page."],
      ],
      "A prompt about half the length with the same score and the savings per thousand requests.",
      ["Baseline counted", "Sections tested one at a time", "Savings reported with prices"],
      "Look at prompt caching next.", [LLM]),
    { starter: code(
      "You are an expert customer support analyst with many years of experience. Please read the",
      "following ticket very carefully. Read it again. Your job is to classify the ticket. The",
      "categories are billing, bug and other. Remember to classify the ticket. Reply with the",
      "category only. Do not add anything else. Again, only the category.") }),
  practice("m3-7-prompt-caching-and-reusable-prefixes", "extend",
    pj("Make it cacheable", 45, "Extend a request builder so that its stable prefix is cached and the saving is reported.",
      [
        ["Send ten requests with the starter and record cached and uncached tokens from the usage data.", "Expect no cache hits yet."],
        ["Move all stable text to the front and remove anything that changes from it.", "Timestamps and ids are common culprits."],
        ["Resend the ten requests and record the cached tokens.", "Check your provider's minimum length for caching."],
        ["Add a line to your log that reports the saving on each request.", "Show the total at the end."],
      ],
      "A request builder with cached tokens reported and a total saving over ten requests.",
      ["Baseline usage recorded", "Stable text moved first", "Savings logged"],
      "Go on to prompt injection in M3.8.", [LLM]),
    { starter: code(
      "def build(question):",
      "    return f'Today is {now()}. Request id {uuid4()}. Question: {question}. Rules: {RULES}'",
      "# RULES is 3000 tokens of fixed text") }),
];

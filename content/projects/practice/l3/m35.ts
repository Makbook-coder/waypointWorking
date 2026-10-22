import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M35: ProjectSrc[] = [
  practice("m3-5-controlling-style-length-and-format", "extend",
    pj("Add a style guide", 40, "Extend a plain prompt with tone, length and format rules and check that each one holds.",
      [
        ["Run the starter on ten inputs and measure word count and tone.", "Write a simple tone check."],
        ["Add a length rule, a tone rule and a format rule, one at a time.", "Rerun after each addition."],
        ["Write an automatic check for each rule and print the pass rate for each.", "Plain Python is enough."],
        ["Reword the weakest rule and measure again.", "Say which rule improved and by how much."],
      ],
      "Pass rates per rule before and after rewording on ten inputs.",
      ["Each rule added separately", "Automatic checks for each rule", "Weakest rule reworded and remeasured"],
      "Look at when prompting is not enough next.", [LLM]),
    { starter: code(
      "prompt = 'Describe the product in a sentence or two.'",
      "products = ['steel water bottle', 'standing desk', 'wireless earbuds', 'yoga mat', 'desk lamp']") }),
  practice("m3-5-when-prompting-is-not-enough", "debug",
    pj("The 50-word limit", 35, "Find why a length rule keeps failing and fix it in code rather than wording.",
      [
        ["Run the prompt on the ten inputs and count words in each reply.", "Count with a function, not by eye."],
        ["List the replies that break the limit and by how much.", "Look at the pattern."],
        ["Strengthen the wording and measure again.", "Compare the pass rate with the earlier run."],
        ["Add a code-side check with one retry and a correction message.", "Cap the retries so a bad case cannot loop forever."],
        ["Compare the pass rate and cost of the wording fix and the code fix.", "Choose one and explain."],
      ],
      "A comparison of wording-only and code-side fixes for a length limit with pass rate and cost.",
      ["Word counts measured", "Wording fix tested", "Code fix compared on cost and pass rate"],
      "Look at semantic instruction versus format enforcement next.", [LLM]),
    { starter: code(
      "prompt = 'Summarise the text. Please try to keep it to about 50 words.'",
      "def words(s): return len(s.split())",
      "# some replies are 90 words, and the check is never run") }),
  practice("m3-5-semantic-instruction-vs-format-enforcement", "reimplement",
    pj("Build a tiny enforcer", 50, "Reimplement in miniature what structured output features do: force a reply to match a schema.",
      [
        ["Write a schema for a reply with three fields, such as title, summary and tags.", "Use a model validation library."],
        ["Write a function that asks the model for JSON, parses the reply and validates it.", "Return a clear error when it fails."],
        ["Add one retry that sends the validation error back to the model.", "Cap it at one retry."],
        ["Run 20 inputs and count first-try valid, valid after retry and failed.", "Report first-try valid, valid after retry and failed."],
        ["Compare with your provider's built-in structured output feature on the same inputs.", "Look at validity, retries and cost per call."],
      ],
      "A small enforcer with counts of first-try, retried and failed replies, compared with a built-in feature.",
      ["Schema validates a reply", "Retry sends the error back", "Three counts reported", "Compared with a built-in feature"],
      "Go on to prompt reliability in M3.6.", [LLM, "pydantic"]),
    {}),
];

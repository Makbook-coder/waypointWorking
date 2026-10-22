import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M32: ProjectSrc[] = [
  practice("m3-2-when-examples-are-needed", "extend",
    pj("Add examples only where needed", 40, "Extend a zero-shot classifier so it gains examples only for the labels it gets wrong.",
      [
        ["Run the starter classifier on the ten inputs and list the wrong labels.", "Compare with the expected labels."],
        ["Add one example for the most confused label and rerun.", "Keep the examples short."],
        ["Add examples for the next confused label and rerun, until no label improves.", "Stop when gains stop."],
        ["Count tokens per call before and after and weigh the gain against the cost.", "Read the token counts from the usage data in each response."],
      ],
      "A classifier with examples only where needed, with accuracy and token cost before and after.",
      ["Wrong labels listed", "Examples added one label at a time", "Cost compared with gain"],
      "Learn to design few-shot examples next.", [LLM]),
    { starter: code(
      "prompt = 'Label the message as billing, bug or other. Reply with the label only.'",
      "inputs = ['I was charged twice', 'App crashes on login', 'Do you have a student plan?', 'Refund please']",
      "expected = ['billing', 'bug', 'other', 'billing']") }),
  practice("m3-2-designing-few-shot-examples", "review",
    pj("Review the examples", 35, "Review a set of few-shot examples and find the ones that teach the wrong lesson.",
      [
        ["Read the examples above and write what rule each one teaches.", "Look for lessons you did not intend to teach."],
        ["Find at least two examples that conflict or leak a shortcut, such as every positive example being short.", "Quote the exact examples that cause trouble."],
        ["Rewrite the set so each example teaches one clear idea and the formats match.", "Keep three to five examples."],
        ["Test old and new sets on ten fresh inputs and compare accuracy.", "Include inputs unlike the examples."],
      ],
      "A review naming the lessons taught, a rewritten set and an accuracy comparison on fresh inputs.",
      ["Lesson per example written", "Conflicts or shortcuts quoted", "Rewritten set tested"],
      "Look at example quality and order next.", [LLM]),
    { starter: code(
      "Review: 'Great!' -> positive",
      "Review: 'Loved the fast delivery and the friendly support team' -> positive",
      "Review: 'Bad' -> negative",
      "Review: 'The product broke after two days, very disappointed' -> Negative") }),
  practice("m3-2-example-quality-diversity-and-order", "debug",
    pj("The order bias", 35, "Find why a prompt always returns the label of the last example and repair it.",
      [
        ["Run the prompt on the ten inputs and count how often each label is returned.", "A heavy skew is a sign of bias."],
        ["Reorder the examples and rerun to see whether the skew follows the order.", "Try three different orders."],
        ["Balance the labels and vary the example styles, then rerun.", "Keep the count the same."],
        ["Write what you learned about order and balance in few-shot examples.", "Use your counts as evidence."],
      ],
      "Label counts for several orders showing the bias and its reduction after balancing.",
      ["Label counts recorded", "Three orders compared", "Balanced set tested"],
      "Compare few-shot with fine-tuning next.", [LLM]),
    { starter: code(
      "examples = [('great', 'positive'), ('love it', 'positive'), ('works well', 'positive'),",
      "            ('awful', 'negative')]",
      "# the last example is the only negative one, and the test set is half negative") }),
  practice("m3-2-few-shot-vs-fine-tuning", "challenge",
    pj("Few-shot or fine-tune", 45, "Produce a decision and evidence for whether a task needs fine-tuning or whether examples are enough, with no steps given.",
      [],
      "A short report with measured few-shot accuracy at several example counts and a reasoned decision about fine-tuning.",
      ["Accuracy measured at 0, 3 and 10 or more examples", "Token cost per call measured for each", "A fine-tuning cost estimate with a source", "A decision with the number that would change it"],
      "Go on to reasoning prompts in M3.3.", [LLM]),
    { hints: ["Use one task with a clear right answer and at least 30 test cases.", "Plot accuracy against the number of examples and look for a plateau.", "Fine-tuning is worth considering when the examples are costly or accuracy still falls short."] }),
];

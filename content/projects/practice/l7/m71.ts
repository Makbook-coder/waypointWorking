import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M71: ProjectSrc[] = [
  practice("m7-1-pitfalls-of-vibe-testing", "review",
    pj("Review a launch decision", 30, "Review a team's reasons for shipping a prompt change and find where vibe testing misled them.",
      [
        ["Read the team's notes below and list every piece of evidence they used.", "Mark each as a look at outputs or a measured result."],
        ["Find at least three weaknesses, such as a tiny sample or only easy inputs.", "Quote the words that show each one."],
        ["Say what could be true in production that the evidence would not show.", "Give two concrete examples."],
        ["Write the smallest test plan that would give real evidence.", "Include the number of cases and how they are chosen."],
      ],
      "A review of a launch decision naming three weaknesses in the evidence and a small test plan.",
      ["Evidence listed and labelled", "Three weaknesses found", "Test plan written"],
      "Look at deterministic and probabilistic testing next.", ["Python 3.11 or newer"]),
    { starter: code(
      "Team notes: 'We tried the new prompt on 6 examples and they all looked great.",
      "The answers feel friendlier. Two of us read them and agreed. The old prompt gave a bad answer",
      "last week, so the new one is clearly better. Shipping tomorrow.'") }),
  practice("m7-1-deterministic-vs-probabilistic-testing", "extend",
    pj("Make a flaky test honest", 40, "Extend a brittle exact-match test into a repeated test with a pass rate.",
      [
        ["Run the starter test five times and note how often it fails.", "Write down the failure rate."],
        ["Add a loop that runs each case several times and counts passes.", "Make the number of runs a setting."],
        ["Fail the case only if the pass rate is below a threshold you choose.", "Print the rate in the message."],
        ["Write a test that uses a fake model with a known failure rate to check your logic.", "Run it with rates of 0, 50 and 100 percent."],
      ],
      "A repeated test that reports a pass rate, with the logic checked using a fake model.",
      ["Flakiness measured", "Pass-rate threshold added", "Fake model check passes"],
      "Look at model evals versus application evals next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def test_label():",
      "    out = classify('My parcel never arrived')",
      "    assert out == 'delivery_problem'     # fails now and then at temperature 0.7") }),
  practice("m7-1-model-evals-vs-application-evals", "debug",
    pj("The wrong kind of eval", 40, "Find why a team's evaluation says a model is great while their product keeps failing.",
      [
        ["Run the starter eval and the starter product cases and write down both scores.", "Note the gap between the two scores and write one sentence on what it suggests."],
        ["Compare what each set tests and which skills the product really needs.", "Make a two-column list."],
        ["Replace the model-level questions with application cases from the product's real inputs.", "Write at least ten."],
        ["Rerun and show that the new score reflects the product's failures.", "Report the old and new numbers."],
      ],
      "An evaluation rebuilt around application cases that reflects the product's real failures.",
      ["Gap between scores noted", "Mismatch explained", "New cases reflect failures"],
      "Look at the end-to-end evaluation workflow next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "EVAL = general knowledge and logic puzzles (model scores 94 percent)",
      "PRODUCT = a refund assistant that must follow a 12-rule policy",
      "complaints: wrong refund amounts, ignores the 30-day rule, rude tone") }),
  practice("m7-1-the-end-to-end-evaluation-workflow", "reimplement",
    pj("Rebuild the eval loop", 45, "Rebuild an eval runner from a description of its inputs, steps and outputs.",
      [
        ["Read the description and write the file formats for cases, outputs and scores.", "Use JSON lines so each case, output and score is one line that is easy to read back."],
        ["Write the runner so it reads cases, calls a function and saves outputs, even when a call fails.", "Record the error in the output file so one failed call does not stop the whole run."],
        ["Write a scorer interface and one example scorer.", "Return a pass flag and a reason."],
        ["Write the report and run it on ten cases with a fake system.", "Check the totals by hand."],
      ],
      "An eval runner built from the description that handles failures and prints a report checked by hand.",
      ["File formats written", "Runner handles failures", "Report checked by hand"],
      "Move on to evaluation methods and paradigms.", ["Python 3.11 or newer"]),
    {}),
];

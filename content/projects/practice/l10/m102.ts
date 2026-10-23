import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M102: ProjectSrc[] = [
  practice("m10-2-reuse-your-level-4-and-5-apps", "debug",
    pj("Works on my machine", 40, "Find why an earlier app fails on a clean machine and fix it.",
      [
        ["Copy the starter app to a clean folder and run the README steps.", "Record the first error."],
        ["Find the cause, such as an absolute path or a global package.", "Quote the line. Compare with a case you know the answer to."],
        ["Fix it and rerun until the app starts.", "Keep a list of fixes."],
        ["Add a start-up check that would have said clearly what was missing.", "Test. Keep a note of each result."],
      ],
      "An app that starts from a clean folder with a clear start-up check for what is missing.",
      ["First error recorded", "Fixes listed", "Start-up check tested"],
      "Look at configuration, not code, next.", ["Python 3.11 or newer"]),
    { starter: code(
      "DATA = 'C:/Users/me/projects/app/data/docs.json'",
      "import openai_helpers            # installed globally on one machine, not in requirements.txt") }),
  practice("m10-2-configuration-not-code", "extend",
    pj("Add environments", 40, "Extend an app that has one settings file with separate dev and prod settings.",
      [
        ["Run the starter and list the values that must differ between dev and prod.", "Include model, timeouts and log level."],
        ["Split the settings into a base file and one per environment.", "Choose by an environment variable."],
        ["Fail at start-up when the environment name is unknown.", "Test. If it feels vague, add a number or an example."],
        ["Print the active settings without secrets.", "Check. Check it with someone else or a model if you can."],
      ],
      "An app with base, dev and prod settings chosen by an environment variable that fails on an unknown name.",
      ["Differing values listed", "Environments split", "Unknown name fails"],
      "Look at pinned versions next.", ["Python 3.11 or newer"]),
    { starter: code(
      "MODEL = 'assistant-large'",
      "TIMEOUT = 60",
      "LOG_LEVEL = 'DEBUG'          # also used in production") }),
  practice("m10-2-pinned-model-and-dependency-versions", "reimplement",
    pj("Rebuild a safe upgrade check", 40, "Rebuild a script that tests a dependency or model upgrade against the eval set before it is accepted.",
      [
        ["Write the script's inputs: the old and new version and the eval set.", "Define the output."],
        ["Run the eval set on each version and save scores.", "Run each twice. Do the easy part first, then return to the hard part."],
        ["Compare with the allowed difference and print accept or reject.", "Explain why. Save your work here so you can compare later."],
        ["Test with a good upgrade and a bad one.", "Show both outputs."],
      ],
      "An upgrade check that runs the eval set on old and new versions and prints accept or reject with a reason.",
      ["Both versions scored", "Decision printed with reason", "Bad upgrade rejected"],
      "Look at being traceable from the first request next.", ["Python 3.11 or newer", LLM])),
  practice("m10-2-traceable-from-the-first-request", "optimise",
    pj("Traces without personal data", 40, "Improve a trace format so it is useful for debugging but does not store personal data.",
      [
        ["Read the starter traces and list the personal data in them.", "Quote examples. Try it on one small example first."],
        ["Replace raw text with hashes, lengths and redacted versions.", "Keep enough to debug."],
        ["Test that you can still find the cause of three failures.", "Write how. Write down what you see before changing anything."],
        ["Add a retention setting that deletes old traces.", "Test with a short setting."],
      ],
      "A trace format without personal data that still explains three failures and has a retention setting.",
      ["Personal data listed", "Redaction applied", "Retention works"],
      "Look at the Level 7 eval set as a yardstick next.", ["Python 3.11 or newer"]),
    { starter: code(
      "{\"user\": \"asha.k@example.com\", \"question\": \"my card 4111 1111 1111 1111 was charged twice\",",
      " \"answer\": \"...\", \"latency_ms\": 2310}") }),
  practice("m10-2-the-level-7-eval-set-as-yardstick", "review",
    pj("Review an eval set as a bar", 30, "Review an evaluation set and decide whether it is fit to block a release.",
      [
        ["Read the summary of the set below and list its weaknesses.", "Include size and coverage."],
        ["Decide which weaknesses would make the gate unfair or blind.", "Explain each. Compare with a case you know the answer to."],
        ["Write five cases you would add first.", "Describe each in a line."],
        ["Write the pass rule you would use for now.", "State its limits. Keep a note of each result."],
      ],
      "A review of an eval set as a release bar with weaknesses explained, five cases to add and a pass rule.",
      ["Weaknesses listed", "Five cases written", "Pass rule has limits"],
      "Look at the module capstone next.", ["A text editor"]),
    { starter: code(
      "Eval set: 12 cases, all written by the developer, all short factual questions, scored by exact match.",
      "No cases for refusals, long inputs or hostile inputs. It passed on every release so far.") }),
];

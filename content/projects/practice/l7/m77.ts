import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M77: ProjectSrc[] = [
  practice("m7-7-component-pipeline-and-application-levels", "review",
    pj("Review a test suite", 30, "Review a test suite and find which levels are tested too much or not at all.",
      [
        ["Read the list of tests below and label each as component, pipeline or application level.", "Count how many tests sit at each level so you can see which level is thin."],
        ["Find at least three problems, such as no test of the whole flow or tests that check wording exactly.", "Quote the tests or notes that show each problem so the review is easy to check."],
        ["Say which failure in the example incident would have been caught by which level.", "Explain which level would have caught the incident first and why."],
        ["Propose the five tests you would add or remove.", "Give a reason for each."],
      ],
      "A review of a test suite by level with three problems and five proposed changes.",
      ["Tests labelled and counted", "Three problems found", "Five changes proposed"],
      "Look at versioning tests, configs and results next.", ["Python 3.11 or newer"]),
    { starter: code(
      "12 tests: classify() exact-label tests; 9 tests: classify() with different casing;",
      "0 tests: classify() -> draft_reply() together; 1 test: full app checks reply == 'Hello! How can I help?'",
      "Incident: a draft reply quoted the wrong order id because classify() passed the wrong field.") }),
  practice("m7-7-versioning-tests-configs-and-results", "debug",
    pj("Results that cannot be compared", 40, "Find why two eval results cannot be compared and fix the saving of runs.",
      [
        ["Open the two starter result files and list what is saved in each.", "Note what is missing."],
        ["Work out what changed between the runs by looking at the outputs.", "Say why you cannot be sure."],
        ["Change the runner to save the dataset hash, prompt, model and settings with every run.", "Add a run id so each saved run can be named and found later."],
        ["Rerun both configurations and show that a compare command can now say what differs.", "Print the differences."],
      ],
      "A runner that saves enough information to explain differences between runs, shown with a compare command.",
      ["Missing information listed", "Runner saves full config", "Compare lists differences"],
      "Look at experiment tracking and baselines next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "run_0412.json: {'pass_rate': 0.81, 'n': 50}",
      "run_0415.json: {'pass_rate': 0.74, 'n': 50}     # nobody remembers what changed") }),
  practice("m7-7-experiment-tracking-and-baselines", "extend",
    pj("Add noise bands to the tracker", 40, "Extend an experiment table so differences within the noise are not treated as wins.",
      [
        ["Run the starter and read the table of experiments and scores.", "Note which win looks small."],
        ["Rerun the baseline three times and compute the spread.", "Store it as the noise level."],
        ["Add a column that says better, worse or within noise for each experiment.", "Use the noise level."],
        ["Test the column with scores just inside and just outside the noise.", "Check the labels at the boundary with scores just inside and just outside the noise."],
      ],
      "An experiment table that labels results as better, worse or within noise, tested at the boundary.",
      ["Small win noted", "Noise level measured", "Boundary test passes"],
      "Look at CI/CD quality gates next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "baseline 0.80 | variant_a 0.82 | variant_b 0.79 | variant_c 0.83     # 40 cases each, one run each") }),
  practice("m7-7-ci-cd-quality-gates", "optimise",
    pj("A faster gate", 40, "Make a CI quality gate run faster and cheaper without letting regressions through.",
      [
        ["Run the starter gate and record its time and cost on a pull request.", "Note the biggest part."],
        ["Run cases in parallel and cache results for cases whose inputs and prompt did not change.", "Keep the cache key safe."],
        ["Run a small smoke set on every push and the full set before merge.", "Write the rule in a line, for example run the smoke set on push and the full set before merge."],
        ["Show that a deliberate regression is still caught and report the new time and cost.", "Compare with the starter."],
      ],
      "A quality gate that is much faster and cheaper and still catches a deliberate regression.",
      ["Baseline time and cost", "Parallel runs and cache", "Regression still caught"],
      "Look at a self-improving golden dataset next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "for case in cases:            # 400 cases, one at a time, 3 model calls each",
      "    run_and_score(case)       # about 22 minutes and 9 dollars per push") }),
  practice("m7-7-self-improving-golden-dataset", "challenge",
    pj("A dataset that heals itself", 55, "Design a workflow that keeps a golden dataset correct as the product changes, with no steps given.",
      [],
      "A workflow that finds outdated, wrong and missing cases in a golden dataset and fixes them with review.",
      ["A dataset of at least 50 cases with planted problems of three kinds", "Automatic checks that find at least 80 percent of the planted problems", "A review step before any case changes", "A log of what changed and why for each fix"],
      "Look at quality alongside latency and cost next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Plant the problems yourself first so you know what the checks should find.", "Cases that every version passes, cases that every version fails and near-duplicates are all worth flagging.", "Never change a case without a recorded reason and a new dataset version."] }),
  practice("m7-7-quality-alongside-latency-and-cost", "reimplement",
    pj("Rebuild a three-number report", 45, "Rebuild a report that shows quality, latency and cost together from a sample output.",
      [
        ["Read the sample report and write the fields and calculations it needs.", "List the formulas."],
        ["Write functions for median and 95th percentile latency, cost per 100 cases and pass rate.", "Test each on a small list."],
        ["Build the report that prints them in the same layout as the sample.", "Match the rounding."],
        ["Run it on ten fake results and compare line by line with a hand calculation.", "Fix any difference."],
      ],
      "A three-number report rebuilt from a sample and checked line by line against hand calculations.",
      ["Formulas listed", "Functions tested", "Report matches hand calculation"],
      "Move on to RAG evals.", ["Python 3.11 or newer"]),
    {}),
];

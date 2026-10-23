import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M73: ProjectSrc[] = [
  practice("m7-3-offline-suites-for-pre-release-testing", "extend",
    pj("Add tag gates", 40, "Extend an offline suite so a drop in any important tag blocks a release even if the overall rate is fine.",
      [
        ["Run the starter and note the overall pass rate and the rate for each tag.", "Find the weakest tag and write its rate so you know what the gate must protect."],
        ["Add a per-tag threshold in a config file.", "Mark safety as stricter than the rest."],
        ["Make the script exit with an error and name the tag when one is below its threshold.", "Test the exit with a case that fails one tag and make sure the message names that tag."],
        ["Break one tag on purpose and check the gate fails while the overall rate stays high.", "Show both numbers."],
      ],
      "An offline suite with per-tag thresholds that fails when one tag drops even if the overall rate is fine.",
      ["Per-tag rates printed", "Thresholds in config", "Deliberate break caught"],
      "Look at post-deployment production risks next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "rate = passed / total",
      "print(f'pass rate {rate:.0%}')",
      "sys.exit(0 if rate >= 0.9 else 1)     # one tag could be at 20 percent") }),
  practice("m7-3-post-deployment-production-risks", "review",
    pj("Review a launch plan", 30, "Review a launch plan and find the production risks it does not cover.",
      [
        ["Read the plan below and list what it measures and what it ignores.", "Use two columns, one for what the plan measures and one for what it leaves out."],
        ["Find at least four production risks that are missing, such as new user groups or provider outages.", "Quote the gap in the plan and say what kind of user or event it leaves out."],
        ["For each risk say how you would notice it and how fast.", "Name the metric or the signal."],
        ["Write the three additions you would make before launch.", "Order them by importance."],
      ],
      "A review of a launch plan with four missing production risks and three ordered additions.",
      ["Covered and ignored listed", "Four risks found with signals", "Additions ordered"],
      "Look at system metrics versus quality metrics next.", ["Python 3.11 or newer"]),
    { starter: code(
      "Launch plan: tested on 25 English prompts from the team. Monitoring: uptime and average latency.",
      "Rollback: manual. Feedback: users can email support. Provider model updates: not discussed.") }),
  practice("m7-3-system-metrics-vs-quality-metrics", "debug",
    pj("Green dashboard, unhappy users", 40, "Find why a dashboard looks healthy while quality has dropped and add the missing signal.",
      [
        ["Read the starter metrics for two weeks and the list of complaints.", "Mark the day complaints began."],
        ["Check which metrics changed on that day and which did not.", "Write what you notice."],
        ["Add a quality score from sampled outputs and compute it for the same two weeks.", "Use the starter outputs."],
        ["Show that the new metric moves on the right day.", "Draw or print it next to the system metrics."],
      ],
      "A quality metric that shows the drop the system metrics missed, plotted alongside them.",
      ["Complaint day marked", "System metrics checked", "Quality metric shows the drop"],
      "Look at the continuous online evaluation pipeline next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "latency p95: flat   error rate: 0.2%   cost/request: flat   thumbs-down: not collected",
      "day 8: provider silently changed the model; replies became shorter and skipped citations") }),
  practice("m7-3-continuous-online-evaluation-pipeline", "reimplement",
    pj("Rebuild a sampler and scorer", 45, "Rebuild an online sampling and scoring job from its specification.",
      [
        ["Read the specification and write a test for each requirement.", "Use a small fake log."],
        ["Write the sampler so it picks a stable share of calls and never samples the same call twice.", "Seed the random choice."],
        ["Write the scorer job that scores sampled calls and stores results with the call id.", "Skip calls it already scored."],
        ["Run it on a day of fake traffic and print the summary.", "Check the numbers by hand."],
      ],
      "A sampling and scoring job built from a specification, tested on fake traffic.",
      ["Tests from the specification", "Sampler and scorer pass", "Summary checked by hand"],
      "Look at feeding failures back offline next.", ["Python 3.11 or newer"]),
    {}),
  practice("m7-3-feeding-failures-back-offline", "optimise",
    pj("Pick the failures worth keeping", 40, "Reduce a pile of production failures to the ones that make the offline suite better.",
      [
        ["Read the 60 starter failures and group the similar ones.", "Count the cases in each group so you can see which problems are the most common."],
        ["Choose one or two representative cases for each group and drop exact duplicates.", "Keep rare but serious ones."],
        ["Add the chosen cases to the suite and run it on the current system.", "Count how many fail."],
        ["Compare the suite before and after by the share of known failure types it covers.", "Report the numbers."],
      ],
      "A small set of failure cases chosen from 60 that covers every known failure type.",
      ["Failures grouped and counted", "Representatives chosen", "Coverage compared"],
      "Move on to model evaluations and benchmarking.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "failures.jsonl: 60 entries; 24 are 'answer too long', 11 are 'wrong date format',",
      "9 are near copies of each other, 3 are a serious privacy leak, the rest are one-offs") }),
];

import { LLM, levelCapstone, pj } from "../build";
import type { ProjectSrc } from "../types";

export const M1110: ProjectSrc[] = [
  levelCapstone(11,
    pj("Deploy on a Managed Platform", 800, "Move an app you already built onto a managed model platform with cloud identity and no API key, a private path, recorded data handling, one bought and one built component, re-run evaluations, a gateway with a working fallback, capacity sizing with a budget alert and a platform decision record.",
      [
        ["Choose an app you already built and write its requirements, data sensitivity and the rules it must meet.", "Record its baseline scores."],
        ["Pick the platform and model by comparing paths, catalog entries, regions and terms.", "Write the evidence."],
        ["Redeploy the app so it calls the model with a cloud identity and no API key.", "Search for leaked keys."],
        ["Build a narrow policy, an audit trail with queries and a private path with proof of no public egress.", "Save the evidence."],
        ["Record data handling: region, retention, training terms, tenant separation and encryption with a managed key.", "Map each to a governance control."],
        ["Choose one component to buy and one to build, such as managed retrieval and your own guardrails.", "Compare each with the alternative."],
        ["Re-run your evaluation suite after the move and fix differences.", "Compare with the baseline."],
        ["Put a gateway in front with failover to a second provider or model and test by breaking the primary.", "Measure overhead and add a bypass."],
        ["Size capacity: quotas, burst handling, cost per request, spend attribution and a budget alert with a runaway test.", "Compute the pricing break-even."],
        ["Write a portability assessment with an abstraction, deprecation watcher and a measured cost of moving one component.", "Rehearse a switch."],
        ["Write a platform decision record that covers choice, evidence, risks, exit plan and revisit triggers.", "Review it with another person."],
      ],
      "An app running on a managed platform with keyless identity, a private audited path, recorded data handling, one bought and one built component, re-run evaluations, a tested failover gateway, capacity and budget controls and a platform decision record.",
      ["No key found and no public egress", "Evaluations re-run against baseline", "Failover and budget alert tested", "Decision record with exit plan"],
      "Level 12 builds on this platform decision with the next area of the roadmap.",
      ["Everything from Level 11", "A cloud account", LLM]),
  ),
];

import { LLM, levelCapstone, pj } from "../build";
import type { ProjectSrc } from "../types";

export const M89: ProjectSrc[] = [
  levelCapstone(8,
    pj("Red-Team & Secure an Agentic RAG App", 700, "Take an agentic RAG app you built, attack it systematically, add layered controls and prove with measured results that it is safer, with governance documents to match.",
      [
        ["Choose or build an agentic RAG app with a corpus, tools and users in teams, using fake data and fake secrets only.", "Write its rules and the harms to prevent."],
        ["Write a threat model: attack surface, trust boundaries, untrusted model output and a ranked list of at least ten threats.", "Draw the diagram with arrows from untrusted inputs to powerful tools so the risks stand out."],
        ["Build a red-team suite of at least 100 harmless tests across injection, jailbreaks, corpus poisoning, tool misuse, permission and tenant crossing, PII and secret leaks.", "Add success markers and metadata."],
        ["Run the suite and record the baseline attack-success and leakage rates with confidence ranges.", "Save the traces of the baseline runs so you can compare behaviour after the controls."],
        ["Add controls in layers: data markers and scanning, guardrails with normalisation, least-privilege tools, a policy engine, approvals and limits.", "Measure after each layer."],
        ["Add knowledge protections: trust levels, ingestion review, per-document permissions, tenant isolation and provenance.", "Test each with leak tests."],
        ["Add privacy controls: detection, redaction, minimization, clean logs and traces, retention and deletion, and keys kept from the model.", "Search stored data for leaks."],
        ["Run generated code only in a locked container and test it with probes.", "Add them to the suite."],
        ["Turn every finding into a regression test and run the suite in CI with thresholds on attack success and leakage.", "Show a failing and a passing change."],
        ["Add an audit log, a bias check where it applies, human oversight for risky decisions and a model card generated from your results.", "Write a compliance checklist for the EU AI Act and DPDP."],
        ["Attack your own defences with new tests, record what still works and fix the top issue.", "Rerun and update the scorecard."],
        ["Write a security report with the threat model, the before and after table, residual risks and a runbook for an incident.", "Include a demo of one attack blocked."],
      ],
      "A red-teamed and hardened agentic RAG app with a 100-test suite, layered controls, CI security gates, governance documents and a before and after results report.",
      ["Threat model and 100-test suite", "Baseline and after rates with ranges", "Layers measured one by one", "CI gate and regression tests", "Report with residual risks and runbook"],
      "Level 9 starts the next area of the roadmap, building on the secure agent you have made here.",
      ["Everything from Level 8", LLM]),
  ),
];

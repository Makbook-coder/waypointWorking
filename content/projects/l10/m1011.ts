import { LLM, levelCapstone, pj } from "../build";
import type { ProjectSrc } from "../types";

export const M1011: ProjectSrc[] = [
  levelCapstone(10,
    pj("LLMOps Project: One App, the Whole Lifecycle", 900, "Take one LLM app from your earlier levels through versioned prompts, a CI evaluation gate, runtime guardrails, a streaming Compose stack, CI/CD to EC2 through CodeDeploy, monitoring and an incident rollback with a runbook.",
      [
        ["Choose one app you built earlier, make it start with one command and move all settings into validated configuration.", "Pin dependencies and the model snapshot."],
        ["Add structured traces with a release id and a release manifest.", "Record a baseline score from your eval set."],
        ["Track experiments in MLflow, register prompts and use staging and production labels loaded at runtime with a fallback.", "Practise a rollback by moving a label."],
        ["Turn the eval set into a DeepEval suite with thresholds, stable repeats, a fast tier and a full tier.", "Log gate runs in MLflow."],
        ["Add runtime guardrails: schema validation, topical rails, input and output checks and agent limits.", "Log every block and measure false blocks and latency."],
        ["Serve the app with FastAPI streaming, health and readiness routes, a thin Streamlit page and a Compose stack with runtime secrets.", "Test timeouts and disconnects."],
        ["Build a GitHub Actions pipeline with tests, the eval gate, a commit-tagged image, scoped secrets and manual approval.", "Prove a bad prompt change is blocked."],
        ["Deploy to EC2 with an IAM role, Secrets Manager and CodeDeploy behind a load balancer with streaming timeouts and scaling on concurrency.", "Delete everything when done."],
        ["Add Prometheus metrics, a Grafana dashboard, alerts and Langfuse traces and close the loop from failures to suite cases.", "Link alerts to runbooks."],
        ["Cause an incident, respond with the runbook, roll back to a known tag or label and write a blameless review.", "Verify the actions."],
        ["Write a final lifecycle report with the architecture, the gate evidence, the incident timeline and what you would do next.", "Include costs. Write down what you see before changing anything."],
      ],
      "An LLM app taken through the whole lifecycle with versioned prompts, a CI evaluation gate, guardrails, a streaming stack, automated AWS deployment, monitoring and a rehearsed incident rollback with a runbook and review.",
      ["Gate blocks a bad prompt change in CI", "Streaming stack runs in Compose and on EC2", "Dashboards, alerts and traces work", "Incident handled with runbook and rollback", "Final report with costs and review actions"],
      "Level 11 builds on this operated app with the next area of the roadmap.",
      ["Everything from Level 10", "An AWS account", "Docker", LLM]),
  ),
];

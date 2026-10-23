import { LLM, levelCapstone, pj } from "../build";
import type { ProjectSrc } from "../types";

export const M910: ProjectSrc[] = [
  levelCapstone(9,
    pj("AI System Design Document", 600, "Write and partly prototype a full design document for an AI product, covering requirements, architecture, routing, caching, reliability, security, evaluation and scaling, with numbers behind each choice.",
      [
        ["Choose a product such as an internal knowledge assistant and write requirements and success criteria with numbers.", "Include who uses it and what failure costs."],
        ["Estimate expected traffic and constraints for launch and at ten times the traffic.", "Show the sums for tokens, requests and cost."],
        ["Draw the high-level architecture with the request path, stores and external services.", "Mark trust boundaries and where people decide."],
        ["Choose models and a routing and fallback plan using a quick measurement on 30 test cases.", "Put the numbers in a table."],
        ["Design the context and RAG architecture with chunk metadata, permissions and freshness.", "Prototype retrieval on a small fake corpus."],
        ["Decide where tools and agents are needed and where a fixed workflow is enough.", "Set limits and approvals."],
        ["Design the caching strategy with safe keys and invalidation.", "Test one leak case."],
        ["Write the latency and cost budget and measure the prototype against it.", "Mark the steps that break it."],
        ["Write the reliability plan with failure cases, timeouts, degraded levels and service targets.", "Inject two failures into the prototype."],
        ["Write the security and guardrail plan covering injection, permissions and personal data.", "Test three attacks on the prototype."],
        ["Design the evaluation and monitoring plan, the user feedback loop and the release process.", "Write the first 30 evaluation cases."],
        ["Write the scaling strategy and the alternatives you rejected with reasons.", "Include a diagram of the final design."],
        ["Review the whole document for gaps, ask someone or a model to attack it and revise.", "List what remains uncertain."],
      ],
      "A complete AI system design document with numbered requirements, an architecture diagram, measured prototype results, risk controls, an evaluation plan and rejected alternatives.",
      ["Requirements and traffic estimates with numbers", "Architecture with measured prototype", "Reliability and security tested on the prototype", "Evaluation and release plan", "Rejected alternatives and uncertainties listed"],
      "Level 10 builds on this design thinking with the next area of the roadmap.",
      ["Everything from Level 9", LLM]),
  ),
];

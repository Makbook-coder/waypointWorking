import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M101: ProjectSrc[] = [
  practice("m10-1-llmops-vs-mlops", "review",
    pj("Review an operations plan", 30, "Review an operations plan written for a classic ML model and mark what an LLM app would need differently.",
      [
        ["Read the plan below and list each activity in it.", "Mark the ones that still apply."],
        ["Find what the plan does not cover for an LLM app, such as prompt versions and guardrails.", "List at least four."],
        ["For each gap, write what you would add and who owns it.", "Keep each to a line."],
        ["Rewrite the plan's top five items for an LLM app.", "Order them by risk."],
      ],
      "A reviewed plan with gaps listed, additions with owners and a rewritten top five for an LLM app.",
      ["Activities marked", "Four gaps listed", "Top five rewritten"],
      "Look at application versus model LLMOps next.", ["A text editor"]),
    { starter: code(
      "Plan: retrain monthly on new data, track accuracy on a held-out set, deploy the model file,",
      "monitor input drift and alert when accuracy drops by 2 points. Owner: the data science team.") }),
  practice("m10-1-application-vs-model-llmops", "challenge",
    pj("Operate without training anything", 45, "Set up the minimum operations for an app on a hosted model with no steps given.",
      [],
      "A minimal operations setup for an app on a hosted model with the first three controls chosen and shown working.",
      ["Three controls chosen and justified from the risks", "Each control shown working on a small app", "A note on what you chose not to build yet", "The cost of each control in time or money"],
      "Look at why LLM systems are hard to operate next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Start from the ways the app can break and pick the cheapest control for each.", "Controls like pinned model names, an eval run and a trace are small and strong.", "Write what you deliberately left out so the gap is a choice, not a surprise."] }),
  practice("m10-1-why-llm-systems-are-hard-to-operate", "debug",
    pj("The answers changed overnight", 40, "Find why an app's answers changed without any code change.",
      [
        ["Compare the two sets of outputs below and describe the difference.", "Quote a pair. Write down what you see before changing anything."],
        ["List everything that could have changed without a code change.", "Include provider, index and settings."],
        ["Use the config and logs below to find the most likely cause.", "Explain the evidence."],
        ["Add a detection that would have caught this on the day.", "Describe the check."],
      ],
      "A diagnosis of a silent change from config and logs with a detection added that would have caught it.",
      ["Difference described", "Causes listed", "Detection added"],
      "Look at what a release consists of next.", ["A text editor"]),
    { starter: code(
      "config: model='assistant-latest', temperature=0.7, index='docs' (re-crawled nightly)",
      "Monday: 'Refunds take 5 days.' Tuesday: 'Refunds usually take 7 to 10 days.' Code: unchanged since last week.") }),
  practice("m10-1-what-a-release-consists-of", "optimise",
    pj("A manifest people can use", 40, "Improve a release manifest so two releases can be compared in seconds.",
      [
        ["Read the starter manifest and note what it lacks for finding a regression.", "List three things."],
        ["Add hashes for prompts, the index version and the model snapshot.", "Keep it flat and readable."],
        ["Write a small diff script that prints only what changed.", "Test it on two manifests."],
        ["Use it to find which part changed between a good and a bad release.", "Show the output. Compare with a case you know the answer to."],
      ],
      "A richer release manifest with hashes and a diff script that finds the changed part between two releases.",
      ["Missing items listed", "Hashes added", "Diff finds the change"],
      "Look at operating RAG versus agents next.", ["Python 3.11 or newer"]),
    { starter: code(
      "{\"version\": \"1.4\", \"model\": \"assistant-latest\", \"notes\": \"prompt tweaks\"}") }),
  practice("m10-1-operating-rag-vs-agents", "review",
    pj("Review a monitoring plan", 30, "Review a monitoring plan for an agent that was copied from a RAG app.",
      [
        ["Read the plan and list what it monitors.", "Mark RAG-specific items."],
        ["Find what an agent needs that is missing, such as step counts and tool failures.", "List at least four."],
        ["Write the alert level for each added item.", "Use numbers. Keep a note of each result."],
        ["Write the first control you would add and why.", "Pick one. If it feels vague, add a number or an example."],
      ],
      "A review of a monitoring plan with agent-specific signals added, alert levels set and a first control chosen.",
      ["RAG items marked", "Agent signals added", "First control chosen"],
      "Look at the lifecycle of this level next.", ["A text editor"]),
    { starter: code(
      "Monitoring: retrieval hit rate, answer length, latency, cost per request, thumbs down rate.",
      "The service is now an agent with a web search tool and a send-email tool.") }),
  practice("m10-1-the-lifecycle-of-this-level", "extend",
    pj("Extend the skeleton", 45, "Extend a thin walking skeleton with one real control at a stage that is still empty.",
      [
        ["Run the starter skeleton and list its stages with what each does.", "Mark the stage that is empty."],
        ["Choose the empty stage that carries the most risk.", "Write why. Check it with someone else or a model if you can."],
        ["Add a real control at that stage and test it.", "Keep it small. Do the easy part first, then return to the hard part."],
        ["Update the stage list and the plan for the next stage.", "Note the time spent."],
      ],
      "A skeleton with one more stage made real and an updated plan for the next.",
      ["Empty stage chosen", "Control tested", "Plan updated"],
      "Look at the module capstone next.", ["Python 3.11 or newer"]),
    { starter: code(
      "stages: tests (1 smoke test) -> build (Dockerfile) -> deploy (copy script) -> monitor (none) -> respond (none)") }),
];

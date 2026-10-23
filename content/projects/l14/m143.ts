import { LLM, moduleCapstone, pj, topicProjects } from "../build";
import type { ProjectSrc } from "../types";

const AI = ["Python 3.11 or newer", LLM, "langgraph"];

export const M143: ProjectSrc[] = [
  ...topicProjects("m14-3-langgraph-orchestration", [
    pj("Two nodes in a graph", 45, "Build a small LangGraph with a researcher node and a writer node sharing state.",
      [
        ["Define a state with topic, notes and draft.", "Typed. Save your work so you can compare later."],
        ["Write a researcher node that fills notes.", "Search or stub. Ask what changed since the last run."],
        ["Write a writer node that produces a draft from the notes.", "LLM call. Print the intermediate values to see them."],
        ["Wire them in a graph and run it on one topic.", "Print the state. Start with a single input before using many."],
      ],
      "A two-node LangGraph that turns a topic into notes and a draft with the state printed.",
      ["State defined", "Both nodes run", "Graph returns a draft"],
      "Next, add a critic loop and limits.", AI),
    pj("Add a critic and a stop rule", 90, "Extend the graph with a critic, a revision loop, a step cap and traces.",
      [
        ["Add a critic node that returns issues or approval.", "Structured. Take it one small step at a time."],
        ["Route back to the writer when issues exist.", "Conditional edge. Write down what you see before changing anything."],
        ["Cap the loop at a number of revisions.", "No infinite loops."],
        ["Add citations to the notes and require them in the draft.", "Check. Re-read the step and try the smallest version first."],
        ["Log every node with input, output and tokens.", "Trace file. Check one example by hand to be sure."],
        ["Run on three topics and compare cost and quality.", "Table. Save your work so you can compare later."],
      ],
      "A graph with writer, critic and capped revision loop, citation requirement and traces over three topics.",
      ["Loop is capped", "Citations required", "Traces recorded"],
      "Next, the module capstone ships a report system.", AI),
  ]),
  moduleCapstone("M14.3", ["m14-3-langgraph-orchestration"], pj("Multi-agent research report system", 480,
    "Build a multi-agent system that plans, researches, writes and reviews a cited report, with limits and an evaluation.",
    [
      ["Define the report format, audience and quality rules.", "Rubric. Ask what changed since the last run."],
      ["Build a planner that decomposes the topic.", "JSON. Print the intermediate values to see them."],
      ["Build researcher agents with tools and source recording.", "Sources. Start with a single input before using many."],
      ["Build a writer and a reviewer in a graph with a revision cap.", "Loop. Take it one small step at a time."],
      ["Verify claims against sources and drop unsupported ones.", "Check. Write down what you see before changing anything."],
      ["Add budgets for tokens, time and tool calls with a graceful stop.", "Limits. Re-read the step and try the smallest version first."],
      ["Run on five topics and score reports with the rubric and a human spot check.", "Table. Check one example by hand to be sure."],
      ["Compare against a single-agent baseline on cost and quality.", "Evidence. Save your work so you can compare later."],
      ["Write a README with the graph diagram, results and failure cases.", "Honest. Ask what changed since the last run."],
    ],
    "A multi-agent report system with a graph, claim verification, budgets, rubric scores and a single-agent comparison.",
    ["Claims verified against sources", "Budgets stop runaway runs", "Compared with a single-agent baseline"],
    "Next, an MCP server for a real tool.", AI)),
];

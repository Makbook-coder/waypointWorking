import { LLM, moduleCapstone, pj, topicProjects } from "../build";
import type { ProjectSrc } from "../types";

const AI = ["Python 3.11 or newer", LLM];

export const M142: ProjectSrc[] = [
  ...topicProjects("m14-2-tool-calling-and-structured-output", [
    pj("Extract a resume into a schema", 45, "Extract structured fields from a resume and a job description with validated output.",
      [
        ["Define a schema for resume fields and for job requirements.", "Typed. Start with a single input before using many."],
        ["Ask a model for JSON matching the schema using structured output.", "Validate. Take it one small step at a time."],
        ["Run on five resumes and one job description.", "Save outputs. Write down what you see before changing anything."],
        ["Count schema failures and fix the prompt.", "Retry once. Re-read the step and try the smallest version first."],
      ],
      "Structured extraction for five resumes and one job description with schema failures counted.",
      ["Schemas defined", "Five resumes extracted", "Failures counted"],
      "Next, add tools and scoring.", AI),
    pj("An agent with tools and a score", 90, "Build an agent that calls tools to compare a resume with a job description and returns a justified score.",
      [
        ["Define tools such as a skill matcher, a years-of-experience calculator and a lookup.", "Deterministic code."],
        ["Let the model call the tools through function calling.", "Log every call. Check one example by hand to be sure."],
        ["Produce a structured result with score, reasons and evidence quotes.", "Validate. Save your work so you can compare later."],
        ["Test on 10 pairs with a hand-made ranking.", "Compare. Ask what changed since the last run."],
        ["Add a guard against acting on instructions hidden in a resume.", "Injection test. Print the intermediate values to see them."],
        ["Save results with the tool call trace.", "Auditable. Start with a single input before using many."],
      ],
      "A screening agent with tool calls, structured scores with evidence and a hand-made ranking comparison.",
      ["Tools called and logged", "Ten pairs ranked", "Injection test passes"],
      "Next, the module capstone builds the full screening agent.", AI),
  ]),
  moduleCapstone("M14.2", ["m14-2-tool-calling-and-structured-output"], pj("Resume and job description screening agent", 480,
    "Build a screening agent that ranks resumes against a job with evidence, handles bias and injection risks and is evaluated against human judgement.",
    [
      ["Write the use case, what the agent may and may not decide and where a human stays in the loop.", "Scope. Take it one small step at a time."],
      ["Define schemas and build extraction with validation.", "Tests. Write down what you see before changing anything."],
      ["Build tools for matching and experience calculation.", "Deterministic. Re-read the step and try the smallest version first."],
      ["Build the agent loop with logging of every tool call.", "Trace. Check one example by hand to be sure."],
      ["Create 20 resume and job pairs with human rankings and compare.", "Rank correlation. Save your work so you can compare later."],
      ["Test for bias by swapping names and non-job-related details and compare scores.", "Table. Ask what changed since the last run."],
      ["Test prompt injection hidden in a resume.", "Defence. Print the intermediate values to see them."],
      ["Add a review screen or report that shows evidence for each score.", "Explainable. Start with a single input before using many."],
      ["Write a README and a short risk note covering fairness and privacy.", "Honest. Take it one small step at a time."],
    ],
    "A screening agent with evidence-backed scores, a human-agreement measure, bias and injection tests and a risk note.",
    ["Human ranking compared", "Bias swap test run", "Injection defended"],
    "Next, the multi-agent report system.", AI)),
];

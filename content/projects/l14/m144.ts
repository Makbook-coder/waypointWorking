import { LLM, moduleCapstone, pj, topicProjects } from "../build";
import type { ProjectSrc } from "../types";

const AI = ["Python 3.11 or newer", LLM, "An MCP SDK"];

export const M144: ProjectSrc[] = [
  ...topicProjects("m14-4-connect-a-model-to-a-real-tool", [
    pj("A one-tool MCP server", 45, "Expose one real tool through an MCP server and call it from a client.",
      [
        ["Choose a real tool such as a calendar, a notes folder or a database.", "Read-only first. Print the intermediate values to see them."],
        ["Write an MCP server with one tool and a clear description and input schema.", "SDK. Start with a single input before using many."],
        ["Connect a client and call the tool.", "Test. Take it one small step at a time."],
        ["Show the model choosing the tool from a natural request.", "Transcript. Write down what you see before changing anything."],
      ],
      "A working MCP server with one tool that a model calls from a natural request.",
      ["Server runs and confirmed", "Client calls the tool", "Model chooses the tool"],
      "Next, add safety and more tools.", AI),
    pj("A safer server", 90, "Extend the server with more tools, validation, permissions and tests.",
      [
        ["Add two more tools including one that writes.", "Think about risk. Re-read the step and try the smallest version first."],
        ["Validate all inputs and return clear errors.", "Tests. Check one example by hand to be sure."],
        ["Require confirmation or a permission flag for the write tool.", "Guard. Save your work so you can compare later."],
        ["Log every call with arguments and result.", "Audit. Ask what changed since the last run."],
        ["Test with adversarial requests such as path traversal.", "Defence. Print the intermediate values to see them."],
        ["Write documentation for tool descriptions and limits.", "README. Start with a single input before using many."],
      ],
      "An MCP server with three tools, validation, a guarded write tool, audit logs and adversarial tests.",
      ["Write tool guarded", "Adversarial tests pass", "Calls logged"],
      "Next, the module capstone ships an MCP server for a real tool.", AI),
  ]),
  moduleCapstone("M14.4", ["m14-4-connect-a-model-to-a-real-tool"], pj("MCP server for a real tool", 480,
    "Ship an MCP server for a tool you actually use, with safe permissions, tests and a demo.",
    [
      ["Choose a tool you really use and list the tasks a model could do with it.", "Scope. Take it one small step at a time."],
      ["Design tool names, descriptions and schemas that a model can use reliably.", "Review. Write down what you see before changing anything."],
      ["Implement read tools first and test them.", "pytest. Re-read the step and try the smallest version first."],
      ["Implement write tools with confirmation, dry run and limits.", "Safe. Check one example by hand to be sure."],
      ["Handle authentication and secrets properly.", "No secrets in code."],
      ["Test with two different clients or models and record how tool selection differs.", "Table. Save your work so you can compare later."],
      ["Write adversarial tests for injection through tool results and bad arguments.", "Defence. Ask what changed since the last run."],
      ["Record a demo transcript of a real task end to end.", "Evidence. Print the intermediate values to see them."],
      ["Write install steps, permissions and known limits in a README.", "Honest. Start with a single input before using many."],
    ],
    "An MCP server for a real tool with safe write handling, tests across clients, adversarial tests and a recorded demo.",
    ["Write tools have confirmation and limits", "Two clients tested", "Demo transcript recorded"],
    "Next, a monitored production API.", AI)),
];

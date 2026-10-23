import { LLM, moduleCapstone, pj, topicProjects } from "../build";
import type { ProjectSrc } from "../types";

const AI = ["Python 3.11 or newer", LLM];

export const M141: ProjectSrc[] = [
  ...topicProjects("m14-1-compose-l4-with-fastapi", [
    pj("Wrap retrieval in an endpoint", 45, "Wrap your retrieval and answering code in a FastAPI endpoint.",
      [
        ["Create a FastAPI app with a health route.", "Run it locally. Take it one small step at a time."],
        ["Move your retrieval code into a function the app can call.", "Keep it importable."],
        ["Add a POST route that takes a question and returns an answer with sources.", "Pydantic models. Write down what you see before changing anything."],
        ["Test it with curl and with the built-in docs page.", "Three questions. Re-read the step and try the smallest version first."],
      ],
      "A running FastAPI app with a question endpoint that returns an answer and its sources.",
      ["Health route works", "Question route returns sources", "Three questions tested"],
      "Next, add upload, citations and limits.", AI),
    pj("A service you could hand over", 90, "Turn the endpoint into a small service with upload, errors, config and tests.",
      [
        ["Add a document upload route that chunks and indexes files.", "Limit file size. Check one example by hand to be sure."],
        ["Return citations with page or chunk ids for every answer.", "Check they resolve."],
        ["Handle errors: empty index, model failure and bad input.", "Clear messages. Save your work so you can compare later."],
        ["Move keys and settings into environment variables.", "No secrets in code."],
        ["Write tests for the routes with a stubbed model.", "pytest. Ask what changed since the last run."],
        ["Write a README with run steps and example calls.", "Fresh clone test. Print the intermediate values to see them."],
      ],
      "A document Q&A service with upload, cited answers, error handling, configuration, tests and a README.",
      ["Upload and answer work", "Errors handled", "Tests pass from a fresh clone"],
      "Next, the module capstone ships the full platform.", AI),
  ]),
  moduleCapstone("M14.1", ["m14-1-compose-l4-with-fastapi"], pj("Document Q&A platform", 480,
    "Ship a document Q&A platform with upload, retrieval, cited answers, an evaluation set and a way to run it.",
    [
      ["Write what the platform does, who uses it and the documents it will handle.", "Scope. Start with a single input before using many."],
      ["Build ingestion that parses, chunks and indexes documents with metadata.", "Test on real files."],
      ["Build retrieval with a measured recall on 30 questions you wrote.", "Table. Take it one small step at a time."],
      ["Wrap everything in a FastAPI service with upload, ask and health routes.", "Typed. Write down what you see before changing anything."],
      ["Return cited answers and refuse when the documents do not contain the answer.", "Test refusals. Re-read the step and try the smallest version first."],
      ["Build an evaluation script that scores answers and citations and run it.", "Numbers. Check one example by hand to be sure."],
      ["Add a minimal interface or a clear API guide so a person can try it.", "Demo. Save your work so you can compare later."],
      ["Containerise or script the setup and test from a fresh clone.", "Proof. Ask what changed since the last run."],
      ["Write a README with architecture, results, limits and next steps.", "Honest. Print the intermediate values to see them."],
    ],
    "A running document Q&A platform with cited answers, refusals, an evaluation result and a README that works from a fresh clone.",
    ["Cited answers and refusals work", "Evaluation numbers recorded", "Runs from a fresh clone"],
    "Next, the screening agent.", AI)),
];

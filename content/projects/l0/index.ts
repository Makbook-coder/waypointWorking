import { levelCapstone, pj } from "../build";
import type { ProjectSrc } from "../types";
import { M01 } from "./m01";
import { M02 } from "./m02";
import { M03 } from "./m03";
import { M04 } from "./m04";
import { M05 } from "./m05";
import { M06 } from "./m06";
import { M07 } from "./m07";

export const PROJECTS_L0: ProjectSrc[] = [
  ...M01, ...M02, ...M03, ...M04, ...M05, ...M06, ...M07,
  levelCapstone(0, pj("Ship a no-AI REST service", 600, "Combine everything in Level 0 into one service another person can clone, run, test, call over HTTP and inspect.",
    [
      ["Choose a domain (tasks, bookmarks or expenses) and write a one-page spec with endpoints, errors and non-goals.", "Pick the smallest domain you can explain in two sentences."],
      ["Create the repo with `CLAUDE.md`, `.gitignore`, `.env.example`, CI and a protected main.", "Reuse your hand-off repo setup."],
      ["Design the schema and write migrations with constraints; add indexes for your two main queries.", "Check each with EXPLAIN."],
      ["Build validated CRUD endpoints with typed models, dependency-injected storage and one error shape.", "Return correct codes."],
      ["Add one external API integration called asynchronously with a timeout, with 502 and 504 mapping.", "In tests use `httpx.MockTransport` returning a canned reply, a timeout exception and a 500. That lets you prove 200, 504 and 502 without touching the network."],
      ["Write tests (20+), config from environment, structured logs with request ids.", "Aim for 90% coverage."],
      ["Containerise with Docker and Compose; deploy publicly with a managed database.", "Secrets only in the host dashboard."],
      ["Verify the live service with a script of curl calls and check `/docs` is hidden or protected as designed.", "Keep the script in the repo."],
      ["Use a coding agent for real work, reviewing every diff; write `docs/ai-notes.md` with one failure it caused and how you caught it.", "The product has no AI, the build can."],
      ["Write the README and RUNBOOK, then have someone else clone and run it without help.", "Fix every stumble."],
    ],
    "A public URL and a repository where a newcomer can run the tests, call the API and read how to deploy and debug it.",
    ["Every failure path returns the right status code and error shape", "No secrets in code, image or history", "CI is green and main is protected", "You can explain the architecture without the agent", "One AI mistake is documented"],
    "Move on to Level 1: LLM 101.", ["Everything in Level 0"])),
];

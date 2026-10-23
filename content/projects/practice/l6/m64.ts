import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M64: ProjectSrc[] = [
  practice("m6-4-scratchpads-files-and-external-stores", "reimplement",
    pj("Rebuild a note store", 45, "Rebuild a note store with save, get, search and delete from its test list.",
      [
        ["Read the test list and turn each line into a test before any code.", "Keep each test small."],
        ["Write the store so notes survive a restart.", "A json lines file is enough."],
        ["Make search return the best three notes for a keyword.", "Define best simply."],
        ["Run all tests and then try the store with a small agent.", "Note any missing feature."],
      ],
      "A note store that passes the test list, survives restarts and is used by a small agent.",
      ["Tests written first", "Notes survive a restart", "Used by an agent"],
      "Look at active versus stored context next.", ["Python 3.11 or newer"]),
    {}),
  practice("m6-4-active-context-vs-stored-context", "extend",
    pj("Add on-demand loading", 40, "Extend an agent that keeps every document in the window so it loads them only when needed.",
      [
        ["Run the starter and note the tokens used by the documents each turn.", "Print the tokens used by the documents for each turn so you can see the cost of keeping them."],
        ["Keep only a short title index in the prompt and add a `load(title)` tool.", "Return the text of the document from the tool so the model can read it when asked."],
        ["Add an `unload(title)` tool and unload after use.", "Log each load so you can see which documents are used again and again."],
        ["Compare tokens per turn with the starter on five questions.", "Check the answers match."],
      ],
      "An agent that loads documents on demand instead of keeping them all, with tokens compared on five questions.",
      ["Starter tokens noted", "Load and unload tools work", "Answers match with fewer tokens"],
      "Look at persisting plans and progress next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "DOCS = load_all_docs()                       # 40 documents",
      "SYSTEM = BASE + '\\n\\n' + '\\n\\n'.join(d.text for d in DOCS)   # all of them, every turn") }),
  practice("m6-4-persisting-plans-and-progress", "review",
    pj("Review a plan file", 30, "Review a plan and progress file and decide whether a fresh agent could continue from it.",
      [
        ["Read the plan and log below and write what a fresh agent would believe is done.", "Be literal and read only what the files say, not what you hope they mean."],
        ["Find at least three gaps or contradictions between the plan and the log.", "Quote both sides of each gap so it is clear where the plan and the log disagree."],
        ["List the questions a fresh agent would have to ask.", "Write at least four."],
        ["Rewrite the plan and log format so those questions are answered.", "Show one example entry."],
      ],
      "A review of a plan and progress file with gaps found, the questions a newcomer would ask and a better format.",
      ["Belief about progress written", "Three gaps found", "Format rewritten"],
      "Look at note-taking agents next.", ["Python 3.11 or newer"]),
    { starter: code(
      "PLAN: 1 set up repo [x]  2 write parser [x]  3 add tests [ ]  4 deploy [ ]",
      "LOG: 10:02 parser started   10:40 tests failing, not sure why   11:05 changed parser again",
      "     11:30 moved on to deploy config   (no note says whether the parser works)") }),
  practice("m6-4-note-taking-agents", "debug",
    pj("Notes nobody can use", 40, "Find why the agent's notes do not help later and fix what it writes.",
      [
        ["Read the saved notes and try to answer three questions from them alone.", "Mark which you cannot."],
        ["Find what is missing from the notes, such as sources or full names.", "Quote an example note that is missing a detail so the problem is concrete."],
        ["Change the note instruction so each note is self-contained with a source.", "Rerun the task after the change and read the new notes to see if they are self-contained."],
        ["Answer the same three questions from the new notes.", "Report the change."],
      ],
      "A note instruction that produces self-contained notes, checked by answering three questions from them.",
      ["Unanswerable questions marked", "Missing details found", "Questions answered from new notes"],
      "Look at remembering versus freeing space next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "NOTE_INSTRUCTION = 'Write a short note after each step.'",
      "# notes produced: 'found it', 'same as before', 'see above', 'it was higher'") }),
  practice("m6-4-remembering-vs-freeing-space", "challenge",
    pj("Remember the right things", 50, "Design a memory that keeps the important facts under a tight size limit, with no steps given.",
      [],
      "A size-limited memory that keeps the facts that matter, tested against a script of questions.",
      ["A script of at least 40 facts with some marked important", "A size limit that forces choices", "Questions asked at the end test important and unimportant facts", "A note explains what the memory forgot and why"],
      "Move on to long-context strategies.", ["Python 3.11 or newer", LLM]),
    { hints: ["Decide what important means before you write the policy.", "Give every fact a priority and a time, and keep pinned facts safe.", "Test with a limit small enough that the policy must drop things."] }),
];

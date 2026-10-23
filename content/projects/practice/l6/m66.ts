import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M66: ProjectSrc[] = [
  practice("m6-6-tool-definitions-compete-for-space", "review",
    pj("Review tool definitions", 30, "Review a set of tool definitions and find the ones that waste tokens or cause confusion.",
      [
        ["Read the definitions below and estimate the tokens of each.", "Rank them by size."],
        ["Find at least three problems, such as repeated text, vague descriptions or look-alike names.", "Quote the exact words of each problem so the issue is easy to find again."],
        ["Say which tools could be merged or removed.", "Give the reason for each merge or removal so the choice can be checked."],
        ["Rewrite two of the definitions to be shorter and clearer.", "Show the token saving."],
      ],
      "A review of tool definitions with three problems, a merge suggestion and two shorter rewrites.",
      ["Tokens ranked", "Three problems found", "Two rewrites with savings"],
      "Look at exposing only relevant tools next.", ["Python 3.11 or newer"]),
    { starter: code(
      "get_user(id): 'Gets a user. Use this tool to get a user. Returns the user. id is the id of the user.'",
      "fetch_user(id): 'Fetches a user by id. Returns user data.'",
      "search_stuff(q): 'Searches for things. Pass what to search for in q.'",
      "find_stuff(q): 'Finds things. Pass what to find in q.'") }),
  practice("m6-6-exposing-only-relevant-tools", "challenge",
    pj("Right tools only", 50, "Attach the smallest set of tools that still lets an agent finish every task, with no steps given.",
      [],
      "A tool selection method that attaches a few tools per task and still completes all tasks.",
      ["At least 30 tools and 25 tasks that need different ones", "Tool selection accuracy measured", "Tokens per call compared with attaching all tools", "A fallback handles a missed tool and is tested"],
      "Look at filtering large tool outputs next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Write a one-line summary of each tool and select from those, not from the full definitions.", "Measure whether the right tool was among those selected, not only whether the answer was right.", "Let the agent ask for a tool by name if it is missing and log how often it does."] }),
  practice("m6-6-filtering-large-tool-outputs", "extend",
    pj("Add pagination to a tool", 40, "Extend a tool that returns everything so it returns a page and a way to get more.",
      [
        ["Run the starter tool and count the tokens in its result.", "Print the count so you have a baseline to compare with after your change."],
        ["Add `limit` and `cursor` parameters and return a next cursor.", "Set a default limit."],
        ["Add a short summary line such as how many results exist in total.", "Keep it to one line."],
        ["Test that paging through all results gives the same items as before.", "Check for duplicates."],
      ],
      "A paginated tool that returns a page, a cursor and a total, with a test that paging returns every item once.",
      ["Starter size counted", "Cursor and limit work", "Paging test passes"],
      "Look at keeping full results externally next.", ["Python 3.11 or newer"]),
    { starter: code(
      "def list_orders(customer):",
      "    return db.query('select * from orders where customer = ?', customer)   # thousands of rows") }),
  practice("m6-6-keeping-full-results-externally", "optimise",
    pj("Keep results out of the window", 40, "Cut the context an agent uses by storing results outside it.",
      [
        ["Run the starter on six tasks and record history size at the end of each.", "Save the final history sizes so you can compare them with the later run."],
        ["Store results over 1,000 tokens in files and put an id and a preview in the history.", "Add a read tool that returns a slice of the stored result so the agent can get detail on demand."],
        ["Rerun the six tasks and compare history size and answers.", "Check the reads are small."],
        ["Add an expiry for stored results and report the final numbers.", "Use a table with the history size and answers before and after for the six tasks."],
      ],
      "An agent that stores large results in files, with history size and answers compared on six tasks.",
      ["Baseline recorded", "Large results stored by id", "Sizes and answers compared"],
      "Look at stopping observation build-up next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def after_tool(result):",
      "    history.append({'role': 'tool', 'content': result})    # kept forever, in full") }),
  practice("m6-6-stopping-observation-build-up", "debug",
    pj("The agent forgets mid-task", 40, "Find why an agent loses track late in a run because old observations bury the goal.",
      [
        ["Run the starter task and print the history size at each step.", "Mark the step where it goes wrong."],
        ["Look at what fills the window at that step.", "Quote the largest items."],
        ["Replace old observations with short placeholders and keep the goal near the end.", "Keep recent results."],
        ["Rerun and check the agent finishes the task.", "Record the final size."],
      ],
      "An agent that finishes a long task after old observations are replaced by placeholders.",
      ["Failure step found", "Largest items identified", "Task finishes after the fix"],
      "Move on to context caching and efficiency.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def step():",
      "    reply = model(messages)                       # goal is only in messages[0]",
      "    messages.append(run_tool(reply))               # every old result stays in full") }),
];

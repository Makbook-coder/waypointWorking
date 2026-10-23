import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M58: ProjectSrc[] = [
  practice("m5-8-why-generated-code-must-not-run-in-process", "challenge",
    pj("Break out of exec", 45, "Show how generated code can harm the host process, and block it, with no steps given.",
      [],
      "A set of harmless attack snippets that each damage an unprotected runner, and a protected runner that stops them.",
      ["At least five harmless attack snippets, such as reading a secret or looping forever", "Each snippet is shown to affect the naive runner", "The protected runner blocks or contains every snippet", "A table shows the snippet, the harm and the protection"],
      "Look at sandboxes next.", ["Python 3.11 or newer"]),
    { hints: ["Use fake secrets and a temporary folder so the attacks cannot hurt your real files.", "Run the generated code in a separate process with a timeout as a first step.", "Compare what the child process can see with what the parent can see."] }),
  practice("m5-8-sandboxes-e2b-modal-and-containers", "extend",
    pj("Add limits to a container run", 40, "Extend a container-based code runner with memory, time and network limits.",
      [
        ["Run the starter and execute a snippet that prints hello.", "Check the output says hello before you add any limits so you know the setup works."],
        ["Add a memory limit and a time limit and test a snippet that breaks each.", "Check the exit code."],
        ["Turn the network off and test a snippet that tries to download a page.", "Expect the download to fail and check that the result says why."],
        ["Return a clear result object with output, error and a reason for stopping.", "Test a normal run, a failing run and a timed-out run so all three results are covered."],
      ],
      "A container runner with memory, time and network limits and a clear result object.",
      ["Hello run works", "Limits tested", "Result object clear"],
      "Look at restricting filesystem, network and time next.", ["Python 3.11 or newer", "Docker installed"]),
    { starter: code(
      "import subprocess",
      "def run(snippet: str) -> str:",
      "    p = subprocess.run(['docker', 'run', '--rm', 'python:3.12-slim', 'python', '-c', snippet],",
      "                       capture_output=True, text=True)",
      "    return p.stdout") }),
  practice("m5-8-restricting-filesystem-network-and-time", "debug",
    pj("The sandbox leaks", 40, "Find the holes in a sandbox that was meant to block files, network and long runs.",
      [
        ["Run the five probe snippets against the starter and record which ones succeeded.", "Make a table with the snippet and whether it succeeded or was blocked."],
        ["For each success, find the missing setting that allowed it.", "Quote the config line."],
        ["Close each hole with a setting such as a read-only mount, no network or a timeout.", "Change one setting at a time so you know which one closed which hole."],
        ["Rerun all five probes and confirm each is now blocked.", "Report the table again."],
      ],
      "A sandbox configuration where all five probe snippets are blocked.",
      ["Probe results tabulated", "Each hole matched to a setting", "All probes blocked"],
      "Look at capturing output safely next.", ["Python 3.11 or newer", "Docker installed"]),
    { starter: code(
      "docker run --rm -v $HOME:/data python:3.12-slim python probe.py",
      "# probe.py tries: read /data/.ssh, open a socket to the internet, loop forever,",
      "#                 write a 2 GB file, fork many processes") }),
  practice("m5-8-capturing-output-safely", "review",
    pj("Review output handling", 30, "Review the code that returns a sandbox's output to the model and find unsafe handling.",
      [
        ["Read the code below and list what from the sandbox reaches the model.", "Include the error output in your list because it also reaches the model."],
        ["Find at least three problems, such as no size limit or secret-shaped strings left in.", "Quote each line so it is clear which part of the code has the problem."],
        ["Write a test with a huge output and one with an injected instruction.", "State the expected result."],
        ["Rewrite the function to truncate, mark the output as data and strip control characters.", "Run the tests after each change so a mistake is found straight away."],
      ],
      "A review of output handling with three problems, two tests and a safer function.",
      ["What reaches the model listed", "Three problems found", "Safer function passes tests"],
      "Look at reducing the blast radius next.", ["Python 3.11 or newer"]),
    { starter: code(
      "def result_for_model(proc):",
      "    return proc.stdout + proc.stderr       # unlimited size, raw text, straight into the prompt") }),
  practice("m5-8-reducing-the-blast-radius", "optimise",
    pj("Least privilege for the runner", 40, "Reduce what a code runner is allowed to do to the smallest set that still works.",
      [
        ["List everything the starter runner can do today, such as files, network and packages.", "Be specific, for example list the folders it can read and the hosts it can reach."],
        ["Run the ten real tasks and record which permissions each one used.", "Read the logs of each run to see which files and hosts it actually touched."],
        ["Remove every permission that no task used and rerun the tasks.", "Report any task that now fails so you can decide whether the permission is really needed."],
        ["Add a short written policy that explains what is allowed and why.", "Keep it to ten lines."],
      ],
      "A runner with only the permissions the ten tasks need, plus a short policy.",
      ["Permissions listed", "Usage recorded for ten tasks", "Unused permissions removed"],
      "Move on to making agents reliable.", ["Python 3.11 or newer", "Docker installed"]),
    { starter: code(
      "docker run --rm --network host --privileged -v /:/host python:3.12-slim python task.py") }),
];

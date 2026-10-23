import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M94: ProjectSrc[] = [
  practice("m9-4-breaking-latency-into-components", "review",
    pj("Review a latency report", 30, "Review a latency report and decide where the time really goes.",
      [
        ["Read the report below and compute each step's share of the total.", "Show the percentages."],
        ["Mark any number that hides the problem, such as an average that ignores slow requests.", "Explain why. Keep a note of each result."],
        ["Choose the first change to try and the saving you expect.", "Give the sum. If it feels vague, add a number or an example."],
        ["List the extra measurements you would add before changing anything.", "At least two. Check it with someone else or a model if you can."],
      ],
      "A review of a latency report with shares computed, misleading numbers marked and a first change chosen.",
      ["Shares computed", "Misleading numbers marked", "Extra measurements listed"],
      "Look at streaming for perceived latency next.", ["A text editor"]),
    { starter: code(
      "Average total 3.1s. Retrieval 0.4s, model 2.4s, checks 0.3s. 95th percentile total 11.5s.",
      "Model time varies from 1s to 9s. Retrieval is always under 0.5s.") }),
  practice("m9-4-streaming-for-perceived-latency", "challenge",
    pj("Make it feel instant", 45, "Make an assistant feel fast to the user without changing the model, with no steps given.",
      [],
      "An assistant that shows the first useful output quickly and a measurement of the improvement.",
      ["Time to first visible output measured before and after", "Streaming or early partial output used", "A case where streaming has to be held back for a check", "A note on what the user sees while waiting"],
      "Look at parallelising independent work next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Measure the first visible output separately from the total time.", "Show something useful early, such as the sources found, while the answer is written.", "Think about answers that must be checked before any of it is shown."] }),
  practice("m9-4-parallelising-independent-work", "optimise",
    pj("Speed up a serial pipeline", 40, "Speed up a pipeline by running independent steps at the same time.",
      [
        ["Run the starter pipeline and record the time of each step and the total.", "Run it five times."],
        ["Mark the steps that do not need each other's output.", "Draw the dependencies."],
        ["Run the independent steps together with a timeout on each.", "Handle one failing."],
        ["Rerun five times and compare the total and the 95th percentile.", "Report the saving."],
      ],
      "A pipeline whose independent steps run together with timeouts and a measured saving.",
      ["Dependencies drawn", "Steps run together", "Saving measured"],
      "Look at when a smaller model will do next.", ["Python 3.11 or newer"]),
    { starter: code(
      "perms = check_permissions(user)        # 0.4s",
      "docs = retrieve(question)              # 0.8s",
      "history = load_history(user)           # 0.5s",
      "reply = llm(build(perms, docs, history, question))") }),
  practice("m9-4-when-a-smaller-model-will-do", "extend",
    pj("Add a small-model path", 40, "Extend an assistant with a small-model path for easy requests and prove nothing important got worse.",
      [
        ["Run the starter on the 40 labelled requests with the large model and record accuracy and cost.", "Save the results. Do the easy part first, then return to the hard part."],
        ["Add a quick check that marks a request as easy using length and keywords.", "Print the share marked easy."],
        ["Send easy requests to the small model and the rest to the large model.", "Log the path used."],
        ["Rerun and compare accuracy and cost.", "List any easy request the small model got wrong."],
      ],
      "An assistant with a small-model path for easy requests and a comparison of accuracy and cost.",
      ["Baseline recorded", "Easy check added", "Comparison reported"],
      "Look at context reduction and batching next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def answer(q):",
      "    return large_model(q)      # every request, including 'hello' and 'thanks'") }),
  practice("m9-4-context-reduction-and-batching", "debug",
    pj("Why trimming broke answers", 40, "Find why a trimmed prompt lost important information and fix the trimming rule.",
      [
        ["Run the starter on ten questions with and without trimming and mark the answers that got worse.", "Save both. Save your work here so you can compare later."],
        ["Look at what was cut for each bad answer.", "Find the pattern, such as cutting from the end."],
        ["Change the rule to keep the highest-ranked chunks and never cut the instructions.", "Add a floor. Try it on one small example first."],
        ["Rerun and show the answers are restored.", "Report the tokens saved."],
      ],
      "A trimming rule that keeps the important parts, restores the answers and still saves tokens.",
      ["Bad answers identified", "Pattern found", "Answers restored"],
      "Look at throughput and utilisation at scale next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def trim(prompt, limit):",
      "    return prompt[:limit]          # cuts the end, where the question and the answer format are") }),
  practice("m9-4-throughput-and-utilization-at-scale", "reimplement",
    pj("Rebuild a load tester", 45, "Rebuild a small load tester from a description and use it to find a service's limit.",
      [
        ["Read the description and write the settings: rate, duration and request type.", "Choose defaults. Write down what you see before changing anything."],
        ["Write a sender that sends requests at a steady rate without waiting for replies.", "Record the start time of each."],
        ["Write a collector that records the finish time, status and latency.", "Save to a file. Compare with a case you know the answer to."],
        ["Run it against a fake service at three rates and print median, 95th percentile and error rate.", "Find where it breaks."],
      ],
      "A load tester that sends at a steady rate and reports median, 95th percentile and error rate at three rates.",
      ["Steady sending works", "Results saved", "Breaking rate found"],
      "Look at the module capstone next.", ["Python 3.11 or newer"]) ),
];

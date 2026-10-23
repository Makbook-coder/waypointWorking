import { LLM, levelCapstone, pj } from "../build";
import type { ProjectSrc } from "../types";

export const M1510: ProjectSrc[] = [
  levelCapstone(15,
    pj("Full Mock GenAI Interview Loop", 600, "Run a complete three-round mock GenAI interview with a friend or mentor, recorded and scored, covering rapid production scenarios, a system design round and a project defence, then turn the feedback into a final plan.",
      [
        ["Write your target role brief and pick the three projects you will defend.", "Reuse your earlier packs."],
        ["Arrange an interviewer who has not seen your answers and agree a score sheet with clear criteria.", "Rubric. Print the intermediate values to see them."],
        ["Prepare six rapid scenario cards: a RAG accuracy drop, an agent in an expensive loop, a provider latency doubling, a tuned model regressing, a prompt that doubles cost and a retriever failing on real queries.", "Cards. Start with a single input before using many."],
        ["Round one: answer all six rapid scenarios aloud in ten minutes each at most and record them.", "Timer. Take it one small step at a time."],
        ["Round two: take an unseen system design prompt and run the full sequence from assumptions to deployment in 45 minutes with a recorded whiteboard.", "Whiteboard. Write down what you see before changing anything."],
        ["Round three: defend two projects for 20 minutes each including failures, why-not questions and 100 times traffic.", "Recordings. Re-read the step and try the smallest version first."],
        ["Have the interviewer score every round with the sheet and write down the questions that exposed gaps.", "Scores. Check one example by hand to be sure."],
        ["Review the recordings yourself and mark vague claims, missing numbers and bluffing.", "Notes. Save your work so you can compare later."],
        ["Fix the three weakest answers and re-record them.", "Second takes. Ask what changed since the last run."],
        ["Run a shorter second loop on a different prompt and compare scores with the first.", "Comparison. Print the intermediate values to see them."],
        ["Write the final plan: strengths, remaining gaps and the next four weeks.", "One page. Start with a single input before using many."],
      ],
      "A scored, recorded three-round mock interview with a second loop for comparison, improved weak answers and a final preparation plan.",
      ["All three rounds completed and recorded", "Interviewer scores recorded for each round", "Weak answers re-recorded and second loop compared", "Final plan names remaining gaps"],
      "You have finished the roadmap; keep practising and keep measuring.",
      ["Everything from Level 15", "A friend or mentor to interview you", LLM]),
  ),
];

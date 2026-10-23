import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M76: ProjectSrc[] = [
  practice("m7-6-evaluating-on-your-actual-task", "extend",
    pj("Add task-specific checks", 40, "Extend a generic evaluation with checks that match what the real task needs.",
      [
        ["Run the starter evaluation and read three outputs it passed.", "Note what a user would still dislike."],
        ["List two checks the real task needs, such as a required field or a length limit.", "Write them as code."],
        ["Add them to the scorer and rerun.", "Count the cases that now fail."],
        ["Write a test with a good and a bad example for each new check.", "Run the new test once without your check to see it fail, then with the check to see it pass."],
      ],
      "A scorer extended with task-specific checks that catch failures a generic check passed.",
      ["Passed outputs read", "Two checks added", "Tests for each check"],
      "Look at shortlisting candidate models next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def score(output):",
      "    return len(output) > 20        # only checks that something was written") }),
  practice("m7-6-shortlisting-candidate-models", "review",
    pj("Review a shortlist", 30, "Review how a team shortlisted models and find where the process was weak.",
      [
        ["Read the notes below and list the reasons used for each choice.", "Mark each as a fact or an opinion."],
        ["Find at least three weaknesses, such as ignoring data location rules or not checking context size.", "Quote the sentence that shows the weakness so the problem is easy to find again."],
        ["Say which model should not be on the list for the stated needs.", "Give the reason in one sentence, such as that the model does not meet a hard requirement."],
        ["Write a better shortlist process in five steps.", "Include a hard requirements check first."],
      ],
      "A review of a model shortlist with three weaknesses and a five-step better process.",
      ["Reasons classified", "Three weaknesses found", "Process written"],
      "Look at building a custom eval dataset next.", ["Python 3.11 or newer"]),
    { starter: code(
      "Needs: summarise 150-page contracts, data must stay in the EU, budget 2 cents per document.",
      "Shortlist: the three models with the most social media buzz. 'Model P has a 32k context',",
      "'Model Q is best on a leaderboard', 'Model R is what our competitor uses'.") }),
  practice("m7-6-building-a-custom-eval-dataset", "challenge",
    pj("A dataset worth trusting", 55, "Build a custom evaluation dataset for a task and show that it is reliable, with no steps given.",
      [],
      "A custom dataset with evidence that its labels are consistent and that it can tell models apart.",
      ["At least 60 cases with tags and a dev and test split", "A second labeller or a second pass agrees on at least 15 cases and the disagreement rate is reported", "Three models are scored and the set separates them", "A note lists the known gaps in the dataset"],
      "Look at like-for-like model comparison next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Write the labelling rules before you label so the second pass has something to follow.", "If every model scores nearly the same, add harder cases until the set separates them.", "Keep the test split unseen while you tune prompts."] }),
  practice("m7-6-like-for-like-model-comparison", "debug",
    pj("An unfair comparison", 40, "Find the reasons a model comparison is unfair and rerun it fairly.",
      [
        ["Read the starter comparison setup and list every difference between the two runs apart from the model.", "Include prompt, settings and dataset."],
        ["Rank the differences by how much they could change the score.", "Pick the top three."],
        ["Make the setup identical for both models except for the model name.", "Put the settings in one config."],
        ["Rerun both and report the new gap next to the old gap.", "Say whether the winner changed."],
      ],
      "A fair rerun of a model comparison with the unfair differences removed and the winner checked.",
      ["Differences listed", "Setup made identical", "Old and new gap compared"],
      "Look at estimating usage and token cost next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "model_a: temperature 0.0, carefully tuned 12-line prompt, run on 80 cases",
      "model_b: temperature 1.0, one-line prompt, run on 50 of the same cases, max_tokens 100") }),
  practice("m7-6-estimating-usage-and-token-cost", "optimise",
    pj("Cut the monthly bill", 40, "Find the biggest cost drivers in an LLM feature and cut the bill without losing quality.",
      [
        ["Read the starter usage log and compute tokens and cost for each part of the prompt.", "Make a table with the part of the prompt, its tokens and its cost per request."],
        ["Choose two changes, such as trimming examples or caching the system text.", "Estimate the saving of each."],
        ["Apply them and rerun 30 cases.", "Record quality and tokens."],
        ["Compare the projected monthly bill before and after at the stated volume.", "Show the quality change."],
      ],
      "A cost cut for an LLM feature, with token tables, quality checked and the monthly bill compared.",
      ["Cost by part computed", "Two changes applied", "Bill and quality compared"],
      "Look at the quality, latency and cost trade-off next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "per request: system text 2,800 tokens (same every time), 12 examples 3,400 tokens,",
      "retrieved context 1,200 tokens, question 60 tokens, answer 250 tokens; 50,000 requests a month") }),
  practice("m7-6-quality-latency-cost-trade-off", "review",
    pj("Review a model decision", 30, "Review a decision to switch models and decide whether the evidence supports it.",
      [
        ["Read the decision memo below and list the numbers it used.", "Note any number that is missing."],
        ["Find at least three problems, such as ignoring tail latency or measuring quality on a tiny set.", "Quote the sentence that causes each problem so the review is easy to follow."],
        ["Say what the decision would be under a different need, such as a live chat.", "Give your reason, for example that live chat needs low delay more than low cost."],
        ["Write the extra evidence you would ask for before signing off.", "List at least four items."],
      ],
      "A review of a model switch decision with three problems and a list of evidence to request.",
      ["Numbers listed", "Three problems found", "Evidence requests written"],
      "Move on to building an evaluation suite.", ["Python 3.11 or newer"]),
    { starter: code(
      "Memo: 'Switching to Model Z. It is 40% cheaper and scored 3 points higher on our 20 test cases.",
      "Average latency is 1.1 s vs 1.3 s. Everyone on the team prefers it. We will switch all traffic on Friday.'") }),
];

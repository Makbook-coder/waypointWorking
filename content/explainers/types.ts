/**
 * A visual explainer and a worked example for one module.
 *
 * diagram.steps: each step is "Label :: a few plain words". A step with " | " between options
 * shows them side by side (two things that happen in parallel or are alternatives).
 * kind "flow" reads left to right; "loop" adds an arrow back to the start labelled `back`;
 * "hub" puts the first step in the centre with the others around it.
 *
 * example.steps: [what we do and why, optional code for that step]. Code is Python unless the
 * module is about something else (shell, SQL, YAML, a prompt). `backticks` in text render as code.
 *
 * yourTurn: a similar problem for the learner, two hints that reveal one at a time, then an answer.
 */
export interface ExplainerSrc {
  id: string;
  diagram: {
    kind: "flow" | "loop" | "hub";
    steps: string[];
    back?: string;
    caption: string;
  };
  example: {
    title: string;
    problem: string;
    steps: [string, string?][];
    result: string;
  };
  yourTurn: {
    task: string;
    hints: [string, string];
    answer: string;
  };
}

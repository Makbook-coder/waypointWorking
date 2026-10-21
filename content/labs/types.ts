// Guided labs: one evolving Python file built step by step, with a checkpoint (tests) after each step.
// Steps move from "guided" (most code given) to "partial" (a signature and docstring) to "open"
// (just the spec). tests/labs.test.ts checks, with python3, that each step's solution passes its
// checkpoint together with every earlier step, and that the scaffold alone does not.

export type LabMode = "guided" | "partial" | "open";

export interface LabStepSrc {
  title: string;
  mode: LabMode;
  /** What to build in this step. `backticks` render as code. */
  instructions: string;
  /** Code appended to the editor when the step starts. Empty for open steps. */
  scaffold: string;
  /** This step's finished code; the reference file is every step's solution joined together. */
  solution: string;
  /** [name, python using assert]. A checkpoint runs these and every earlier step's tests. */
  tests: [string, string][];
  hints: [string, string];
}

export interface LabSrc {
  id: string;
  moduleId: string;
  title: string;
  /** One or two sentences: what you will have built at the end */
  goal: string;
  /** Code the editor starts with, before step 1's scaffold (imports, given helpers). */
  preamble: string;
  steps: LabStepSrc[];
  /** Ideas for taking it further once every checkpoint passes */
  stretch: string[];
}

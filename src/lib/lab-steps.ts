// Pure helpers for one guided lab. No lab content is imported here, so client components can use
// these without pulling every lab into the browser bundle. The content lives in src/lib/labs.ts.
import type { LabSrc } from "../../content/labs/types";
import { toPythonFile } from "./download";
import type { CodingTest } from "./types";

export type { LabMode, LabSrc as Lab, LabStepSrc as LabStep } from "../../content/labs/types";

/** Storage key for a lab's draft; step k's checkpoint is stored as `${labKey(id)}#${k}`. */
export const labKey = (id: string) => `lab:${id}`;
export const stepKey = (id: string, step: number) => `${labKey(id)}#${step}`;

const join = (parts: string[]) => parts.map((p) => p.replace(/\s+$/, "")).filter(Boolean).join("\n\n\n") + "\n";

/** The starting file: the preamble plus step 1's scaffold. */
export const starterCode = (lab: LabSrc) => join([lab.preamble, lab.steps[0]?.scaffold ?? ""]);

/** The reference file after step `upTo` (0-based, inclusive). */
export const referenceCode = (lab: LabSrc, upTo: number) => join([lab.preamble, ...lab.steps.slice(0, upTo + 1).map((s) => s.solution)]);

/** What the editor holds when step `step` starts from the reference: earlier solutions plus this step's scaffold. */
export const scaffoldedCode = (lab: LabSrc, step: number) => join([lab.preamble, ...lab.steps.slice(0, step).map((s) => s.solution), lab.steps[step].scaffold]);

/** A checkpoint runs this step's tests and every earlier step's, so later steps can't break earlier ones. */
export function checkpointTests(lab: LabSrc, step: number): CodingTest[] {
  return lab.steps.slice(0, step + 1).flatMap((s, i) => s.tests.map(([name, code]) => ({ name: `Step ${i + 1}: ${name}`, code })));
}

/** How many checkpoints in a row are passed, from step 1. */
export function stepsPassed(lab: LabSrc, coding: Record<string, { passedAt?: string }>): number {
  let n = 0;
  while (n < lab.steps.length && coding[stepKey(lab.id, n)]?.passedAt) n++;
  return n;
}

/** A plain .py file with the code and every checkpoint so far, to run with `python lab.py` anywhere. */
export const downloadable = (lab: LabSrc, code: string, step: number) => toPythonFile(code, checkpointTests(lab, step), `Waypoint lab: ${lab.title} (checkpoint ${step + 1})`);


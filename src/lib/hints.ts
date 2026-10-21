// "Stuck? start here": every practice item gets a ladder of small nudges before the full answer.
// Coding tasks have authored hints; other kinds build their rungs from content the app already has.
import { getNote } from "./notes";
import { getModule } from "./data";
import type { ExerciseItem, MiniProjectItem, ScenarioItem } from "./types";

export interface Rung {
  label: string;
  text: string;
  /** Extra lines shown as a list under the text */
  list?: string[];
}

/** Hint 1, hint 2, then a picture of the finished thing, for builds that have no single solution. */
export function buildLadder(item: MiniProjectItem | ExerciseItem): Rung[] {
  const note = getNote(item.moduleId);
  const mod = getModule(item.moduleId);
  const first = item.type === "mini" ? item.steps[0] : item.acceptance[0];
  const rungs: Rung[] = [
    {
      label: "Hint 1",
      text: note
        ? `Shrink it. Get only the first part working: "${first}". Remember the core idea: ${note.what} For example: ${note.example}`
        : `Shrink it. Get only the first part working: "${first}". Write the smallest script that prints something, then grow it one step at a time.`,
    },
    {
      label: "Hint 2",
      text: "These are the mistakes people make most often here. Check your work against each one before moving on.",
      list: note?.mistakes ?? ["Doing every step at once instead of one at a time", "Not writing down how to run it"],
    },
  ];
  const done = item.type === "mini" ? item.doneWhen : item.acceptance.join(" ");
  rungs.push({
    label: "What finished looks like",
    text: [done, mod?.mentalModel ? `Mental model: ${mod.mentalModel}` : ""].filter(Boolean).join(" "),
    ...(mod?.tryIt && item.type !== "mini" ? { list: [`Try it: ${mod.tryIt}`] } : {}),
  });
  return rungs;
}

/** A scenario's strong-answer points, revealed a little at a time. */
export function scenarioLadder(item: ScenarioItem): Rung[] {
  const [a, b] = item.hints;
  const rungs: Rung[] = [];
  if (a) rungs.push({ label: "Hint 1", text: `Start here: ${a}` });
  if (b) rungs.push({ label: "Hint 2", text: `Then cover: ${b}` });
  rungs.push({ label: "What a strong answer covers", text: "All the points:", list: item.hints });
  return rungs;
}

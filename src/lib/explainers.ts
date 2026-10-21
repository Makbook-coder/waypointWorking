// Per-module visual explainers and worked examples, authored in content/explainers/.
// Server pages pass one module's explainer to the client, so the full set stays out of the bundle.
import { EXPLAINER_SOURCES } from "../../content/explainers";
import type { ExplainerSrc } from "../../content/explainers/types";
import { parseStep } from "./diagram";

export type Explainer = ExplainerSrc;
export { parseStep };

const byId = new Map(EXPLAINER_SOURCES.map((e) => [e.id, e]));
export const getExplainer = (moduleId: string): Explainer | undefined => byId.get(moduleId);

const ticksOk = (s: string) => (s.match(/`/g)?.length ?? 0) % 2 === 0;

/** Problems with the explainer set, given the module ids that should have one. Empty means valid. */
export function validateExplainers(moduleIds: string[]): string[] {
  const errors: string[] = [];
  const expected = new Set(moduleIds);
  const seen = new Set<string>();
  for (const e of EXPLAINER_SOURCES) {
    const at = (msg: string) => errors.push(`${e.id}: ${msg}`);
    if (seen.has(e.id)) at("duplicate");
    seen.add(e.id);
    if (!expected.has(e.id)) at("no such non-capstone module");
    const { diagram: d, example: x, yourTurn: y } = e;
    if (d.steps.length < 3 || d.steps.length > 6) at("diagram needs 3 to 6 steps");
    if (d.kind === "loop" && !d.back) at("a loop needs a `back` label");
    if (d.kind !== "loop" && d.back) at("only loops have a `back` label");
    for (const node of d.steps.flatMap(parseStep)) {
      if (!node.label) at("empty diagram label");
      if (node.label.length > 40) at(`diagram label too long: ${node.label}`);
    }
    if (d.caption.length < 30) at("caption too short");
    if (x.steps.length < 3 || x.steps.length > 7) at("worked example needs 3 to 7 steps");
    if (x.steps.some(([say]) => say.trim().length < 5)) at("a worked-example step has no explanation");
    if (!x.problem.trim() || !x.result.trim() || !x.title.trim()) at("worked example is missing its title, problem or result");
    if (!y.task.trim() || y.hints.some((h) => h.trim().length < 5) || y.answer.trim().length < 10) at("your-turn is incomplete");
    const texts = [d.caption, x.problem, x.result, ...x.steps.map(([s]) => s), y.task, ...y.hints, y.answer];
    if (!texts.every(ticksOk)) at("unbalanced backticks");
  }
  for (const id of expected) if (!seen.has(id)) errors.push(`${id}: missing explainer`);
  return errors;
}

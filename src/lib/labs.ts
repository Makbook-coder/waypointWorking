// Guided labs (content/labs): one evolving Python file per lab, built step by step with a
// checkpoint after each step. Progress reuses UserState.coding: the draft is saved under the lab's
// key and each passed checkpoint under "<key>#<step>", so labs need no schema change.
import { LAB_SOURCES } from "../../content/labs";
import type { LabSrc, LabStepSrc } from "../../content/labs/types";

export * from "./lab-steps";

export const labs: LabSrc[] = LAB_SOURCES;

const byModule = new Map<string, LabSrc[]>();
for (const l of labs) byModule.set(l.moduleId, [...(byModule.get(l.moduleId) ?? []), l]);

export const getLab = (id: string) => labs.find((l) => l.id === id);
export const labsForModule = (moduleId: string): LabSrc[] => byModule.get(moduleId) ?? [];
export const labsForLevel = (levelId: number): LabSrc[] => labs.filter((l) => Number(l.moduleId.slice(1).split(".")[0]) === levelId);

const MODES: LabStepSrc["mode"][] = ["guided", "partial", "open"];

/** Problems with the lab content (anything a python run can't check). Empty means valid. */
export function validateLabs(moduleIds: Set<string>): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const lab of labs) {
    if (ids.has(lab.id)) errors.push(`${lab.id}: duplicate id`);
    ids.add(lab.id);
    if (!moduleIds.has(lab.moduleId)) errors.push(`${lab.id}: unknown module ${lab.moduleId}`);
    if (lab.steps.length < 3) errors.push(`${lab.id}: needs 3+ steps`);
    const modes = lab.steps.map((s) => MODES.indexOf(s.mode));
    if (modes.some((m, i) => i > 0 && m < modes[i - 1])) errors.push(`${lab.id}: steps must go guided → partial → open`);
    if (lab.steps[0]?.mode !== "guided") errors.push(`${lab.id}: first step must be guided`);
    if (lab.steps[lab.steps.length - 1]?.mode !== "open") errors.push(`${lab.id}: last step must be open`);
    lab.steps.forEach((s, i) => {
      if (s.tests.length === 0) errors.push(`${lab.id} step ${i + 1}: no tests`);
      if (s.hints.some((h) => h.trim().length < 20)) errors.push(`${lab.id} step ${i + 1}: hints too short`);
      if (s.mode === "open" && s.scaffold.trim()) errors.push(`${lab.id} step ${i + 1}: open steps have no scaffold`);
      if (s.mode !== "open" && !s.scaffold.trim()) errors.push(`${lab.id} step ${i + 1}: ${s.mode} steps need a scaffold`);
    });
    if (lab.stretch.length === 0) errors.push(`${lab.id}: no stretch ideas`);
  }
  return errors;
}

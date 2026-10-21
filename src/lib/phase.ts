import type { PhaseId } from "./types";

// Tailwind needs literal class names, so map phase ids to them here.
export const PHASE_STYLE: Record<PhaseId, { bg: string; text: string; border: string; var: string; n: number }> = {
  foundations: { bg: "bg-phase-1", text: "text-phase-1", border: "border-phase-1", var: "var(--phase-1)", n: 1 },
  retrieval: { bg: "bg-phase-2", text: "text-phase-2", border: "border-phase-2", var: "var(--phase-2)", n: 2 },
  agentic: { bg: "bg-phase-3", text: "text-phase-3", border: "border-phase-3", var: "var(--phase-3)", n: 3 },
  "evaluation-trust": { bg: "bg-phase-4", text: "text-phase-4", border: "border-phase-4", var: "var(--phase-4)", n: 4 },
  production: { bg: "bg-phase-5", text: "text-phase-5", border: "border-phase-5", var: "var(--phase-5)", n: 5 },
  "frontier-proof": { bg: "bg-phase-6", text: "text-phase-6", border: "border-phase-6", var: "var(--phase-6)", n: 6 },
  interview: { bg: "bg-phase-7", text: "text-phase-7", border: "border-phase-7", var: "var(--phase-7)", n: 7 },
};

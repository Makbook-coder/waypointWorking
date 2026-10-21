"use client";

import { store, type TargetRole } from "@/lib/store";
import { useUserState } from "@/lib/use-store";

const ROLES: { id: TargetRole; label: string }[] = [
  { id: "none", label: "Balanced" },
  { id: "ai-engineer", label: "AI Engineer" },
  { id: "genai-ds", label: "GenAI Data Scientist" },
];

export function RoleToggle() {
  const role = useUserState().settings.targetRole;
  return (
    <fieldset>
      <legend className="sr-only">Target role</legend>
      <div className="inline-flex flex-wrap rounded-md border border-line bg-surface p-0.5">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={role === r.id}
            onClick={() => store.setTargetRole(r.id)}
            className="rounded px-2.5 py-1 text-xs text-muted aria-pressed:bg-ink aria-pressed:text-bg"
          >
            {r.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

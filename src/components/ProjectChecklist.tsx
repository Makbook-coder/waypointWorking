"use client";

import { store } from "@/lib/store";
import { useUserState } from "@/lib/use-store";
import type { ProjectItem } from "@/lib/types";
import { ProgressBar } from "./ui";

export function ProjectChecklist({ project, color }: { project: ProjectItem; color?: string }) {
  const s = useUserState();
  const checked = project.checklist.map((_, i) => Boolean(s.projectChecks[`${project.id}#${i}`]));
  const done = checked.filter(Boolean).length;
  const pct = Math.floor((done / project.checklist.length) * 100);
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <ProgressBar pct={pct} color={color} label={`${project.title} checklist ${pct}%`} />
        <span className="num shrink-0 text-xs text-muted">
          {done}/{project.checklist.length}
        </span>
      </div>
      <ul className="space-y-2">
        {project.checklist.map((item, i) => {
          const id = `${project.id}-${i}`;
          return (
            <li key={id} className="flex items-start gap-3">
              <input
                id={id}
                type="checkbox"
                checked={checked[i]}
                onChange={(e) => store.setProjectCheck(project.id, i, e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[var(--ink)]"
              />
              <label htmlFor={id} className={`cursor-pointer text-sm ${checked[i] ? "text-muted line-through" : ""}`}>
                {item}
              </label>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 rounded-md border-l-4 border-strong-line bg-surface-2 p-3 text-sm">
        <span className="font-semibold">Definition of done: </span>
        {project.definitionOfDone}
      </div>
    </div>
  );
}

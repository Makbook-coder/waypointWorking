"use client";

import { store } from "@/lib/store";
import { useUserState } from "@/lib/use-store";
import type { ExerciseItem } from "@/lib/types";
import { BookmarkButton } from "./BookmarkButton";
import { Badge } from "./ui";

export function ExerciseCard({ item, context }: { item: ExerciseItem; context?: string }) {
  const done = Boolean(useUserState().exercises[item.id]);
  const id = `ex-${item.id}`;
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge>exercise</Badge>
            <Badge>{item.difficulty}</Badge>
            {context && <span className="text-xs text-muted">{context}</span>}
          </div>
          <h3 className="font-semibold">{item.title}</h3>
        </div>
        <BookmarkButton itemKey={`practice:${item.id}`} label={item.title} compact />
      </div>
      <p className="mt-2 text-sm">{item.task}</p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted">Acceptance criteria</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {item.acceptance.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-2">
        <input id={id} type="checkbox" checked={done} onChange={(e) => store.setExerciseDone(item.id, e.target.checked)} className="h-5 w-5 cursor-pointer accent-[var(--ink)]" />
        <label htmlFor={id} className="cursor-pointer text-sm">
          All criteria met
        </label>
      </div>
    </article>
  );
}

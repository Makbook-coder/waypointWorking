"use client";

import { useId } from "react";
import { store } from "@/lib/store";
import { useUserState } from "@/lib/use-store";
import { InlineCode } from "./InlineCode";
import { ProgressBar } from "./ui";

export const SETUP_KEY = "onramp:setup";

/** A tickable list saved in projectChecks under `${listKey}#<index>`. */
export function StartChecklist({ items, listKey = SETUP_KEY }: { items: { title: string; detail: string }[]; listKey?: string }) {
  const s = useUserState();
  const uid = useId();
  const done = items.filter((_, i) => s.projectChecks[`${listKey}#${i}`]).length;
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <ProgressBar pct={Math.floor((done / items.length) * 100)} label="Setup checklist" size="sm" />
        <span className="num shrink-0 text-xs text-muted">
          {done}/{items.length}
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((it, i) => {
          const id = `${uid}-${i}`;
          const checked = Boolean(s.projectChecks[`${listKey}#${i}`]);
          return (
            <li key={it.title} className="flex items-start gap-3">
              <input id={id} type="checkbox" checked={checked} onChange={(e) => store.setProjectCheck(listKey, i, e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[var(--ink)]" />
              <label htmlFor={id} className="cursor-pointer text-sm">
                <span className={`font-medium ${checked ? "text-muted line-through" : ""}`}>{it.title}</span>
                <span className="block text-muted">
                  <InlineCode text={it.detail} />
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

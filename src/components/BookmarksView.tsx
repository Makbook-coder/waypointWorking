"use client";

import { useState } from "react";
import { useHydrated } from "@/lib/use-store";
import { BookmarkList, useBookmarks } from "./BookmarkList";

export function BookmarksView() {
  const all = useBookmarks();
  const hydrated = useHydrated();
  const [kind, setKind] = useState("all");
  if (!hydrated) return null;
  const kinds = ["all", ...new Set(all.map((b) => b.kind))];
  const shown = kind === "all" ? all : all.filter((b) => b.kind === kind);
  return (
    <div>
      {all.length > 0 && (
        <div role="group" aria-label="Filter by kind" className="mb-4 flex flex-wrap gap-1">
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className="rounded-md border border-line bg-surface px-3 py-1 text-sm capitalize aria-pressed:border-strong-line aria-pressed:bg-ink aria-pressed:text-bg"
            >
              {k} <span className="num text-xs opacity-70">{k === "all" ? all.length : all.filter((b) => b.kind === k).length}</span>
            </button>
          ))}
        </div>
      )}
      <BookmarkList items={shown} empty="No bookmarks yet. Use Save on any topic, module, level, resource or practice item." />
    </div>
  );
}

"use client";

import { store } from "@/lib/store";
import { useUserState } from "@/lib/use-store";

export function BookmarkButton({ itemKey, label, compact = false }: { itemKey: string; label: string; compact?: boolean }) {
  const on = Boolean(useUserState().bookmarks[itemKey]);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove bookmark: ${label}` : `Bookmark: ${label}`}
      title={on ? "Remove bookmark" : "Bookmark"}
      onClick={() => store.toggleBookmark(itemKey)}
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs ${
        on ? "border-strong-line bg-ink text-bg" : "border-line bg-surface text-muted hover:text-ink"
      }`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M6 3h12v18l-6-4-6 4z" strokeLinejoin="round" />
      </svg>
      {!compact && <span>{on ? "Saved" : "Save"}</span>}
    </button>
  );
}

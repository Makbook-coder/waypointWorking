"use client";

import { ratio } from "@/lib/progress";
import { useUserState } from "@/lib/use-store";
import { ProgressBar } from "./ui";

/** Progress bar + count for an arbitrary set of topic ids. */
export function ProgressFor({ topicIds, label, color, showCount = true, size }: { topicIds: string[]; label: string; color?: string; showCount?: boolean; size?: "sm" | "md" }) {
  const s = useUserState();
  const p = ratio(topicIds.filter((id) => s.topics[id]?.done).length, topicIds.length);
  return (
    <div className="flex items-center gap-3">
      <ProgressBar pct={p.pct} color={color} label={`${label}: ${p.pct}%`} size={size} />
      {showCount && (
        <span className="num shrink-0 text-xs text-muted">
          {p.done}/{p.total}
        </span>
      )}
    </div>
  );
}

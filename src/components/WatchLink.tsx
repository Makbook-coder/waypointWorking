import type { WatchItem } from "@/lib/video-lessons";

/** One watch-first entry: the link, who made it, what to look for, and a clear mark on searches. */
export function WatchLink({ item }: { item: WatchItem }) {
  return (
    <div>
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
        {item.title}
        <span className="sr-only"> (opens in a new tab)</span>
        <span aria-hidden="true"> ↗</span>
      </a>
      {item.search && <span className="ml-1.5 rounded border border-line px-1 text-[11px] text-muted">search, not a checked video</span>}
      {item.source && <p className="text-xs text-muted">{item.source}</p>}
      {item.watchFor && <p className="text-xs">Watch for: {item.watchFor}</p>}
    </div>
  );
}

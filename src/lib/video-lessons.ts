// Watch-first lists: checked video links per module and per level, in roadmap order.
// Modules with no checked video fall back to a YouTube search, which is always flagged.
import { VIDEO_LESSONS, type VideoLesson } from "../../content/video-lessons";
import { getResources } from "./content-data";
import type { Level, Module, Resource } from "./types";
import { verifiedVideos, youtubeSearch } from "./youtube";

export interface WatchItem {
  title: string;
  url: string;
  /** Who made it, e.g. "DeepLearning.AI short course (free account)". */
  source?: string;
  watchFor?: string;
  /** True for a YouTube search rather than a checked link. */
  search: boolean;
}

export { VIDEO_LESSONS };

const fromResource = (r: Resource): WatchItem => ({ title: r.title, url: r.url, search: !!r.searchLink });
const fromLesson = (l: VideoLesson): WatchItem => ({ title: l.title, url: l.url, source: l.source, watchFor: l.watchFor, search: false });

/** Checked videos for one module: the module's verified video resources, then the short lessons. */
export function moduleVideos(moduleId: string, resources: Resource[] = getResources(moduleId)): WatchItem[] {
  const out = [...verifiedVideos(resources).map(fromResource), ...VIDEO_LESSONS.filter((l) => l.modules.includes(moduleId)).map(fromLesson)];
  const seen = new Set<string>();
  return out.filter((v) => !seen.has(v.url) && seen.add(v.url));
}

export interface WatchStep {
  module: Pick<Module, "id" | "title">;
  items: WatchItem[];
}

/**
 * One step per module in roadmap order. A video already listed for an earlier module
 * is not repeated; a module left with nothing gets one flagged YouTube search.
 */
export function levelWatchList(level: Pick<Level, "modules">): WatchStep[] {
  const seen = new Set<string>();
  return level.modules.map((m) => {
    const items = moduleVideos(m.id).filter((v) => !seen.has(v.url));
    items.forEach((v) => seen.add(v.url));
    if (items.length > 0) return { module: m, items };
    const query = `${m.title.replace(/^Capstone:\s*/i, "")} ${m.isCapstone ? "project tutorial" : "explained"}`;
    return { module: m, items: [fromResource(youtubeSearch(query))] };
  });
}

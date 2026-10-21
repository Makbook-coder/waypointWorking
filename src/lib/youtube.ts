// YouTube links. We never guess video URLs: per-topic links open a YouTube search,
// and are flagged searchLink so the UI can say so.
import type { Module, Resource, Topic } from "./types";

export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query.replace(/\s+/g, " ").trim())}`;
}

export function youtubeSearch(query: string): Resource {
  return { type: "video", title: `YouTube search: ${query}`, url: youtubeSearchUrl(query), free: true, searchLink: true };
}

const cleanModuleTitle = (m: Pick<Module, "title">) => m.title.replace(/^Capstone:\s*/i, "").replace(/\s*\([^)]*\)/g, "");

/** Search for one topic, with the module title as context so short topic names still find relevant videos. */
export function topicVideo(topic: Pick<Topic, "title">, module: Pick<Module, "title">): Resource {
  const t = topic.title.trim();
  const m = cleanModuleTitle(module);
  const query = t.toLowerCase().includes(m.toLowerCase()) ? t : `${t} ${m}`;
  return { ...youtubeSearch(query), title: `YouTube: ${t}` };
}

/** Verified (non-search) video links for a module, e.g. CampusX or Karpathy videos. */
export function verifiedVideos(resources: Resource[]): Resource[] {
  return resources.filter((r) => r.type === "video" && !r.searchLink);
}

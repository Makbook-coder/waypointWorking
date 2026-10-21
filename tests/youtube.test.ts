import { describe, expect, it } from "vitest";
import { modules, getModule } from "@/lib/data";
import { topicVideo, verifiedVideos, youtubeSearchUrl } from "@/lib/youtube";
import { getResources } from "@/lib/content-data";

describe("topic YouTube links", () => {
  it("every topic gets a YouTube search link, flagged as a search", () => {
    for (const m of modules)
      for (const t of m.topics) {
        const v = topicVideo(t, m);
        expect(v.searchLink, t.id).toBe(true);
        expect(v.type).toBe("video");
        expect(v.url.startsWith("https://www.youtube.com/results?search_query=")).toBe(true);
      }
  });

  it("adds the module title as context unless the topic already contains it", () => {
    const m46 = getModule("M4.6")!;
    expect(decodeURIComponent(topicVideo({ title: "Lexical retrieval & BM25" }, m46).url)).toContain("Lexical retrieval & BM25 Sparse & hybrid retrieval");
    expect(decodeURIComponent(topicVideo({ title: "LangGraph" }, { title: "Capstone: LangGraph" }).url)).toMatch(/query=LangGraph$/);
  });

  it("encodes queries safely", () => {
    expect(youtubeSearchUrl("RAG & agents  ")).toBe("https://www.youtube.com/results?search_query=RAG%20%26%20agents");
  });

  it("verifiedVideos excludes search links", () => {
    for (const m of modules) for (const v of verifiedVideos(getResources(m.id))) expect(v.searchLink).toBeFalsy();
    expect(verifiedVideos(getResources("M1.3")).length).toBeGreaterThan(0);
  });
});

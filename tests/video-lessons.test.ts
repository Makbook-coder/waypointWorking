import { describe, expect, it } from "vitest";
import { levels, modules } from "@/lib/data";
import { VIDEO_LESSONS, levelWatchList, moduleVideos } from "@/lib/video-lessons";

const moduleIds = new Set(modules.map((m) => m.id));

describe("video lessons", () => {
  it("are whole courses or talks on https, with no timestamps or search pages", () => {
    for (const l of VIDEO_LESSONS) {
      expect(l.url.startsWith("https://"), l.id).toBe(true);
      expect(l.url, l.id).not.toMatch(/[?&#]t=|\/lesson\/|results\?search_query/);
    }
  });

  it("have unique ids and urls and point at real modules", () => {
    expect(new Set(VIDEO_LESSONS.map((l) => l.id)).size).toBe(VIDEO_LESSONS.length);
    expect(new Set(VIDEO_LESSONS.map((l) => l.url)).size).toBe(VIDEO_LESSONS.length);
    for (const l of VIDEO_LESSONS) {
      expect(l.modules.length, l.id).toBeGreaterThan(0);
      for (const id of l.modules) expect(moduleIds.has(id), `${l.id} -> ${id}`).toBe(true);
      expect(l.watchFor.length, l.id).toBeGreaterThan(15);
    }
  });

  it("module lists hold only checked links, with no duplicates", () => {
    for (const m of modules) {
      const vids = moduleVideos(m.id);
      expect(vids.every((v) => !v.search), m.id).toBe(true);
      expect(new Set(vids.map((v) => v.url)).size).toBe(vids.length);
    }
    expect(moduleVideos("M5.4").map((v) => v.title)).toContain("MCP: Build Rich-Context AI Apps with Anthropic");
  });

  it("level watch lists follow module order, never repeat a link, and mark every search", () => {
    for (const level of levels) {
      const steps = levelWatchList(level);
      expect(steps.map((s) => s.module.id)).toEqual(level.modules.map((m) => m.id));
      const urls = steps.flatMap((s) => s.items.map((v) => v.url));
      expect(new Set(urls).size).toBe(urls.length);
      for (const s of steps) {
        expect(s.items.length, s.module.id).toBeGreaterThan(0);
        for (const v of s.items) expect(v.search, v.url).toBe(v.url.includes("youtube.com/results"));
      }
    }
  });
});

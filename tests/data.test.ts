import { describe, expect, it } from "vitest";
import roadmapJson from "../data/roadmap.json";
import resourcesJson from "../data/resources.json";
import practiceJson from "../data/practice.json";
import { countRoadmap, moduleSlug, slugify, validateRoadmap } from "@/lib/roadmap-build";
import type { PracticeMap, ResourceMap, Roadmap } from "@/lib/types";
import { buildPractice, countPractice, validatePractice } from "../scripts/build-practice";
import { notes, validateNotes } from "@/lib/notes";
import { topicNotes, validateTopicNotes } from "@/lib/topic-notes";

const roadmap = roadmapJson as unknown as Roadmap;
const resources = resourcesJson as unknown as ResourceMap;
const practice = practiceJson as unknown as PracticeMap;
const modules = roadmap.phases.flatMap((p) => p.levels).flatMap((l) => l.modules);

describe("roadmap.json", () => {
  it("passes validation", () => {
    expect(validateRoadmap(roadmap)).toEqual([]);
  });

  it("has 16 levels in 7 phases", () => {
    const c = countRoadmap(roadmap);
    expect(c.levels).toBe(16);
    expect(c.phases).toBe(7);
    expect(c.modules).toBe(modules.length);
  });

  it("has unique topic ids and at least one topic per module", () => {
    const ids = modules.flatMap((m) => m.topics.map((t) => t.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const m of modules) expect(m.topics.length, m.id).toBeGreaterThan(0);
  });

  it("topic ids are stable slugs prefixed by their module", () => {
    for (const m of modules) for (const t of m.topics) expect(t.id.startsWith(moduleSlug(m.id) + "-"), t.id).toBe(true);
  });

  it("validation catches broken data", () => {
    const broken = structuredClone(roadmap);
    broken.phases[0].levels[0].modules[0].topics = [];
    broken.phases[1].levels[0].modules[1].topics[0].id = broken.phases[1].levels[0].modules[0].topics[0].id;
    broken.phases[1].levels[0].prerequisites = [99];
    const errors = validateRoadmap(broken);
    expect(errors.some((e) => /no topics|at least one topic/i.test(e))).toBe(true);
    expect(errors.some((e) => /duplicate/i.test(e))).toBe(true);
    expect(errors.some((e) => /prereq/i.test(e))).toBe(true);
  });
});

describe("slugify", () => {
  it("makes stable lowercase slugs", () => {
    expect(slugify("Hybrid retrieval with RRF")).toBe("hybrid-retrieval-with-rrf");
    expect(slugify("Retrieve, assemble & generate!")).toBe("retrieve-assemble-and-generate");
    expect(slugify("  Naïve → Advanced  ")).toBe("naive-advanced");
    expect(moduleSlug("M4.6")).toBe("m4-6");
  });
});

describe("resources.json", () => {
  it("has 3 to 6 resources for every module", () => {
    for (const m of modules) {
      const n = resources[m.id]?.length ?? 0;
      expect(n, m.id).toBeGreaterThanOrEqual(3);
      expect(n, m.id).toBeLessThanOrEqual(6);
    }
  });

  it("uses https URLs and valid types", () => {
    const types = new Set(["video", "docs", "article", "course", "repo", "paper"]);
    for (const list of Object.values(resources))
      for (const r of list) {
        expect(new URL(r.url).protocol, r.url).toBe("https:");
        expect(types.has(r.type), r.type).toBe(true);
        expect(typeof r.free).toBe("boolean");
      }
  });

  it("marks every search-results link as a searchLink", () => {
    for (const list of Object.values(resources))
      for (const r of list) if (r.url.includes("/results?search_query=")) expect(r.searchLink, r.url).toBe(true);
  });
});

describe("practice.json", () => {
  it("passes validation and matches a fresh build", () => {
    expect(validatePractice(roadmap, practice)).toEqual([]);
    expect(buildPractice(roadmap)).toEqual(practice);
  });

  it("has 5 quizzes per module for L0..L13 with one correct answer each", () => {
    for (const m of modules.filter((m) => m.levelId <= 13)) {
      const qs = (practice[m.id] ?? []).filter((p) => p.type === "quiz");
      expect(qs.length, m.id).toBe(5);
      for (const q of qs) if (q.type === "quiz") expect(q.options[q.answer]).toBeTruthy();
    }
  });

  it("includes the required interview scenarios", () => {
    const titles = Object.values(practice)
      .flat()
      .filter((p) => p.type === "scenario")
      .map((p) => (p.type === "scenario" ? p.title.toLowerCase() : ""));
    for (const needle of ["quality dropped after a week", "costly loop", "latency doubled", "enterprise support assistant"])
      expect(titles.some((t) => t.includes(needle)), needle).toBe(true);
  });

  it("scenarios are concentrated in L9 and L15", () => {
    const all = Object.values(practice).flat().filter((p) => p.type === "scenario");
    const heavy = all.filter((p) => p.levelId === 9 || p.levelId === 15).length;
    expect(heavy / all.length).toBeGreaterThan(0.6);
  });

  it("gives every non-capstone L0..L14 module an exercise or a mini project built from its topics", () => {
    for (const m of modules.filter((m) => m.levelId <= 14 && !m.isCapstone)) {
      const items = practice[m.id] ?? [];
      const builds = items.filter((p) => p.type === "exercise" || p.type === "mini");
      expect(builds.length, m.id).toBe(1);
      const mini = builds[0];
      if (mini.type === "mini") {
        expect(mini.steps.length, m.id).toBe(m.topics.length + 1);
        m.topics.forEach((t, i) => expect(mini.steps[i].startsWith(t.title), m.id).toBe(true));
      }
    }
    expect(countPractice(practice).mini).toBeGreaterThan(80);
  });

  it("has one project per level that defines one", () => {
    const withProject = roadmap.phases.flatMap((p) => p.levels).filter((l) => l.project);
    expect(countPractice(practice).project).toBe(withProject.length);
  });
});

describe("module notes", () => {
  it("has one valid note for every non-capstone module", () => {
    const ids = modules.filter((m) => !m.isCapstone).map((m) => m.id);
    expect(validateNotes(ids)).toEqual([]);
    expect(Object.keys(notes)).toHaveLength(ids.length);
  });
});

describe("topic notes", () => {
  it("covers whole levels with complete, known notes", () => {
    const byLevel: Record<number, string[]> = {};
    for (const m of modules) (byLevel[m.levelId] ??= []).push(...m.topics.map((t) => t.id));
    expect(validateTopicNotes(byLevel)).toEqual([]);
  });

  it("covers every topic in L0 to L8", () => {
    const ids = modules.filter((m) => m.levelId <= 8).flatMap((m) => m.topics.map((t) => t.id));
    expect(ids.filter((id) => !topicNotes[id])).toEqual([]);
  });
});

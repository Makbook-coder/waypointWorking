import { describe, expect, it } from "vitest";
import { cheatSheet } from "@/lib/cheatsheet";
import { levels } from "@/lib/data";

describe("cheat sheets", () => {
  it("has an entry with a gist and topics for every module of every level", () => {
    for (const l of levels) {
      const sheet = cheatSheet(l);
      expect(sheet.map((e) => e.module.id)).toEqual(l.modules.map((m) => m.id));
      for (const e of sheet) {
        expect(e.gist.length, e.module.id).toBeGreaterThan(20);
        expect(e.topics.length, e.module.id).toBeGreaterThan(0);
        if (!e.module.isCapstone) expect(e.mistakes.length, e.module.id).toBeGreaterThanOrEqual(2);
        if (e.interview) expect(e.interview.keyPoints.length).toBeLessThanOrEqual(4);
      }
    }
  });
});

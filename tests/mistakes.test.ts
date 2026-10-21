import { describe, expect, it } from "vitest";
import { levels, modules } from "@/lib/data";
import { MISTAKES_PER_LEVEL, mistakesForLevel, validateMistakes } from "@/lib/mistakes";

describe("level mistakes", () => {
  it("pass validation", () => {
    expect(validateMistakes(modules.map((m) => m.id))).toEqual([]);
  });

  it("give every level the same number of mistakes, each tied to that level", () => {
    for (const l of levels) {
      const list = mistakesForLevel(l.id);
      expect(list, `L${l.id}`).toHaveLength(MISTAKES_PER_LEVEL);
      for (const m of list) expect(m.moduleId.startsWith(`M${l.id}.`)).toBe(true);
    }
  });

  it("catch a level with too few", () => {
    expect(validateMistakes([...modules.map((m) => m.id), "M16.1"])).toContain("L16: has 0 mistakes, needs 5");
  });
});

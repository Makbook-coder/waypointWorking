import { describe, expect, it } from "vitest";
import { levels } from "@/lib/data";
import { MISTAKES_PER_LEVEL } from "@/lib/mistakes";
import { printPack } from "@/lib/print-pack";

describe("print packs", () => {
  it("has a summary, mistakes and a project row for every module of every level", () => {
    for (const l of levels) {
      const pack = printPack(l);
      expect(pack.sheet.map((e) => e.module.id), `L${l.id}`).toEqual(l.modules.map((m) => m.id));
      expect(pack.projects.map((p) => p.module.id), `L${l.id}`).toEqual(l.modules.map((m) => m.id));
      expect(pack.mistakes, `L${l.id}`).toHaveLength(MISTAKES_PER_LEVEL);
      expect(pack.levelCapstone, `L${l.id}`).not.toBeNull();
    }
  });
});

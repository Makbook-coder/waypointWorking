import { describe, expect, it } from "vitest";
import { modules } from "@/lib/data";
import { APPLIED_LEVELS, appliedSources, applied, getApplied, validateApplied, type AppliedModule } from "@/lib/applied";

const covered = modules.filter((m) => !m.isCapstone && APPLIED_LEVELS.includes(m.levelId)).map((m) => m.id);

describe("In practice sections", () => {
  it("covers every non-capstone module in the covered levels, with complete entries", () => {
    expect(validateApplied(covered)).toEqual([]);
    expect(Object.keys(applied).sort()).toEqual([...covered].sort());
  });

  it("gives every source an https URL, and every real-world use a page source", () => {
    for (const id of covered) {
      const a = getApplied(id)!;
      for (const s of appliedSources(a)) expect(s.url, `${id} ${s.label}`).toMatch(/^https:\/\/[^\s]+\.[a-z]{2,}/);
      for (const u of a.uses) expect(u.source.kind, `${id} ${u.who}`).not.toBe("search");
    }
  });

  it("never covers capstones, which have their own guide", () => {
    const capstones = new Set(modules.filter((m) => m.isCapstone).map((m) => m.id));
    expect(Object.keys(applied).filter((id) => capstones.has(id))).toEqual([]);
  });

  it("catches thin or broken entries", () => {
    const good = getApplied(covered[0])!;
    const thin: AppliedModule = { ...good, howItWorks: "short", uses: [good.uses[0]], reading: [] };
    const errors = validateApplied([good.moduleId], [thin]);
    expect(errors.join("\n")).toMatch(/too thin/);
    expect(errors.join("\n")).toMatch(/real-world uses/);
    expect(errors.join("\n")).toMatch(/further-reading/);

    const unmarked: AppliedModule = { ...good, reading: [{ label: "Search", url: "https://www.google.com/search?q=x", kind: "docs" }, good.reading[0]] };
    expect(validateApplied([good.moduleId], [unmarked]).join("\n")).toMatch(/marked search/);

    const plain: AppliedModule = { ...good, reading: [{ label: "Insecure", url: "http://example.com/a", kind: "docs" }, good.reading[0]] };
    expect(validateApplied([good.moduleId], [plain]).join("\n")).toMatch(/not https/);

    expect(validateApplied([good.moduleId, "M99.1"], [good])).toContain('M99.1: missing "In practice" section');
  });
});

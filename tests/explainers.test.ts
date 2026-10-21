import { describe, expect, it } from "vitest";
import { modules } from "@/lib/data";
import { getExplainer, parseStep, validateExplainers } from "@/lib/explainers";

const nonCapstone = modules.filter((m) => !m.isCapstone).map((m) => m.id);

describe("explainers", () => {
  it("cover every non-capstone module exactly once", () => {
    expect(validateExplainers(nonCapstone)).toEqual([]);
  });

  it("catch a missing module", () => {
    expect(validateExplainers([...nonCapstone, "M99.1"])).toContain("M99.1: missing explainer");
  });

  it("parse labels, details and parallel options", () => {
    expect(parseStep("Retrieve :: top chunks")).toEqual([{ label: "Retrieve", detail: "top chunks" }]);
    expect(parseStep("BM25 :: exact words | Vector search :: meaning")).toEqual([
      { label: "BM25", detail: "exact words" },
      { label: "Vector search", detail: "meaning" },
    ]);
    expect(parseStep("Query")).toEqual([{ label: "Query", detail: "" }]);
  });

  it("is looked up by module id", () => {
    expect(getExplainer("M4.6")?.example.title).toMatch(/RRF/);
    expect(getExplainer("M4.7")).toBeUndefined();
  });
});

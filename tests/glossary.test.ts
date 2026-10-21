import { describe, expect, it } from "vitest";
import { modules } from "@/lib/data";
import { glossary, linkTerms, termsMentioned, validateGlossary } from "@/lib/glossary";

describe("glossary", () => {
  it("passes validation", () => {
    expect(validateGlossary(modules.map((m) => m.id))).toEqual([]);
  });

  it("has at least 200 terms with unique slugs", () => {
    expect(glossary.length).toBeGreaterThanOrEqual(200);
    expect(new Set(glossary.map((e) => e.slug)).size).toBe(glossary.length);
  });

  it("covers every level", () => {
    const levels = new Set(glossary.map((e) => Number(/^M(\d+)\./.exec(e.moduleId)![1])));
    for (let l = 0; l <= 13; l++) expect(levels.has(l), `L${l}`).toBe(true);
  });
});

describe("linkTerms", () => {
  const terms = (text: string) =>
    linkTerms([text])[0]
      .filter((s) => s.kind === "term")
      .map((s) => s.text);

  it("marks only the first mention across a group of texts", () => {
    const [a, b] = linkTerms(["RAG needs a retriever.", "Then RAG answers."]);
    expect(a.filter((s) => s.kind === "term").map((s) => s.text)).toEqual(["RAG", "retriever"]);
    expect(b.some((s) => s.kind === "term")).toBe(false);
  });

  it("prefers the longest phrase", () => {
    expect(terms("Watch for prompt injection.")).toEqual(["prompt injection"]);
  });

  it("needs exact capitals for acronyms and mixed-case names", () => {
    expect(terms("a rag doll")).toEqual([]);
    expect(terms("Use RAG here")).toEqual(["RAG"]);
    expect(terms("Try LoRA")).toEqual(["LoRA"]);
  });

  it("ignores case for ordinary words and accepts plurals", () => {
    expect(terms("Embeddings are useful")).toEqual(["Embeddings"]);
  });

  it("respects word boundaries and hyphenated words", () => {
    expect(terms("a multi-agent design")).toEqual(["multi-agent"]);
    expect(terms("reagents")).toEqual([]);
  });

  it("leaves code spans alone", () => {
    const [segs] = linkTerms(["Call `RAG()` then RAG"]);
    expect(segs).toEqual([
      { kind: "text", text: "Call " },
      { kind: "code", text: "RAG()" },
      { kind: "text", text: " then " },
      { kind: "term", text: "RAG", slug: "rag" },
    ]);
  });

  it("can skip a term and keeps all the text", () => {
    const text = "An agent calls a tool through MCP.";
    const [segs] = linkTerms([text], ["agent"]);
    expect(segs.map((s) => s.text).join("")).toBe(text);
    expect(segs.filter((s) => s.kind === "term").map((s) => s.text)).toEqual(["MCP"]);
  });

  it("lists the terms mentioned, in order", () => {
    expect(termsMentioned(["BM25 and embeddings", "BM25 again"]).map((e) => e.term)).toEqual(["BM25", "Embedding"]);
  });
});

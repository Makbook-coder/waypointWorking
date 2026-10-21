/**
 * "In practice" content: how a module is applied in real products.
 * Every named company or product claim carries a public source that was
 * fetched and read when it was written. Wording is paraphrased, never copied.
 * `backticks` render as inline code.
 */

export type SourceKind = "docs" | "blog" | "paper" | "case-study" | "talk" | "news" | "search";

export interface AppliedSource {
  label: string;
  url: string;
  kind: SourceKind;
}

/** One place the idea shows up in a real product or team, backed by a source. */
export interface RealWorldUse {
  who: string;
  what: string;
  source: AppliedSource;
}

export interface AppliedScenario {
  title: string;
  /** The situation: who the users are and what the system has to do. */
  context: string;
  /** How the pieces fit together, in one or two sentences. */
  architecture: string;
  tools: string[];
  /** The order of work on a real project. */
  steps: string[];
}

export interface AppliedExample {
  title: string;
  lang: "python" | "bash" | "dockerfile" | "sql" | "yaml" | "json" | "toml" | "text" | "http";
  code: string;
  /** What to notice in the example. */
  notes: string;
}

export interface TradeOff {
  issue: string;
  /** What teams actually do about it. */
  response: string;
}

export interface AppliedModule {
  moduleId: string;
  /** How the idea works in practice, a short paragraph. */
  howItWorks: string;
  uses: RealWorldUse[];
  scenario: AppliedScenario;
  example: AppliedExample;
  tradeoffs: TradeOff[];
  junior: string;
  senior: string;
  reading: AppliedSource[];
}

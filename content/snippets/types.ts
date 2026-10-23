/**
 * A runnable snippet on a topic page: a short, self-contained Python program the learner can edit and run in the browser.
 * Rules (tests/snippets.test.ts runs every one with python3 and checks them):
 *  - standard library only; no network, no files outside a temp dir, no asyncio.run (top-level `await` works instead)
 *  - deterministic: no timing-dependent or unseeded-random output
 *  - prints something, and `expect` is a piece of that output
 */
export interface SnippetSrc {
  topicId: string;
  title: string;
  /** One sentence: what to run it for and what to notice in the output. `backticks` render as code. */
  intro: string;
  code: string;
  /** Text that must appear in the output of the code exactly as written */
  expect: string;
  /** Something to change and try, e.g. "Set k to 1 and run it again." */
  tryThis?: string;
}

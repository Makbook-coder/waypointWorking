// Runnable snippets (content/snippets): one or more editable Python programs per topic page.
import { SNIPPET_SOURCES } from "../../content/snippets";
import type { SnippetSrc } from "../../content/snippets/types";

export type { SnippetSrc };

export const snippets: SnippetSrc[] = SNIPPET_SOURCES;

const byTopic = new Map<string, SnippetSrc[]>();
for (const s of snippets) byTopic.set(s.topicId, [...(byTopic.get(s.topicId) ?? []), s]);

export const snippetsForTopic = (topicId: string): SnippetSrc[] => byTopic.get(topicId) ?? [];

/** Problems with the snippet content that a python run can't check. Empty means valid. */
export function validateSnippets(topicIds: Set<string>): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const s of snippets) {
    const label = `${s.topicId} "${s.title}"`;
    if (!topicIds.has(s.topicId)) errors.push(`${label}: unknown topic`);
    if (seen.has(`${s.topicId}|${s.title}`)) errors.push(`${label}: duplicate`);
    seen.add(`${s.topicId}|${s.title}`);
    if (s.code.trim().split("\n").length > 40) errors.push(`${label}: over 40 lines, keep snippets short`);
    if (s.intro.trim().length < 20) errors.push(`${label}: intro too short`);
    if (!s.expect.trim()) errors.push(`${label}: no expected output`);
    if (/asyncio\.run\(/.test(s.code)) errors.push(`${label}: asyncio.run does not work in the browser, use top-level await`);
    if (/^\s*(import|from)\s+(requests|numpy|pandas|openai|anthropic|httpx|sqlite3)\b/m.test(s.code)) errors.push(`${label}: standard library only`);
  }
  return errors;
}

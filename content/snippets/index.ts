import { SNIPPETS_L0_L2 } from "./l0-l2";
import { SNIPPETS_L3_L4 } from "./l3-l4";
import { SNIPPETS_L5_L9 } from "./l5-l9";
import type { SnippetSrc } from "./types";

export const SNIPPET_SOURCES: SnippetSrc[] = [...SNIPPETS_L0_L2, ...SNIPPETS_L3_L4, ...SNIPPETS_L5_L9];

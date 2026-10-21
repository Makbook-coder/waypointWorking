// Parsing for explainer diagram steps. Kept apart from the content so client code can import it cheaply.

export interface DiagramNode {
  label: string;
  detail: string;
}

/** "Label :: detail | Other :: detail" -> one group of parallel nodes. */
export function parseStep(step: string): DiagramNode[] {
  return step.split(" | ").map((part) => {
    const [label, detail = ""] = part.split(" :: ");
    return { label: label.trim(), detail: detail.trim() };
  });
}

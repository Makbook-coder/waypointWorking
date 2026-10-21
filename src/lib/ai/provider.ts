// Calls the chosen LLM straight from the browser. There is no server in between: the request goes
// to Google (Gemini), to the learner's own Ollama, or to the OpenAI-compatible URL they entered.
import type { AISettings } from "./config";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CompleteRequest {
  system: string;
  messages: ChatMessage[];
  json?: boolean; // ask for a JSON object back
  temperature?: number;
  signal?: AbortSignal;
}

export interface Provider {
  complete(req: CompleteRequest): Promise<string>;
}

export type AIErrorKind = "not-configured" | "auth" | "rate-limit" | "network" | "timeout" | "blocked" | "bad-response" | "aborted";

export class AIError extends Error {
  constructor(
    public kind: AIErrorKind,
    message: string,
    public retryAfterSec?: number,
  ) {
    super(message);
    this.name = "AIError";
  }
}

/** A short sentence for the learner. */
export function describeAIError(e: unknown): string {
  if (!(e instanceof AIError)) return "Something went wrong talking to the AI. Try again.";
  switch (e.kind) {
    case "not-configured":
      return "The AI tutor isn't set up yet. Add a free key in Settings.";
    case "auth":
      return "The provider rejected the key. Check it in Settings.";
    case "rate-limit":
      return e.retryAfterSec
        ? `You've hit the provider's rate limit. Try again in about ${e.retryAfterSec} seconds.`
        : "You've hit the provider's rate limit (free tiers allow a few requests a minute). Wait a moment and try again.";
    case "network":
      return "Couldn't reach the AI provider. Check your connection, or for Ollama that it's running and allows this site (see README).";
    case "timeout":
      return "The AI took too long to answer. Try again.";
    case "blocked":
      return "The provider declined to answer this one. Try rephrasing.";
    case "aborted":
      return "Cancelled.";
    default:
      return e.message || "The AI sent back something unexpected. Try again.";
  }
}

export const TIMEOUT_MS = 60_000;
type Fetch = typeof fetch;
// Called through a wrapper so the global fetch is never invoked with a foreign `this`.
const globalFetch: Fetch = (input, init) => fetch(input, init);

/** Seconds to wait from a Retry-After header or Gemini's RetryInfo ("12s" / "12.5s"). */
function retryAfter(res: Response, body: unknown): number | undefined {
  const h = Number(res.headers.get("retry-after"));
  if (Number.isFinite(h) && h > 0) return Math.ceil(h);
  const details = (body as { error?: { details?: { retryDelay?: unknown }[] } })?.error?.details;
  for (const d of Array.isArray(details) ? details : []) {
    const m = typeof d?.retryDelay === "string" ? /^([\d.]+)s$/.exec(d.retryDelay) : null;
    if (m) return Math.ceil(Number(m[1]));
  }
  return undefined;
}

function errorMessage(body: unknown): string {
  const e = (body as { error?: unknown })?.error;
  if (typeof e === "string") return e;
  if (e && typeof e === "object" && typeof (e as { message?: unknown }).message === "string") return (e as { message: string }).message;
  return "";
}

async function post(fetchFn: Fetch, url: string, headers: Record<string, string>, body: unknown, signal?: AbortSignal): Promise<unknown> {
  const ctrl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    ctrl.abort();
  }, TIMEOUT_MS);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener("abort", onAbort);
  let res: Response;
  try {
    res = await fetchFn(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body), signal: ctrl.signal });
  } catch {
    if (timedOut) throw new AIError("timeout", "Timed out");
    if (signal?.aborted) throw new AIError("aborted", "Cancelled");
    throw new AIError("network", "Network error");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    // some errors come back as plain text
  }
  if (res.ok) return json;
  const msg = errorMessage(json);
  if (res.status === 429) throw new AIError("rate-limit", msg || "Rate limited", retryAfter(res, json));
  if (res.status === 401 || res.status === 403 || /api key/i.test(msg)) throw new AIError("auth", msg || "Unauthorized");
  throw new AIError("bad-response", msg ? `The provider said: ${msg}` : `The provider answered with HTTP ${res.status}.`);
}

export function geminiProvider(s: AISettings, fetchFn: Fetch = globalFetch): Provider {
  return {
    async complete({ system, messages, json, temperature = 0.4, signal }) {
      const url = `${s.baseUrl}/models/${encodeURIComponent(s.model)}:generateContent`;
      const body = {
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        generationConfig: { temperature, ...(json ? { responseMimeType: "application/json" } : {}) },
      };
      const data = (await post(fetchFn, url, { "x-goog-api-key": s.apiKey }, body, signal)) as {
        promptFeedback?: { blockReason?: string };
        candidates?: { finishReason?: string; content?: { parts?: { text?: string }[] } }[];
      } | null;
      if (data?.promptFeedback?.blockReason) throw new AIError("blocked", data.promptFeedback.blockReason);
      const c = data?.candidates?.[0];
      const text = (c?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
      if (!text) {
        if (c?.finishReason === "SAFETY" || c?.finishReason === "PROHIBITED_CONTENT") throw new AIError("blocked", c.finishReason);
        throw new AIError("bad-response", "The AI sent back an empty answer. Try again.");
      }
      return text;
    },
  };
}

/** Works with OpenAI, Groq, OpenRouter, LM Studio, Ollama's /v1 endpoint and anything else that speaks /chat/completions. */
export function openAICompatibleProvider(s: AISettings, fetchFn: Fetch = globalFetch): Provider {
  return {
    async complete({ system, messages, json, temperature = 0.4, signal }) {
      const body = {
        model: s.model,
        temperature,
        messages: [{ role: "system", content: system + (json ? "\nReply with a single JSON object and nothing else." : "") }, ...messages],
      };
      const headers: Record<string, string> = s.apiKey ? { authorization: `Bearer ${s.apiKey}` } : {};
      const data = (await post(fetchFn, `${s.baseUrl}/chat/completions`, headers, body, signal)) as {
        choices?: { message?: { content?: string }; finish_reason?: string }[];
      } | null;
      const choice = data?.choices?.[0];
      const text = choice?.message?.content?.trim() ?? "";
      if (!text) {
        if (choice?.finish_reason === "content_filter") throw new AIError("blocked", "content_filter");
        throw new AIError("bad-response", "The AI sent back an empty answer. Try again.");
      }
      return text;
    },
  };
}

export function createProvider(s: AISettings, fetchFn?: Fetch): Provider {
  return s.provider === "gemini" ? geminiProvider(s, fetchFn) : openAICompatibleProvider(s, fetchFn);
}

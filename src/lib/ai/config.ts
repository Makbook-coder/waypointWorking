// Settings for the optional AI tutor. Kept apart from UserState on purpose: the API key must never
// be part of a JSON export or the cloud sync document, so it lives under its own localStorage key.
import type { StorageAdapter } from "../store";

export const AI_STORAGE_KEY = "aet:ai";

export type ProviderId = "gemini" | "ollama" | "openai";

export interface AISettings {
  provider: ProviderId;
  apiKey: string; // only sent to the chosen provider
  model: string;
  baseUrl: string; // used by ollama and openai; gemini's endpoint is fixed
}

export interface ProviderPreset {
  id: ProviderId;
  label: string;
  model: string;
  baseUrl: string;
  needsKey: boolean;
}

export const PRESETS: Record<ProviderId, ProviderPreset> = {
  // "gemini-flash-latest" follows Google's newest Flash model, which is the one the free tier covers.
  gemini: { id: "gemini", label: "Google Gemini (free tier)", model: "gemini-flash-latest", baseUrl: "https://generativelanguage.googleapis.com/v1beta", needsKey: true },
  ollama: { id: "ollama", label: "Ollama (runs on your computer)", model: "llama3.2", baseUrl: "http://localhost:11434/v1", needsKey: false },
  openai: { id: "openai", label: "Any OpenAI-compatible API", model: "", baseUrl: "", needsKey: false },
};

/**
 * Model ids offered in the Settings picker. Any other id can be typed in, and "Fetch my models" lists
 * exactly what the key can use. Google's free tier covers the Flash models; Pro needs billing.
 */
export const MODEL_SUGGESTIONS: Record<ProviderId, { id: string; note: string }[]> = {
  gemini: [
    { id: "gemini-flash-latest", note: "newest Flash, free tier (default)" },
    { id: "gemini-flash-lite-latest", note: "newest Flash-Lite, fastest, higher free limits" },
    { id: "gemini-2.5-flash", note: "pinned Flash version" },
    { id: "gemini-2.5-flash-lite", note: "pinned Flash-Lite version" },
    { id: "gemini-2.5-pro", note: "strongest, usually needs billing" },
  ],
  ollama: [
    { id: "llama3.2", note: "small, runs on most laptops" },
    { id: "qwen2.5:7b", note: "good at JSON grading" },
    { id: "gemma3", note: "Google's open model" },
    { id: "mistral", note: "general purpose" },
  ],
  openai: [
    { id: "llama-3.1-8b-instant", note: "Groq, free tier" },
    { id: "meta-llama/llama-3.3-70b-instruct:free", note: "OpenRouter, free" },
    { id: "gpt-4o-mini", note: "OpenAI, paid" },
  ],
};

export const defaultAISettings = (): AISettings => ({ provider: "gemini", apiKey: "", model: PRESETS.gemini.model, baseUrl: PRESETS.gemini.baseUrl });

const MAX_FIELD = 500;
const field = (v: unknown, fallback: string) => (typeof v === "string" ? v.trim().slice(0, MAX_FIELD) : fallback);

/** Parse stored settings. Anything unreadable falls back to the defaults; never throws. */
export function loadAISettings(raw: string | null | undefined): AISettings {
  const base = defaultAISettings();
  if (!raw) return base;
  try {
    const s = JSON.parse(raw);
    if (typeof s !== "object" || s === null) return base;
    const provider: ProviderId = s.provider === "ollama" || s.provider === "openai" || s.provider === "gemini" ? s.provider : base.provider;
    const preset = PRESETS[provider];
    return {
      provider,
      apiKey: field(s.apiKey, ""),
      model: field(s.model, preset.model) || preset.model,
      baseUrl: provider === "gemini" ? preset.baseUrl : field(s.baseUrl, preset.baseUrl).replace(/\/+$/, ""),
    };
  } catch {
    return base;
  }
}

/** True when there is enough to make a request: a key for Gemini, a URL and model otherwise. */
export function isConfigured(s: AISettings): boolean {
  if (!s.model) return false;
  if (s.provider === "gemini") return Boolean(s.apiKey);
  return /^https?:\/\/\S+$/.test(s.baseUrl);
}

export const aiBrowserStorage: StorageAdapter = {
  read() {
    try {
      return window.localStorage.getItem(AI_STORAGE_KEY);
    } catch {
      return null;
    }
  },
  write(value) {
    try {
      if (value) window.localStorage.setItem(AI_STORAGE_KEY, value);
      else window.localStorage.removeItem(AI_STORAGE_KEY);
    } catch {
      // blocked storage: the settings last for this tab only
    }
  },
};

export function createAISettingsStore(storage: StorageAdapter = aiBrowserStorage) {
  let state: AISettings | null = null;
  const listeners = new Set<() => void>();
  const get = () => (state ??= loadAISettings(storage.read()));
  const emit = () => listeners.forEach((l) => l());
  return {
    get,
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    save(next: AISettings) {
      state = loadAISettings(JSON.stringify(next));
      storage.write(JSON.stringify(state));
      emit();
    },
    /** Forget everything, including the key. */
    clear() {
      state = defaultAISettings();
      storage.write("");
      emit();
    },
    reload() {
      state = null;
      emit();
    },
  };
}

export const aiSettings = createAISettingsStore();

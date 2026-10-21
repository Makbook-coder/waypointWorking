"use client";

import { useEffect, useId, useState } from "react";
import { aiSettings, isConfigured, PRESETS, type AISettings, type ProviderId } from "@/lib/ai/config";
import { createProvider, describeAIError } from "@/lib/ai/provider";
import { useAISettings } from "@/lib/ai/use-ai";
import { useHydrated } from "@/lib/use-store";
import { Card, SectionTitle, buttonClass, ghostButtonClass, inputClass } from "./ui";

/** Settings card for the optional AI tutor: provider, key, model and a connection test. */
export function AISettingsPanel() {
  const saved = useAISettings();
  const hydrated = useHydrated();
  const uid = useId();
  const [draft, setDraft] = useState<AISettings>(saved);
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState(false);

  // Pick up the stored settings once the browser has loaded them.
  useEffect(() => setDraft(saved), [saved]);

  const preset = PRESETS[draft.provider];
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const set = (patch: Partial<AISettings>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setStatus(null);
  };

  function pickProvider(id: ProviderId) {
    const p = PRESETS[id];
    setDraft({ provider: id, apiKey: id === saved.provider ? saved.apiKey : "", model: id === saved.provider ? saved.model : p.model, baseUrl: id === saved.provider ? saved.baseUrl : p.baseUrl });
    setStatus(null);
  }

  function save() {
    aiSettings.save(draft);
    setStatus({ ok: true, text: isConfigured(aiSettings.get()) ? "Saved. AI features are on." : "Saved, but something is missing (key, URL or model)." });
  }

  async function test() {
    setTesting(true);
    setStatus(null);
    try {
      const reply = await createProvider(draft).complete({ system: "Reply with the single word: ready", messages: [{ role: "user", content: "Are you there?" }], temperature: 0 });
      setStatus({ ok: true, text: `Connected. The model replied: “${reply.slice(0, 60)}”.${dirty ? " Press Save to use these settings." : ""}` });
    } catch (e) {
      setStatus({ ok: false, text: describeAIError(e) });
    } finally {
      setTesting(false);
    }
  }

  return (
    <Card>
      <div id="ai" className="scroll-mt-20" />
      <SectionTitle>AI tutor</SectionTitle>
      <p className="mb-4 text-sm text-muted">
        Optional. Connect a free AI model to grade your written answers, explain topics, write extra practice questions, hint at coding fixes and play
        interviewer. Everything else works without it.
      </p>

      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Provider</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PRESETS) as ProviderId[]).map((id) => (
            <label key={id} className="flex cursor-pointer items-center gap-2 rounded-md border border-line px-3 py-2 text-sm has-[:checked]:border-strong-line">
              <input type="radio" name={`${uid}-provider`} checked={hydrated && draft.provider === id} onChange={() => pickProvider(id)} className="accent-[var(--ink)]" />
              {PRESETS[id].label}
            </label>
          ))}
        </div>
      </fieldset>

      {draft.provider === "gemini" && (
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm">
          <li>
            Open{" "}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              Google AI Studio → API keys<span className="sr-only"> (opens in a new tab)</span>
            </a>{" "}
            and sign in with a Google account.
          </li>
          <li>Create an API key. No credit card is needed for the free tier.</li>
          <li>Paste it below and press Save.</li>
        </ol>
      )}
      {draft.provider === "ollama" && (
        <p className="mt-4 text-sm text-muted">
          Install Ollama, run <code className="font-mono">ollama pull {draft.model || "llama3.2"}</code>, and start it with{" "}
          <code className="font-mono">OLLAMA_ORIGINS=*</code> (or this site&apos;s address) so the browser is allowed to call it. Nothing leaves your computer.
        </p>
      )}
      {draft.provider === "openai" && (
        <p className="mt-4 text-sm text-muted">
          Any service with an OpenAI-style <code className="font-mono">/chat/completions</code> endpoint that allows browser requests, for example Groq, OpenRouter
          or LM Studio. Enter its base URL (ending before <code className="font-mono">/chat/completions</code>) and a model name.
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {draft.provider !== "gemini" && (
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Base URL
            <input className={inputClass} value={draft.baseUrl} onChange={(e) => set({ baseUrl: e.target.value })} placeholder="https://api.example.com/v1" spellCheck={false} autoComplete="off" />
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          API key {preset.needsKey ? "" : <span className="text-xs text-muted">(optional for local models)</span>}
          <span className="flex gap-2">
            <input
              className={`${inputClass} min-w-0 flex-1 font-mono`}
              type={showKey ? "text" : "password"}
              value={draft.apiKey}
              onChange={(e) => set({ apiKey: e.target.value })}
              placeholder={draft.provider === "gemini" ? "AIza…" : ""}
              spellCheck={false}
              autoComplete="off"
            />
            <button type="button" className={ghostButtonClass} onClick={() => setShowKey((v) => !v)} aria-pressed={showKey}>
              {showKey ? "Hide" : "Show"}
            </button>
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Model
          <input className={`${inputClass} font-mono`} value={draft.model} onChange={(e) => set({ model: e.target.value })} placeholder={preset.model || "model name"} spellCheck={false} autoComplete="off" />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={buttonClass} onClick={save} disabled={!hydrated || !dirty}>
          Save
        </button>
        <button type="button" className={ghostButtonClass} onClick={test} disabled={!hydrated || testing || !isConfigured(draft)}>
          {testing ? "Testing…" : "Test connection"}
        </button>
        {(saved.apiKey || saved.provider !== "gemini") && (
          <button
            type="button"
            className={`${ghostButtonClass} border-bad text-bad`}
            onClick={() => {
              aiSettings.clear();
              setStatus({ ok: true, text: "AI settings and key removed from this browser." });
            }}
          >
            Forget key
          </button>
        )}
      </div>
      <div aria-live="polite">{status && <p className={`mt-3 text-sm ${status.ok ? "text-good" : "text-bad"}`}>{status.text}</p>}</div>

      <details className="mt-4 text-sm text-muted">
        <summary className="cursor-pointer">Privacy and limits</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Your key is stored only in this browser&apos;s local storage. It is never in your progress export or cloud sync, and is sent only to the provider you picked.</li>
          <li>Requests go straight from your browser to the provider. What you type into AI features (answers, code, questions) is sent with the topic&apos;s notes.</li>
          <li>Google may use free-tier Gemini requests to improve its products. Don&apos;t paste anything private. Ollama keeps everything on your computer.</li>
          <li>Free tiers allow only a few requests per minute and a daily cap. If you hit it, wait a minute and try again.</li>
          <li>Anyone with access to this browser profile could read the key. Use Forget key on shared computers.</li>
        </ul>
      </details>
    </Card>
  );
}

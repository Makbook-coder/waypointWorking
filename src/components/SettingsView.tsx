"use client";

import { useRef, useState } from "react";
import { store, type Theme } from "@/lib/store";
import { useHydrated, useUserState } from "@/lib/use-store";
import { AISettingsPanel } from "./AISettingsPanel";
import { RoleToggle } from "./RoleToggle";
import { SyncPanel } from "./SyncPanel";
import { Card, SectionTitle, buttonClass, ghostButtonClass } from "./ui";

export function SettingsView() {
  const s = useUserState();
  const hydrated = useHydrated();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  function exportData() {
    const blob = new Blob([store.exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waypoint-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ ok: true, text: "Exported. Keep the file somewhere safe." });
  }

  async function importData(file: File) {
    const result = store.importJSON(await file.text());
    setMessage(result.ok ? { ok: true, text: "Imported. Your progress has been replaced with the file's contents." } : { ok: false, text: result.error });
    if (fileRef.current) fileRef.current.value = "";
  }

  function reset() {
    store.reset();
    setConfirming(false);
    setConfirmText("");
    setMessage({ ok: true, text: "All progress cleared." });
  }

  const themes: { id: Theme; label: string }[] = [
    { id: "system", label: "Match system" },
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <div aria-live="polite">
        {message && (
          <p className={`rounded-md border px-4 py-3 text-sm ${message.ok ? "border-good text-good" : "border-bad text-bad"}`}>{message.text}</p>
        )}
      </div>

      <Card>
        <SectionTitle>Theme</SectionTitle>
        <fieldset>
          <legend className="sr-only">Theme</legend>
          <div className="flex flex-wrap gap-2">
            {themes.map((t) => (
              <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded-md border border-line px-3 py-2 text-sm has-[:checked]:border-strong-line">
                <input type="radio" name="theme" value={t.id} checked={hydrated && s.settings.theme === t.id} onChange={() => store.setTheme(t.id)} className="accent-[var(--ink)]" />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card>
        <SectionTitle>Target role</SectionTitle>
        <p className="mb-3 text-sm text-muted">Optional. Changes how the dashboard ranks recommended levels using interview and job weights.</p>
        <RoleToggle />
      </Card>

      <AISettingsPanel />

      <SyncPanel />

      <Card>
        <SectionTitle>Your data</SectionTitle>
        <p className="mb-4 text-sm text-muted">
          Progress lives in this browser&apos;s local storage. Export a backup to move between devices or browsers.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonClass} onClick={exportData} disabled={!hydrated}>
            Export JSON
          </button>
          <button type="button" className={ghostButtonClass} onClick={() => fileRef.current?.click()} disabled={!hydrated}>
            Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-label="Choose a progress file to import"
            onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])}
          />
        </div>
      </Card>

      <Card className="border-bad/50">
        <SectionTitle>Reset</SectionTitle>
        {!confirming ? (
          <button type="button" className={`${ghostButtonClass} border-bad text-bad`} onClick={() => setConfirming(true)}>
            Reset all progress…
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm">
              This deletes every checkmark, note, bookmark, quiz result and review in this browser. It cannot be undone. Export first if you
              might want it back.
            </p>
            <label className="block text-sm">
              Type <strong>reset</strong> to confirm
              <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="mt-1 block w-40 rounded-md border border-line bg-surface px-3 py-1.5" autoFocus />
            </label>
            <div className="flex gap-2">
              <button type="button" className={`${buttonClass} border-bad bg-bad`} disabled={confirmText.trim().toLowerCase() !== "reset"} onClick={reset}>
                Delete everything
              </button>
              <button type="button" className={ghostButtonClass} onClick={() => { setConfirming(false); setConfirmText(""); }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

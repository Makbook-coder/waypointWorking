"use client";

import { useState } from "react";
import { syncClient } from "@/lib/sync/client";
import { useSync } from "@/lib/sync/use-sync";
import { Card, SectionTitle, buttonClass, ghostButtonClass, inputClass } from "./ui";

const fmtTime = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/** Settings card for the optional Supabase sync. Explains how to enable it when it's off. */
export function SyncPanel() {
  const sync = useSync();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!sync.configured) {
    return (
      <Card>
        <SectionTitle>Cloud sync</SectionTitle>
        <p className="text-sm text-muted">
          Off. Your progress lives only in this browser. To sync between devices, deploy your own copy with a free Supabase project. The README section &ldquo;Optional Supabase sync&rdquo; walks through it.
        </p>
      </Card>
    );
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await syncClient.sendMagicLink(email.trim());
    setBusy(false);
    if (err) setError(err);
    else setSent(email.trim());
  }

  function downloadOther() {
    const raw = syncClient.conflictCopy();
    if (!raw) return;
    const url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `waypoint-other-copy-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const st = sync.status;
  return (
    <Card>
      <SectionTitle>Cloud sync</SectionTitle>
      {!sync.ready ? (
        <p className="text-sm text-muted">Checking sign-in…</p>
      ) : !sync.email ? (
        sent ? (
          <p className="text-sm">
            Check <span className="font-semibold">{sent}</span> for a sign-in link. Open it on this device and you&apos;ll come back here signed in.
          </p>
        ) : (
          <form onSubmit={send} className="space-y-2">
            <p className="text-sm text-muted">Sign in with your email to keep progress in sync across devices. We send a one-time link; there&apos;s no password.</p>
            <label htmlFor="sync-email" className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Email
            </label>
            <div className="flex flex-wrap gap-2">
              <input id="sync-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} min-w-0 flex-1`} />
              <button type="submit" className={buttonClass} disabled={busy || !email.trim()}>
                {busy ? "Sending…" : "Send sign-in link"}
              </button>
            </div>
            {error && <p className="text-sm text-bad">{error}</p>}
          </form>
        )
      ) : (
        <div className="space-y-3 text-sm">
          <p>
            Signed in as <span className="font-semibold">{sync.email}</span>.
          </p>
          <p className="text-muted" aria-live="polite">
            {st.phase === "syncing"
              ? "Syncing…"
              : st.phase === "error"
                ? `Last sync failed: ${st.error}. Your progress is safe in this browser and will sync when the connection is back.`
                : st.lastSyncedAt
                  ? `Synced ${fmtTime(st.lastSyncedAt)}.`
                  : "Not synced yet."}
          </p>
          {(st.conflict || sync.hasConflictCopy) && (
            <div className="rounded-md border border-line bg-surface-2 p-3">
              <p>
                This device and the cloud both changed since the last sync.{" "}
                {st.conflict ? `The newer copy (${st.conflict.kept}) was kept.` : "The newer copy was kept."} You can download the other copy and import it if you need it.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" className={ghostButtonClass} onClick={downloadOther}>
                  Download the other copy
                </button>
                <button type="button" className={ghostButtonClass} onClick={() => syncClient.clearConflict()}>
                  Dismiss
                </button>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClass} disabled={st.phase === "syncing"} onClick={() => void syncClient.syncNow()}>
              Sync now
            </button>
            <button type="button" className={ghostButtonClass} onClick={() => void syncClient.signOut()}>
              Sign out
            </button>
          </div>
          <p className="text-xs text-muted">Signing out stops syncing. Your progress stays in this browser.</p>
        </div>
      )}
    </Card>
  );
}

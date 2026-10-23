"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { syncClient } from "@/lib/sync/client";
import { useSync } from "@/lib/sync/use-sync";

const fmtTime = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/** Header chip: initial + dropdown when signed in, a Sign in link when not. Hidden when sync is off. */
export function ProfileMenu() {
  const sync = useSync();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!sync.configured || !sync.ready) return null;

  if (!sync.email) {
    return (
      <Link href="/settings" className="rounded-md border border-line px-3 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-ink">
        Sign in
      </Link>
    );
  }

  const st = sync.status;
  const statusText =
    st.phase === "syncing" ? "Syncing…" : st.phase === "error" ? "Last sync failed" : st.lastSyncedAt ? `Synced ${fmtTime(st.lastSyncedAt)}` : "Not synced yet";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Signed in as ${sync.email}`}
        className="relative flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-semibold uppercase text-bg"
      >
        {sync.email[0]}
        <span
          aria-hidden="true"
          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg ${st.phase === "error" ? "bg-bad" : "bg-good"}`}
        />
      </button>
      {open && (
        <div role="dialog" aria-label="Account" className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-line bg-surface p-3 text-sm shadow-lg">
          <p className="text-xs uppercase tracking-wider text-muted">Signed in as</p>
          <p className="break-all font-semibold">{sync.email}</p>
          <p className="mt-1 text-xs text-muted" aria-live="polite">
            {statusText}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/settings" onClick={() => setOpen(false)} className="rounded-md border border-line px-3 py-1.5 text-sm hover:bg-surface-2">
              Sync settings
            </Link>
            <button
              type="button"
              className="rounded-md border border-line px-3 py-1.5 text-sm hover:bg-surface-2"
              onClick={() => {
                setOpen(false);
                void syncClient.signOut();
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

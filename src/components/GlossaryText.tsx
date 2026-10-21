"use client";

import Link from "next/link";
import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { getGlossaryEntry, linkTerms, type Segment } from "@/lib/glossary";

const codeClass = "rounded bg-surface-2 px-1 py-0.5 font-mono text-[0.9em]";

/** Renders one text with `code` spans and tap-to-define glossary terms. */
export function GlossaryText({ text, skip }: { text: string; skip?: string[] }) {
  return <Segments segments={linkTerms([text], skip)[0]} />;
}

/** Renders already-linked segments, so a group of texts can share "first mention only". */
export function Segments({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((s, i) =>
        s.kind === "code" ? (
          <code key={i} className={codeClass}>
            {s.text}
          </code>
        ) : s.kind === "term" ? (
          <Term key={i} slug={s.slug}>
            {s.text}
          </Term>
        ) : (
          <Fragment key={i}>{s.text}</Fragment>
        ),
      )}
    </>
  );
}

const WIDTH = 288;

/**
 * A dotted-underlined term. Hover or focus shows the definition on desktop; a tap toggles it on
 * touch screens. The card is positioned against the viewport so it never runs off a phone screen.
 */
export function Term({ slug, children }: { slug: string; children: React.ReactNode }) {
  const entry = getGlossaryEntry(slug);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; above: boolean } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLSpanElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const r = btn.current.getBoundingClientRect();
    const width = Math.min(WIDTH, window.innerWidth - 16);
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    const above = r.bottom + 160 > window.innerHeight && r.top > 180;
    setPos({ left, top: above ? r.top - 6 : r.bottom + 6, above });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!btn.current?.contains(t) && !card.current?.contains(t)) setOpen(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  if (!entry) return <>{children}</>;

  const hover = (next: boolean) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(next), next ? 150 : 200);
  };

  return (
    <span onPointerEnter={hover(true)} onPointerLeave={hover(false)}>
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((o) => !o)}
        className="cursor-help underline decoration-muted decoration-dotted decoration-1 underline-offset-[3px] hover:decoration-ink"
      >
        {children}
      </button>
      {open && (
        <span
          ref={card}
          id={id}
          role="tooltip"
          className="fixed z-50 block rounded-md border border-strong-line bg-surface p-3 text-left text-sm font-normal normal-case leading-relaxed tracking-normal text-ink shadow-lg"
          style={{
            width: Math.min(WIDTH, typeof window === "undefined" ? WIDTH : window.innerWidth - 16),
            left: pos?.left ?? 8,
            top: pos?.top ?? 0,
            transform: pos?.above ? "translateY(-100%)" : undefined,
            visibility: pos ? "visible" : "hidden",
          }}
        >
          <span className="block font-semibold">{entry.term}</span>
          <span className="mt-1 block">
            <PlainCode text={entry.plain} />
          </span>
          <Link href={`/glossary#${entry.slug}`} className="mt-2 inline-block text-xs text-muted underline underline-offset-2 hover:text-ink">
            Open in glossary
          </Link>
        </span>
      )}
    </span>
  );
}

function PlainCode({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.length > 1 && part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} className={codeClass}>
            {part.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

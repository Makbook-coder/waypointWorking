"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getModule, getTopic, levels, moduleHref } from "@/lib/data";
import { toDay } from "@/lib/dates";
import { dueReviews } from "@/lib/progress";
import { shakyTopicIds } from "@/lib/insights";
import { store } from "@/lib/store";
import { useHydrated, useUserState } from "@/lib/use-store";
import { topicVideo } from "@/lib/youtube";
import { EmptyState, buttonClass, ghostButtonClass, inputClass } from "./ui";

type Deck = "due" | "shaky" | "module";

/**
 * Flashcards built from topics: the front is the topic, the back is its description and
 * the module's mental model. In the "due" deck, answers drive the spaced-review schedule.
 */
export function Flashcards() {
  const s = useUserState();
  const hydrated = useHydrated();
  const [deck, setDeck] = useState<Deck>("due");
  const [moduleId, setModuleId] = useState("M0.1");
  const [cards, setCards] = useState<string[]>([]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState({ remembered: 0, forgot: 0 });

  const today = toDay(new Date());
  const due = useMemo(() => dueReviews(s, today), [s, today]);
  const shaky = useMemo(() => shakyTopicIds(s), [s]);

  // Snapshot the deck when it is chosen, so answering a card doesn't reshuffle the queue mid-session.
  function start(d: Deck, mId = moduleId) {
    const ids = d === "due" ? dueReviews(store.getState(), today) : d === "shaky" ? shakyTopicIds(store.getState()) : (getModule(mId)?.topics.map((t) => t.id) ?? []);
    setDeck(d);
    setCards(ids);
    setI(0);
    setFlipped(false);
    setTally({ remembered: 0, forgot: 0 });
  }

  useEffect(() => {
    if (hydrated) start("due");
    // only on first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function answer(remembered: boolean) {
    const id = cards[i];
    if (deck === "due") store.reviewTopic(id, remembered);
    else if (!remembered) store.setConfidence(id, 1);
    else if (s.topics[id]?.confidence === 1) store.setConfidence(id, 2);
    setTally((t) => (remembered ? { ...t, remembered: t.remembered + 1 } : { ...t, forgot: t.forgot + 1 }));
    setFlipped(false);
    setI((n) => n + 1);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select")) return;
      if (i >= cards.length) return;
      if (e.key === " " || e.key === "Enter") {
        if (el.closest("button, a")) return;
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && e.key === "1") answer(false);
      else if (flipped && e.key === "2") answer(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!hydrated) return null;
  const current = cards[i] ? getTopic(cards[i]) : undefined;
  const finished = cards.length > 0 && i >= cards.length;

  return (
    <div className="max-w-2xl">
      <div role="group" aria-label="Deck" className="mb-4 flex flex-wrap items-end gap-2">
        <DeckButton active={deck === "due"} onClick={() => start("due")} label="Due today" count={due.length} />
        <DeckButton active={deck === "shaky"} onClick={() => start("shaky")} label="Shaky topics" count={shaky.length} />
        <DeckButton active={deck === "module"} onClick={() => start("module")} label="A module" />
        {deck === "module" && (
          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wider text-muted">
            Module
            <select
              value={moduleId}
              onChange={(e) => {
                setModuleId(e.target.value);
                start("module", e.target.value);
              }}
              className={`${inputClass} max-w-72 normal-case tracking-normal`}
            >
              {levels.map((l) => (
                <optgroup key={l.id} label={`L${l.id} ${l.title}`}>
                  {l.modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} {m.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        )}
      </div>
      <p className="mb-4 text-sm text-muted">
        {deck === "due"
          ? "Topics you marked done, on their 1, 3, 7 and 21 day schedule. Your answers move them along."
          : deck === "shaky"
            ? "Topics you rated 1 (Shaky). Remembering one bumps it to 2 (Okay)."
            : "Every topic in one module. Forgetting a card marks it Shaky so it shows up in that deck."}
      </p>

      {cards.length === 0 ? (
        <EmptyState>
          {deck === "due" ? "Nothing due today. Mark topics done and they'll come back here on schedule." : deck === "shaky" ? "No shaky topics. Rate a topic 1 to add it." : "This module has no topics."}
        </EmptyState>
      ) : finished ? (
        <div className="rounded-lg border border-line bg-surface p-6 text-center" role="status">
          <p className="text-sm uppercase tracking-wider text-muted">Deck finished</p>
          <p className="num mt-2 text-3xl font-bold">
            {tally.remembered} remembered · {tally.forgot} to revisit
          </p>
          <button type="button" className={`${buttonClass} mt-4`} onClick={() => start(deck)}>
            {deck === "due" ? "Check for more" : "Go again"}
          </button>
        </div>
      ) : current ? (
        <div>
          <p className="num mb-2 text-xs text-muted">
            Card {i + 1} of {cards.length}
          </p>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? "Hide answer" : "Show answer"}
            aria-expanded={flipped}
            className="block min-h-64 w-full rounded-xl border border-line bg-surface p-6 text-left shadow-[0_1px_0_var(--line),0_8px_24px_-12px_rgba(0,0,0,0.25)] hover:border-strong-line"
          >
            <span className="font-mono text-xs text-muted">
              {current.module.id} · {current.module.title}
            </span>
            <span className="mt-3 block text-2xl font-bold leading-snug">{current.topic.title}</span>
            {!flipped ? (
              <span className="mt-6 block text-sm text-muted">Explain it to yourself, then press Space or click to check.</span>
            ) : (
              <span className="mt-4 block space-y-3 border-t border-line pt-4 text-base leading-relaxed">
                <span className="block">{current.topic.description}</span>
                {current.module.mentalModel && (
                  <span className="block text-sm text-muted">
                    <strong className="font-semibold text-ink">Mental model:</strong> {current.module.mentalModel}
                  </span>
                )}
              </span>
            )}
          </button>
          {flipped && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" className={ghostButtonClass} onClick={() => answer(false)}>
                Forgot <kbd className="ml-1 font-mono text-[10px] text-muted">1</kbd>
              </button>
              <button type="button" className={buttonClass} onClick={() => answer(true)}>
                Remembered <kbd className="ml-1 font-mono text-[10px] opacity-70">2</kbd>
              </button>
              <span className="ml-auto flex gap-3 text-sm">
                <a href={topicVideo(current.topic, current.module).url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  YouTube<span className="sr-only"> search (opens in a new tab)</span>
                </a>
                <Link href={moduleHref(current.module.id)} className="underline underline-offset-2">
                  Open module
                </Link>
              </span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function DeckButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count?: number }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm aria-pressed:border-strong-line aria-pressed:bg-ink aria-pressed:text-bg"
    >
      {label}
      {count !== undefined && <span className="num ml-1.5 text-xs opacity-70">{count}</span>}
    </button>
  );
}

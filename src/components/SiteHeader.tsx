"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FocusPill } from "./FocusPill";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/practice", label: "Practice" },
  { href: "/interview", label: "Interview" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/glossary", label: "Glossary" },
  { href: "/plan", label: "Plan" },
  { href: "/progress", label: "Progress" },
  { href: "/bookmarks", label: "Bookmarks" },
  { href: "/search", label: "Search" },
  { href: "/settings", label: "Settings" },
];

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <header className="sticky top-0 z-40 print:hidden border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="Waypoint home">
          <Logo />
          <span>Waypoint</span>
        </Link>
        <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-0.5 xl:gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active(l.href) ? "page" : undefined}
                  className="rounded-md px-2 py-1.5 text-sm text-muted xl:px-2.5 hover:bg-surface-2 hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-bg"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto lg:ml-0">
          <FocusPill />
        </div>
        <button
          type="button"
          className="rounded-md border border-line px-3 py-1.5 text-sm lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          Menu
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-line lg:hidden">
          <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-1 px-4 py-2 sm:grid-cols-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={active(l.href) ? "page" : undefined}
                  className="block rounded-md px-3 py-2 text-sm aria-[current=page]:bg-ink aria-[current=page]:text-bg"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function Logo() {
  // A tiny transit-map glyph: seven stops on a bent line, one per phase.
  const stops = ["--phase-1", "--phase-2", "--phase-3", "--phase-4", "--phase-5", "--phase-6", "--phase-7"];
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden="true">
      <path d="M2 16 L10 16 L18 4 L26 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {stops.map((v, i) => {
        const pts = [[2, 16], [6, 16], [10, 16], [14, 10], [18, 4], [22, 4], [26, 4]];
        return <circle key={v} cx={pts[i][0]} cy={pts[i][1]} r="2.2" fill={`var(${v})`} />;
      })}
    </svg>
  );
}

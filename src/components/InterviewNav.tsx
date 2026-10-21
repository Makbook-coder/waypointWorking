"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/interview", label: "Mock interview" },
  { href: "/interview/company", label: "By company" },
  { href: "/interview/drill", label: "Company drills" },
  { href: "/interview/system-design", label: "System design" },
  { href: "/interview/debug", label: "Debug the snippet" },
];

/** Tabs across the interview preparation pages. */
export function InterviewNav() {
  const path = usePathname();
  return (
    <nav aria-label="Interview preparation" className="mb-6 flex flex-wrap gap-2 text-sm">
      {LINKS.map((l) => {
        const current = path === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={current ? "page" : undefined}
            className={`rounded-md border px-3 py-1.5 ${current ? "border-strong-line bg-ink text-bg" : "border-line text-muted hover:text-ink"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

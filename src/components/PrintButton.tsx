"use client";

import { ghostButtonClass } from "./ui";

export function PrintButton({ label = "Print or save as PDF" }: { label?: string }) {
  return (
    <button type="button" className={`${ghostButtonClass} print:hidden`} onClick={() => window.print()}>
      {label}
    </button>
  );
}

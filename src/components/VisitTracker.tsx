"use client";

import { useEffect } from "react";
import { store } from "@/lib/store";

/** Records this page as "where you left off". */
export function VisitTracker({ href, title }: { href: string; title: string }) {
  useEffect(() => {
    store.visit(href, title);
  }, [href, title]);
  return null;
}

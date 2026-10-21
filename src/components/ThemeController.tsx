"use client";

import { useEffect } from "react";
import { store, STORAGE_KEY } from "@/lib/store";
import { useUserState } from "@/lib/use-store";

/** Keeps <html data-theme> in sync with settings, and picks up changes made in other tabs. */
export function ThemeController() {
  const { theme } = useUserState().settings;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) store.reload();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}

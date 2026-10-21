"use client";

import { useEffect } from "react";
import { syncConfigured } from "@/lib/sync/config";

/** Starts cloud sync when it is configured; renders nothing. */
export function SyncBoot() {
  useEffect(() => {
    if (!syncConfigured) return;
    void import("@/lib/sync/client").then(({ syncClient }) => syncClient.boot());
  }, []);
  return null;
}

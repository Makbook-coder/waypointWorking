"use client";

import { useSyncExternalStore } from "react";
import { syncClient, type SyncSnapshot } from "./client";

const SERVER: SyncSnapshot = { configured: false, ready: false, email: null, status: { phase: "idle", lastSyncedAt: null, error: null, conflict: null }, hasConflictCopy: false };

export const useSync = () => useSyncExternalStore(syncClient.subscribe, syncClient.getSnapshot, () => SERVER);

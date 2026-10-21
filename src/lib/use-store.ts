"use client";

import { useSyncExternalStore } from "react";
import { emptyState, store, type UserState } from "./store";

const SERVER_STATE: UserState = emptyState();
const noop = () => () => {};

/** Current user state. Renders the empty state on the server and during hydration. */
export function useUserState(): UserState {
  return useSyncExternalStore(store.subscribe, store.getState, () => SERVER_STATE);
}

/** False during SSR and hydration, true once running in the browser with real state loaded. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

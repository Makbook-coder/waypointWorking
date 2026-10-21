"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { aiSettings, defaultAISettings, isConfigured, type AISettings } from "./config";
import { AIError, createProvider, describeAIError, type Provider } from "./provider";

const SERVER_SETTINGS = defaultAISettings();

export function useAISettings(): AISettings {
  return useSyncExternalStore(aiSettings.subscribe, aiSettings.get, () => SERVER_SETTINGS);
}

/** Whether the AI tutor can be used right now. False during SSR. */
export function useAIConfigured(): boolean {
  return isConfigured(useAISettings());
}

/**
 * Run one AI request at a time from a component: tracks loading and a friendly error, and cancels the
 * request on unmount or when a new one starts.
 */
export function useAIRequest() {
  const settings = useAISettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => () => ctrl.current?.abort(), []);

  const run = useCallback(
    async <T,>(fn: (p: Provider, signal: AbortSignal) => Promise<T>): Promise<T | null> => {
      ctrl.current?.abort();
      const c = new AbortController();
      ctrl.current = c;
      setError(null);
      if (!isConfigured(settings)) {
        setError(describeAIError(new AIError("not-configured", "")));
        return null;
      }
      setLoading(true);
      try {
        return await fn(createProvider(settings), c.signal);
      } catch (e) {
        if (!c.signal.aborted) setError(describeAIError(e));
        return null;
      } finally {
        if (ctrl.current === c) {
          setLoading(false);
          ctrl.current = null;
        }
      }
    },
    [settings],
  );

  const cancel = useCallback(() => {
    ctrl.current?.abort();
    ctrl.current = null;
    setLoading(false);
  }, []);

  return { run, loading, error, cancel, configured: isConfigured(settings), clearError: () => setError(null) };
}

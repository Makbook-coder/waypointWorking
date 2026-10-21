"use client";

import { useEffect } from "react";
import { store } from "@/lib/store";

const IDLE_AFTER_MS = 3 * 60_000;

/**
 * Counts focused study time: one minute is added for each minute the tab is visible
 * and the learner has scrolled, typed or clicked within the last three minutes.
 */
export function StudyTimer() {
  useEffect(() => {
    let lastInput = Date.now();
    const touch = () => {
      lastInput = Date.now();
    };
    const events = ["pointerdown", "keydown", "scroll", "wheel", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const tick = setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - lastInput < IDLE_AFTER_MS) store.addStudyMinutes(1);
    }, 60_000);
    return () => {
      clearInterval(tick);
      events.forEach((e) => window.removeEventListener(e, touch));
    };
  }, []);
  return null;
}

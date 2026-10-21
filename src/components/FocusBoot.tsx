"use client";

import { useEffect } from "react";
import { checkTimer, useTimer } from "@/lib/use-timer";

/** Ends timer phases on time from any page, with a short chime and an optional notification. */
export function FocusBoot() {
  const running = useTimer().running;
  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const before = Date.now();
      const finished = checkTimer(before);
      if (finished) announce("Focus block done", `${finished.minutes} minutes logged. Take a break.`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running]);
  return null;
}

function announce(title: string, body: string) {
  chime();
  try {
    if ("Notification" in window && Notification.permission === "granted" && document.visibilityState !== "visible") {
      new Notification(title, { body, tag: "waypoint-focus" });
    }
  } catch {
    // notifications unsupported in this context
  }
}

function chime() {
  try {
    const ctx = new AudioContext();
    [0, 0.25].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.2);
    });
    setTimeout(() => void ctx.close(), 800);
  } catch {
    // audio blocked until the page has had a user gesture
  }
}

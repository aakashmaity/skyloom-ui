"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { MotionConfig } from "motion/react";

export type MotionPreference = "inherit" | "none";
const Playback = createContext(true);
const listeners = new Set<() => void>();
let disconnect: (() => void) | undefined;
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!disconnect && typeof document !== "undefined") {
    const notify = () => listeners.forEach(fn => fn());
    const observer = new MutationObserver(notify);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion", "data-theme", "data-palette", "data-font", "data-density", "class", "style", "dir"] });
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    media?.addEventListener("change", notify);
    document.addEventListener("visibilitychange", notify);
    disconnect = () => { observer.disconnect(); media?.removeEventListener("change", notify); document.removeEventListener("visibilitychange", notify); disconnect = undefined; };
  }
  return () => { listeners.delete(listener); if (!listeners.size) disconnect?.(); };
}
function snapshot() {
  const root = document.documentElement;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  return JSON.stringify([root.getAttribute("data-motion"), !!reduced, document.hidden, root.getAttribute("data-theme"), root.getAttribute("data-palette"), root.getAttribute("data-font"), root.getAttribute("data-density"), root.getAttribute("style"), root.className]);
}
const serverSnapshot = () => '["none",true,false]';

/** Also works without ThemeProvider. CSS and JavaScript share the root preference. */
export function useMotionPolicy(motion: MotionPreference = "inherit") {
  const themeKey = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [preference, reduced, hidden] = JSON.parse(themeKey) as [string, boolean, boolean];
  const playing = useContext(Playback);
  const settings = useMemo(() => {
    const style = typeof document === "undefined" ? undefined : getComputedStyle(document.documentElement);
    const number = (name: string, fallback: number) => parseFloat(style?.getPropertyValue(name) ?? "") || fallback;
    const rawDuration = style?.getPropertyValue("--sky-duration-enter").trim();
    const duration = number("--sky-duration-enter", 220) * (rawDuration?.endsWith("s") && !rawDuration.endsWith("ms") ? 1000 : 1);
    return { duration: duration / 1000, stiffness: number("--sky-spring-stiffness", 180), damping: number("--sky-spring-damping", 18) };
  }, [themeKey]);
  return { settings, enabled: motion !== "none" && preference !== "none" && preference !== "reduced" && !reduced && !hidden && playing, visible: !hidden, playing, themeKey };
}

export function useAnimationActivity<T extends Element = HTMLDivElement>(motion: MotionPreference = "inherit") {
  const [node, ref] = useState<T | null>(null);
  const [inView, setInView] = useState(false);
  const policy = useMotionPolicy(motion);
  useEffect(() => {
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);
  return { ...policy, enabled: policy.enabled && inView, inView, node, ref };
}

export function AnimationBoundary({ playing = true, children }: { playing?: boolean; children: ReactNode }) {
  const parent = useContext(Playback);
  const policy = useMotionPolicy();
  return <Playback.Provider value={parent && playing}><MotionConfig reducedMotion={policy.enabled && playing ? "never" : "always"}><div data-sky-paused={!playing || !policy.enabled ? "true" : undefined}>{children}</div></MotionConfig></Playback.Provider>;
}

"use client";
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { Icon } from "./icon";
import { Button } from "./button";
import { useAnimationActivity } from "./motion";
import { cn } from "../lib/utils";

export type CompareProps = { before: ReactNode; after: ReactNode; beforeLabel?: string; afterLabel?: string; value?: number; defaultValue?: number; onValueChange?: (value: number) => void; orientation?: "horizontal" | "vertical"; interaction?: "drag" | "hover"; variant?: "default" | "classic" | "modern"; autoplay?: boolean; className?: string };
export function Compare({ before, after, beforeLabel = "Before", afterLabel = "After", value: controlled, defaultValue = 50, onValueChange, orientation = "horizontal", interaction = "drag", variant = "default", autoplay = false, className }: CompareProps) {
  const [internal, setInternal] = useState(defaultValue), [dragging, setDragging] = useState(false), [paused, setPaused] = useState(false);
  const activity = useAnimationActivity(), pointer = useRef<number | null>(null);
  const value = Math.max(0, Math.min(100, Number.isFinite(controlled ?? internal) ? controlled ?? internal : 50));
  const latest = useRef(onValueChange); latest.current = onValueChange;
  function change(next: number) { const clamped = Math.max(0, Math.min(100, next)); if (controlled === undefined) setInternal(clamped); latest.current?.(clamped); }
  useEffect(() => {
    if (!autoplay || paused || dragging || !activity.enabled || controlled !== undefined) return;
    let frame = 0; const start = performance.now();
    const tick = (time: number) => { const next = 50 + Math.sin((time - start) / 1500) * 45; setInternal(next); latest.current?.(next); frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [autoplay, paused, dragging, activity.enabled, controlled]);
  function move(event: React.PointerEvent<HTMLDivElement>) {
    if (pointer.current !== event.pointerId && !(interaction === "hover" && event.pointerType === "mouse")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const size = orientation === "horizontal" ? rect.width : rect.height;
    if (size) change(((orientation === "horizontal" ? event.clientX - rect.left : event.clientY - rect.top) / size) * 100);
  }
  return <div className={cn("grid gap-control", className)}><div ref={activity.ref} data-variant={variant} data-dragging={dragging && activity.enabled} data-orientation={orientation} className="sky-compare sky-advanced-surface relative isolate h-chart overflow-hidden" onPointerDown={event => { pointer.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); setPaused(true); move(event); }} onPointerMove={move} onPointerUp={event => { if (pointer.current === event.pointerId) { setDragging(false); pointer.current = null; event.currentTarget.releasePointerCapture(event.pointerId); } }} onPointerCancel={() => { setDragging(false); pointer.current = null; }}>
    <div className="absolute inset-0" aria-label={afterLabel} inert>{after}</div><div className="absolute inset-0" aria-label={beforeLabel} inert style={{ clipPath: orientation === "horizontal" ? `inset(0 ${100 - value}% 0 0)` : `inset(0 0 ${100 - value}% 0)` }}>{before}</div>
    <span className="pointer-events-none absolute start-control top-control rounded-control bg-card p-control text-caption text-card-foreground">{beforeLabel}</span><span className="pointer-events-none absolute end-control bottom-control rounded-control bg-card p-control text-caption text-card-foreground">{afterLabel}</span>
    <div className="sky-compare-divider pointer-events-none absolute" style={(orientation === "horizontal" ? { left: `${value}%`, top: 0, height: "100%" } : { top: `${value}%`, left: 0, width: "100%" }) as CSSProperties}><span className="sky-compare-handle absolute flex size-touch items-center justify-center rounded-capsule bg-card text-card-foreground shadow-floating"><Icon name="compare" className={orientation === "vertical" ? "rotate-90" : undefined} /></span>{variant === "modern" && dragging && activity.enabled && [0, 1, 2, 3, 4, 5].map(index => <i key={index} aria-hidden="true" className="sky-compare-particle" style={{ "--sky-index": index } as CSSProperties} />)}</div>
  </div><label className="flex min-w-0 items-center gap-control text-caption"><span>Compare {beforeLabel} and {afterLabel}</span><input aria-label={`Compare ${beforeLabel} and ${afterLabel}`} type="range" min={0} max={100} value={value} className="sky-focus min-h-touch min-w-0 flex-1 accent-primary" onFocus={() => setPaused(true)} onChange={event => change(Number(event.target.value))} /></label>{autoplay && <Button variant="outline" onClick={() => setPaused(!paused)}>{paused ? "Play comparison" : "Pause comparison"}</Button>}</div>;
}
export const CompareSlider = Compare;

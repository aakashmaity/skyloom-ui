"use client";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { motion as animated } from "motion/react";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card";
import { useAnimationActivity, type MotionPreference } from "./motion";
import { canvas2D, resolveCanvasColor } from "../lib/canvas-tokens";
import { cn } from "../lib/utils";

const segments = (text: string) => Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), part => part.segment);
export type TextEffectProps = { text: string; className?: string; duration?: number; motion?: MotionPreference; replayKey?: string | number };
function RevealText({ text, className, duration = 1200, motion, replayKey, effect }: TextEffectProps & { effect: "encrypted" | "generate" | "typewriter" | "board" }) {
  const activity = useAnimationActivity<HTMLSpanElement>(motion), [count, setCount] = useState(0), [tick, setTick] = useState(0);
  const units = useMemo(() => effect === "generate" ? text.split(/(\s+)/) : segments(text), [text, effect]);
  const started = useRef(false), completed = useRef(false), elapsed = useRef(0);
  useEffect(() => { setCount(0); elapsed.current = 0; started.current = false; completed.current = false; }, [text, replayKey]);
  useEffect(() => {
    if (!activity.enabled || completed.current) return;
    started.current = true;
    const start = performance.now() - elapsed.current;
    const ms = Math.max(100, Number.isFinite(duration) ? duration : 1200);
    const timer = setInterval(() => { elapsed.current = performance.now() - start; const next = Math.min(units.length, Math.floor(elapsed.current / ms * units.length)); setCount(next); setTick(value => value + 1); if (next >= units.length) { completed.current = true; clearInterval(timer); } }, 40);
    return () => clearInterval(timer);
  }, [activity.enabled, units.length, duration, text, replayKey]);
  const shown = !activity.enabled ? units.length : count;
  return <span ref={activity.ref} className={cn("inline-block whitespace-pre-wrap", className)} aria-label={text}><span aria-hidden="true">{units.map((unit, index) => <span key={index} className={cn(effect === "board" && "sky-flap", effect === "generate" && "sky-word-reveal")} style={{ opacity: index < shown || effect === "encrypted" || effect === "board" ? 1 : 0, transform: effect === "board" && index >= shown ? "rotateX(70deg)" : undefined }}>{index < shown ? unit : effect === "encrypted" && !/\s/.test(unit) ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[(index * 7 + tick * 13) % 36] : unit}</span>)}{effect === "typewriter" && activity.enabled && !completed.current && <span className="sky-text-cursor">|</span>}</span></span>;
}
export const EncryptedText = (props: TextEffectProps) => <RevealText {...props} effect="encrypted" />;
export const TextGenerateEffect = ({ words, ...props }: Omit<TextEffectProps, "text"> & { words: string }) => <RevealText {...props} text={words} effect="generate" />;
export const TypewriterEffect = (props: TextEffectProps) => <RevealText {...props} effect="typewriter" />;
export const TextFlippingBoard = (props: TextEffectProps) => <RevealText {...props} effect="board" />;

export type FlipWordsProps = { words: readonly string[]; interval?: number; className?: string; motion?: MotionPreference; text?: string };
function CyclingWords({ words, interval = 3000, className, motion, text, effect }: FlipWordsProps & { effect: "words" | "layout" | "container" }) {
  const activity = useAnimationActivity<HTMLDivElement>(motion), [index, setIndex] = useState(0), [playing, setPlaying] = useState(true), [revision, setRevision] = useState(0);
  useEffect(() => { if (!activity.enabled || !playing || words.length < 2) return; const timer = setInterval(() => setIndex(value => (value + 1) % words.length), Math.max(300, Number.isFinite(interval) ? interval : 3000)); return () => clearInterval(timer); }, [activity.enabled, playing, words.length, interval]);
  const value = words[index % Math.max(1, words.length)] ?? "";
  return <div ref={activity.ref} className={cn("flex flex-wrap items-center gap-control", className)}>{text && <span>{text}</span>}<animated.span layout={effect !== "words" && activity.enabled} className={cn("inline-block overflow-hidden", effect === "container" && "rounded-control bg-secondary px-inline py-control")}><animated.span key={`${index}-${revision}`} initial={activity.enabled ? { y: "75%", opacity: 0, rotateX: -45 } : false} animate={{ y: "0%", opacity: 1, rotateX: 0 }} transition={{ duration: activity.enabled ? .3 : 0 }} className="inline-block">{value}</animated.span></animated.span>{words.length > 1 && <span className="inline-flex gap-control"><Button size="sm" variant="ghost" onClick={() => setPlaying(!playing)}>{playing ? "Pause words" : "Play words"}</Button><Button size="sm" variant="ghost" onClick={() => { setIndex(0); setRevision(value => value + 1); }}>Replay words</Button></span>}</div>;
}
export const FlipWords = (props: FlipWordsProps) => <CyclingWords {...props} effect="words" />;
export const LayoutTextFlip = (props: FlipWordsProps) => <CyclingWords {...props} effect="layout" />;
export const ContainerTextFlip = (props: FlipWordsProps) => <CyclingWords {...props} effect="container" />;

export function ColourfulText({ text, className, motion }: TextEffectProps) { const activity = useAnimationActivity<HTMLSpanElement>(motion); return <span ref={activity.ref} aria-label={text} data-running={activity.enabled} className={cn("sky-colourful whitespace-pre-wrap", className)}>{segments(text).map((char, index) => <span key={index} aria-hidden="true" style={{ "--sky-index": index, color: `var(--chart-${index % 5 + 1})` } as CSSProperties}>{char}</span>)}</span>; }
export function SquigglyText({ children, className, motion }: { children: ReactNode; className?: string; motion?: MotionPreference }) { const id = useId(), activity = useAnimationActivity<HTMLSpanElement>(motion); return <span ref={activity.ref} data-running={activity.enabled} className={cn("sky-squiggly inline-block", className)}><svg aria-hidden="true" className="absolute size-0"><defs><filter id={id}><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves={2} seed={3} /><feDisplacementMap in="SourceGraphic" scale={activity.enabled ? 3 : 0} /></filter></defs></svg><span style={{ filter: activity.enabled ? `url(#${id})` : undefined }}>{children}</span></span>; }
export function CanvasText({ text, className, motion }: TextEffectProps) {
  const activity = useAnimationActivity<HTMLSpanElement>(motion), canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = activity.node, surface = canvas.current;
    if (!element || !surface) return;
    const ctx = canvas2D(surface); if (!ctx) return;
    const color = resolveCanvasColor(element, "var(--primary)"), accent = resolveCanvasColor(element, "var(--info)");
    let frame = 0;
    const draw = (time: number) => {
      const rect = element.getBoundingClientRect(), ratio = Math.min(devicePixelRatio || 1, 2);
      if (!rect.width || !rect.height) return;
      if (surface.width !== Math.ceil(rect.width * ratio) || surface.height !== Math.ceil(rect.height * ratio)) { surface.width = Math.ceil(rect.width * ratio); surface.height = Math.ceil(rect.height * ratio); }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, rect.width, rect.height);
      const style = getComputedStyle(element); ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`; ctx.textBaseline = "middle"; ctx.fillStyle = color; ctx.fillText(text, 0, rect.height / 2, rect.width);
      ctx.globalCompositeOperation = "source-atop"; ctx.strokeStyle = accent; ctx.lineWidth = rect.height / 8;
      for (let i = -2; i < 8; i++) { const x = i * rect.width / 5 + Math.sin(time / 1200) * rect.width / 5; ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + rect.height, rect.height / 3, x - rect.height, rect.height * .7, x, rect.height); ctx.stroke(); }
      ctx.globalCompositeOperation = "source-over";
      if (activity.enabled) frame = requestAnimationFrame(draw);
    };
    const resize = () => { cancelAnimationFrame(frame); draw(performance.now()); };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [activity.node, activity.enabled, activity.themeKey, text]);
  return <span ref={activity.ref} className={cn("relative inline-block text-title font-semibold", className)}><span>{text}</span><canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" /></span>;
}
export function TextHoverEffect({ text, className }: TextEffectProps) { const activity = useAnimationActivity<HTMLSpanElement>(); const [position, setPosition] = useState(50); return <span ref={activity.ref} className={cn("sky-text-hover inline-block text-title font-semibold", className)} style={{ "--sky-text-position": `${position}%` } as CSSProperties} onPointerMove={event => { if (!activity.enabled || event.pointerType === "touch") return; const rect = event.currentTarget.getBoundingClientRect(); setPosition((event.clientX - rect.left) / rect.width * 100); }}>{text}</span>; }
export function HeroHighlight({ children, className }: { children: ReactNode; className?: string }) { return <div className={cn("sky-hero-highlight rounded-surface p-panel", className)}>{children}</div>; }
export function Highlight({ children, className }: { children: ReactNode; className?: string }) { return <mark className={cn("rounded-control bg-secondary px-control text-primary", className)}>{children}</mark>; }
export function TextRevealCard({ text, revealText, title = "Reveal another perspective", description, className }: { text: string; revealText: string; title?: string; description?: string; className?: string }) {
  const [revealed, setRevealed] = useState(false), [amount, setAmount] = useState(0), activity = useAnimationActivity();
  return <Card className={className}><CardHeader><CardTitle>{title}</CardTitle>{description && <CardDescription>{description}</CardDescription>}</CardHeader><CardContent><div ref={activity.ref} className="relative overflow-hidden py-panel text-title font-semibold" onPointerMove={event => { if (event.pointerType === "mouse" && activity.enabled) { const rect = event.currentTarget.getBoundingClientRect(); setAmount((event.clientX - rect.left) / rect.width * 100); } }} onPointerLeave={() => setAmount(0)}><span>{text}</span><span aria-hidden={!revealed} className="absolute inset-0 bg-card py-panel text-primary" style={{ clipPath: `inset(0 ${100 - (revealed ? 100 : amount)}% 0 0)` }}>{revealText}</span></div><Button variant="outline" aria-expanded={revealed} onClick={() => setRevealed(!revealed)}>{revealed ? "Show original" : "Reveal text"}</Button>{!revealed && <span className="sr-only">{revealText}</span>}</CardContent></Card>;
}

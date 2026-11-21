"use client";
import { useRef, type ReactNode } from "react";
import { motion as animated, useScroll } from "motion/react";
import { useMotionPolicy } from "./motion";
import { cn } from "../lib/utils";
export type TimelineItem = { id: string; title: string; content: ReactNode; date?: string };
export function Timeline({ items, variant = "simple", className }: { items: readonly TimelineItem[]; variant?: "simple" | "progress"; className?: string }) {
  const ref = useRef<HTMLDivElement>(null), { enabled } = useMotionPolicy();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end center"] });
  return <div ref={ref} className={cn("relative grid gap-panel ps-panel", className)}><span aria-hidden="true" className="absolute inset-y-0 start-0 w-hairline bg-border" />{variant === "progress" && <animated.span aria-hidden="true" className="absolute inset-y-0 start-0 w-hairline origin-top bg-primary" style={{ scaleY: enabled ? scrollYProgress : 1 }} />}<ol className="grid gap-panel">{items.map(item => <li key={item.id} className="grid min-w-0 gap-stack tablet:grid-cols-3"><div className="min-w-0"><h3 className="text-title font-semibold">{item.title}</h3>{item.date && <time className="text-caption text-muted-foreground">{item.date}</time>}</div><div className="min-w-0 text-label leading-body tablet:col-span-2">{item.content}</div></li>)}</ol></div>;
}

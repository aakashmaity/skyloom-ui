"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./dialog";
import { Icon } from "./icon";
import { Loader } from "./loader";
import { useMotionPolicy } from "./motion";
import { cn } from "../lib/utils";

export type LoadingState = { text: string; id?: string };
export type MultiStepLoaderProps = { loadingStates: readonly LoadingState[]; loading: boolean; onLoadingChange?: (loading: boolean) => void; duration?: number; loop?: boolean; activeStep?: number; presentation?: "modal" | "inline"; title?: string; className?: string };
export function MultiStepLoader({ loadingStates, loading, onLoadingChange, duration = 2000, loop = true, activeStep, presentation = "modal", title = "Working on your request", className }: MultiStepLoaderProps) {
  const [step, setStep] = useState(0);
  const { visible, playing } = useMotionPolicy();
  const interval = Number.isFinite(duration) && duration > 0 ? duration : 2000;
  const count = loadingStates.length;
  useEffect(() => { if (!loading) setStep(0); }, [loading]);
  useEffect(() => {
    if (!loading || !visible || !playing || activeStep !== undefined || count === 0 || (!loop && step >= count)) return;
    const timer = window.setInterval(() => setStep(current => loop ? (current + 1) % count : Math.min(current + 1, count)), interval);
    return () => clearInterval(timer);
  }, [loading, visible, playing, activeStep, count, interval, loop, step]);
  const current = Math.max(0, Math.min(count - 1, Number.isFinite(activeStep ?? step) ? Math.floor(activeStep ?? step) : 0));
  const sequenceFinished = activeStep === undefined && !loop && step >= count;
  if (!loading || !count) return null;
  const content = <div className={cn("grid gap-stack", className)} aria-busy="true"><p role="status" className="sr-only">{sequenceFinished ? "Sequence finished. Waiting for your request." : loadingStates[current].text}</p><ol className="grid gap-stack">{loadingStates.map((item, index) => <li key={item.id ?? index} aria-current={index === current ? "step" : undefined} className={cn("flex items-center gap-inline rounded-control p-inline text-label", index === current ? "bg-secondary font-medium text-foreground" : "text-muted-foreground")}>
    {(sequenceFinished || index < current) ? <Icon name="check" className="text-success" /> : index === current ? <Loader size="sm" variant="svg" label="Current step" /> : <span aria-hidden="true" className="inline-flex size-icon shrink-0 items-center justify-center text-caption">{index + 1}</span>}<span className="min-w-0 wrap-anywhere">{item.text}</span>
  </li>)}</ol>{sequenceFinished && <p className="text-caption text-muted-foreground">Sequence finished. Waiting for your request.</p>}</div>;
  return presentation === "inline" ? <section aria-label={title}>{content}</section> : <Dialog open={loading} onOpenChange={onLoadingChange}><DialogContent showClose={!!onLoadingChange} onEscapeKeyDown={event => { if (!onLoadingChange) event.preventDefault(); }} onPointerDownOutside={event => event.preventDefault()}><DialogTitle>{title}</DialogTitle><DialogDescription>{activeStep === undefined ? "Progress messages while your request is running." : "Current progress of your request."}</DialogDescription>{content}</DialogContent></Dialog>;
}

"use client";

import type { ComponentPropsWithRef, CSSProperties } from "react";
import { useAnimationActivity, type MotionPreference } from "./motion";
import { cn } from "../lib/utils";

export type LoaderProps = ComponentPropsWithRef<"div"> & { variant?: "dots" | "sliding-dots" | "svg" | "glitch" | "shimmer"; size?: "sm" | "md" | "lg"; label?: string; motion?: MotionPreference };
export function Loader({ variant = "dots", size = "md", label = "Loading", motion, className, ref: forwardedRef, ...props }: LoaderProps) {
  const activity = useAnimationActivity(motion);
  return <div ref={node => { activity.ref(node); if (typeof forwardedRef === "function") return forwardedRef(node); if (forwardedRef) forwardedRef.current = node; }} role="status" aria-label={label} data-running={activity.enabled} data-size={size} data-variant={variant} className={cn("sky-loader inline-flex items-center justify-center gap-control text-primary", className)} {...props}>
    <span className="sr-only">{label}</span>
    {variant === "dots" || variant === "sliding-dots" ? <span aria-hidden="true" className="inline-flex items-center gap-control">{[0, 1, 2].map(index => <span key={index} className="sky-loader-dot" style={{ "--sky-index": index } as CSSProperties} />)}</span>
      : variant === "svg" ? <svg aria-hidden="true" className="sky-loader-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path className="sky-loader-path" pathLength={1} d="m13 2-9 12h7l-1 8 10-13h-7z" /></svg>
      : <span aria-hidden="true" className={cn("relative inline-block font-medium", variant === "glitch" ? "sky-loader-glitch" : "sky-loader-shimmer")}>{label}</span>}
  </div>;
}
export const LoaderOne = (props: Omit<LoaderProps, "variant">) => <Loader {...props} variant="dots" />;
export const LoaderTwo = (props: Omit<LoaderProps, "variant">) => <Loader {...props} variant="sliding-dots" />;
export const LoaderThree = (props: Omit<LoaderProps, "variant">) => <Loader {...props} variant="svg" />;
export const LoaderFour = ({ text, ...props }: Omit<LoaderProps, "variant"> & { text?: string }) => <Loader {...props} label={text ?? props.label} variant="glitch" />;
export const LoaderFive = ({ text, ...props }: Omit<LoaderProps, "variant"> & { text?: string }) => <Loader {...props} label={text ?? props.label} variant="shimmer" />;

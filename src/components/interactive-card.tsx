"use client";

import { Card, type CardProps } from "./card";
import { cn } from "../lib/utils";

export type InteractiveCardProps = CardProps & { effect?: "lift" | "spotlight" | "none" };
/** Decorative emphasis; put actual actions in semantic buttons or links inside the card. */
export function InteractiveCard({ effect = "lift", className, onPointerMove, ...props }: InteractiveCardProps) {
  return <Card data-effect={effect} className={cn("sky-interactive-card relative", className)} onPointerMove={event => {
    onPointerMove?.(event);
    const motion = document.documentElement.dataset.motion;
    if (event.defaultPrevented || effect !== "spotlight" || event.pointerType === "touch" || motion === "none" || motion === "reduced" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    event.currentTarget.style.setProperty("--sky-pointer-x", `${(event.clientX - bounds.left) / bounds.width * 100}%`);
    event.currentTarget.style.setProperty("--sky-pointer-y", `${(event.clientY - bounds.top) / bounds.height * 100}%`);
  }} {...props} />;
}

import type { ComponentPropsWithRef } from "react";
import { cn } from "../lib/utils";

export type MessageProps = ComponentPropsWithRef<"article"> & { from: "user" | "assistant" | "system"; variant?: "bubble" | "plain" };

export function Message({ className, from, variant = "bubble", ...props }: MessageProps) {
  return <article aria-label={from === "user" ? "You" : from === "assistant" ? "Assistant" : "System"} data-from={from} className={cn("grid min-w-0 max-w-full gap-control rounded-surface p-inline", from === "user" ? "ms-auto" : "me-auto", variant === "bubble" && (from === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"), className)} {...props} />;
}
export function MessageContent({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cn("min-w-0 whitespace-pre-wrap wrap-anywhere text-body leading-body", className)} {...props} />;
}
export function MessageActions({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div role="group" aria-label="Message actions" className={cn("flex flex-wrap gap-control", className)} {...props} />;
}

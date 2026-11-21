"use client";
import type { ComponentPropsWithRef } from "react";
import * as Primitive from "@radix-ui/react-progress";
import { cn } from "../lib/utils";
export function Progress({ className, value, max = 100, ...props }: ComponentPropsWithRef<typeof Primitive.Root>) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = value == null || !Number.isFinite(value) ? null : Math.min(safeMax, Math.max(0, value));
  return <Primitive.Root value={safeValue} max={safeMax} className={cn("relative h-control w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
    <Primitive.Indicator className={cn("sky-progress-indicator h-full bg-primary", safeValue === null && "sky-skeleton w-full")} style={safeValue === null ? undefined : { width: `${safeValue / safeMax * 100}%` }} />
  </Primitive.Root>;
}

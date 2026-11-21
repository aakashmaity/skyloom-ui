import type { ComponentPropsWithRef } from "react";
import { cn } from "../lib/utils";

export function ButtonGroup({ className, orientation = "horizontal", ...props }: ComponentPropsWithRef<"div"> & { orientation?: "horizontal" | "vertical" }) {
  return <div role="group" className={cn("flex min-w-0 gap-control", orientation === "vertical" ? "flex-col items-stretch" : "flex-wrap items-center", className)} {...props} />;
}

export function Kbd({ className, ...props }: ComponentPropsWithRef<"kbd">) {
  return <kbd className={cn("sky-border inline-flex items-center justify-center rounded-control border-border bg-muted px-control py-control font-mono text-caption text-muted-foreground", className)} {...props} />;
}

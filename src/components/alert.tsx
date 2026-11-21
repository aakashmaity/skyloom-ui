import type { ComponentPropsWithRef } from "react";
import { cn } from "../lib/utils";

export function Alert({ className, variant = "default", role = "status", ...props }: ComponentPropsWithRef<"div"> & { variant?: "default" | "destructive" | "success" | "warning" | "info" }) {
  return <div role={role} className={cn("sky-border grid gap-control rounded-surface bg-card p-panel", {
    default: "border-border text-card-foreground", destructive: "border-destructive text-destructive", success: "border-success text-success",
    warning: "border-warning text-warning", info: "border-info text-info",
  }[variant], className)} {...props} />;
}
export function AlertTitle({ className, ...props }: ComponentPropsWithRef<"h3">) {
  return <h3 className={cn("text-label font-semibold", className)} {...props} />;
}
export function AlertDescription({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cn("text-label leading-body", className)} {...props} />;
}

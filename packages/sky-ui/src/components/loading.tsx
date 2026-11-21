import type { ComponentPropsWithRef } from "react";
import { cn } from "../lib/utils";

export function Skeleton({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div aria-hidden="true" className={cn("sky-skeleton h-field rounded-control bg-muted", className)} {...props} />;
}
export function Spinner({ className, label = "Loading", ...props }: ComponentPropsWithRef<"span"> & { label?: string }) {
  return <span role="status" className={cn("inline-flex items-center gap-control", className)} {...props}>
    <span aria-hidden="true" className="sky-spinner size-icon shrink-0" /><span className="sr-only">{label}</span>
  </span>;
}

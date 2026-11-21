import type { ComponentPropsWithRef } from "react";
import { cn } from "../lib/utils";

export function Container({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cn("mx-auto w-full min-w-0 max-w-container px-page tablet:px-page-wide", className)} {...props} />;
}
export function Stack({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cn("flex min-w-0 flex-col gap-stack", className)} {...props} />;
}
export function ResponsiveGrid({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cn("grid min-w-0 grid-cols-1 gap-panel tablet:grid-cols-2 laptop:grid-cols-3 [&>*]:min-w-0", className)} {...props} />;
}

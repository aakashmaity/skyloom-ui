"use client";

import type { ComponentPropsWithRef } from "react";
import * as Primitive from "@radix-ui/react-tabs";
import { cn } from "../lib/utils";

export const Tabs = Primitive.Root;
export function TabsList({ className, variant = "default", ...props }: ComponentPropsWithRef<typeof Primitive.List> & { variant?: "default" | "line" | "outline" }) {
  return <Primitive.List data-variant={variant} className={cn("group/sky-tabs flex w-full gap-control overflow-x-auto rounded-control bg-muted p-control data-[orientation=vertical]:flex-col", { default: "", line: "sky-tabs-line rounded-none bg-transparent p-0", outline: "sky-border border-border bg-transparent" }[variant], className)} {...props} />;
}
export function TabsTrigger({ className, ...props }: ComponentPropsWithRef<typeof Primitive.Trigger>) {
  return <Primitive.Trigger className={cn("sky-icon-slot inline-flex items-center justify-center gap-control sky-focus sky-disabled sky-transition min-h-touch shrink-0 rounded-control px-inline py-control text-label text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-card-foreground group-data-[variant=line]/sky-tabs:data-[state=active]:bg-transparent group-data-[variant=line]/sky-tabs:data-[state=active]:text-primary tablet:min-h-field", className)} {...props} />;
}
export function TabsContent({ className, ...props }: ComponentPropsWithRef<typeof Primitive.Content>) {
  return <Primitive.Content className={cn("sky-tab-panel sky-focus min-w-0 py-panel", className)} {...props} />;
}

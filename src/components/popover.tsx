"use client";
import type { ComponentPropsWithRef } from "react";
import * as Primitive from "@radix-ui/react-popover";
import { cn } from "../lib/utils";
export const Popover = Primitive.Root;
export const PopoverTrigger = Primitive.Trigger;
export const PopoverClose = Primitive.Close;
export function PopoverContent({ className, ...props }: ComponentPropsWithRef<typeof Primitive.Content>) {
  return <Primitive.Portal><Primitive.Content className={cn("sky-enter sky-popover sky-border sky-floating-fit w-preview-wide rounded-surface border-border bg-popover p-panel text-popover-foreground shadow-floating", className)} {...props} /></Primitive.Portal>;
}

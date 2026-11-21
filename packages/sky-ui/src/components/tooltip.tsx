"use client";

import type { ComponentPropsWithRef } from "react";
import * as Primitive from "@radix-ui/react-tooltip";
import { cn } from "../lib/utils";
export const TooltipProvider = Primitive.Provider;
export const Tooltip = Primitive.Root;
export const TooltipTrigger = Primitive.Trigger;
export function TooltipContent({ className, children, ...props }: ComponentPropsWithRef<typeof Primitive.Content>) {
  return <Primitive.Portal><Primitive.Content className={cn("sky-enter sky-tooltip max-w-tooltip rounded-control bg-foreground px-inline py-control text-label text-background shadow-raised", className)} {...props}>
    {children}<Primitive.Arrow className="fill-foreground" />
  </Primitive.Content></Primitive.Portal>;
}

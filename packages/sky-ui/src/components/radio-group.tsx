"use client";
import type { ComponentPropsWithRef } from "react";
import * as Primitive from "@radix-ui/react-radio-group";
import { cn } from "../lib/utils";
export function RadioGroup({ className, ...props }: ComponentPropsWithRef<typeof Primitive.Root>) {
  return <Primitive.Root className={cn("grid gap-control", className)} {...props} />;
}
export function RadioGroupItem({ className, ...props }: ComponentPropsWithRef<typeof Primitive.Item>) {
  return <Primitive.Item className={cn("sky-focus sky-disabled sky-border size-choice shrink-0 rounded-full border-input text-primary", className)} {...props}>
    <Primitive.Indicator className="flex size-full items-center justify-center"><span className="size-control rounded-full bg-primary" /></Primitive.Indicator>
  </Primitive.Item>;
}

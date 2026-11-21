"use client";
import type { ComponentPropsWithRef } from "react";
import * as Primitive from "@radix-ui/react-slider";
import { cn } from "../lib/utils";
export function Slider({ className, value, defaultValue = [0], thumbLabels, ...props }: ComponentPropsWithRef<typeof Primitive.Root> & { thumbLabels?: string[] }) {
  return <Primitive.Root value={value} defaultValue={defaultValue} className={cn("sky-disabled relative flex min-h-touch w-full touch-none select-none items-center data-[orientation=vertical]:h-preview data-[orientation=vertical]:min-w-touch data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col", className)} {...props}>
    <Primitive.Track className="relative grow overflow-hidden rounded-full bg-secondary data-[orientation=horizontal]:h-track data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-track">
      <Primitive.Range className="absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" />
    </Primitive.Track>
    {(value ?? defaultValue).map((_, index) => <Primitive.Thumb key={index} aria-label={thumbLabels?.[index] ?? props["aria-label"] ?? `Value ${index + 1}`} className="sky-focus sky-border block size-choice rounded-full border-primary bg-background shadow-raised" />)}
  </Primitive.Root>;
}

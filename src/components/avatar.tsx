"use client";
import type { ComponentPropsWithRef } from "react";
import * as Primitive from "@radix-ui/react-avatar";
import { cn } from "../lib/utils";
export function Avatar({ className, ...props }: ComponentPropsWithRef<typeof Primitive.Root>) {
  return <Primitive.Root className={cn("relative flex size-field shrink-0 overflow-hidden rounded-full", className)} {...props} />;
}
export function AvatarImage({ className, ...props }: ComponentPropsWithRef<typeof Primitive.Image>) {
  return <Primitive.Image className={cn("aspect-square size-full object-cover", className)} {...props} />;
}
export function AvatarFallback({ className, ...props }: ComponentPropsWithRef<typeof Primitive.Fallback>) {
  return <Primitive.Fallback className={cn("flex size-full items-center justify-center rounded-full bg-secondary text-label font-medium text-secondary-foreground", className)} {...props} />;
}

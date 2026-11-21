"use client";

import type { ComponentPropsWithRef } from "react";
import * as Primitive from "@radix-ui/react-separator";
import { cn } from "../lib/utils";
export function Separator({ className, orientation = "horizontal", decorative = true, ...props }: ComponentPropsWithRef<typeof Primitive.Root>) {
  return <Primitive.Root orientation={orientation} decorative={decorative} className={cn("shrink-0 bg-border data-[orientation=horizontal]:h-hairline data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-hairline", className)} {...props} />;
}

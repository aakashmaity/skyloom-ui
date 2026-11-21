"use client";

import type { ComponentPropsWithRef } from "react";
import * as Primitive from "@radix-ui/react-switch";
import { cn } from "../lib/utils";

export function Switch({ className, ...props }: ComponentPropsWithRef<typeof Primitive.Root>) {
  return <Primitive.Root className={cn("sky-focus sky-disabled group inline-flex min-h-touch min-w-touch items-center", className)} {...props}>
    <span className="sky-switch sky-transition flex bg-input group-data-[state=checked]:bg-primary">
      <Primitive.Thumb className="sky-switch-thumb block bg-background group-data-[state=checked]:bg-primary-foreground" />
    </span>
  </Primitive.Root>;
}

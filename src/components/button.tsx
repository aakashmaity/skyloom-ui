"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

export const buttonVariants = cva(
  "sky-action sky-icon-slot inline-flex items-center justify-center gap-control rounded-control text-label font-medium sky-transition sky-focus disabled:pointer-events-none sky-disabled",
  { variants: {
    variant: {
      "hover-border-gradient": "sky-gradient-border bg-card text-card-foreground",
      default: "bg-primary text-primary-foreground sky-hover",
      secondary: "bg-secondary text-secondary-foreground sky-hover",
      outline: "sky-border border-input bg-background hover:bg-secondary",
      ghost: "hover:bg-secondary",
      destructive: "bg-destructive text-destructive-foreground sky-hover",
      link: "sky-link text-primary hover:underline",
      soft: "bg-secondary text-primary hover:bg-accent",
      success: "bg-success text-success-foreground sky-hover",
      classic: "sky-border border-input bg-card text-card-foreground shadow-raised hover:bg-secondary",
    },
    size: { default: "h-field min-h-touch tablet:min-h-field px-panel", sm: "h-field-sm min-h-touch tablet:min-h-field-sm px-inline", lg: "h-field-lg px-panel", icon: "size-field min-h-touch min-w-touch" },
    shape: { default: "", pill: "rounded-capsule", square: "rounded-none" },
  }, defaultVariants: { variant: "default", size: "default" } },
);

export type ButtonProps = React.ComponentPropsWithRef<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, shape, asChild = false, type, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component type={asChild ? type : (type ?? "button")} className={cn(buttonVariants({ variant, size, shape }), className)} {...props} />;
}

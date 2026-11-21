import type { ComponentPropsWithRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const variants = cva("sky-icon-slot inline-flex items-center gap-control rounded-control px-inline py-control text-caption font-medium", {
  variants: { variant: {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    info: "bg-info text-info-foreground",
    soft: "bg-secondary text-primary",
    outline: "sky-border border-border text-foreground",
  }, shape: { default: "", pill: "rounded-capsule" } }, defaultVariants: { variant: "default" },
});
export type BadgeProps = ComponentPropsWithRef<"span"> & VariantProps<typeof variants>;
export function Badge({ className, variant, shape, ...props }: BadgeProps) {
  return <span className={cn(variants({ variant, shape }), className)} {...props} />;
}

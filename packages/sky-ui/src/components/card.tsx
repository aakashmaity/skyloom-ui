import type { ComponentPropsWithRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

export const cardVariants = cva("sky-border min-w-0 rounded-surface border-border bg-card text-card-foreground", {
  variants: { variant: {
    default: "shadow-raised",
    outline: "shadow-none",
    soft: "border-transparent bg-muted text-foreground shadow-none",
    classic: "rounded-control border-input shadow-raised",
    modern: "rounded-modal shadow-none",
    elevated: "shadow-floating",
  } }, defaultVariants: { variant: "default" },
});
export type CardProps = ComponentPropsWithRef<"div"> & VariantProps<typeof cardVariants>;

export function Card({ className, variant, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant }), className)} {...props} />;
}
export function CardHeader({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cn("grid gap-control p-panel", className)} {...props} />;
}
export function CardTitle({ className, ...props }: ComponentPropsWithRef<"h2">) {
  return <h2 className={cn("text-title font-semibold leading-title wrap-break-word", className)} {...props} />;
}
export function CardDescription({ className, ...props }: ComponentPropsWithRef<"p">) {
  return <p className={cn("text-label leading-body text-muted-foreground", className)} {...props} />;
}
export function CardContent({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cn("p-panel pt-0", className)} {...props} />;
}
export function CardFooter({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cn("flex flex-col gap-control p-panel pt-0 tablet:flex-row tablet:items-center", className)} {...props} />;
}

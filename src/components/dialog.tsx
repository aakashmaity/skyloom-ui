"use client";

import type { ComponentPropsWithRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import * as Primitive from "@radix-ui/react-dialog";
import { Button } from "./button";
import { Icon } from "./icon";
import { cn } from "../lib/utils";

export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;

const dialogVariants = cva("sky-modal sky-modal-fit sky-border fixed left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 gap-stack overflow-y-auto rounded-modal border-border bg-popover p-panel text-popover-foreground shadow-floating", {
  variants: {
    variant: { default: "", classic: "rounded-control border-input", modern: "rounded-modal shadow-raised" },
    size: { default: "tablet:max-w-dialog", sm: "tablet:max-w-dialog-sm", lg: "tablet:max-w-dialog-lg" },
  }, defaultVariants: { variant: "default", size: "default" },
});
export type DialogContentProps = ComponentPropsWithRef<typeof Primitive.Content> & VariantProps<typeof dialogVariants> & { closeLabel?: string; showClose?: boolean };

export function DialogContent({ children, className, variant, size, closeLabel = "Close dialog", showClose = true, ...props }: DialogContentProps) {
  return <Primitive.Portal>
    <Primitive.Overlay className="sky-overlay fixed inset-0 bg-overlay" />
    <Primitive.Content className={cn(dialogVariants({ variant, size }), className)} {...props}>
      {showClose && <Primitive.Close asChild><Button variant="ghost" className="justify-self-end" aria-label={closeLabel}><Icon name="close" />{closeLabel}</Button></Primitive.Close>}
      {children}
    </Primitive.Content>
  </Primitive.Portal>;
}
export function DialogHeader({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cn("grid gap-control min-w-0", className)} {...props} />;
}
export function DialogTitle({ className, ...props }: ComponentPropsWithRef<typeof Primitive.Title>) {
  return <Primitive.Title className={cn("text-title font-semibold leading-title", className)} {...props} />;
}
export function DialogDescription({ className, ...props }: ComponentPropsWithRef<typeof Primitive.Description>) {
  return <Primitive.Description className={cn("text-label leading-body text-muted-foreground", className)} {...props} />;
}
export function DialogFooter({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cn("flex flex-col gap-control tablet:flex-row tablet:justify-end", className)} {...props} />;
}

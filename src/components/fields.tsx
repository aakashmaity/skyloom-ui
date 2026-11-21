import type { ComponentPropsWithRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const fieldClass = "sky-field w-full min-w-0 rounded-control sky-border border-input bg-background px-inline py-control text-body tablet:text-label sky-focus disabled:cursor-not-allowed sky-disabled aria-invalid:border-destructive";
const fieldVariants = cva(fieldClass, {
  variants: { variant: { default: "", filled: "border-transparent bg-muted", classic: "bg-card shadow-raised", gradient: "sky-gradient-border" } },
  defaultVariants: { variant: "default" },
});
export type InputProps = ComponentPropsWithRef<"input"> & VariantProps<typeof fieldVariants>;
export type TextareaProps = ComponentPropsWithRef<"textarea"> & VariantProps<typeof fieldVariants>;

export function Input({ className, variant, ...props }: InputProps) {
  return <input className={cn(fieldVariants({ variant }), "h-field min-h-touch tablet:min-h-field", className)} {...props} />;
}
export function Textarea({ className, variant, ...props }: TextareaProps) {
  return <textarea className={cn(fieldVariants({ variant }), "min-h-textarea", className)} {...props} />;
}
export function Label({ className, ...props }: ComponentPropsWithRef<"label">) {
  return <label className={cn("text-label font-medium", className)} {...props} />;
}
export function Checkbox({ className, ...props }: Omit<ComponentPropsWithRef<"input">, "type">) {
  return <input type="checkbox" className={cn("size-choice accent-primary sky-focus sky-disabled", className)} {...props} />;
}

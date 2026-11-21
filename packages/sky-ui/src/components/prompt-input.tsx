"use client";

import { useId, useRef, type ComponentPropsWithRef, type FormEvent, type ReactNode } from "react";
import { Button } from "./button";
import { Label, Textarea, type TextareaProps } from "./fields";
import { Spinner } from "./loading";
import { cn } from "../lib/utils";

export type PromptInputProps = Omit<ComponentPropsWithRef<"form">, "onSubmit" | "children"> & {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (value: string, event: FormEvent<HTMLFormElement>) => void;
  onStop?: () => void;
  status?: "ready" | "submitted" | "streaming" | "error";
  disabled?: boolean;
  label?: string;
  submitLabel?: string;
  stopLabel?: string;
  tools?: ReactNode;
  variant?: "default" | "classic" | "modern";
  textareaProps?: Omit<TextareaProps, "value" | "defaultValue" | "onChange" | "disabled" | "children">;
};

export function PromptInput({ className, value, onValueChange, onSubmit, onStop, status = "ready", disabled = false, label = "Message", submitLabel = "Send message", stopLabel = "Stop response", tools, variant = "default", textareaProps, ...props }: PromptInputProps) {
  const generatedId = useId();
  const composing = useRef(false);
  const busy = status === "submitted" || status === "streaming";
  const { id = generatedId, onKeyDown, onCompositionStart, onCompositionEnd, ...inputProps } = textareaProps ?? {};

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || busy || !value.trim()) return;
    onSubmit(value.trim(), event);
  }

  return <form className={cn("sky-border min-w-0 rounded-surface border-input bg-card p-inline text-card-foreground", { default: "", classic: "rounded-control shadow-raised", modern: "rounded-modal" }[variant], className)} {...props} onSubmit={submit}>
    <fieldset disabled={disabled} className="grid min-w-0 gap-control">
      <Label htmlFor={id} className="sr-only">{label}</Label>
      <Textarea placeholder="Write a message…" {...inputProps} id={id} value={value} onChange={event => onValueChange(event.target.value)}
        onCompositionStart={event => { composing.current = true; onCompositionStart?.(event); }}
        onCompositionEnd={event => { composing.current = false; onCompositionEnd?.(event); }}
        onKeyDown={event => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.nativeEvent.keyCode !== 229 && !composing.current) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }} />
      <div className="flex flex-wrap items-center justify-between gap-control">
        <div className="flex min-w-0 flex-wrap items-center gap-control">{tools}</div>
        {busy ? <Button variant="outline" disabled={disabled || !onStop} onClick={onStop}><Spinner />{stopLabel}</Button>
          : <Button type="submit" disabled={disabled || !value.trim()}>{submitLabel}</Button>}
      </div>
    </fieldset>
  </form>;
}

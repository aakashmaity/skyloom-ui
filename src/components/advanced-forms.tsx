"use client";
import { useEffect, useId, useRef, useState, type ComponentPropsWithRef, type FormEvent } from "react";
import { Button } from "./button";
import { Input, Label, type InputProps } from "./fields";
import { Icon } from "./icon";
import { Progress } from "./progress";
import { useAnimationActivity } from "./motion";
import { cn } from "../lib/utils";
import type { SurfaceVariant } from "./navigation";

export function FormPanel({ variant = "default", className, ...props }: ComponentPropsWithRef<"form"> & { variant?: SurfaceVariant }) {
  return <form data-variant={variant} className={cn("sky-advanced-surface grid min-w-0 gap-stack p-panel", className)} {...props} />;
}
export type VanishInputProps = Omit<InputProps, "onSubmit" | "value" | "defaultValue"> & { label: string; value: string; onValueChange: (value: string) => void; onSubmit: (value: string, event: FormEvent<HTMLFormElement>) => void; placeholders?: readonly string[] };
export function PlaceholdersAndVanishInput({ label, value, onValueChange, onSubmit, placeholders = [], disabled, readOnly, id: suppliedId, className, ...props }: VanishInputProps) {
  const id = useId(), activity = useAnimationActivity<HTMLFormElement>();
  const [index, setIndex] = useState(0), [ghost, setGhost] = useState("");
  const composing = useRef(false);
  useEffect(() => { if (!activity.enabled || placeholders.length < 2 || value) return; const timer = setInterval(() => setIndex(i => (i + 1) % placeholders.length), 3000); return () => clearInterval(timer); }, [activity.enabled, placeholders.length, value]);
  useEffect(() => { if (!ghost) return; const timer = setTimeout(() => setGhost(""), 600); return () => clearTimeout(timer); }, [ghost]);
  return <form ref={activity.ref} className={cn("grid gap-control", className)} onSubmit={event => { event.preventDefault(); if (disabled || readOnly || composing.current || !value.trim()) return; if (activity.enabled) setGhost(value); onSubmit(value.trim(), event); }}><Label htmlFor={suppliedId ?? id}>{label}</Label><div className="relative flex min-w-0 items-center gap-control"><Input {...props} id={suppliedId ?? id} disabled={disabled} readOnly={readOnly} value={value} placeholder={placeholders[index % Math.max(1, placeholders.length)]} onChange={event => { onValueChange(event.target.value); props.onChange?.(event); }} onCompositionStart={event => { composing.current = true; props.onCompositionStart?.(event); }} onCompositionEnd={event => { composing.current = false; props.onCompositionEnd?.(event); }} /><Button type="submit" disabled={disabled || readOnly || !value.trim()} aria-label="Submit input" size="icon"><Icon name="arrow-right" /></Button>{ghost && <span aria-hidden="true" className="sky-vanish pointer-events-none absolute inset-y-0 start-inline flex max-w-full items-center overflow-hidden text-label">{ghost}</span>}</div></form>;
}
export type GooeyInputProps = InputProps & { label: string; onValueChange?: (value: string) => void; onOpenChange?: (open: boolean) => void };
export function GooeyInput({ label, onValueChange, onOpenChange, className, id: suppliedId, ...props }: GooeyInputProps) {
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId(), [open, setOpen] = useState(false), input = useRef<HTMLInputElement>(null);
  const filter = `${id}-goo`, activity = useAnimationActivity();
  function change(next: boolean) { setOpen(next); onOpenChange?.(next); requestAnimationFrame(() => { if (next) input.current?.focus(); else trigger.current?.focus(); }); }
  return <div ref={activity.ref} className={cn("sky-gooey relative grid gap-control", className)} data-open={open} data-running={activity.enabled}><svg aria-hidden="true" className="absolute size-0"><defs><filter id={filter}><feGaussianBlur in="SourceGraphic" stdDeviation="4" /><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 16 -7" /></filter></defs></svg><Label htmlFor={suppliedId ?? id}>{label}</Label><div className="relative flex items-center gap-control"><div aria-hidden="true" className="sky-gooey-decoration pointer-events-none absolute inset-0" style={{ filter: activity.enabled ? `url(#${filter})` : undefined }} /><Button ref={trigger} variant="outline" size="icon" disabled={props.disabled} aria-expanded={open} aria-controls={suppliedId ?? id} aria-label={open ? "Collapse search" : "Expand search"} onClick={() => change(!open)}><Icon name="search" /></Button><Input {...props} id={suppliedId ?? id} ref={node => { input.current = node; if (typeof props.ref === "function") return props.ref(node); if (props.ref) props.ref.current = node; }} hidden={!open} onChange={event => { onValueChange?.(event.target.value); props.onChange?.(event); }} onKeyDown={event => { props.onKeyDown?.(event); if (!event.defaultPrevented && event.key === "Escape") change(false); }} /></div></div>;
}

export type FileRejection = { file: File; reason: string };
export type FileUploadProps = { files?: readonly File[]; defaultFiles?: readonly File[]; onFilesChange?: (files: File[]) => void; onReject?: (files: FileRejection[]) => void; accept?: string; multiple?: boolean; maxFiles?: number; maxSize?: number; disabled?: boolean; label?: string; progress?: readonly number[]; variant?: SurfaceVariant; className?: string };
export function FileUpload({ files: controlled, defaultFiles = [], onFilesChange, onReject, accept, multiple = true, maxFiles = 10, maxSize = Infinity, disabled, label = "Upload files", progress, variant = "default", className }: FileUploadProps) {
  const [internal, setInternal] = useState<File[]>([...defaultFiles]), [errors, setErrors] = useState<string[]>([]), [dragging, setDragging] = useState(false);
  const files = controlled ?? internal, input = useRef<HTMLInputElement>(null), id = useId();
  function change(next: File[]) { if (controlled === undefined) setInternal(next); onFilesChange?.(next); }
  function add(incoming: File[]) {
    if (disabled) return;
    const next = multiple ? [...files] : [], rejected: FileRejection[] = [];
    const types = accept?.split(",").map(type => type.trim().toLowerCase()).filter(Boolean) ?? [];
    for (const file of incoming) {
      if (next.some(existing => existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified)) continue;
      const matches = !types.length || types.some(type => type.startsWith(".") ? file.name.toLowerCase().endsWith(type) : type.endsWith("/*") ? file.type.toLowerCase().startsWith(type.slice(0, -1)) : file.type.toLowerCase() === type);
      const reason = !matches ? "File type is not accepted." : file.size > maxSize ? "File exceeds the size limit." : next.length >= (multiple ? Math.max(1, maxFiles) : 1) ? "File count limit reached." : "";
      if (reason) rejected.push({ file, reason }); else if (!next.some(existing => existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified)) next.push(file);
    }
    change(next); setErrors(rejected.map(({ file, reason }) => `${file.name}: ${reason}`)); if (rejected.length) onReject?.(rejected);
  }
  return <section aria-label={label} data-variant={variant} className={cn("sky-advanced-surface grid gap-stack p-panel", className)}><div className={cn("sky-border grid justify-items-center gap-control rounded-control border-input p-panel", dragging && "bg-secondary")} onDragOver={event => { event.preventDefault(); if (!disabled) setDragging(true); }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }} onDrop={event => { event.preventDefault(); setDragging(false); add(Array.from(event.dataTransfer.files)); }}><Icon name="upload" /><Label htmlFor={id}>{label}</Label><input ref={input} id={id} type="file" accept={accept} multiple={multiple} disabled={disabled} className="sky-focus max-w-full text-label" onChange={event => { add(Array.from(event.target.files ?? [])); event.target.value = ""; }} /><p className="text-caption text-muted-foreground">Choose files or drop them here.</p></div><ul className="grid gap-control">{files.map((file, index) => <li key={`${file.name}-${file.lastModified}-${index}`} className="grid gap-control"><div className="flex min-w-0 items-center gap-control"><span className="min-w-0 flex-1 wrap-anywhere text-label">{file.name} <span className="text-muted-foreground">({Math.ceil(file.size / 1024)} KB)</span></span><Button variant="ghost" size="icon" disabled={disabled} aria-label={`Remove ${file.name}`} onClick={() => change(files.filter((_, i) => i !== index))}><Icon name="close" /></Button></div>{progress?.[index] !== undefined && <Progress value={progress[index]} aria-label={`${file.name} upload progress`} />}</li>)}</ul>{errors.length > 0 && <ul role="alert" className="text-label text-destructive">{errors.map(error => <li key={error}>{error}</li>)}</ul>}</section>;
}

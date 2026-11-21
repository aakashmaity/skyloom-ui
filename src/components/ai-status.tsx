"use client";

import type { ComponentPropsWithRef, ReactNode } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion";
import { Badge } from "./badge";
import { Button } from "./button";
import { cn } from "../lib/utils";

export type TaskStatus = "pending" | "running" | "complete" | "error";
const statusLabels = { pending: "Pending", running: "Running", complete: "Complete", error: "Error" };

export function Suggestions({ items, onSelect, disabled, className, ...props }: Omit<ComponentPropsWithRef<"div">, "onSelect" | "children"> & { items: readonly string[]; onSelect: (value: string) => void; disabled?: boolean }) {
  return <div role="group" aria-label="Suggested prompts" className={cn("flex min-w-0 flex-wrap gap-control", className)} {...props}>{items.map((item, index) => <Button key={`${index}-${item}`} variant="outline" shape="pill" disabled={disabled} className="h-auto whitespace-normal py-control text-start" onClick={() => onSelect(item)}>{item}</Button>)}</div>;
}

export function ToolStatus({ title, status, children, open, defaultOpen = false, onOpenChange, className }: { title: string; status: TaskStatus; children: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; className?: string }) {
  return <Accordion type="single" collapsible value={open === undefined ? undefined : open ? "details" : ""} defaultValue={defaultOpen ? "details" : ""} onValueChange={value => onOpenChange?.(value === "details")} className={className}>
    <AccordionItem value="details"><AccordionTrigger aria-label={`${title} ${statusLabels[status]}`}><span className="min-w-0 flex-1 wrap-anywhere">{title}</span><Badge className="shrink-0 whitespace-nowrap" variant={status === "error" ? "destructive" : status === "complete" ? "success" : "secondary"}>{statusLabels[status]}</Badge></AccordionTrigger><AccordionContent>{children}</AccordionContent></AccordionItem>
  </Accordion>;
}

export function ShimmerText({ active = true, className, ...props }: ComponentPropsWithRef<"span"> & { active?: boolean }) {
  return <span className={cn(active && "sky-shimmer-text", className)} {...props} />;
}

export type TaskPlanStep = { id: string; title: string; description?: ReactNode; status: TaskStatus };
export function TaskPlan({ title, steps, ...props }: Omit<ComponentPropsWithRef<"section">, "title" | "children"> & { title: string; steps: readonly TaskPlanStep[] }) {
  return <section aria-label={title} {...props}>
    <h3 className="mb-stack text-body font-semibold">{title}</h3>
    <ol className="grid gap-control">{steps.map(step => <li key={step.id}><ToolStatus title={step.title} status={step.status}>{step.description ?? "No additional details."}</ToolStatus></li>)}</ol>
  </section>;
}

import type { ReactNode } from "react";
import { Card, type CardProps } from "./card";
import { cn } from "../lib/utils";

export type StatCardProps = CardProps & {
  label: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  trend?: ReactNode;
  tone?: "default" | "success" | "destructive";
};

export function StatCard({ label, value, description, trend, tone = "default", children, className, ...props }: StatCardProps) {
  return <Card className={cn("p-panel", className)} {...props}>
    <dl className="grid gap-control">
      <dt className="text-label text-muted-foreground">{label}</dt>
      <dd className="text-title font-semibold leading-title wrap-anywhere">{value}</dd>
      {trend && <dd className={cn("text-label", { default: "text-muted-foreground", success: "text-success", destructive: "text-destructive" }[tone])}>{trend}</dd>}
    </dl>
    {description && <p className="mt-control text-caption leading-body text-muted-foreground">{description}</p>}
    {children}
  </Card>;
}

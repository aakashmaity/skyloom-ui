import type { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, type CardProps } from "./card";
import { cn } from "../lib/utils";

export type FeatureCardProps = Omit<CardProps, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
};

export function FeatureCard({ title, description, icon, action, children, className, variant = "modern", ...props }: FeatureCardProps) {
  return <Card variant={variant} className={cn("flex h-full flex-col", className)} {...props}>
    <CardHeader>
      {icon && <div aria-hidden="true" className="sky-icon-slot mb-control flex size-field items-center justify-center rounded-control bg-secondary text-primary">{icon}</div>}
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    {children && <CardContent className="flex-1">{children}</CardContent>}
    {action && <CardFooter className="mt-auto">{action}</CardFooter>}
  </Card>;
}

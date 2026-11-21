import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="grid justify-items-center gap-stack p-page-wide text-center">
    <h2 className="text-title font-semibold">{title}</h2>
    {description && <p className="text-label">{description}</p>}{action}
  </div>;
}

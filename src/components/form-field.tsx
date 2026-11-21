import type { ReactNode } from "react";
import { Label } from "./fields";

export function FormField({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return <div className="grid gap-control"><Label htmlFor={id}>{label}</Label>{children}
    {error && <p id={`${id}-error`} role="alert" className="text-label text-destructive">{error}</p>}
  </div>;
}

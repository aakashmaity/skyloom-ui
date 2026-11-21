"use client";
import { Button } from "./button";
export function Pagination({ page, pageCount, onPageChange, label = "Pagination" }: { page: number; pageCount: number; onPageChange: (page: number) => void; label?: string }) {
  const count = Math.max(1, Math.floor(pageCount) || 1);
  const current = Math.min(count, Math.max(1, Math.floor(page) || 1));
  return <nav aria-label={label} className="flex flex-wrap items-center justify-between gap-control">
    <Button variant="outline" disabled={current <= 1} onClick={() => onPageChange(current - 1)}>Previous</Button>
    <span className="text-label text-muted-foreground" aria-live="polite">Page {current} of {count}</span>
    <Button variant="outline" disabled={current >= count} onClick={() => onPageChange(current + 1)}>Next</Button>
  </nav>;
}

"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { columnsInRegion, columnRegion, type DataTableColumnLayout } from "../lib/column-layout";

export function useColumnPinning(layout: DataTableColumnLayout) {
  const [table, setTable] = useState<HTMLTableElement | null>(null);
  const [measurements, setMeasurements] = useState<{ widths: Record<string, number>; viewport: number; minimum: number }>({ widths: {}, viewport: 0, minimum: 0 });
  const signature = JSON.stringify(layout);
  useEffect(() => {
    const viewport = table?.parentElement;
    if (!table || !viewport || typeof ResizeObserver === "undefined") return;
    let frame = 0, disposed = false;
    const measure = () => {
      if (disposed) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const root = getComputedStyle(document.documentElement);
        const minimum = parseFloat(root.getPropertyValue("--sky-table-center-min")) * parseFloat(root.fontSize);
        const widths = Object.fromEntries([...table.querySelectorAll<HTMLTableCellElement>("thead th[data-column-id]")].map(cell => [cell.dataset.columnId!, cell.getBoundingClientRect().width]));
        const next = { widths, viewport: viewport.clientWidth, minimum };
        setMeasurements(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(table);
    table.querySelectorAll("thead th").forEach(cell => observer.observe(cell));
    const rootObserver = new MutationObserver(measure);
    rootObserver.observe(document.documentElement, { attributes: true });
    document.fonts?.ready.then(measure);
    document.fonts?.addEventListener("loadingdone", measure);
    measure();
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); rootObserver.disconnect(); document.fonts?.removeEventListener("loadingdone", measure); };
  }, [table, signature]);

  const start = columnsInRegion(layout, "start", true), end = columnsInRegion(layout, "end", true);
  const pinnedWidth = [...start, ...end].reduce((sum, id) => sum + (measurements.widths[id] ?? 0), 0);
  const hasPins = start.length + end.length > 0;
  const active = hasPins && measurements.viewport > 0 && [...start, ...end].every(id => measurements.widths[id] > 0) && pinnedWidth + measurements.minimum <= measurements.viewport;
  function cellProps(id: string): { "data-pinned"?: string; style?: CSSProperties } {
    const region = columnRegion(layout, id);
    if (!active || region === "center") return {};
    const group = region === "start" ? start : [...end].reverse();
    const offset = group.slice(0, group.indexOf(id)).reduce((sum, item) => sum + (measurements.widths[item] ?? 0), 0);
    // Measured browser geometry, not an authored fixed dimension.
    return { "data-pinned": region, style: region === "start" ? { insetInlineStart: offset } : { insetInlineEnd: offset } };
  }
  return { tableRef: setTable, cellProps, suspended: hasPins && !active };
}

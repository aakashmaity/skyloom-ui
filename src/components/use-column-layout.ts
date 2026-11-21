"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { changeColumnLayout, normalizeColumnLayout, readStoredColumnLayout, type ColumnLayoutAction, type ColumnLayoutDefinition, type DataTableColumnLayout } from "../lib/column-layout";

export function useColumnLayout(columns: readonly ColumnLayoutDefinition[], controlled: DataTableColumnLayout | undefined, defaults: DataTableColumnLayout | undefined, onChange: ((layout: DataTableColumnLayout) => void) | undefined, storageKey: string | undefined) {
  const [internal, setInternal] = useState(() => normalizeColumnLayout(columns, defaults));
  const controlledRef = useRef(controlled);
  controlledRef.current = controlled;
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;
  useEffect(() => {
    if (controlledRef.current !== undefined) return;
    let value = defaultsRef.current;
    if (storageKey) {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
        value = readStoredColumnLayout(saved) ?? value;
      } catch { /* Missing, invalid, or unavailable storage uses defaults. */ }
    }
    // Normalization happens on render against the latest definitions.
    setInternal(value ?? normalizeColumnLayout([]));
  }, [storageKey, controlled !== undefined]);
  const layout = useMemo(() => normalizeColumnLayout(columns, controlled ?? internal), [columns, controlled, internal]);

  function commit(next: DataTableColumnLayout) {
    if (controlled === undefined) {
      setInternal(next);
      if (storageKey) {
        try { localStorage.setItem(storageKey, JSON.stringify({ version: 1, layout: next })); } catch { /* Optional persistence. */ }
      }
    }
    onChange?.(next);
  }
  return { layout, change: (action: ColumnLayoutAction) => commit(changeColumnLayout(columns, layout, action)), reset: () => commit(normalizeColumnLayout(columns, defaults)) };
}

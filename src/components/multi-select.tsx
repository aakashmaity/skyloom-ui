"use client";

import { useId, useLayoutEffect, useRef } from "react";
import { Checkbox, Label } from "./fields";

export type MultiSelectOption = { value: string; label: string; disabled?: boolean };

/** Select all affects enabled options only; disabled selections are preserved. */
export function MultiSelect({ label, options, value, onValueChange, disabled = false }: {
  label: string; options: readonly MultiSelectOption[]; value: readonly string[];
  onValueChange: (value: string[]) => void; disabled?: boolean;
}) {
  const id = useId();
  const allRef = useRef<HTMLInputElement>(null);
  const enabled = options.filter(option => !option.disabled);
  const selected = new Set(value);
  const count = enabled.filter(option => selected.has(option.value)).length;
  const all = enabled.length > 0 && count === enabled.length;
  const mixed = count > 0 && !all;
  useLayoutEffect(() => { if (allRef.current) allRef.current.indeterminate = mixed; }, [mixed]);

  return <fieldset disabled={disabled} className="grid gap-stack rounded-control sky-border border-input p-panel">
    <legend className="px-control text-label font-medium">{label}</legend>
    <div className="sky-choice-row flex items-center gap-control">
      <Checkbox ref={allRef} id={`${id}-all`} checked={all} disabled={!enabled.length} onChange={event => {
        const next = new Set(value);
        for (const option of enabled) event.target.checked ? next.add(option.value) : next.delete(option.value);
        onValueChange([...next]);
      }} /><Label className="flex min-h-touch flex-1 items-center" htmlFor={`${id}-all`}>Select all</Label>
    </div>
    {options.map((option, index) => <div key={option.value} className="sky-choice-row flex items-center gap-control">
      <Checkbox id={`${id}-${index}`} checked={selected.has(option.value)} disabled={option.disabled} onChange={event => {
        const next = new Set(value);
        event.target.checked ? next.add(option.value) : next.delete(option.value);
        onValueChange([...next]);
      }} /><Label className="flex min-h-touch flex-1 items-center" htmlFor={`${id}-${index}`}>{option.label}</Label>
    </div>)}
    {!options.length && <p className="text-label">No options available.</p>}
  </fieldset>;
}

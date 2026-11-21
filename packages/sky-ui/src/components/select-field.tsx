"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { FormField } from "./form-field";

export function SelectField({ id, label, value, onValueChange, options, placeholder = "Choose an option", disabled, error }: {
  id: string; label: string; value: string; onValueChange: (value: string) => void;
  options: readonly { value: string; label: string; disabled?: boolean }[];
  placeholder?: string; disabled?: boolean; error?: string;
}) {
  return <FormField id={id} label={label} error={error}>
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>{options.map(option => <SelectItem key={option.value} value={option.value} disabled={option.disabled}>{option.label}</SelectItem>)}</SelectContent>
    </Select>
  </FormField>;
}

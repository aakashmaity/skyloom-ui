"use client";

import type { ComponentPropsWithRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { useTheme } from "./theme-provider";
import { cn } from "../lib/utils";
import type { ThemeSettings } from "../lib/theme-settings";

export function ThemeControls({ className, ...props }: ComponentPropsWithRef<"div">) {
  const { settings, themes, fontProfiles, updateSettings } = useTheme();
  const controls: { key: keyof ThemeSettings; label: string; choices: readonly { id: string; label: string }[] }[] = [
    { key: "theme", label: "Color theme", choices: [...themes, { id: "system", label: "System" }] },
    { key: "palette", label: "Color palette", choices: ["sage", "ocean", "violet", "neutral"].map(id => ({ id, label: id[0].toUpperCase() + id.slice(1) })) },
    { key: "appearance", label: "Component appearance", choices: ["default", "classic", "modern"].map(id => ({ id, label: id[0].toUpperCase() + id.slice(1) })) },
    { key: "density", label: "Interface density", choices: [{ id: "comfortable", label: "Comfortable" }, { id: "compact", label: "Compact" }] },
    { key: "font", label: "Typography profile", choices: fontProfiles },
    { key: "motion", label: "Motion preference", choices: [{ id: "system", label: "System motion" }, { id: "reduced", label: "Reduced motion" }, { id: "none", label: "No motion" }] },
  ];
  return <div className={cn("flex min-w-0 flex-wrap items-center gap-control", className)} {...props}>{controls.map(control => <Select key={control.key} value={settings[control.key]} onValueChange={value => updateSettings({ [control.key]: value })}>
    <SelectTrigger aria-label={control.label} className="w-auto"><SelectValue /></SelectTrigger><SelectContent>{control.choices.map(choice => <SelectItem key={choice.id} value={choice.id}>{choice.label}</SelectItem>)}</SelectContent>
  </Select>)}</div>;
}

import type { ReactNode } from "react";

export type PlaygroundValues = Record<string, string>;
export type PlaygroundControl = { key: string; label: string; options: readonly string[]; kind?: "select" | "text" | "number" | "boolean"; min?: number; max?: number };
export type PlaygroundDefinition = {
  controls: PlaygroundControl[];
  defaults: PlaygroundValues;
  render: (values: PlaygroundValues) => ReactNode;
  source: (values: PlaygroundValues) => string;
};
type Choices = Record<string, readonly [string, ...string[]]>;
type Selection<T extends Choices> = { [K in keyof T]: T[K][number] };

export const titleCase = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/-/g, " ").replace(/^./, letter => letter.toUpperCase());

/** One typed specification drives controls, rendering, and copyable configuration. */
export function playground<const T extends Choices>(config: {
  choices: T;
  defaults?: Partial<Selection<T>>;
  labels?: Partial<Record<keyof T, string>>;
  fields?: Partial<Record<keyof T, { kind: "text" | "number" | "boolean"; min?: number; max?: number }>>;
  imports: string;
  render: (values: Selection<T>) => ReactNode;
  code: (values: Selection<T>) => string;
  setup?: (values: Selection<T>) => string;
}): PlaygroundDefinition {
  const controls = Object.entries(config.choices).map(([key, options]) => ({ key, label: config.labels?.[key] ?? titleCase(key), options, ...config.fields?.[key] }));
  const defaults = Object.fromEntries(controls.map(({ key, options }) => [key, config.defaults?.[key] ?? options[0]]));
  function normalize(values: PlaygroundValues) {
    return Object.fromEntries(controls.map(({ key, options, kind, min, max }) => [key, kind === "text" ? values[key] ?? defaults[key] : kind === "number" ? String(Number.isFinite(Number(values[key])) ? Math.max(min ?? -Infinity, Math.min(max ?? Infinity, Number(values[key]))) : Number(defaults[key])) : kind === "boolean" ? String(values[key] === "true") : options.includes(values[key]) ? values[key] : defaults[key]])) as Selection<T>;
  }
  return {
    controls, defaults,
    render: values => config.render(normalize(values)),
    source: values => {
      const selection = normalize(values);
      const setup = config.setup?.(selection) ?? "";
      const hooks = ["useState", "useId"].filter(hook => setup.includes(hook));
      return `"use client";\n${hooks.length ? `import { ${hooks.join(", ")} } from "react";\n` : ""}import { ${config.imports} } from "skyloom-ui";\n\nexport function ComponentPreview() {\n${setup ? setup.split("\n").map(line => `  ${line}`).join("\n") + "\n" : ""}  return (\n${config.code(selection).split("\n").map(line => `    ${line}`).join("\n")}\n  );\n}`;
    },
  };
}

export const cardStyles = ["default", "outline", "soft", "classic", "modern", "elevated"] as const;
export const buttonStyles = ["default", "secondary", "outline", "ghost", "destructive", "link", "soft", "success", "classic", "hover-border-gradient"] as const;
export const fieldStyles = ["default", "filled", "classic", "gradient"] as const;
export const appearanceStyles = ["default", "classic", "modern"] as const;

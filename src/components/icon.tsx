import type { ComponentPropsWithRef } from "react";
import { cn } from "../lib/utils";

const paths = {
  menu: "M4 6h16M4 12h16M4 18h16",
  upload: "M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5",
  play: "m8 4 12 8-12 8z",
  pause: "M8 4v16M16 4v16",
  reset: "M3 10a9 9 0 1 1 1 8M3 4v6h6",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  "arrow-right": "M5 12h14m-7-7 7 7-7 7",
  compare: "m8 8-4 4 4 4m8-8 4 4-4 4M12 3v18",
  "chevron-down": "m6 9 6 6 6-6",
  "chevron-up": "m6 15 6-6 6 6",
  "chevron-right": "m9 6 6 6-6 6",
  "arrow-up": "M12 19V5m-7 7 7-7 7 7",
  "arrow-down": "M12 5v14m-7-7 7 7 7-7",
  "arrow-left": "M19 12H5m7-7-7 7 7 7",
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12M6 18 18 6",
} as const;

export type IconName = keyof typeof paths | "grip" | "more-horizontal";
export type IconProps = Omit<ComponentPropsWithRef<"svg">, "children" | "name"> & { name: IconName };

/** Decorative by default. Label the enclosing control, or pass aria-label for a standalone image. */
export function Icon({ name, className, "aria-label": label, "aria-labelledby": labelledBy, ...props }: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    aria-hidden={label || labelledBy ? undefined : true} role={label || labelledBy ? "img" : undefined}
    aria-label={label} aria-labelledby={labelledBy} focusable="false"
    className={cn("block size-icon shrink-0", className)} {...props}>
    {name === "grip" ? [5, 12, 19].flatMap(y => [9, 15].map(x => <circle key={`${x}-${y}`} cx={x} cy={y} r={1} fill="currentColor" stroke="none" />))
      : name === "more-horizontal" ? [5, 12, 19].map(x => <circle key={x} cx={x} cy={12} r={1} fill="currentColor" />)
      : <path d={paths[name]} />}
  </svg>;
}

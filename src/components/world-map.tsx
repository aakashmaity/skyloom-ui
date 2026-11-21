"use client";
import { useId } from "react";
import { landRings } from "../data/land";
import { useAnimationActivity } from "./motion";
export type GeoPoint = { lat: number; lng: number; label?: string };
export type GeoConnection = { id: string; start: GeoPoint; end: GeoPoint };
export const validPoint = (point: GeoPoint) => Number.isFinite(point.lat) && Number.isFinite(point.lng) && Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180;
const project = ([lng, lat]: number[]) => [lng + 180, 90 - lat];
const land = landRings.map(ring => ring.map((point, index) => `${index ? "L" : "M"}${project(point).join(",")}`).join(" ") + "Z").join(" ");
export function WorldMap({ connections = [], variant = "dots", label = "World connections", className }: { connections?: readonly GeoConnection[]; variant?: "dots" | "outline"; label?: string; className?: string }) {
  const id = useId(), activity = useAnimationActivity<HTMLElement>();
  const valid = connections.filter(item => validPoint(item.start) && validPoint(item.end));
  return <figure ref={activity.ref} className={className}><svg viewBox="0 0 360 180" role="img" aria-label={label} className="w-full rounded-surface bg-card"><defs><pattern id={`${id}-dots`} width={3} height={3} patternUnits="userSpaceOnUse"><circle cx={1} cy={1} r={.6} fill="var(--muted-foreground)" /></pattern></defs><path d={land} fill={variant === "dots" ? `url(#${id}-dots)` : "var(--muted)"} stroke={variant === "outline" ? "var(--border)" : "none"} strokeWidth={.4} />{valid.map(item => { const [x1,y1]=project([item.start.lng,item.start.lat]),[x2,y2]=project([item.end.lng,item.end.lat]); return <g key={item.id}><path className={activity.enabled ? "sky-map-arc" : undefined} d={`M${x1},${y1} Q${(x1+x2)/2},${Math.min(y1,y2)-Math.abs(x2-x1)/4} ${x2},${y2}`} fill="none" stroke="var(--primary)" strokeWidth={1} pathLength={1} /><circle cx={x1} cy={y1} r={1.8} fill="var(--primary)" /><circle cx={x2} cy={y2} r={1.8} fill="var(--info)" /></g>; })}</svg><figcaption className="mt-control text-caption text-muted-foreground">{label}</figcaption><details className="text-caption"><summary className="sky-focus cursor-pointer">Connection details ({valid.length})</summary><ul>{valid.map(item => <li key={item.id}>{item.start.label ?? `${item.start.lat}, ${item.start.lng}`} to {item.end.label ?? `${item.end.lat}, ${item.end.lng}`}</li>)}</ul></details></figure>;
}

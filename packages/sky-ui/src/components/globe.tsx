"use client";
import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { WorldMap, type GeoConnection } from "./world-map";
import { useAnimationActivity } from "./motion";
import { Button } from "./button";
const Renderer = lazy(() => import("./globe-renderer"));
class GlobeBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> { state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; } render() { return this.state.failed ? this.props.fallback : this.props.children; } }
export type GlobeProps = { connections?: readonly GeoConnection[]; variant?: "arcs" | "points"; autoRotate?: boolean; label?: string; className?: string };
export function Globe({ connections = [], variant = "arcs", autoRotate = true, label = "Global connections", className }: GlobeProps) {
  const activity = useAnimationActivity<HTMLElement>(), [supported, setSupported] = useState(false), [paused, setPaused] = useState(false);
  useEffect(() => { const canvas = document.createElement("canvas"); try { const gl = canvas.getContext("webgl2"); setSupported(!!gl); gl?.getExtension("WEBGL_lose_context")?.loseContext(); } catch { setSupported(false); } }, []);
  const fallback = <WorldMap connections={connections} label={label} />;
  return <section ref={activity.ref} aria-label={label} className={className}>{supported && activity.inView ? <GlobeBoundary fallback={fallback}><Suspense fallback={fallback}><Renderer connections={connections} variant={variant} active={activity.enabled && !paused && autoRotate} themeKey={activity.themeKey} /></Suspense><p className="text-caption text-muted-foreground">Drag to rotate. Scroll to zoom.</p><Button variant="ghost" size="sm" onClick={() => setPaused(!paused)}>{paused ? "Resume rotation" : "Pause rotation"}</Button><details className="text-caption"><summary>Connection details</summary>{connections.map(item => <p key={item.id}>{item.start.label ?? `${item.start.lat}, ${item.start.lng}`} to {item.end.label ?? `${item.end.lat}, ${item.end.lng}`}</p>)}</details></GlobeBoundary> : fallback}</section>;
}

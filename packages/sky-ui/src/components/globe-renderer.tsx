"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import ThreeGlobe from "three-globe";
import { landRings } from "../data/land";
import { validPoint, type GeoConnection } from "./world-map";
import { resolveCanvasColor } from "../lib/canvas-tokens";
import type { Material, Mesh, MeshPhongMaterial } from "three";

function Earth({ connections, variant, active, colors }: { connections: readonly GeoConnection[]; variant: "arcs" | "points"; active: boolean; colors: string[] }) {
  const globe = useMemo(() => new ThreeGlobe({ animateIn: false }), []);
  const { invalidate } = useThree();
  useEffect(() => {
    const valid = connections.filter(item => validPoint(item.start) && validPoint(item.end));
    globe.polygonsData(landRings.map(ring => ({ type: "Feature", geometry: { type: "Polygon", coordinates: [ring] } }))).polygonCapColor(() => colors[1]).polygonSideColor(() => colors[1]).polygonStrokeColor(() => colors[2]);
    (globe.globeMaterial() as MeshPhongMaterial).color.set(colors[0]);
    globe.showAtmosphere(false).pointsData(valid.flatMap(item => [item.start, item.end])).pointLat("lat").pointLng("lng").pointColor(() => colors[2]).pointAltitude(.02).pointRadius(.7);
    globe.arcsData(variant === "arcs" ? valid : []).arcStartLat(item => (item as GeoConnection).start.lat).arcStartLng(item => (item as GeoConnection).start.lng).arcEndLat(item => (item as GeoConnection).end.lat).arcEndLng(item => (item as GeoConnection).end.lng).arcColor(() => colors[2]).arcStroke(.4).arcDashLength(1).arcDashGap(0).arcsTransitionDuration(0).pointsTransitionDuration(0).polygonsTransitionDuration(0);
    invalidate();
  }, [globe, connections, variant, colors, invalidate]);
  useFrame((_, delta) => { if (active) globe.rotation.y += delta * .08; });
  useEffect(() => () => { globe.pauseAnimation(); globe.traverse(object => { const mesh = object as Mesh; mesh.geometry?.dispose(); if (mesh.material) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((material: Material) => material.dispose()); }); }, [globe]);
  return <primitive object={globe} />;
}
export default function GlobeRenderer({ connections, variant, active, themeKey }: { connections: readonly GeoConnection[]; variant: "arcs" | "points"; active: boolean; themeKey: string }) {
  const ref = useRef<HTMLDivElement>(null), [colors, setColors] = useState<string[]>();
  useEffect(() => { if (ref.current) setColors(["var(--card)", "var(--muted-foreground)", "var(--primary)"].map(color => resolveCanvasColor(ref.current!, color))); }, [themeKey]);
  return <div ref={ref} className="h-chart w-full" role="img" aria-label="Interactive globe">{colors && <Canvas dpr={[1, 1.5]} frameloop={active ? "always" : "demand"} camera={{ position: [0, 0, 280], near: 1, far: 1000 }}><ambientLight intensity={2} /><directionalLight position={[100, 100, 200]} intensity={2} /><Earth connections={connections} variant={variant} active={active} colors={colors} /><OrbitControls enablePan={false} minDistance={150} maxDistance={450} enableDamping={false} /></Canvas>}</div>;
}

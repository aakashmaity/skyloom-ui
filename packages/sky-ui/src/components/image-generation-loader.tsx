"use client";

import { useEffect, useRef, useState } from "react";
import { useAnimationActivity, type MotionPreference } from "./motion";
import { canvas2D, resolveCanvasColor, tokenLength } from "../lib/canvas-tokens";
import { cn } from "../lib/utils";

export type ImageGenerationLoaderProps = { loading?: boolean; effect?: "shimmer" | "wave" | "scale-wave" | "none"; easing?: "linear" | "ease-in-out"; text?: string; duration?: number; cellSize?: number; gap?: number; bandHeight?: number; colors?: readonly [string, string]; motion?: MotionPreference; className?: string };
export function ImageGenerationLoader({ loading = true, effect = "shimmer", easing = "ease-in-out", text = "Generating", duration = 4000, cellSize, gap, bandHeight, colors = ["var(--primary)", "var(--info)"], motion, className }: ImageGenerationLoaderProps) {
  const activity = useAnimationActivity(motion);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [available, setAvailable] = useState(true);
  const [firstColor, secondColor] = colors;
  useEffect(() => {
    const node = activity.node, canvas = canvasRef.current;
    if (!node || !canvas || !loading) return;
    const ctx = canvas2D(canvas);
    if (!ctx) { setAvailable(false); return; }
    setAvailable(true);
    const mask = document.createElement("canvas"), maskCtx = canvas2D(mask);
    let width = 0, height = 0, frame = 0, start = 0, textPixels: Uint8ClampedArray | undefined;
    const a = resolveCanvasColor(node, firstColor), b = resolveCanvasColor(node, secondColor);
    const cell = Math.max(1, cellSize && Number.isFinite(cellSize) ? cellSize : tokenLength(node, "--sky-loader-cell", 4));
    const spacing = Math.max(0, gap !== undefined && Number.isFinite(gap) ? gap : tokenLength(node, "--sky-loader-gap", 2));
    const band = Math.max(cell, bandHeight && Number.isFinite(bandHeight) ? bandHeight : tokenLength(node, "--sky-loader-band", 48));
    const milliseconds = Number.isFinite(duration) && duration > 0 ? duration : 4000;
    function draw(time: number) {
      if (!ctx) return;
      if (!start) start = time;
      const raw = activity.enabled ? ((time - start) % milliseconds) / milliseconds : .5;
      const progress = easing === "linear" ? raw : (1 - Math.cos(Math.PI * raw)) / 2;
      const yBand = progress * (height + band) - band / 2;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = b;
      ctx.globalAlpha = .12;
      ctx.fillRect(0, 0, width, Math.max(0, yBand - band / 2));
      ctx.globalAlpha = 1;
      const stride = Math.max(cell + spacing, Math.sqrt(width * height / 6000));
      for (let y = 0; y < height; y += stride) for (let x = 0; x < width; x += stride) {
        const distance = Math.abs(y - yBand) / band;
        const alpha = Math.max(0, 1 - distance);
        if (alpha <= 0) continue;
        const wave = Math.sin(x / stride * .45 + raw * Math.PI * 4);
        const inText = textPixels && textPixels[(Math.floor(y) * Math.ceil(width) + Math.floor(x)) * 4 + 3] > 0;
        ctx.fillStyle = inText ? b : a;
        ctx.globalAlpha = inText ? 1 : alpha * (effect === "shimmer" ? .45 + .35 * Math.sin(x + y + raw * 12) : .55);
        const size = cell * (effect === "scale-wave" ? 1 + alpha * (wave + 1) / 2 : 1);
        const offset = effect === "wave" ? wave * stride * alpha : 0;
        ctx.fillRect(x - (size - cell) / 2, y + offset, size, size);
      }
      ctx.globalAlpha = 1;
      if (activity.enabled && effect !== "none") frame = requestAnimationFrame(draw);
    }
    function resize() {
      if (!node || !canvas || !ctx) return;
      cancelAnimationFrame(frame);
      const rect = node.getBoundingClientRect(); width = Math.ceil(rect.width); height = Math.ceil(rect.height);
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4000000 / (width * height)));
      canvas.width = Math.ceil(width * ratio); canvas.height = Math.ceil(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      mask.width = width; mask.height = height;
      if (maskCtx) {
        maskCtx.font = `600 ${Math.min(width / Math.max(text.length * .65, 1), band * .65)}px ${getComputedStyle(node).fontFamily}`;
        maskCtx.textAlign = "center"; maskCtx.textBaseline = "middle";
        maskCtx.fillText(text.toUpperCase(), width / 2, height / 2);
        textPixels = maskCtx.getImageData(0, 0, width, height).data;
      }
      draw(performance.now());
    }
    const observer = new ResizeObserver(resize); observer.observe(node); resize();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [activity.node, activity.enabled, activity.themeKey, loading, effect, easing, text, duration, cellSize, gap, bandHeight, firstColor, secondColor]);
  if (!loading) return null;
  return <div ref={activity.ref} className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-busy="true"><canvas ref={canvasRef} aria-hidden="true" className="size-full" /><span role="status" className={cn("absolute inset-x-0 bottom-0 bg-card p-inline text-center text-label text-card-foreground", available && activity.enabled && effect !== "none" && "sr-only")}>{text}</span></div>;
}

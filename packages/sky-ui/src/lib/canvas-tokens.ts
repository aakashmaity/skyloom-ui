/** Some browsers can throw when canvas contexts are disabled by policy. */
export function canvas2D(canvas: HTMLCanvasElement) {
  try { return canvas.getContext("2d"); } catch { return null; }
}

/** Resolve CSS colors to sRGB for renderers that cannot parse OKLCH or CSS variables. */
export function resolveCanvasColor(element: Element, color: string) {
  const probe = document.createElement("span");
  probe.style.color = color;
  element.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas2D(canvas);
  if (!context) return resolved;
  context.fillStyle = resolved;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
}

export function tokenLength(element: Element, token: string, fallback: number) {
  const probe = document.createElement("span");
  probe.style.cssText = `position:absolute;visibility:hidden;display:block;width:var(${token})`;
  element.appendChild(probe);
  const length = probe.getBoundingClientRect().width;
  probe.remove();
  return length > 0 ? length : fallback;
}

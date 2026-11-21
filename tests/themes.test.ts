// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

const css = readFileSync("packages/sky-ui/src/tokens.css", "utf8");
function properties(text: string) {
  return Object.fromEntries([...text.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(match => [match[1], match[2]]));
}
const foundation = properties(css.split(":root, ")[0]);
const light = properties(css.split(':root, :root[data-theme="light"] {')[1].split("}")[0]);
const dark = properties(css.split(':root[data-theme="dark"] {')[1].split("}")[0]);
const sepia = properties(css.split(':root[data-theme="sepia"] {')[1].split("}")[0]);

function resolve(name: string, tokens: Record<string, string>, seen = new Set<string>()): string {
  if (seen.has(name)) throw new Error(`Cyclic token: ${name}`);
  seen.add(name);
  const value = tokens[name];
  if (!value) throw new Error(`Undefined token: ${name}`);
  return value.startsWith("var(") ? resolve(value.slice(4, -1), tokens, seen) : value;
}

// OKLCH -> linear sRGB -> WCAG relative luminance (clipped to the sRGB gamut).
function luminance(color: string) {
  const [L, C, H] = color.slice(6, -1).split(/\s+/).map(Number);
  const a = C * Math.cos(H * Math.PI / 180), b = C * Math.sin(H * Math.PI / 180);
  const l = (L + .3963377774 * a + .2158037573 * b) ** 3;
  const m = (L - .1055613458 * a - .0638541728 * b) ** 3;
  const s = (L - .0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return .2126 * clamp(4.0767416621 * l - 3.3077115913 * m + .2309699292 * s)
    + .7152 * clamp(-1.2684380046 * l + 2.6097574011 * m - .3413193965 * s)
    + .0722 * clamp(-.0041960863 * l - .7034186147 * m + 1.707614701 * s);
}

describe("theme contracts", () => {
  const palettes = Object.fromEntries(["sage", "ocean", "violet", "neutral"].map(name => [name, properties(css.split(`:root[data-palette="${name}"] {`)[1]?.split("}")[0] ?? "")]));
  for (const [palette, overrides] of Object.entries(palettes)) {
    for (const [name, mode] of Object.entries({ light, dark, sepia })) {
      it(`${palette}/${name} resolves foreground/background pairs with readable text contrast`, () => {
        const tokens = { ...foundation, ...light, ...mode, ...overrides };
        for (const [bg, fg] of [["background", "foreground"], ["secondary", "primary"], ["card", "warning"], ["card", "info"], ...["card", "popover", "primary", "secondary", "muted", "accent", "destructive", "success", "warning", "info"].map(role => [role, `${role}-foreground`])]) {
          const a = luminance(resolve(`--${bg}`, tokens));
          const b = luminance(resolve(`--${fg}`, tokens));
          const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
          expect(ratio, `${palette}/${name}: ${bg}/${fg}`).toBeGreaterThanOrEqual(4.5);
        }
      });
    }
  }
});

import { readdir, readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import path from "node:path";

const root = path.resolve("packages/sky-ui/src");
async function walk(dir) {
  return (await Promise.all((await readdir(dir, { withFileTypes: true })).map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : path.join(dir, entry.name)))).flat();
}
const files = await walk(root);
const errors = [];
for (const file of files.filter(file => /\.(css|tsx?)$/.test(file))) {
  const text = await readFile(file, "utf8");
  if (/\b\d*\.?\d+px\b/.test(text)) errors.push(`${file}: pixel literal`);
  if (file.endsWith(".tsx")) {
    if (/(?:#[\da-f]{3,8}\b|\b(?:oklch|rgb|hsl)a?\s*\()/.test(text)) errors.push(`${file}: raw color`);
    if (/\[(?:\d*\.)?\d+(?:px|rem|em)\]/.test(text)) errors.push(`${file}: arbitrary dimension`);
    if (/(?:\s|["':])(?:p[xysetblr]?|m[xysetblr]?|gap|size|min-h|min-w|h|w)-[1-9]\d*(?:\s|["'])/.test(text)) errors.push(`${file}: numeric sizing utility; use a semantic token`);
  }
}
assert.deepEqual(errors, [], errors.join("\n"));
const css = await readFile(".checks/sky-ui.css", "utf8");
for (const required of ["var(--primary)", "var(--sky-control-height)", "var(--sky-space-panel)", "var(--sky-radius-control)", "width >= 48rem", "width >= 64rem", ".tablet\\:grid-cols-2", ".laptop\\:grid-cols-3", ".min-h-touch", "prefers-reduced-motion", "--radix-select-content-available-height"]) {
  assert.ok(css.includes(required), `Missing compiled token or responsive rule: ${required}`);
}
console.log("Token rules and compiled responsive utilities passed.");

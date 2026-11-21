import { copyFile, readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

await copyFile("src/tokens.css", "dist/tokens.css");
await copyFile("src/advanced.css", "dist/advanced.css");
const css = await readFile("src/styles.css", "utf8");
await writeFile("dist/styles.css", css.replace('./**/*.{ts,tsx}', './**/*.{js,ts,tsx}'));

// Explicit extensions make the emitted ESM portable beyond bundler resolution.
async function rewrite(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await rewrite(file);
    else if (file.endsWith(".js") || file.endsWith(".d.ts")) {
      const content = await readFile(file, "utf8");
      await writeFile(file, content.replace(/((?:from\s+|import\s*\()["'])(\.[^"']+)(["'])/g, (match, prefix, specifier, suffix) => path.extname(specifier) ? match : `${prefix}${specifier}.js${suffix}`));
    }
  }
}
await rewrite("dist");

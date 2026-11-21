import { defaultThemeSettings, initializeTheme, themes, fontProfiles, type FontProfileDefinition, type ThemeDefinition, type ThemeSettings } from "../lib/theme-settings";

/** Place in head; use matching configuration on ThemeProvider. */
export function ThemeScript({ nonce, themes: registry = themes, fontProfiles: suppliedFonts = fontProfiles, defaultSettings, storagePrefix = "sky-ui" }: { nonce?: string; themes?: readonly ThemeDefinition[]; fontProfiles?: readonly FontProfileDefinition[]; defaultSettings?: Partial<ThemeSettings>; storagePrefix?: string }) {
  const fonts = suppliedFonts.length ? suppliedFonts : fontProfiles;
  const args = JSON.stringify([registry, fonts, { ...defaultThemeSettings, ...defaultSettings }, storagePrefix]).replace(/</g, "\\u003c");
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: `(${initializeTheme.toString()})(...${args});` }} />;
}

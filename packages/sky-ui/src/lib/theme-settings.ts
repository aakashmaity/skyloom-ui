export type ThemeDefinition = { id: string; label: string; colorScheme: "light" | "dark" };
export const themes: readonly ThemeDefinition[] = [
  { id: "light", label: "Light", colorScheme: "light" },
  { id: "dark", label: "Dark", colorScheme: "dark" },
  { id: "sepia", label: "Sepia", colorScheme: "light" },
];
export type FontProfileDefinition = { id: string; label: string };
export const fontProfiles: readonly FontProfileDefinition[] = [
  { id: "system", label: "System font" },
  { id: "inter", label: "Inter" },
  { id: "editorial", label: "Editorial" },
];
export type ThemeSettings = {
  theme: string;
  palette: "sage" | "ocean" | "violet" | "neutral";
  appearance: "default" | "classic" | "modern";
  density: "comfortable" | "compact";
  font: string;
  motion: "system" | "reduced" | "none";
};
export const defaultThemeSettings: ThemeSettings = { theme: "light", palette: "sage", appearance: "default", density: "comfortable", font: "system", motion: "system" };

/** Self-contained so the same resolver can run before hydration in ThemeScript. */
export function initializeTheme(registry: readonly ThemeDefinition[], fonts: readonly FontProfileDefinition[], defaults: ThemeSettings, storagePrefix: string, override?: Partial<ThemeSettings>): ThemeSettings {
  const choices = {
    theme: ["system", ...registry.map(item => item.id)],
    palette: ["sage", "ocean", "violet", "neutral"],
    appearance: ["default", "classic", "modern"],
    density: ["comfortable", "compact"],
    font: fonts.length ? fonts.map(item => item.id) : ["system"],
    motion: ["system", "reduced", "none"],
  };
  const settings = { ...defaults };
  for (const key of Object.keys(choices) as (keyof ThemeSettings)[]) {
    let saved: string | null = null;
    try { saved = localStorage.getItem(`${storagePrefix}-${key}`); } catch { /* Storage is optional. */ }
    const requested = override?.[key] ?? saved ?? defaults[key];
    Object.assign(settings, { [key]: choices[key].includes(requested) ? requested : (choices[key].includes(defaults[key]) ? defaults[key] : choices[key][0]) });
  }
  const resolved = settings.theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : settings.theme;
  Object.assign(document.documentElement.dataset, { ...settings, theme: resolved, themePreference: settings.theme });
  document.documentElement.style.colorScheme = registry.find(item => item.id === resolved)?.colorScheme ?? "light";
  return settings;
}

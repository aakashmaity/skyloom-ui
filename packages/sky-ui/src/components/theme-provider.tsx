"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { defaultThemeSettings, initializeTheme, themes, fontProfiles, type FontProfileDefinition, type ThemeDefinition, type ThemeSettings } from "../lib/theme-settings";

type ThemeContextValue = {
  settings: ThemeSettings;
  resolvedTheme: string;
  themes: readonly ThemeDefinition[];
  fontProfiles: readonly FontProfileDefinition[];
  updateSettings: (settings: Partial<ThemeSettings>) => void;
  resetSettings: () => void;
};
const ThemeContext = createContext<ThemeContextValue | null>(null);
export type ThemeProviderProps = { children: ReactNode; themes?: readonly ThemeDefinition[]; fontProfiles?: readonly FontProfileDefinition[]; defaultSettings?: Partial<ThemeSettings>; storagePrefix?: string };

export function ThemeProvider({ children, themes: registry = themes, fontProfiles: suppliedFonts = fontProfiles, defaultSettings, storagePrefix = "sky-ui" }: ThemeProviderProps) {
  const fonts = suppliedFonts.length ? suppliedFonts : fontProfiles;
  const defaults = useMemo(() => ({ ...defaultThemeSettings, ...defaultSettings }), [defaultSettings]);
  const [settings, setSettings] = useState<ThemeSettings>(defaults);
  const settingsRef = useRef(settings);
  const initializedNamespace = useRef<string | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState(defaults.theme === "system" ? "light" : defaults.theme);

  useEffect(() => {
    const refresh = (override?: Partial<ThemeSettings>) => {
      const next = initializeTheme(registry, fonts, defaults, storagePrefix, override);
      settingsRef.current = next;
      setSettings(next);
      setResolvedTheme(document.documentElement.dataset.theme!);
    };
    // Equivalent parent configurations must not reset choices when storage is blocked.
    refresh(initializedNamespace.current === storagePrefix ? settingsRef.current : undefined);
    initializedNamespace.current = storagePrefix;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const storage = (event: StorageEvent) => { if (event.key === null || event.key.startsWith(`${storagePrefix}-`)) refresh(); };
    const systemChanged = () => refresh(settingsRef.current);
    media.addEventListener("change", systemChanged);
    window.addEventListener("storage", storage);
    return () => { media.removeEventListener("change", systemChanged); window.removeEventListener("storage", storage); };
  }, [registry, fonts, defaults, storagePrefix]);

  function updateSettings(next: Partial<ThemeSettings>) {
    const updated = initializeTheme(registry, fonts, defaults, storagePrefix, { ...settingsRef.current, ...next });
    settingsRef.current = updated;
    setSettings(updated);
    setResolvedTheme(document.documentElement.dataset.theme!);
    for (const [key, value] of Object.entries(updated)) {
      try { localStorage.setItem(`${storagePrefix}-${key}`, value); } catch { /* Optional persistence. */ }
    }
  }
  return <ThemeContext.Provider value={{ settings, resolvedTheme, themes: registry, fontProfiles: fonts, updateSettings, resetSettings: () => updateSettings(defaults) }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider.");
  return context;
}

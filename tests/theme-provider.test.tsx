import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "../packages/sky-ui/src/components/theme-provider";
import { ThemeScript } from "../packages/sky-ui/src/components/theme-script";
import { ThemeControls } from "../packages/sky-ui/src/components/theme-controls";
import { fontProfiles, themes } from "../packages/sky-ui/src/lib/theme-settings";
import userEvent from "@testing-library/user-event";

let media: EventTarget & { matches: boolean };
beforeEach(() => {
  localStorage.clear();
  media = Object.assign(new EventTarget(), { matches: false });
  vi.stubGlobal("matchMedia", () => media);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); localStorage.clear(); });
function Controls() {
  const { settings, resolvedTheme, updateSettings } = useTheme();
  return <><output>{settings.theme}/{resolvedTheme}/{settings.font}</output>
    <button onClick={() => updateSettings({ theme: "system" })}>System</button>
    <button onClick={() => updateSettings({ theme: "sepia", font: "editorial" })}>Sepia</button>
  </>;
}
describe("theme preference resolution", () => {
  it("follows system changes only for the system preference", () => {
    render(<ThemeProvider><Controls /></ThemeProvider>);
    fireEvent.click(screen.getByText("System"));
    act(() => { media.matches = true; media.dispatchEvent(new Event("change")); });
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.getByText("system/dark/system")).toBeTruthy();
    fireEvent.click(screen.getByText("Sepia"));
    act(() => { media.matches = false; media.dispatchEvent(new Event("change")); });
    expect(document.documentElement.dataset.theme).toBe("sepia");
    expect(document.documentElement.dataset.font).toBe("editorial");
    expect(localStorage.getItem("sky-ui-theme")).toBe("sepia");
  });
  it("validates saved settings and responds to cross-tab storage changes", () => {
    localStorage.setItem("sky-ui-theme", "unknown");
    localStorage.setItem("sky-ui-font", "missing");
    render(<ThemeProvider><Controls /></ThemeProvider>);
    expect(screen.getByText("light/light/system")).toBeTruthy();
    act(() => { localStorage.setItem("sky-ui-theme", "sepia"); window.dispatchEvent(new StorageEvent("storage", { key: "sky-ui-theme" })); });
    expect(document.documentElement.dataset.theme).toBe("sepia");
  });
  it("keeps in-memory choices when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Blocked"); });
    const { rerender } = render(<ThemeProvider defaultSettings={{ theme: "light" }}><Controls /></ThemeProvider>);
    fireEvent.click(screen.getByText("Sepia"));
    rerender(<ThemeProvider defaultSettings={{ theme: "light" }}><Controls /></ThemeProvider>);
    act(() => { media.matches = true; media.dispatchEvent(new Event("change")); });
    expect(screen.getByText("sepia/sepia/editorial")).toBeTruthy();
  });
  it("registers custom fonts and themes in controls, persistence, and the bootstrap script", async () => {
    const fonts = [...fontProfiles, { id: "studio", label: "Studio" }];
    const registry = [...themes, { id: "midnight", label: "Midnight", colorScheme: "dark" as const }];
    const props = { fontProfiles: fonts, themes: registry, defaultSettings: { theme: "midnight" } };
    const first = render(<ThemeProvider {...props}><ThemeControls /></ThemeProvider>);
    expect(document.documentElement.dataset.theme).toBe("midnight");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    await userEvent.click(screen.getByRole("combobox", { name: "Typography profile" }));
    await userEvent.click(screen.getByRole("option", { name: "Studio", exact: true }));
    expect(document.documentElement.dataset.font).toBe("studio");
    expect(localStorage.getItem("sky-ui-font")).toBe("studio");
    first.unmount();
    document.documentElement.dataset.font = "system";
    const markup = renderToStaticMarkup(<ThemeScript {...props} />);
    new Function(markup.slice(markup.indexOf(">") + 1, markup.lastIndexOf("</script>")))();
    expect(document.documentElement.dataset.font).toBe("studio");
    render(<ThemeProvider {...props}><ThemeControls /></ThemeProvider>);
    expect(screen.getByRole("combobox", { name: "Typography profile" }).textContent).toContain("Studio");
  });
  it("uses built-in fonts for an empty registry and isolates preference namespaces", () => {
    localStorage.setItem("other-font", "inter");
    const { rerender } = render(<ThemeProvider fontProfiles={[]}><Controls /></ThemeProvider>);
    fireEvent.click(screen.getByText("Sepia"));
    rerender(<ThemeProvider fontProfiles={[]} storagePrefix="other"><Controls /></ThemeProvider>);
    expect(screen.getByText("light/light/inter")).toBeTruthy();
    expect(localStorage.getItem("sky-ui-font")).toBe("editorial");
  });
  it("executes the pre-hydration script without module closures and escapes configuration", () => {
    localStorage.setItem("sky-ui-theme", "system");
    media.matches = true;
    const markup = renderToStaticMarkup(<ThemeScript nonce="test-nonce" />);
    const script = markup.slice(markup.indexOf(">") + 1, markup.lastIndexOf("</script>"));
    new Function(script)();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(markup).toContain('nonce="test-nonce"');
    expect(renderToStaticMarkup(<ThemeScript storagePrefix="</script><script>" />).match(/<script/g)).toHaveLength(1);
  });
});

import { expect, test } from "@playwright/test";

test("palette and appearance controls persist and dialogs inherit every theme combination", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Color palette" }).click();
  await page.getByRole("option", { name: "Ocean", exact: true }).click();
  await page.getByRole("combobox", { name: "Component appearance" }).click();
  await page.getByRole("option", { name: "Modern", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "ocean");
  await expect(page.locator("html")).toHaveAttribute("data-appearance", "modern");
  await page.getByLabel("Search components").fill("Dialog variants");
  const trigger = page.getByRole("button", { name: "Open modern dialog" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Modern details" });
  for (const palette of ["sage", "ocean", "violet", "neutral"]) {
    for (const theme of ["light", "dark", "sepia"]) {
      for (const appearance of ["default", "classic", "modern"]) {
        for (const density of ["comfortable", "compact"]) {
          await page.evaluate(settings => Object.assign(document.documentElement.dataset, settings), { palette, theme, appearance, density });
          const colors = await dialog.evaluate(el => {
            const probe = document.createElement("div");
            probe.style.backgroundColor = "var(--popover)";
            document.body.append(probe);
            const expected = getComputedStyle(probe).backgroundColor;
            probe.remove();
            return {
              actual: getComputedStyle(el).backgroundColor,
              expected,
              foreground: getComputedStyle(el).color,
              primary: getComputedStyle(el).getPropertyValue("--primary").trim(),
              rootPrimary: getComputedStyle(document.documentElement).getPropertyValue("--primary").trim(),
            };
          });
          expect(colors.actual).toBe(colors.expected);
          expect(colors.actual).not.toBe(colors.foreground);
          expect(colors.primary).toBe(colors.rootPrimary);
          const box = await dialog.boundingBox();
          expect(box!.x).toBeGreaterThanOrEqual(0);
          expect(box!.width + box!.x).toBeLessThanOrEqual(page.viewportSize()!.width);
          expect(box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
        }
      }
    }
  }
  await page.keyboard.press("Tab");
  expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.getByLabel("Search components").fill("Messages & Prompt Input");
  const composer = page.getByRole("textbox", { name: "Message", exact: true });
  await composer.fill("A long message ".repeat(30));
  await composer.press("Enter");
  await expect(composer).toHaveValue("");
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", await page.locator("html").evaluate(el => el.clientWidth));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("#chat-primitives").screenshot({ path: `.checks/variants-${testInfo.project.name}.png` });
  await page.getByLabel("Search components").fill("Line Tabs");
  const activeTab = page.getByRole("tab", { name: "Overview", exact: true });
  await expect(activeTab).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await activeTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Activity", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", await page.locator("html").evaluate(el => el.clientWidth));
});

test("gallery pagination and responsive layout", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await page.getByLabel("Search components").fill("Paginated Data Table");
  const table = page.locator("#data-table");
  await expect(table.getByText("Showing 1–5 of 84 rows")).toBeVisible();
  await table.getByRole("button", { name: "Next", exact: true }).click();
  await expect(table.getByText("Showing 6–10 of 84 rows")).toBeVisible();
  await table.getByLabel("Search requests").fill("req-084");
  await expect(table.getByText("Showing 1–1 of 1 rows")).toBeVisible();
  await expect(table.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
  await table.getByLabel("Search requests").fill("no-results");
  await expect(table.getByText("No matching rows.")).toBeVisible();
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", await page.locator("html").evaluate(el => el.clientWidth));
  expect(errors).toEqual([]);
});

test("AI charts render and filters, themes, and data tables work", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/analytics");
  await expect(page.getByRole("heading", { name: "AI, in perspective." })).toBeVisible();
  await expect(page.locator(".sky-chart svg.recharts-surface")).toHaveCount(9);
  for (const chart of await page.locator(".sky-chart").all()) {
    const box = await chart.boundingBox();
    expect(box?.width).toBeGreaterThan(100);
    expect(box?.height).toBeGreaterThan(100);
  }
  await page.getByRole("combobox", { name: "Operational window" }).click();
  await page.getByRole("option", { name: "Nov 8–14, 2026" }).click();
  await page.getByRole("combobox", { name: "Model", exact: true }).click();
  await page.getByRole("option", { name: "Scout", exact: true }).click();
  await expect(page.getByText("Showing 1–10 of 14 rows")).toBeVisible();
  await page.getByRole("button", { name: "Dark theme", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator("summary").first().click();
  await expect(page.getByRole("table", { name: "Token usage values" })).toBeVisible();
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", await page.locator("html").evaluate(el => el.clientWidth));
  await page.screenshot({ path: `.checks/analytics-${testInfo.project.name}.png` });
  expect(errors).toEqual([]);
});

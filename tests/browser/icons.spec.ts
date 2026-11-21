import { expect, test, type Locator } from "@playwright/test";

async function centered(control: Locator, icon: Locator, square = true) {
  const box = await control.boundingBox();
  const glyph = await icon.boundingBox();
  expect(box).not.toBeNull();
  expect(glyph).not.toBeNull();
  expect(Math.abs(glyph!.y + glyph!.height / 2 - box!.y - box!.height / 2)).toBeLessThan(1);
  expect(glyph!.width).toBeGreaterThan(0);
  if (square) expect(glyph!.width).toBeCloseTo(glyph!.height, 1);
  expect(glyph!.x).toBeGreaterThanOrEqual(box!.x);
  expect(glyph!.x + glyph!.width).toBeLessThanOrEqual(box!.x + box!.width);
}

test("SVG disclosure stays aligned across fonts, themes, density, and reading direction", async ({ page }, info) => {
  test.setTimeout(120000);
  await page.goto("/");
  await page.getByLabel("Search components").fill("Tool Status");
  const card = page.locator("#tool-status");
  await card.getByRole("tab", { name: "Playground", exact: true }).click();
  await card.getByRole("combobox", { name: "Title", exact: true }).click();
  await page.getByRole("option", { name: "Long", exact: true }).click();
  const trigger = card.locator(".sky-disclosure");
  const icon = trigger.locator("svg");
  const badge = trigger.locator("span").nth(1);
  for (const theme of ["light", "dark", "sepia"]) for (const font of ["system", "inter", "editorial"]) for (const density of ["comfortable", "compact"]) for (const dir of ["ltr", "rtl"]) {
    await page.evaluate(settings => {
      Object.assign(document.documentElement.dataset, settings);
      document.documentElement.dir = settings.dir;
    }, { theme, font, density, dir });
    await page.evaluate(() => document.fonts.ready);
    await centered(trigger, icon);
    await centered(trigger, badge, false);
    const titleBox = await trigger.locator("span").first().boundingBox();
    const badgeBox = await badge.boundingBox();
    // Radix can supply its own direction independently of the surrounding page.
    const direction = await trigger.evaluate(el => getComputedStyle(el).direction);
    expect(direction === "ltr" ? titleBox!.x + titleBox!.width <= badgeBox!.x : badgeBox!.x + badgeBox!.width <= titleBox!.x).toBe(true);
  }
  await page.evaluate(() => { document.documentElement.dir = "ltr"; document.documentElement.dataset.motion = "none"; });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(icon).toHaveCSS("transform", "matrix(-1, 0, 0, -1, 0, 0)");
  await expect(icon).toHaveCSS("transition-duration", "0s");
  await card.screenshot({ path: `.checks/icons-status-${info.project.name}.png` });
  await page.setViewportSize({ width: 320, height: 800 });
  await centered(trigger, icon);
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", await page.locator("html").evaluate(el => el.clientWidth));
});

test("select and drawer SVGs align without changing control names or keyboard behavior", async ({ page }, info) => {
  await page.goto("/");
  const theme = page.getByRole("combobox", { name: "Color theme" });
  await centered(theme, theme.locator("svg"));
  await theme.click();
  const selected = page.getByRole("option", { selected: true });
  await centered(selected, selected.locator("svg"));
  await page.keyboard.press("Escape");
  await expect(theme).toBeFocused();
  await page.getByLabel("Search components").fill("Paginated Data Table");
  await page.getByRole("button", { name: "Manage columns" }).click();
  const drawer = page.getByRole("dialog", { name: "Manage columns" });
  await drawer.getByRole("button", { name: "Close panel" }).click({ trial: true });
  for (const button of await drawer.getByRole("button").filter({ has: page.locator("svg") }).all()) {
    await centered(button, button.locator("svg"));
  }
  for (const select of await drawer.locator("select").all()) await centered(select, select.locator("..").locator("svg"));
  await drawer.screenshot({ path: `.checks/icons-drawer-${info.project.name}.png` });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Manage columns" })).toBeFocused();
});

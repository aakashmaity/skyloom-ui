import { expect, test, type Page } from "@playwright/test";

async function choose(page: Page, name: string, option: string) {
  await page.getByRole("combobox", { name, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("variant playground compares, generates code, resets, and fits narrow screens", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await page.getByLabel("Search components").fill("Button");
  const card = page.locator("#button");
  await card.getByRole("tab", { name: "Playground", exact: true }).click();
  const playground = card.getByRole("region", { name: "Button playground" });
  await choose(page, "Variant", "Success");
  await expect(playground.getByRole("button", { name: "Continue", exact: true })).toHaveClass(/bg-success/);
  await playground.getByRole("switch", { name: "Compare options" }).click();
  await expect(playground.getByRole("button", { name: "Continue", exact: true })).toHaveCount(10);
  await playground.getByRole("button", { name: "Use Classic", exact: true }).click();
  await playground.locator("summary").click();
  await expect(playground.getByLabel("Button configuration code")).toContainText('variant="classic"');
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await playground.getByRole("button", { name: "Copy configuration", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('variant="classic"');
  await choose(page, "State", "Disabled");
  for (const button of await playground.getByRole("button", { name: "Continue", exact: true }).all()) await expect(button).toBeDisabled();
  await choose(page, "Preview width", "Narrow container");
  await choose(page, "Color theme", "Sepia");
  await page.screenshot({ path: `.checks/playground-${info.project.name}.png`, fullPage: true });
  await playground.getByRole("button", { name: "Reset playground" }).click();
  await expect(playground.getByRole("button", { name: "Continue", exact: true })).toBeEnabled();
  await expect(playground.getByRole("switch", { name: "Compare options" })).not.toBeChecked();
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", await page.locator("html").evaluate(el => el.clientWidth));
  expect(errors).toEqual([]);
});

test("motion preferences and OS reduction reach portals and interactive surfaces", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.getByLabel("Search components").fill("Sheet");
  const card = page.locator("#sheet");
  await card.getByRole("tab", { name: "Playground", exact: true }).click();
  const trigger = card.getByRole("button", { name: "Open preview sheet" });
  await trigger.click();
  const drawer = page.getByRole("dialog", { name: "Preview sheet" });
  await expect(drawer).toHaveCSS("animation-name", "sky-sheet-in");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await choose(page, "Motion preference", "No motion");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "none");
  await page.getByLabel("Search components").fill("Sheet");
  await card.getByRole("tab", { name: "Playground", exact: true }).click();
  await trigger.click();
  await expect(drawer).toHaveCSS("animation-name", "none");
  await page.keyboard.press("Escape");
  await choose(page, "Motion preference", "System motion");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await trigger.click();
  await expect(drawer).toHaveCSS("animation-name", "none");
  await page.keyboard.press("Escape");
  await page.getByLabel("Search components").fill("Interactive Card");
  await page.locator("#interactive-card").getByRole("tab", { name: "Playground" }).click();
  const surface = page.locator("#interactive-card .sky-interactive-card");
  await surface.hover();
  await expect(surface).toHaveCSS("translate", "none");
  await choose(page, "Effect", "Spotlight");
  await surface.hover();
  expect(await surface.evaluate(el => el.style.getPropertyValue("--sky-pointer-x"))).toBe("");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await choose(page, "Motion preference", "No motion");
  await surface.hover();
  expect(await surface.evaluate(el => el.style.getPropertyValue("--sky-pointer-x"))).toBe("");
});

test("every catalog entry opens a functioning playground", async ({ page }, info) => {
  test.skip(info.project.name !== "laptop", "Catalog coverage; responsive behavior is checked separately at every size.");
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const ids = await page.locator("#components .ds-section").evaluateAll(cards => cards.map(card => card.id));
  expect(ids.length).toBeGreaterThan(50);
  for (const id of ids) {
    const card = page.locator(`#${id}`);
    await card.getByRole("tab", { name: "Playground", exact: true }).click();
    await expect(card.getByRole("button", { name: "Reset playground" })).toBeVisible();
    await card.getByRole("tab", { name: "Preview", exact: true }).click();
  }
  expect(errors).toEqual([]);
});

test("column drawer keeps its actions visible while its column list scrolls", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search components").fill("Paginated Data Table");
  await page.getByRole("button", { name: "Manage columns", exact: true }).click();
  const drawer = page.getByRole("dialog", { name: "Manage columns" });
  await expect(drawer.getByText("6 of 6 visible", { exact: false })).toBeVisible();
  const done = drawer.getByRole("button", { name: "Done", exact: true });
  const box = (await done.boundingBox())!;
  expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await drawer.getByRole("switch", { name: "Show Cost (USD)", exact: true }).scrollIntoViewIfNeeded();
  await expect(done).toBeInViewport();
  await done.click();
  await expect(page.getByRole("button", { name: "Manage columns", exact: true })).toBeFocused();
});

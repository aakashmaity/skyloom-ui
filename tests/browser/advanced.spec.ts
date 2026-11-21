import { expect, test } from "@playwright/test";

test("advanced components support keyboard interaction and responsive layout", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  const search = page.getByLabel("Search components");
  await search.fill("compare");
  const compare = page.locator("#compare");
  const slider = compare.getByRole("slider");
  await slider.focus();
  await slider.press("ArrowRight");
  await expect(slider).toHaveValue("51");
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", await page.evaluate(() => document.documentElement.clientWidth));
  await search.fill("infinite card");
  const gallery = page.locator("#infinite-card-grid");
  await expect(gallery.locator(".sky-gallery-tile").first()).toBeVisible();
  expect(await gallery.locator(".sky-gallery-tile").count()).toBeLessThanOrEqual(120);
  await gallery.getByRole("button", { name: "Pan right" }).click();
  await gallery.getByRole("button", { name: "Accessible list" }).click();
  await gallery.getByRole("button", { name: "Coastal workspace", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await search.fill("gooey");
  await page.getByRole("button", { name: "Expand search" }).click();
  await expect(page.getByRole("textbox", { name: "Search workspace" })).toBeFocused();
  await page.getByRole("textbox", { name: "Search workspace" }).press("Escape");
  await expect(page.getByRole("button", { name: "Expand search" })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await search.fill("world map");
  await expect(page.getByRole("img", { name: "World connections", exact: true })).toBeVisible();
  if (info.project.name === "mobile") {
    await page.setViewportSize({ width: 320, height: 844 });
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  }
  await page.screenshot({ path: `.checks/advanced-${info.project.name}.png`, fullPage: true });
  expect(errors).toEqual([]);
});


test("dock focus and image loading remain usable across themes", async ({ page }) => {
  await page.goto("/");
  const search = page.getByLabel("Search components");
  await search.fill("floating dock");
  const home = page.locator("#floating-dock").getByRole("link", { name: "Home", exact: true });
  await home.scrollIntoViewIfNeeded();
  await home.focus();
  await expect(home).toHaveAttribute("aria-describedby", /.+/);
  await expect(page.getByRole("tooltip")).toHaveText("Home");
  await search.fill("image generation loader");
  const card = page.locator("#image-generation-loader");
  await expect(card.getByRole("img", { name: "Workspace illustration" })).toBeVisible();
  for (const theme of ["Dark", "Sepia", "Light"]) {
    await page.getByRole("combobox", { name: "Color theme", exact: true }).click();
    await page.getByRole("option", { name: theme, exact: true }).click();
    await expect(card.locator("canvas")).toBeVisible();
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(card.getByRole("status")).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("modern comparison treatment follows dragging and reduced motion", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search components").fill("compare");
  const card = page.locator("#compare");
  await card.getByRole("tab", { name: "Playground", exact: true }).click();
  await card.getByRole("combobox", { name: "Variant", exact: true }).click();
  await page.getByRole("option", { name: "Modern", exact: true }).click();
  const surface = card.locator(".sky-compare").first();
  await surface.scrollIntoViewIfNeeded();
  const rect = await surface.boundingBox();
  if (!rect) throw new Error("Comparison is not visible");
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * .7, rect.y + rect.height / 2);
  await expect(surface).toHaveAttribute("data-dragging", "true");
  await expect(surface.locator(".sky-compare-particle")).toHaveCount(6);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(surface).toHaveAttribute("data-dragging", "false");
  await expect(surface.locator(".sky-compare-particle")).toHaveCount(0);
  await page.mouse.up();
});

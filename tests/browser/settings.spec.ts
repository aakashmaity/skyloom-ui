import { expect, test, type Page } from "@playwright/test";

async function choose(page: Page, name: string, option: string) {
  await page.getByRole("combobox", { name, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("saved system theme and typography apply before application hydration", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => {
    localStorage.setItem("sky-ui-theme", "system");
    localStorage.setItem("sky-ui-font", "editorial");
  });
  let blockedScripts = 0;
  await page.route("**/_next/static/**/*.js", route => { blockedScripts++; return route.abort(); });
  await page.goto("/", { waitUntil: "load" });
  expect(blockedScripts).toBeGreaterThan(0);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await expect(page.locator("html")).toHaveAttribute("data-font", "editorial");
});

test("system, sepia, and typography preferences persist and reach portals", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await choose(page, "Color theme", "System");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await choose(page, "Color theme", "Sepia");
  await choose(page, "Typography profile", "Editorial");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "sepia");
  await expect(page.locator("html")).toHaveAttribute("data-font", "editorial");
  await page.evaluate(() => document.fonts.ready);
  const fonts = await page.evaluate(() => ({
    body: getComputedStyle(document.body).fontFamily,
    heading: getComputedStyle(document.querySelector("h1")!).fontFamily,
  }));
  expect(fonts.body).toContain("inter");
  expect(fonts.heading).toContain("editorial");
  await page.getByLabel("Search components").fill("Paginated Data Table");
  await page.getByRole("button", { name: "Manage columns", exact: true }).click();
  const drawer = page.getByRole("dialog", { name: "Manage columns" });
  expect(await drawer.evaluate(el => getComputedStyle(el).getPropertyValue("--background"))).toBe(await page.locator("html").evaluate(el => getComputedStyle(el).getPropertyValue("--sky-sepia-paper")));
  expect((await drawer.boundingBox())!.x).toBe(0);
  await page.screenshot({ path: `.checks/sepia-drawer-${info.project.name}.png` });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Manage columns", exact: true })).toBeFocused();
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", await page.locator("html").evaluate(el => el.clientWidth));
  expect(errors).toEqual([]);
});

test("column drawer reorders, hides, pins, cancels drags, and persists", async ({ page }, info) => {
  await page.goto("/");
  await page.getByLabel("Search components").fill("Paginated Data Table");
  const table = page.locator("#data-table");
  await table.getByRole("button", { name: "Next", exact: true }).click();
  await table.getByRole("button", { name: "Manage columns", exact: true }).click();
  const drawer = page.getByRole("dialog", { name: "Manage columns" });
  const unpinned = drawer.getByRole("region", { name: "Unpinned columns" });
  const grip = drawer.getByRole("button", { name: "Reorder Request", exact: true });
  if (info.project.name === "mobile") {
    // Raw touch events bypass Playwright's stability checks; wait for drawer entrance.
    await grip.click({ trial: true });
    const session = await page.context().newCDPSession(page);
    const from = (await grip.boundingBox())!;
    const to = (await drawer.getByRole("button", { name: "Reorder Model", exact: true }).boundingBox())!;
    const x = from.x + from.width / 2, y = from.y + from.height / 2;
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    await page.waitForTimeout(300); // Allow the touch sensor's hold activation.
    for (let step = 1; step <= 10; step++) {
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y + (to.y + to.height / 2 - y) * step / 10 }] });
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(unpinned.getByRole("switch").first()).toHaveAccessibleName("Show Model");
    await drawer.getByRole("button", { name: "Reset columns", exact: true }).click();
    await session.detach();
  }
  await grip.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Escape");
  await expect(drawer).toBeVisible();
  await expect(unpinned.getByRole("switch").first()).toHaveAccessibleName("Show Request");
  await grip.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(unpinned.getByRole("switch").first()).toHaveAccessibleName("Show Model");
  await drawer.getByRole("combobox", { name: "Pin Request", exact: true }).selectOption("start");
  await drawer.getByRole("switch", { name: "Show Tokens", exact: true }).click();
  await drawer.getByRole("button", { name: "Done", exact: true }).click();
  await expect(table.getByText("Showing 6–10 of 84 rows")).toBeVisible();
  await expect(table.locator('th[data-column-id="tokens"]')).toHaveCount(0);
  await expect(table.locator("th").first()).toHaveAttribute("data-column-id", "id");
  await page.reload();
  await page.getByLabel("Search components").fill("Paginated Data Table");
  await table.getByRole("button", { name: "Manage columns", exact: true }).click();
  await expect(drawer.getByRole("combobox", { name: "Pin Request", exact: true })).toHaveValue("start");
  await expect(drawer.getByRole("switch", { name: "Show Tokens", exact: true })).not.toBeChecked();
  await drawer.getByRole("button", { name: "Reset columns", exact: true }).click();
  await drawer.getByRole("button", { name: "Done", exact: true }).click();
  await expect(table.locator("th")).toHaveCount(6);
  await expect(table.locator("th").first()).toHaveAttribute("data-column-id", "id");
});

test("header drag and measured pin offsets survive font, direction, and viewport changes", async ({ page }, info) => {
  test.skip(info.project.name !== "laptop", "Full-width geometry and pointer drag; drawer behavior runs at every size.");
  await page.goto("/analytics");
  const table = page.locator("table.sky-managed-table");
  const from = page.getByRole("button", { name: "Move Request column", exact: true });
  const to = page.getByRole("button", { name: "Move Status column", exact: true });
  await from.scrollIntoViewIfNeeded();
  const a = (await from.boundingBox())!, b = (await to.boundingBox())!;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 20 });
  await page.mouse.up();
  await expect.poll(() => table.locator("th").evaluateAll(cells => cells.map(cell => (cell as HTMLElement).dataset.columnId))).toEqual(["model", "status", "id", "tokens", "duration", "cost"]);
  await page.getByRole("button", { name: "Manage columns", exact: true }).click();
  const drawer = page.getByRole("dialog", { name: "Manage columns" });
  await drawer.getByRole("combobox", { name: "Pin Request", exact: true }).selectOption("start");
  await drawer.getByRole("combobox", { name: "Pin Model", exact: true }).selectOption("start");
  await drawer.getByRole("combobox", { name: "Pin Cost (USD)", exact: true }).selectOption("end");
  await drawer.getByRole("button", { name: "Done", exact: true }).click();
  for (const font of ["system", "inter", "editorial"]) {
    await page.evaluate(font => { document.documentElement.dataset.font = font; }, font);
    await page.evaluate(() => document.fonts.ready);
    for (const dir of ["ltr", "rtl"]) {
      await page.evaluate(dir => { document.documentElement.dir = dir; }, dir);
      const first = table.locator('th[data-column-id="id"]');
      const second = table.locator('th[data-column-id="model"]');
      await expect(first).toHaveAttribute("data-pinned", "start");
      await expect.poll(async () => Math.abs(await second.evaluate(el => parseFloat(getComputedStyle(el).insetInlineStart)) - (await first.boundingBox())!.width)).toBeLessThan(1);
      await expect(table.locator('tbody tr').first().locator('[data-pinned="start"]')).toHaveCount(2);
    }
  }
  await page.evaluate(() => { document.documentElement.dir = "ltr"; });
  await page.screenshot({ path: ".checks/pinned-columns-laptop.png" });
  await page.getByRole("button", { name: "Model column options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Unpin", exact: true }).click();
  await page.setViewportSize({ width: 900, height: 1000 });
  await expect(table.locator('th[data-column-id="id"]')).toHaveAttribute("data-pinned", "start");
  for (const dir of ["ltr", "rtl"]) {
    await page.evaluate(dir => { document.documentElement.dir = dir; }, dir);
    const edges = await table.evaluate(el => {
      const viewport = el.parentElement!;
      const rtl = document.documentElement.dir === "rtl";
      viewport.scrollLeft = rtl ? -200 : 200;
      const bounds = viewport.getBoundingClientRect();
      const start = el.querySelector('th[data-pinned="start"]')!.getBoundingClientRect();
      const end = el.querySelector('th[data-pinned="end"]')!.getBoundingClientRect();
      return { scrolled: Math.abs(viewport.scrollLeft), start: rtl ? bounds.right - start.right : start.left - bounds.left, end: rtl ? end.left - bounds.left : bounds.right - end.right };
    });
    expect(edges.scrolled).toBeGreaterThan(0);
    expect(Math.abs(edges.start)).toBeLessThan(1);
    expect(Math.abs(edges.end)).toBeLessThan(1);
  }
  await page.evaluate(() => { document.documentElement.dir = "ltr"; });
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(table.locator("th[data-pinned]")).toHaveCount(0);
  await expect(page.getByText("Pinned columns will stick", { exact: false })).toBeVisible();
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", await page.locator("html").evaluate(el => el.clientWidth));
});

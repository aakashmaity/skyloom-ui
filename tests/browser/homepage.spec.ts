import { expect, test } from "@playwright/test";

test("catalog is the homepage and legacy routes redirect", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Good interfaces");
  await expect(page.locator('a[href*="shadcn"], a[href*="aceternity"]')).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(/shadcn|aceternity/i);
  await page.getByRole("link", { name: "Explore AI analytics" }).press("Enter");
  await expect(page).toHaveURL(/\/analytics$/);
  await page.getByRole("link", { name: "Component library" }).press("Enter");
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/design-system");
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/design-system/analytics");
  await expect(page).toHaveURL(/\/analytics$/);
});

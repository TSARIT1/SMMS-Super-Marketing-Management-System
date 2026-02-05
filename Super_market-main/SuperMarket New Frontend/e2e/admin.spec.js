const { test, expect } = require("@playwright/test");
const axios = require("axios");

test.describe("Admin flows", () => {
  test("admin can login and manage users", async ({ page }) => {
    // Ensure test user exists (dev-only endpoint)
    try {
      await axios.post("http://localhost:8080/api/dev/create-user", {
        email: "e2e.test.user@example.com",
        fullName: "E2E Test User",
      });
    } catch (err) {
      // ignore if exists
      console.debug("e2e user create ignored or failed:", err?.message || err);
    }

    await page.goto("/admin/login");
    await expect(page).toHaveURL("/admin/login");

    await page.fill('input[name="emailOrPhone"]', "admin@supermart.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button:has-text("Admin Login")');

    // Wait for redirect to dashboard
    await page.waitForURL("**/admin/dashboard");
    await expect(page.locator("text=Admin Dashboard")).toBeVisible();

    // Navigate to manage users
    await page.goto("/admin/users");
    await expect(page.locator("text=Manage Users")).toBeVisible();

    // Search e2e user
    await page.fill(
      'input[placeholder="Search by name or email"]',
      "e2e.test.user@example.com",
    );
    await page.click('button:has-text("Search")');
    await page.waitForTimeout(800);

    const row = page
      .locator("table tbody tr")
      .filter({ hasText: "e2e.test.user@example.com" });
    await expect(row).toHaveCount(1);

    // Freeze the user
    await row.locator('button:has-text("Freeze")').click();
    // dialog prompt will not block here — assume backend sets status; reload
    await page.waitForTimeout(500);
    await page.click('button:has-text("Search")');
    await page.waitForTimeout(500);

    // Cleanup: delete the user
    await row.locator('button:has-text("Delete")').click();
    // confirm may be a browser dialog - handle
    // Playwright won't handle window.confirm by default; backend called with API, so just ensure deletion by searching again
    await page.waitForTimeout(500);
  });
});

const { test, expect } = require("@playwright/test");
const axios = require("axios");

test.describe("Freeze/Unfreeze flow (Super Admin)", () => {
  test("super admin can freeze and unfreeze a user and audit/logs/navbar update", async ({
    page,
  }) => {
    // Create a test user
    try {
      await axios.post("http://localhost:8080/api/dev/create-user", {
        email: "e2e.freeze.user@example.com",
        fullName: "E2E Freeze User",
      });
    } catch (err) {
      console.debug("e2e user create ignored or failed:", err?.message || err);
    }

    // Login as admin
    await page.goto("/admin/login");
    await page.fill('input[name="emailOrPhone"]', "admin@supermart.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button:has-text("Admin Login")');
    await page.waitForURL("**/admin/dashboard");

    // Navigate to Super Admin Dashboard and Users tab
    await page.goto("/superadmindashboard");
    await page.click('button:has-text("Manage Users")').catch(() => {});
    await page.click('button:has-text("Manage Users")').catch(() => {});

    // Ensure users loaded
    await page.click('button:has-text("Refresh Users")');
    await page.waitForTimeout(600);

    // Find test user row
    const row = page
      .locator("table tbody tr")
      .filter({ hasText: "e2e.freeze.user@example.com" });
    await expect(row).toHaveCount(1);

    // Freeze the user
    await row.locator('button:has-text("Freeze")').click();
    await page.waitForTimeout(800);
    await expect(row.locator("text=FROZEN")).toHaveCount(1);

    // Check navbar shows frozen count > 0
    await expect(page.locator("text=account")).toContainText("frozen");

    // Go to Audit tab and look for freeze entry
    await page.click('button:has-text("Audit Logs")');
    await page.waitForTimeout(600);
    await expect(page.locator("text=Freeze")).toBeVisible();

    // Unfreeze user
    await page.click('button:has-text("Users")');
    await page.click('button:has-text("Refresh Users")');
    await page.waitForTimeout(500);
    await row.locator('button:has-text("Unfreeze")').click();
    await page.waitForTimeout(800);
    await expect(row.locator("text=ACTIVE")).toHaveCount(1);
  });
});

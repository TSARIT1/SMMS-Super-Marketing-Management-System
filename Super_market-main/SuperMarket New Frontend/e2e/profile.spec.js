const { test, expect } = require("@playwright/test");
const axios = require("axios");
const path = require("path");

test.describe("Profile E2E", () => {
  test("user can edit and save profile with file upload", async ({ page }) => {
    const email = "e2e.profile@test.com";

    // Ensure test user exists (dev-only endpoint)
    try {
      await axios.post("http://localhost:8080/api/dev/create-user", { email });
    } catch (err) {
      console.debug("create-user ignored or failed:", err?.message || err);
    }

    // Ensure localStorage has user email before loading app
    await page.addInitScript((e) => {
      localStorage.setItem("user", JSON.stringify({ id: 9999, email: e }));
    }, email);

    await page.goto("/profile");
    await expect(page.locator("text=Store Profile")).toBeVisible();

    // Intercept PUT /api/profile and respond with updated profile
    let putRequestSeen = false;
    await page.route("**/api/profile", (route) => {
      const req = route.request();
      if (req.method() === "PUT") {
        putRequestSeen = true;
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            shop_name: "E2E Shop",
            profile_photo: "/uploads/e2e-profile.png",
            qr_code: "/uploads/e2e-qr.png",
            product_categories: ["Groceries"],
          }),
        });
      } else {
        route.continue();
      }
    });

    // Open Edit modal
    await page.click('button:has-text("Edit")');
    await expect(page.locator("text=Edit Store Profile")).toBeVisible();

    // Fill fields
    await page.fill('input[name="shop_name"]', "E2E Shop");

    // Upload files - use test image
    const filePath = path.join(__dirname, "test-data", "profile-photo.png");
    await page.setInputFiles('input[name="profile_photo"]', filePath);
    await page.setInputFiles('input[name="qr_code"]', filePath);

    // Fill categories text
    await page.fill('input[name="product_categories"]', "Groceries, Dairy");

    // Click Save and wait for the route to handle PUT
    await Promise.all([
      page.click('button:has-text("Save Changes")'),
      page.waitForResponse(
        (r) =>
          r.url().includes("/api/profile") && r.request().method() === "PUT",
      ),
    ]);

    expect(putRequestSeen).toBe(true);

    // Modal should close after successful save
    await expect(page.locator("text=Edit Store Profile")).not.toBeVisible();

    // New profile photo (mocked response) should reflect in the UI
    await expect(page.locator("img").first()).toHaveAttribute(
      "src",
      /e2e-profile.png/,
    );
  });
});

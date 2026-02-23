// @ts-check
const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:3000",
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
});

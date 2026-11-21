import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 60000,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3100", channel: "msedge", headless: true, trace: "retain-on-failure" },
  outputDir: ".checks/browser-results",
  projects: [
    { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
    { name: "tablet", use: { viewport: { width: 834, height: 1112 } } },
    { name: "laptop", use: { viewport: { width: 1440, height: 1000 } } },
  ],
  webServer: { command: "npm run start -- --hostname 127.0.0.1 --port 3100", url: "http://127.0.0.1:3100/", reuseExistingServer: false, timeout: 60000 },
});

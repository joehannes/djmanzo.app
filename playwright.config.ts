import { defineConfig } from "@playwright/test";

// The island, driven in a real browser against `wrangler dev`.
export default defineConfig({
  testDir: "e2e",
  testMatch: /.*\.spec\.ts/,
  timeout: 60_000,
  use: {
    baseURL: process.env.SITE ?? "http://127.0.0.1:8787",
    // WebGL through SwiftShader, so the Signal Path's painting is really drawn in the tests.
    launchOptions: {
      ...(process.env.DJMANZO_CHROMIUM ? { executablePath: process.env.DJMANZO_CHROMIUM } : {}),
      args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
    },
  },
  webServer: process.env.SITE
    ? undefined
    : { command: "npx wrangler d1 migrations apply djmanzo --local --env test && npx wrangler dev --env test --port 8787 --ip 127.0.0.1", url: "http://127.0.0.1:8787/api/me", reuseExistingServer: true, timeout: 60_000 },
});

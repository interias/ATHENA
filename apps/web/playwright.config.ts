import { defineConfig } from "@playwright/test";

const baseURL = process.env.ATHENA_WEB_URL ?? "http://127.0.0.1:3000";
const testProxyServer = process.env.ATHENA_TEST_PROXY_SERVER;

export default defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: "list",
  use: {
    baseURL,
    channel: "chrome",
    proxy: testProxyServer
      ? { server: testProxyServer, bypass: "<-loopback>" }
      : undefined,
    launchOptions: {
      args: testProxyServer ? ["--proxy-bypass-list=<-loopback>"] : [],
    },
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});

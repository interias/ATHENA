import { expect, test } from "@playwright/test";

test("shows the available pilot lesson and planned lessons", async ({ page }) => {
  const responses: string[] = [];
  const externalRequests: string[] = [];
  const failedResponses: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:3000") externalRequests.push(request.url());
  });
  page.on("response", (response) => {
    if (response.url().includes("/api/curriculum")) responses.push(response.url());
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Kapitelübersicht" })).toBeVisible();
  await expect(page.getByText("Gleiche Aufgabe, andere Reaktion")).toBeVisible();
  await expect(page.getByText("Verfügbar", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Geplant", { exact: true })).toHaveCount(3);
  await expect(page.locator(".lesson.planned a, .lesson.planned button")).toHaveCount(0);
  expect(responses).toHaveLength(1);
  expect(new URL(responses[0]).pathname).toBe("/api/curriculum");
  expect(externalRequests).toEqual([]);
  expect(failedResponses).toEqual([]);
});

test("offers a reachable retry state after an API failure", async ({ page }) => {
  await page.route("**/api/curriculum", (route) => route.abort("failed"));
  await page.goto("/");

  await expect(page.locator(".error-card")).toContainText("nicht verfügbar");
  const retry = page.getByRole("button", { name: "Erneut versuchen" });
  await expect(retry).toBeVisible();

  await page.unroute("**/api/curriculum");
  await retry.click();
  await expect(page.getByText("Gleiche Aufgabe, andere Reaktion")).toBeVisible();
});

test("keeps the chapter overview usable at 390 pixels", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByText("Gleiche Aufgabe, andere Reaktion")).toBeVisible();
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport);
});

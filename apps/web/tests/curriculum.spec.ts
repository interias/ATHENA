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
  const headerHeight = await page.locator(".site-header").evaluate((element) => element.getBoundingClientRect().height);
  expect(headerHeight).toBeGreaterThanOrEqual(56);
  expect(headerHeight).toBeLessThanOrEqual(64);
  const titleSize = await page.getByRole("heading", { name: "Training verstehen. Klarer beobachten." }).evaluate((element) => getComputedStyle(element).fontSize);
  expect(titleSize).toBe("32px");
  const bannerRatio = await page.locator(".home-banner").evaluate((element) => {
    const box = element.getBoundingClientRect();
    return box.width / box.height;
  });
  expect(bannerRatio).toBeGreaterThan(3.9);
  expect(bannerRatio).toBeLessThan(4.1);
  await expect(page.locator(".hero")).toHaveCount(0);
  await expect(page.getByText("Gleiche Aufgabe, andere Reaktion")).toBeVisible();
  await expect(page.locator(".lesson.available")).toHaveCount(3);
  await expect(page.getByText("Geplant", { exact: true })).toHaveCount(2);
  await expect(page.locator(".lesson.planned a, .lesson.planned button")).toHaveCount(0);
  expect(responses.length).toBeGreaterThanOrEqual(1);
  expect([...new Set(responses.map((url) => new URL(url).pathname))]).toEqual(["/api/curriculum"]);
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
  const headerLinks = page.locator(".site-header a");
  for (const link of await headerLinks.all()) {
    expect(await link.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  }
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport);
});

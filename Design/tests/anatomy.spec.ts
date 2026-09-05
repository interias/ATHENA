import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

test("anatomy styles preserve geometry, labels, URL and export a versioned review package", async ({ page }) => {
  await page.goto("/?view=images");
  const section = page.getByRole("region", { name: "Anatomiegrundlage", exact: true });
  await expect(section).toBeVisible();
  const a = page.getByRole("region", { name: "Anatomievariante A", exact: true });
  const b = page.getByRole("region", { name: "Anatomievariante B", exact: true });
  const geometry = () => a.locator("[data-structure]").evaluateAll(elements => elements.map(e => [e.getAttribute("data-structure"), e.getAttribute("d")]));
  const original = await geometry();
  for (const style of ["graphite", "roman", "atlas"]) {
    await page.getByLabel("Darstellung A", { exact: true }).selectOption(style);
    expect(await geometry()).toEqual(original);
    expect(await b.locator("[data-structure]").evaluateAll(elements => elements.map(e => [e.getAttribute("data-structure"), e.getAttribute("d")]))).toEqual(original);
  }
  await page.getByLabel("Darstellung A", { exact: true }).selectOption("graphite");
  await page.getByLabel("Beschriftungen anzeigen", { exact: true }).uncheck();
  await expect(section.locator("[data-labels]")).toHaveCount(0);
  await page.getByRole("button", { name: "Lektionslabor", exact: true }).click();
  await page.getByRole("button", { name: "Bildlabor", exact: true }).click();
  await page.reload();
  await expect(page.getByLabel("Darstellung A", { exact: true })).toHaveValue("graphite");
  await expect(page.getByLabel("Beschriftungen anzeigen", { exact: true })).not.toBeChecked();
  await page.getByLabel("Beschriftungen anzeigen", { exact: true }).check();
  await expect(a.locator(".anatomy-legend li")).toHaveCount(6);
  await section.getByText("Was ist belegt, was muss geprüft werden?", { exact: true }).click();
  await expect(section.locator("a[href^='https://openstax.org/']")).toHaveCount(3);
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Anatomie-Prüfpaket exportieren", exact: true }).click();
  const download = await pending;
  const data = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(data.expertReview).toBeNull();
  expect(data.version).toBe(data.geometry.version);
  expect(data.variants).toHaveLength(2);
  for (const variant of data.variants) expect(createHash("sha256").update(variant.svg).digest("hex")).toBe(variant.sha256);
  await section.screenshot({ path: "test-results/anatomy-desktop.png" });
});

test("anatomy comparison stays readable at 390px and works without browser storage", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new Error("Blocked"); } }));
  await page.goto("/?view=images");
  await page.getByRole("button", { name: "Anatomie B anzeigen", exact: true }).click();
  await expect(page.getByRole("region", { name: "Anatomievariante A", exact: true })).toBeHidden();
  const b = page.getByRole("region", { name: "Anatomievariante B", exact: true });
  await expect(b).toBeVisible();
  await page.getByLabel("Darstellung B", { exact: true }).selectOption("graphite");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await b.locator(".anatomy-legend").evaluate(e => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
  await b.screenshot({ path: "test-results/anatomy-mobile.png" });
});

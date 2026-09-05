import { test, expect } from "@playwright/test";
import { presets } from "../lib/presets";

test("capture themes, measure text contrast, focus and 200 percent reflow", async ({ page }, testInfo) => {
  await page.goto("/?view=lesson");
  await expect(page.locator(".preview")).toBeVisible();
  const measurements: { style: string; ink: number; muted: number; accent: number }[] = [];
  for (const preset of presets) {
    await page.getByLabel("Visueller Stil", { exact: true }).selectOption(preset.id);
    const contrast = await page.locator(".preview").evaluate(element => {
      const css = getComputedStyle(element);
      const luminance = (hex: string) => {
        const value = hex.trim().replace("#", "");
        const channels = [0, 2, 4].map(i => parseInt(value.slice(i, i + 2), 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
        return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
      };
      const paper = luminance(css.getPropertyValue("--paper"));
      const ratio = (token: string) => { const foreground = luminance(css.getPropertyValue(token)); return (Math.max(paper, foreground) + .05) / (Math.min(paper, foreground) + .05); };
      return { ink: ratio("--ink"), muted: ratio("--muted"), accent: ratio("--accent") };
    });
    measurements.push({ style: preset.id, ...contrast });
    expect(contrast.ink).toBeGreaterThanOrEqual(4.5);
    expect(contrast.muted).toBeGreaterThanOrEqual(4.5);
    expect(contrast.accent).toBeGreaterThanOrEqual(4.5);
    if (preset.deep) {
      await page.getByRole("button", { name: "Fokusmodus", exact: true }).click();
      await page.screenshot({ path: testInfo.outputPath(`${preset.id}-desktop.png`) });
      await page.locator('[data-figure="fig-ch01-load"]').scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath(`${preset.id}-figure.png`) });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.evaluate(() => scrollTo(0, 0));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`${preset.id}-mobile.png`) });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.getByRole("button", { name: "Labor einblenden" }).click();
    }
  }
  await testInfo.attach("contrast-tokens.json", { body: JSON.stringify(measurements, null, 2), contentType: "application/json" });
  await page.getByLabel("Visueller Stil", { exact: true }).selectOption("marble-library");
  await page.getByLabel("Mythologie", { exact: true }).selectOption("none");
  await expect(page.locator(".preview .ornament")).toBeHidden();
  await page.getByLabel("Mythologie", { exact: true }).selectOption("bold");
  await expect(page.locator(".preview .ornament")).toBeVisible();
  await page.evaluate(() => { document.body.style.zoom = "2"; scrollTo(0, 0); });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.getByRole("button", { name: "Fokusmodus", exact: true }).focus();
  const outline = await page.getByRole("button", { name: "Fokusmodus", exact: true }).evaluate(element => getComputedStyle(element).outlineWidth);
  expect(parseFloat(outline)).toBeGreaterThanOrEqual(3);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Labor einblenden" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("200-percent.png") });
});

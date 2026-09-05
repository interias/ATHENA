import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { imageAssets, imageStorageKey } from "../lib/image-config";

const control = (page: Page, name: string) => page.getByRole("combobox", { name, exact: true });
const panel = (page: Page, id: string) => page.getByRole("region", { name: `Bildvariante ${id}`, exact: true });
async function openLab(page: Page) {
  await page.goto("/?view=images");
  await expect(page.getByRole("heading", { name: "Ein Motiv. Viele Arten, es zu sehen." })).toBeVisible();
  await expect(page).toHaveURL(/img\.a\.image=/);
}

test("fifteen local images load with separate anatomy and atmosphere filters and favorites", async ({ page }) => {
  const errors: string[] = [];
  const remote: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => { if (!new URL(request.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/)) remote.push(request.url()); });
  await openLab(page);
  await expect(page.locator(".image-card")).toHaveCount(15);
  for (const image of await page.locator(".image-thumbnail img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  await control(page, "Bildsammlung filtern").selectOption("anatomy");
  await expect(page.locator(".image-card")).toHaveCount(6);
  await page.getByRole("button", { name: `${imageAssets[0].title} als Favorit markieren`, exact: true }).click();
  await control(page, "Bildsammlung filtern").selectOption("favorites");
  await expect(page.locator(".image-card")).toHaveCount(1);
  await control(page, "Bildsammlung filtern").selectOption("atmosphere");
  await expect(page.locator(".image-card")).toHaveCount(9);
  expect(errors).toEqual([]);
  expect(remote).toEqual([]);
});

test("image and framing dimensions are independent and comparison rounds change one dimension", async ({ page }) => {
  await openLab(page);
  await control(page, "Bild A").selectOption("shoulder-blueprint");
  await control(page, "Rahmendesign A").selectOption("bronze-oracle");
  await expect(control(page, "Bild B")).toHaveValue("shoulder-graphite");
  await expect(control(page, "Rahmendesign B")).toHaveValue("marble-library");
  await page.getByRole("button", { name: /^2 · Ausschnitt/ }).click();
  await expect(control(page, "Bild B")).toHaveValue("shoulder-blueprint");
  await expect(control(page, "Rahmendesign B")).toHaveValue("bronze-oracle");
  await expect(control(page, "Ansicht A")).toHaveValue("full");
  await expect(control(page, "Ansicht B")).toHaveValue("detail");
  await control(page, "Vergrößerung B").selectOption("200");
  await expect(panel(page, "B").locator(".image-stage img")).toHaveCSS("transform", "matrix(2, 0, 0, 2, 0, 0)");
  await page.getByRole("button", { name: /^3 · Bildgewicht/ }).click();
  await expect(control(page, "Bildgröße A")).toHaveValue("large");
  await expect(control(page, "Bildgröße B")).toHaveValue("compact");
  await expect(control(page, "Ansicht B")).toHaveValue("full");
});

test("image URL survives lesson tab roundtrip and reload without leaking notes", async ({ page }) => {
  await openLab(page);
  await control(page, "Bild B").selectOption("scene-oracle");
  await control(page, "Bilduntergrund B").selectOption("dark");
  await page.getByRole("textbox", { name: "Notiz zum Bildvergleich", exact: true }).fill("private image note");
  await page.getByRole("button", { name: "Lektionslabor", exact: true }).click();
  await expect(page).toHaveURL(/img\.b\.image=scene-oracle/);
  await page.getByRole("button", { name: "Bildlabor", exact: true }).click();
  await expect(control(page, "Bild B")).toHaveValue("scene-oracle");
  await page.reload();
  await expect(control(page, "Bild B")).toHaveValue("scene-oracle");
  await expect(control(page, "Bilduntergrund B")).toHaveValue("dark");
  await expect(page.getByRole("textbox", { name: "Notiz zum Bildvergleich", exact: true })).toHaveValue("private image note");
  expect(page.url()).not.toContain("private");
});

test("image feedback persists, exports provenance and resets only its own namespace", async ({ page }) => {
  await openLab(page);
  await page.evaluate(() => localStorage.setItem("other-app:preserve", "untouched"));
  await page.getByRole("textbox", { name: "Notiz zum Bildvergleich", exact: true }).fill("Graphit behalten, Schatten reduzieren.");
  await control(page, "Favorit dieses Vergleichs").selectOption("b");
  await page.getByRole("button", { name: "Bildvergleich speichern", exact: true }).click();
  await expect(page.getByText("1 gespeicherte Bildvergleiche · 0 Bildfavoriten")).toBeVisible();
  await page.reload();
  await expect(page.getByText("1 gespeicherte Bildvergleiche · 0 Bildfavoriten")).toBeVisible();
  for (const [format, name] of [["json", "Bilder als JSON exportieren"], ["md", "Bilder als Markdown exportieren"]]) {
    const pending = page.waitForEvent("download");
    await page.getByRole("button", { name, exact: true }).click();
    const download = await pending;
    expect(download.suggestedFilename()).toBe(`athena-bildlabor.${format}`);
    const content = await readFile((await download.path())!, "utf8");
    expect(content).toContain("Graphit behalten");
    expect(content).toContain(imageAssets[0].sha256);
  }
  await page.getByText("Bildlabor zurücksetzen", { exact: true }).click();
  await page.getByRole("button", { name: "Alle lokalen Bildbewertungen und Einstellungen löschen", exact: true }).click();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).entries.length, imageStorageKey)).toBe(0);
  expect(await page.evaluate(() => localStorage.getItem("other-app:preserve"))).toBe("untouched");
});

test("390px reduced-motion image comparison switches A/B without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openLab(page);
  await expect(panel(page, "A")).toBeVisible();
  await expect(panel(page, "B")).toBeHidden();
  await page.getByRole("button", { name: "Bild B anzeigen", exact: true }).click();
  await expect(panel(page, "A")).toBeHidden();
  await expect(panel(page, "B")).toBeVisible();
  await control(page, "Ansicht B").selectOption("detail");
  await control(page, "Vergrößerung B").selectOption("200");
  await expect(panel(page, "B").getByText("Ausschnitt · 200 % · Teile des Bildes sind ausgeblendet.")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/images-mobile.png", fullPage: true });
});

test("blocked local storage keeps image exploration and exports usable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("Storage blocked"); };
    Storage.prototype.setItem = () => { throw new Error("Storage blocked"); };
  });
  await openLab(page);
  await control(page, "Bild A").selectOption("shoulder-3d");
  await page.getByRole("button", { name: "Bildvergleich speichern", exact: true }).click();
  await expect(page.getByText(/Lokaler Speicher nicht verfügbar/)).toBeVisible();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Bilder als JSON exportieren", exact: true }).click();
  expect(await (await pending).failure()).toBeNull();
  expect(errors).toEqual([]);
});


test("Roman collection offers six studies and three contrasts with consistent framing", async ({ page }) => {
  await openLab(page);
  await page.getByRole("button", { name: "Römische Sammlung ansehen", exact: true }).click();
  await expect(control(page, "Bildsammlung filtern")).toHaveValue("roman");
  await expect(page.locator(".image-card")).toHaveCount(6);
  await control(page, "Rahmendesign A").selectOption("amphora");
  await control(page, "Bilduntergrund A").selectOption("dark");
  await control(page, "Ansicht A").selectOption("detail");
  await control(page, "Vergrößerung A").selectOption("200");
  for (const [name, a, b] of [
    ["Fresko & Thermen", "scene-pompeii", "scene-thermae"],
    ["Oculus & nächtliches Forum", "scene-oculus", "scene-forum-night"],
    ["Palästra & Mosaik", "scene-palaestra", "scene-mosaic"],
  ]) {
    await page.getByRole("button", { name: new RegExp(name) }).click();
    await expect(control(page, "Bild A")).toHaveValue(a);
    await expect(control(page, "Bild B")).toHaveValue(b);
    for (const id of ["A", "B"]) {
      await expect(control(page, `Rahmendesign ${id}`)).toHaveValue("amphora");
      await expect(control(page, `Bilduntergrund ${id}`)).toHaveValue("dark");
      await expect(control(page, `Ansicht ${id}`)).toHaveValue("detail");
      await expect(control(page, `Vergrößerung ${id}`)).toHaveValue("200");
    }
  }
  await page.reload();
  await expect(control(page, "Bildsammlung filtern")).toHaveValue("roman");
  await expect(page.locator(".image-card")).toHaveCount(6);
  await expect(control(page, "Bild A")).toHaveValue("scene-palaestra");
  await expect(control(page, "Bild B")).toHaveValue("scene-mosaic");
  await expect(control(page, "Vergrößerung B")).toHaveValue("200");
});

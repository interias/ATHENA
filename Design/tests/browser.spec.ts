import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { loadContent, type LabContent } from "../lib/content";
import { presets } from "../lib/presets";
import { storageKey } from "../lib/config";

let content: LabContent;
test.beforeAll(async () => { content = await loadContent(); });

async function lesson(page: Page) {
  await page.goto("/?view=lesson");
  await expect(page.locator(".preview")).toBeVisible();
}

test("all ten presets, focus mode, images and reading layout remain usable", async ({ page }) => {
  const external: string[] = [];
  const errors: string[] = [];
  page.on("request", request => { if (!request.url().startsWith("http://127.0.0.1:3100") && !request.url().startsWith("data:")) external.push(request.url()); });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".gallery-card")).toHaveCount(10);
  await expect(page.locator(".card-caption").filter({ hasText: "Vertiefter Prototyp" })).toHaveCount(3);
  await expect(page.locator(".card-caption").filter({ hasText: "Erster Stilentwurf" })).toHaveCount(7);
  await page.getByRole("button", { name: "Runde A beginnen →" }).click();
  for (const preset of presets) {
    await page.getByLabel("Visueller Stil", { exact: true }).selectOption(preset.id);
    await expect(page.locator(".preview")).toHaveAttribute("data-style", preset.id);
    await expect(page.locator("[data-figure]")).toHaveCount(2);
    await expect(page.getByRole("heading", { name: "Gleiche Aufgabe, andere Reaktion", exact: true })).toBeVisible();
  }
  for (const mode of ["reduced", "integrated", "guided"]) {
    await page.getByLabel("Bildpräsentation", { exact: true }).selectOption(mode);
    await expect(page.locator("[data-figure]").first()).toBeVisible();
    await expect(page.locator("[data-figure]").last()).toBeVisible();
  }
  await page.getByLabel("Leseform", { exact: true }).selectOption("workbook");
  await expect(page.locator(".workbook-only")).toBeVisible();
  await page.getByLabel("Leseform", { exact: true }).selectOption("reader");
  await expect(page.locator(".workbook-only")).toBeHidden();
  await page.getByRole("button", { name: "Fokusmodus", exact: true }).click();
  await expect(page.locator(".lab-bar")).toHaveCount(0);
  await page.getByRole("button", { name: "Labor einblenden" }).click();
  await expect(page.locator(".lab-bar")).toBeVisible();
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test("interaction requires prediction, covers all feedback paths and resets by keyboard", async ({ page }) => {
  await lesson(page);
  const figure = page.locator('[data-figure="fig-ch01-two-runs"]');
  for (let index = 0; index < 3; index++) {
    await expect(figure.getByRole("button", { name: "Reaktionen aufdecken" })).toBeDisabled();
    await expect(figure).not.toContainText("Angenehm erlebt.");
    await expect(figure).not.toContainText("Deutlich anstrengender erlebt.");
    const radio = figure.getByRole("radio").nth(index);
    await radio.focus();
    await page.keyboard.press("Space");
    await expect(radio).toBeChecked();
    await figure.getByRole("button", { name: "Reaktionen aufdecken" }).focus();
    await page.keyboard.press("Enter");
    await expect(figure).toContainText(content.interaction.feedback[index]);
    await expect(figure).toContainText("Angenehm erlebt.");
    await expect(figure).toContainText("Deutlich anstrengender erlebt.");
    await figure.getByRole("button", { name: "Welche zusätzliche Information könnte bei der Einordnung helfen?" }).click();
    await expect(figure).toContainText("Keine dieser Fragen beweist eine Ursache.");
    await figure.getByRole("button", { name: "Neu ansehen" }).click();
    await expect(figure.getByRole("radio").first()).toBeFocused();
    await expect(figure.getByRole("radio").nth(index)).not.toBeChecked();
  }
});

test("question feedback is canonical, free text uses explicit self assessment", async ({ page }) => {
  await lesson(page);
  const choice = page.getByRole("region", { name: "Aufgabe q-ch01-01" });
  await expect(choice.getByRole("button", { name: "Antwort prüfen" })).toBeDisabled();
  for (const option of content.questions[0].options!) {
    await choice.getByRole("radio", { name: option.text, exact: true }).check();
    await choice.getByRole("button", { name: "Antwort prüfen" }).click();
    await expect(choice.getByRole("status")).toHaveText(content.questions[0].feedback_by_option![option.id]);
    await choice.getByRole("button", { name: "Aufgabe zurücksetzen" }).click();
  }
  const free = page.getByRole("region", { name: "Aufgabe q-ch01-02" });
  await expect(free.getByRole("button", { name: "Mit Musterlösung vergleichen" })).toBeDisabled();
  await free.getByRole("textbox").fill("Distanz und Dauer sind gleich; Reaktion anders. Ursache und Anpassung bleiben offen.");
  await free.getByLabel("Wie sicher bist du? (optional)").selectOption({ label: "Teilweise sicher" });
  await free.getByRole("button", { name: "Mit Musterlösung vergleichen" }).click();
  await expect(free).toContainText(content.questions[1].model_answer!);
  await expect(free.getByRole("checkbox")).toHaveCount(3);
  for (const checkbox of await free.getByRole("checkbox").all()) await checkbox.check();
  await expect(free).toContainText("Keine automatische Benotung.");
  await free.getByRole("button", { name: "Aufgabe zurücksetzen" }).click();
  await expect(free.getByRole("textbox")).toHaveValue("");
  await expect(free.getByRole("checkbox")).toHaveCount(0);
});

test("style changes preserve answers; source panels open and URL reproduces configuration", async ({ page }) => {
  await lesson(page);
  const figure = page.locator('[data-figure="fig-ch01-two-runs"]');
  await figure.getByRole("radio").nth(1).check();
  await page.getByLabel("Visueller Stil", { exact: true }).selectOption("bronze-oracle");
  await expect(figure.getByRole("radio").nth(1)).toBeChecked();
  for (const id of ["S05", "S06"]) {
    await page.locator(".preview").getByRole("button", { name: `[${id}]`, exact: true }).first().click();
    const panel = page.getByRole("complementary", { name: `Quelle ${id}` });
    await expect(panel).toBeVisible();
    await expect(panel).toBeFocused();
    await expect(panel).toContainText(content.sources.find(source => source.id === id)!.access_scope);
    await panel.getByRole("button", { name: "Quelle schließen" }).click();
  }
  await page.getByLabel("Leseschrift", { exact: true }).selectOption("22");
  await page.getByLabel("Mythologie", { exact: true }).selectOption("none");
  await expect.poll(() => new URL(page.url()).searchParams.get("a.size")).toBe("22");
  const url = page.url();
  await page.reload();
  await expect(page.locator(".preview")).toHaveAttribute("data-style", "bronze-oracle");
  await expect(page.getByLabel("Leseschrift", { exact: true })).toHaveValue("22");
  expect(page.url()).toBe(url);
  await page.goto("/?view=lesson&a.style=invalid&a.size=999&a.myth=wrong");
  await expect(page.locator(".preview")).toHaveAttribute("data-style", "marble-library");
  await expect(page.getByLabel("Leseschrift", { exact: true })).toHaveValue("18");
  await expect(page.getByLabel("Mythologie", { exact: true })).toHaveValue("subtle");
});

test("comparison keeps themes, source panels and responses independent", async ({ page }) => {
  await page.goto("/?view=compare&content=lesson&a.style=marble-library&b.style=bronze-oracle");
  const a = page.getByRole("region", { name: "Variante A", exact: true });
  const b = page.getByRole("region", { name: "Variante B", exact: true });
  await expect(a.locator(".preview")).toHaveAttribute("data-style", "marble-library");
  await expect(b.locator(".preview")).toHaveAttribute("data-style", "bronze-oracle");
  const aFigure = a.locator('[data-figure="fig-ch01-two-runs"]');
  const bFigure = b.locator('[data-figure="fig-ch01-two-runs"]');
  await aFigure.getByRole("radio").first().check();
  await aFigure.getByRole("button", { name: "Reaktionen aufdecken" }).click();
  await expect(aFigure).toContainText("Angenehm erlebt.");
  await expect(bFigure).not.toContainText("Angenehm erlebt.");
  await expect(bFigure.getByRole("button", { name: "Reaktionen aufdecken" })).toBeDisabled();
  await bFigure.getByRole("radio").nth(2).check();
  await expect(aFigure.getByRole("radio").first()).toBeChecked();
  await a.getByRole("button", { name: "[S05]", exact: true }).first().click();
  await expect(a.locator(".source-panel")).toBeVisible();
  await expect(b.locator(".source-panel")).toHaveCount(0);
  await b.getByLabel("Visueller Stil", { exact: true }).selectOption("gymnasion-notebook");
  await expect(a.locator(".preview")).toHaveAttribute("data-style", "marble-library");
});

test("four writing voices change text while preserving chosen design", async ({ page }) => {
  await page.goto("/?view=voices&a.style=bronze-oracle");
  const passages = new Set<string>();
  for (const voice of ["factual", "partner", "socratic", "dry"]) {
    await page.getByLabel("Schreibstimme · nur Passage", { exact: true }).selectOption(voice);
    await expect(page.locator(".preview")).toHaveAttribute("data-style", "bronze-oracle");
    await expect(page.locator(".preview .prose")).not.toBeEmpty();
    passages.add(await page.locator(".preview .prose").innerText());
    await expect(page.locator(".preview")).toContainText("Redaktioneller Designentwurf");
    await expect(page.locator(".preview [data-figure]")).toHaveCount(0);
  }
  expect(passages.size).toBe(4);
  await page.getByLabel("Schreibstimme · nur Passage", { exact: true }).selectOption("canonical");
  await expect(page.locator(".preview")).not.toContainText("Redaktioneller Designentwurf");
});

test("feedback persists, exports exact notes and resets only its own entries", async ({ page }) => {
  await lesson(page);
  await page.evaluate(() => localStorage.setItem("unrelated-app", "retain me"));
  await page.getByLabel("Lesekomfort", { exact: true }).selectOption("4");
  await page.getByLabel("Persönlicher Favorit", { exact: true }).selectOption("a");
  await page.getByLabel("Behalten", { exact: true }).fill("Prüfnotiz: ruhige Ränder");
  await page.getByLabel("Stört", { exact: true }).fill("Zu viele Rahmen");
  await page.getByLabel("Als Nächstes testen", { exact: true }).fill("Reader ohne Ornament");
  await page.getByRole("button", { name: "Bewertung speichern", exact: true }).click();
  await expect(page.locator(".feedback-list details")).toHaveCount(1);
  expect(page.url()).not.toContain("Pr%C3%BCfnotiz");
  await page.reload();
  await expect(page.locator(".feedback-list details")).toHaveCount(1);
  await page.locator(".feedback-list summary").click();
  await expect(page.locator(".feedback-list")).toContainText("Prüfnotiz: ruhige Ränder");
  for (const [label, extension] of [["JSON exportieren", "json"], ["Markdown exportieren", "md"]]) {
    const downloaded = page.waitForEvent("download");
    await page.getByRole("button", { name: label, exact: true }).click();
    const download = await downloaded;
    expect(download.suggestedFilename()).toBe(`athena-design-feedback.${extension}`);
    const text = await readFile((await download.path())!, "utf8");
    expect(text).toContain("Prüfnotiz: ruhige Ränder");
    expect(text).toContain(content.hash);
    if (extension === "json") expect(JSON.parse(text).entries[0].ratings.Lesekomfort).toBe("4");
  }
  await page.getByRole("button", { name: "Alle Designbewertungen zurücksetzen", exact: true }).click();
  await expect(page.locator(".feedback-list details")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".feedback-list details")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("unrelated-app"))).toBe("retain me");
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).entries.length, storageKey)).toBe(0);
});

test("blocked local storage leaves exploration and export usable", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException("Blocked", "SecurityError"); };
    Storage.prototype.setItem = () => { throw new DOMException("Blocked", "QuotaExceededError"); };
  });
  await lesson(page);
  await expect(page.getByText(/Speichern im Browser fehlgeschlagen/)).toBeVisible();
  await page.getByLabel("Visueller Stil", { exact: true }).selectOption("gymnasion-notebook");
  await expect(page.locator(".preview")).toHaveAttribute("data-style", "gymnasion-notebook");
  await page.getByLabel("Behalten", { exact: true }).fill("Nur Sitzung");
  await page.getByRole("button", { name: "Bewertung speichern", exact: true }).click();
  await expect(page.locator(".feedback-list details")).toHaveCount(1);
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON exportieren", exact: true }).click();
  expect(await (await downloaded).failure()).toBeNull();
});

test("390px comparison uses readable A/B switching and reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?view=compare&content=lesson&a.style=marble-library&b.style=bronze-oracle");
  const a = page.getByRole("region", { name: "Variante A", exact: true });
  const b = page.getByRole("region", { name: "Variante B", exact: true });
  await expect(a).toBeVisible();
  await expect(b).toBeHidden();
  await page.getByRole("button", { name: "Variante B", exact: true }).click();
  await expect(a).toBeHidden();
  await expect(b).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await b.locator('[data-figure="fig-ch01-two-runs"]').getByRole("radio").first().check();
  await b.getByRole("button", { name: "Reaktionen aufdecken" }).click();
  await expect(b).toContainText("Angenehm erlebt.");
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
});

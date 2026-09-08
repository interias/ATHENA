import { expect, test } from "@playwright/test";

const publishedLessons = [
  { id: "ch01-l02", image: "/images/lessons/l2-target-metric-v1.webp" },
  { id: "ch01-l05", image: "/images/lessons/l3-progression-v1.webp" },
] as const;

test("opens both new lessons while planned lesson identities stay inaccessible", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('.lesson.available a[href="/lessons/ch01-l01"]')).toBeVisible();
  await expect(page.locator('.lesson.available a[href="/lessons/ch01-l02"]')).toBeVisible();
  await expect(page.locator('.lesson.available a[href="/lessons/ch01-l05"]')).toBeVisible();
  await expect(page.locator('.lesson.planned a[href="/lessons/ch01-l03"]')).toHaveCount(0);

  for (const lesson of publishedLessons) {
    const response = await page.goto(`/lessons/${lesson.id}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(".lesson-reader > header h1")).toBeVisible();
    await expect(page.locator(".exercise-card")).toHaveCount(1);
    await expect(page.locator(".exercise-preview")).toHaveCount(0);
    await expect(page.locator(".lesson-content-list").first().locator(":scope > li")).toHaveCount(3);
    const image = page.locator(`.lesson-illustration img[src*="${lesson.image}"]`);
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => (
      element.complete ? element.naturalWidth : 0
    ))).toBeGreaterThan(0);

    const leakedKeys = await page.evaluate(async (lessonId) => {
      const payload = await fetch(`/api/lessons/${lessonId}`).then((result) => result.json());
      const forbidden = new Set([
        "correct_option",
        "feedback_by_option",
        "model_answer",
        "rubric",
        "misconception",
        "correct_mapping",
      ]);
      const found: string[] = [];
      function visit(value: unknown) {
        if (Array.isArray(value)) return value.forEach(visit);
        if (!value || typeof value !== "object") return;
        for (const [key, nested] of Object.entries(value)) {
          if (forbidden.has(key)) found.push(key);
          visit(nested);
        }
      }
      visit(payload);
      return found;
    }, lesson.id);
    expect(leakedKeys).toEqual([]);
  }

  expect((await page.goto("/lessons/ch01-l03"))?.status()).toBe(404);
  expect((await page.goto("/lessons/ch01-l04"))?.status()).toBe(404);
});

test("reveals optional depth and recall answers only after keyboard activation", async ({ page }) => {
  await page.goto("/lessons/ch01-l02");
  const deepening = page.locator(".lesson-deepening").first();
  await expect(deepening).toBeVisible();
  await expect(deepening.locator(":scope > summary")).toContainText(
    "Vertiefung · optional · zusätzliche Zeit",
  );
  await expect(deepening.locator(".lesson-details-body")).toBeHidden();
  await deepening.locator(":scope > summary").focus();
  await page.keyboard.press("Enter");
  await expect(deepening).toHaveAttribute("open", "");
  await expect(deepening.locator(".lesson-details-body")).toBeVisible();

  await page.goto("/lessons/ch01-l05");
  const recall = page.locator(".lesson-recall").first();
  await expect(recall).toBeVisible();
  await expect(recall.locator(":scope > summary")).toContainText("Kurzabruf");
  await expect(recall.locator(".lesson-details-body")).toBeHidden();
  await recall.locator(":scope > summary").focus();
  await page.keyboard.press("Enter");
  await expect(recall).toHaveAttribute("open", "");
  await expect(recall.locator(".lesson-details-body")).toBeVisible();
});

test("keeps the validated lesson number when curriculum navigation fails", async ({ page }) => {
  await page.route("**/api/curriculum", (route) => route.abort("failed"));
  await page.goto("/lessons/ch01-l05");

  await expect(page.locator(".reader-breadcrumb")).toContainText("Lektion 03");
  await expect(page.locator(".navigation-unavailable")).toHaveCount(2);
});

test("keeps the new lesson controls usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lessons/ch01-l05");

  const summary = page.locator(".lesson-recall > summary");
  expect(await summary.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(54);
  const answer = page.locator(".free-text-exercise textarea");
  await answer.focus();
  await page.keyboard.type("Der einzelne Wert beschreibt noch keinen Verlauf.");
  await expect(answer).toHaveValue("Der einzelne Wert beschreibt noch keinen Verlauf.");
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport);
});

test("stores the L2 choice and L3 self-assessment without opening optional depth", async ({ page }) => {
  await page.goto("/lessons/ch01-l02");
  const deepening = page.locator(".lesson-deepening");
  await expect(deepening).not.toHaveAttribute("open", "");
  const choice = page.locator(".exercise-card:not(.free-text-exercise)");
  await expect(choice.getByText("Der Test beantwortet eine Kraftfrage", { exact: false })).toHaveCount(0);
  await choice.getByRole("radio").nth(1).check();
  await choice.getByRole("button", { name: "Antwort speichern" }).click();
  await expect(choice.getByRole("status")).toContainText(
    "Der Test beantwortet eine Kraftfrage; Muskelwachstum braucht eine dazu passende Beobachtung.",
  );

  const progressButton = page.locator(".reading-progress button");
  if (await progressButton.getAttribute("class") === "secondary-action") {
    await progressButton.click();
  }
  await page.getByRole("button", { name: "Als gelesen markieren" }).click();
  await expect(page.getByRole("heading", { name: "Als gelesen markiert" })).toBeVisible();
  await expect(deepening).not.toHaveAttribute("open", "");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Als gelesen markiert" })).toBeVisible();
  await expect(page.locator(".lesson-deepening")).not.toHaveAttribute("open", "");

  await page.goto("/lessons/ch01-l05");
  const freeText = page.locator(".free-text-exercise");
  await expect(freeText.getByRole("heading", { name: "Musterantwort" })).toHaveCount(0);
  await freeText.getByRole("textbox", { name: "Deine Antwort in eigenen Worten" }).fill(
    "Progression beschreibt die zielbezogene Entwicklung über Zeit. Ein einzelner Testtag bildet keinen ganzen Verlauf ab; Zielgröße, Vergleichbarkeit und Messunsicherheit bleiben zu prüfen.",
  );
  await freeText.getByRole("button", { name: "Antwort speichern" }).click();
  await expect(freeText.getByRole("heading", { name: "Musterantwort" })).toBeVisible();
  await expect(freeText.getByText("Die Aussage ist zu stark", { exact: false })).toBeVisible();
  for (const criterion of await freeText.getByRole("checkbox").all()) {
    await criterion.check();
  }
  await freeText.getByLabel("Wie schätzt du deine Antwort ein?").selectOption("good");
  await freeText.getByRole("button", { name: "Selbstbewertung speichern" }).click();
  await expect(freeText.getByRole("status")).toContainText(
    "Selbstbewertung dauerhaft gespeichert",
  );

  await page.goto("/lessons/ch01-l02");
  await page.getByRole("button", { name: "Lesemarkierung zurücknehmen" }).click();
  await expect(page.getByRole("heading", { name: "Lektion gelesen?" })).toBeVisible();
});

import { expect, test, type Page } from "@playwright/test";

const feedback = [
  "Die dokumentierten Merkmale stimmen überein. Jetzt kennst du zusätzlich eine unterschiedliche innere Reaktion. Warum sie verschieden war, ist noch offen.",
  "Gleiche dokumentierte Strecken- und Zeitangaben reichen nicht für diese Aussage. Das aufgedeckte Erleben unterscheidet sich.",
  "Eine langfristige Veränderung lässt sich aus diesem Vergleich nicht ablesen. Du kennst jetzt erst zwei unmittelbare Reaktionen.",
];

const exerciseFeedback = [
  "Eine stärkere akute Beanspruchung beweist keine bestimmte langfristige Anpassung.",
  "Richtig: Dokumentierte Aufgabe, beobachtete Reaktion und weitergehende Erklärung bleiben getrennt.",
  "Die Reaktion zeigt keine vollständige Gleichheit, beweist aber auch nicht, welches äußere Merkmal verschieden gewesen sein müsste.",
];

const freeTextModelAnswer = "Übung, Last, Sätze und Wiederholungen stimmen im Protokoll überein.";

function freeTextExercise(page: Page) {
  return page.locator(".free-text-exercise");
}

async function openLesson(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: "Gleiche Aufgabe, andere Reaktion" }).click();
  await expect(page.getByRole("heading", { name: "Gleiche Aufgabe, andere Reaktion", exact: true })).toBeVisible();
}

async function readerContainmentViolations(page: Page) {
  return page.evaluate(() => {
    const reader = document.querySelector<HTMLElement>(".lesson-reader")!;
    const readerBox = reader.getBoundingClientRect();
    const style = getComputedStyle(reader);
    const contentLeft = readerBox.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
    const contentRight = readerBox.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);
    const surfaces = reader.querySelectorAll<HTMLElement>(
      ".lesson-guide, .lesson-illustration, .knowledge-figure, .exercise-preview, .exercise-card, .reading-progress, .optional-feedback, button, input, select, textarea, summary, .pilot-rating-options label",
    );

    return Array.from(surfaces).filter((element) => element.getClientRects().length > 0).map((element) => {
      const box = element.getBoundingClientRect();
      return {
        className: element.className,
        left: box.left,
        right: box.right,
        contentLeft,
        contentRight,
      };
    }).filter(({ left, right }) => left < contentLeft - 1 || right > contentRight + 1);
  });
}

test("opens the complete canonical pilot reader without external runtime requests", async ({ page }) => {
  const expectedOrigin = new URL(process.env.ATHENA_WEB_URL ?? "http://127.0.0.1:3000").origin;
  const externalRequests: string[] = [];
  const failedResponses: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== expectedOrigin) externalRequests.push(request.url());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  await openLesson(page);

  const reader = page.locator(".lesson-reader");
  await expect(reader.getByRole("heading", { name: "Etwa 5 Minuten mit Aufgaben" })).toBeVisible();
  await expect(reader.getByText("Orientierungswert, kein Timer.")).toBeVisible();
  await expect(reader.locator(".lesson-guide li")).toHaveText(["1Lesen", "2Anwenden", "3Abschließen"]);
  const headerHeight = await page.locator(".site-header").evaluate((element) => element.getBoundingClientRect().height);
  expect(headerHeight).toBeGreaterThanOrEqual(56);
  expect(headerHeight).toBeLessThanOrEqual(64);
  await expect(page.locator(".lesson-sidebar-left")).toBeVisible();
  await expect(page.locator(".lesson-sidebar-right")).toBeVisible();
  await expect(page.locator(".lesson-mobile-navigation")).toBeHidden();
  await expect(page.locator('.lesson-sidebar-left .lesson-navigation a[aria-current="page"]')).toHaveText(/Gleiche Aufgabe, andere Reaktion/);
  await expect(page.locator(".lesson-navigation .planned-lesson")).toHaveCount(4);
  await expect(page.locator(".planned-lesson a")).toHaveCount(0);
  const tocLinks = page.locator(".lesson-sidebar-right .lesson-toc a");
  await expect(tocLinks).toHaveCount(4);
  expect(await tocLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")))).toEqual([
    "#was-wurde-eigentlich-gemessen",
    "#erst-urteilen-dann-aufdecken",
    "#heute-ist-nicht-langfristig",
    "#merksatz",
  ]);
  const headingIds = await reader.locator(":scope > h2, :scope > h3").evaluateAll((elements) => elements.map((element) => element.id));
  expect(new Set(headingIds).size).toBe(headingIds.length);
  for (const id of headingIds) await expect(page.locator(`#${id}`)).toHaveCount(1);
  const optionalFeedback = page.locator(".optional-feedback");
  await expect(optionalFeedback).not.toHaveAttribute("open", "");
  await expect(page.locator(".pilot-feedback")).not.toBeVisible();
  await expect(optionalFeedback.getByText("Die Bewertung gehört nicht zur Zeitangabe der Lektion.")).toBeVisible();
  await expect(reader.getByText("Fiktives Beispiel.", { exact: true })).toBeVisible();
  await expect(reader.getByRole("heading", { name: "Was wurde eigentlich gemessen?" })).toBeVisible();
  await expect(reader.getByRole("heading", { name: "Erst urteilen, dann aufdecken" })).toBeVisible();
  await expect(reader.getByRole("heading", { name: "Heute ist nicht langfristig" })).toBeVisible();
  await expect(reader.getByRole("heading", { name: "Merksatz" })).toBeVisible();
  await expect(page.locator(".knowledge-figure")).toHaveCount(1);
  const illustrations = reader.locator(".lesson-illustration");
  await expect(illustrations).toHaveCount(3);
  await expect(illustrations.locator("figcaption")).toHaveText([
    "Fiktive Illustration · Das Trainingstagebuch spielt Orakel.",
    "Fiktive Illustration · Trainingsalltag im römischen Lernstudio.",
    "Fiktive Illustration · Erschöpfung verteilt keine Fortschrittszeugnisse.",
  ]);
  const illustrationImages = illustrations.locator("img");
  expect(await illustrationImages.evaluateAll((images) => images.map((image) => ({
    path: new URL((image as HTMLImageElement).src).pathname,
    alt: image.getAttribute("alt"),
    loading: image.getAttribute("loading"),
  })))).toEqual([
    { path: "/images/lessons/l1-oracle-v1.webp", alt: "", loading: "lazy" },
    { path: "/images/lessons/l1-training-studio-v1.webp", alt: "", loading: "lazy" },
    { path: "/images/lessons/l1-no-certificate-v2.webp", alt: "", loading: "lazy" },
  ]);
  for (const image of await illustrationImages.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete ? element.naturalWidth : 0)).toBeGreaterThan(0);
  }
  await expect(page.getByText("Denkaufgabe · Fiktives Beispiel")).toHaveCount(2);
  await expect(page.getByText("Aufgabe · in Entwicklung")).toHaveCount(0);
  await expect(page.getByText("Recherchegestützter Pilotentwurf · keine unabhängige Fachprüfung")).toBeVisible();
  await expect(page.getByText("pilot_draft", { exact: false })).toBeVisible();
  const banner = page.locator(".lesson-banner");
  const bannerRatio = await banner.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return box.width / box.height;
  });
  expect(bannerRatio).toBeGreaterThan(3.9);
  expect(bannerRatio).toBeLessThan(4.1);
  const bannerImage = banner.locator("img");
  await expect(bannerImage).toBeVisible();
  await expect.poll(() => bannerImage.evaluate((image: HTMLImageElement) => image.complete ? image.naturalWidth : 0)).toBeGreaterThan(0);
  await expect(page.getByText("Angenehm erlebt", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Deutlich anstrengender erlebt", { exact: true })).toHaveCount(0);
  const prematureReveal = await reader.evaluate((element) => {
    const attributes = Array.from(element.querySelectorAll("[aria-label], [title]"))
      .flatMap((element) => [element.getAttribute("aria-label"), element.getAttribute("title")])
      .filter(Boolean)
      .join(" ");
    return `${element.textContent ?? ""} ${attributes}`;
  });
  expect(prematureReveal).not.toContain("A wurde als angenehm erlebt");
  expect(prematureReveal).not.toContain("B als deutlich anstrengender");
  expect(prematureReveal).not.toContain("Angenehm erlebt.");
  expect(prematureReveal).not.toContain("Deutlich anstrengender erlebt.");
  expect(externalRequests).toEqual([]);
  expect(failedResponses).toEqual([]);
});

test("keeps the lesson readable when optional curriculum navigation fails", async ({ page }) => {
  await page.route("**/api/curriculum", (route) => route.abort("failed"));
  await page.goto("/lessons/ch01-l01");

  await expect(page.getByRole("heading", { name: "Gleiche Aufgabe, andere Reaktion", exact: true })).toBeVisible();
  await expect(page.locator(".error-card")).toHaveCount(0);
  await expect(page.locator(".navigation-unavailable")).toHaveCount(2);
  await expect(page.locator(".lesson-sidebar-left .navigation-unavailable")).toBeVisible();
});

test("opens both mobile navigation groups by keyboard and keeps anchors below the header", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lessons/ch01-l01");

  const mobileNavigation = page.locator(".lesson-mobile-navigation");
  await expect(mobileNavigation).toBeVisible();
  const details = mobileNavigation.locator(":scope > details");
  const lessonSummary = details.nth(0).locator(":scope > summary");
  await lessonSummary.focus();
  await page.keyboard.press("Enter");
  await expect(details.nth(0)).toHaveAttribute("open", "");
  await expect(details.nth(0).locator('a[aria-current="page"]')).toBeVisible();
  await expect(details.nth(0).locator(".planned-lesson a")).toHaveCount(0);

  const tocSummary = details.nth(1).locator(":scope > summary");
  await tocSummary.focus();
  await page.keyboard.press("Enter");
  await expect(details.nth(1)).toHaveAttribute("open", "");
  const tocLink = details.nth(1).getByRole("link", { name: "Heute ist nicht langfristig" });
  await expect(tocLink).toBeVisible();
  await tocLink.click();
  await expect(page).toHaveURL(/#heute-ist-nicht-langfristig$/);

  const target = page.locator("#heute-ist-nicht-langfristig");
  await expect.poll(async () => {
    const [headerBox, targetBox] = await Promise.all([
      page.locator(".site-header").boundingBox(),
      target.boundingBox(),
    ]);
    return headerBox && targetBox ? targetBox.y - (headerBox.y + headerBox.height) : -1;
  }).toBeGreaterThanOrEqual(0);
});

test("keeps exercise solutions out of the initial page and client bundle", async ({ page }) => {
  await page.goto("/lessons/ch01-l01");
  const exercise = page.locator(".exercise-card:not(.free-text-exercise)");
  await expect(exercise.getByRole("heading", { name: /Welche Schlussfolgerung trennt die drei Ebenen/ })).toBeVisible();
  await expect(exercise.getByRole("radio")).toHaveCount(3);
  await expect(exercise.getByText("Versuch dauerhaft gespeichert")).toHaveCount(0);
  for (const text of exerciseFeedback) await expect(exercise.getByText(text)).toHaveCount(0);
  await expect(page.getByText(freeTextModelAnswer, { exact: false })).toHaveCount(0);

  const bundleText = await page.locator('script[src]').evaluateAll(async (scripts) => {
    const responses = await Promise.all(scripts.map((script) => fetch((script as HTMLScriptElement).src)));
    return (await Promise.all(responses.map((response) => response.text()))).join("\n");
  });
  for (const text of exerciseFeedback) expect(bundleText).not.toContain(text);
  expect(bundleText).not.toContain(freeTextModelAnswer);
});

test("stores a keyboard free-text answer before showing canonical self-assessment", async ({ page }) => {
  const requests: { url: string; body: Record<string, unknown> }[] = [];
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (request.method() === "POST" && path.includes("/api/attempts")) {
      requests.push({ url: request.url(), body: request.postDataJSON() as Record<string, unknown> });
    }
  });
  await page.goto("/lessons/ch01-l01");
  const exercise = freeTextExercise(page);
  const answer = "Distanz und Dauer sind gleich. Das Erleben ist verschieden; die Ursache und Anpassung bleiben offen.";
  await exercise.getByLabel("Deine Antwort in eigenen Worten").fill(answer);
  await exercise.getByLabel("Wie sicher bist du?").selectOption("mittel");
  const submit = exercise.getByRole("button", { name: "Antwort speichern" });
  await submit.focus();
  await page.keyboard.press("Enter");

  const feedbackPanel = exercise.locator(".free-text-feedback");
  await expect(feedbackPanel).toBeFocused();
  await expect(feedbackPanel).toContainText(freeTextModelAnswer);
  await expect(feedbackPanel).toContainText("Alternative korrekte Formulierungen");
  await expect(feedbackPanel).toContainText("bewertet deinen Text nicht automatisch");
  await expect(feedbackPanel.getByRole("checkbox")).toHaveCount(3);
  expect(requests[0].body).toMatchObject({
    item_id: "q-ch01-02",
    answer: { text: answer },
    confidence: "mittel",
  });
  expect(new URL(requests[0].url).search).toBe("");

  for (const checkbox of await feedbackPanel.getByRole("checkbox").all()) await checkbox.check();
  const rating = feedbackPanel.getByLabel("Wie schätzt du deine Antwort ein?");
  await expect(rating.locator("option")).toHaveText([
    "Bitte wählen",
    "Noch einmal – noch nicht erinnert",
    "Schwierig – teilweise oder unsicher",
    "Gut – alle Pflichtkriterien erfüllt",
  ]);
  await rating.selectOption("good");
  await feedbackPanel.getByRole("checkbox").last().uncheck();
  await expect(rating).toHaveValue("");
  await feedbackPanel.getByRole("checkbox").last().check();
  await rating.selectOption("good");
  await feedbackPanel.getByRole("button", { name: "Selbstbewertung speichern" }).press("Enter");
  const assessment = exercise.getByRole("status");
  await expect(assessment).toBeFocused();
  await expect(assessment).toContainText("Alle Pflichtkriterien erfüllt");
  await expect(assessment).toContainText("keine objektive Wissensmessung");
  expect(requests[1].body).toEqual({
    content_version: "0.2.0",
    checked_criterion_ids: ["c1", "c2", "c3"],
    rating: "good",
  });
  expect(new URL(requests[1].url).search).toBe("");
});

test("counts Unicode codepoints and keeps an overlong pasted answer for correction", async ({ page }) => {
  await page.goto("/lessons/ch01-l01");
  const exercise = freeTextExercise(page);
  const textarea = exercise.getByLabel("Deine Antwort in eigenen Worten");
  await textarea.fill("🧪".repeat(4_000));
  await expect(exercise.getByText("4.000 von 4.000 Zeichen")).toBeVisible();
  await expect(exercise.getByRole("button", { name: "Antwort speichern" })).toBeEnabled();
  await textarea.fill("🧪".repeat(4_001));
  await expect(exercise.getByText("4.001 von 4.000 Zeichen – bitte kürzen")).toBeVisible();
  await expect(textarea).toHaveValue("🧪".repeat(4_001));
  await expect(exercise.getByRole("button", { name: "Antwort speichern" })).toBeDisabled();
});

test("uses a new free-text UUID after changing an answer with unknown save status", async ({ page }) => {
  const attemptIds: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && new URL(request.url()).pathname === "/api/attempts") {
      const body = request.postDataJSON() as { attempt_id: string; item_id: string };
      if (body.item_id === "q-ch01-02") attemptIds.push(body.attempt_id);
    }
  });
  await page.route("**/api/attempts", async (route) => {
    const response = await route.fetch();
    expect(response.ok()).toBe(true);
    await route.abort("failed");
  }, { times: 1 });
  await page.goto("/lessons/ch01-l01");
  const exercise = freeTextExercise(page);
  const textarea = exercise.getByLabel("Deine Antwort in eigenen Worten");
  await textarea.fill("Erster Text bleibt zunächst offen.");
  await exercise.getByRole("button", { name: "Antwort speichern" }).click();
  await expect(exercise.getByRole("alert")).toContainText("Text bleibt erhalten");
  await textarea.fill("Geänderter Text ist ein neuer Versuch.");
  await exercise.getByRole("button", { name: "Antwort speichern" }).click();
  await expect(exercise.locator(".free-text-feedback")).toContainText(freeTextModelAnswer);
  expect(attemptIds).toHaveLength(2);
  expect(attemptIds[1]).not.toBe(attemptIds[0]);
});

test("retries an unchanged self-assessment after a lost successful response", async ({ page }) => {
  await page.route("**/api/attempts/*/self-assessment", async (route) => {
    const response = await route.fetch();
    expect(response.ok()).toBe(true);
    await route.abort("failed");
  }, { times: 1 });
  await page.goto("/lessons/ch01-l01");
  const exercise = freeTextExercise(page);
  await exercise.getByLabel("Deine Antwort in eigenen Worten").fill("Die Ebenen sind getrennt; die Ursache ist offen.");
  await exercise.getByRole("button", { name: "Antwort speichern" }).click();
  const feedbackPanel = exercise.locator(".free-text-feedback");
  await feedbackPanel.getByRole("checkbox").first().check();
  await feedbackPanel.getByLabel("Wie schätzt du deine Antwort ein?").selectOption("hard");
  await feedbackPanel.getByRole("button", { name: "Selbstbewertung speichern" }).click();
  await expect(exercise.getByRole("alert")).toContainText("Selbstbewertung ist unklar");
  await expect(feedbackPanel.getByRole("checkbox").first()).toBeDisabled();
  await feedbackPanel.getByRole("button", { name: "Selbstbewertung speichern" }).click();
  await expect(exercise.getByRole("status")).toContainText("Teilweise oder unsicher");
});

test("stores the keyboard answer before revealing canonical feedback", async ({ page }) => {
  const requests: { url: string; body: Record<string, unknown> }[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && new URL(request.url()).pathname === "/api/attempts") {
      requests.push({ url: request.url(), body: request.postDataJSON() as Record<string, unknown> });
    }
  });
  await page.goto("/lessons/ch01-l01");
  const exercise = page.locator(".exercise-card:not(.free-text-exercise)");
  const correctChoice = exercise.getByRole("radio").nth(1);
  await correctChoice.focus();
  await page.keyboard.press("Space");
  await exercise.getByLabel("Wie sicher bist du?").selectOption("sicher");
  const submit = exercise.getByRole("button", { name: "Antwort speichern" });
  await submit.focus();
  await page.keyboard.press("Enter");

  const result = exercise.getByRole("status");
  await expect(result).toBeFocused();
  await expect(result).toContainText(exerciseFeedback[1]);
  await expect(result).toContainText("Versuch dauerhaft gespeichert · Zuversicht: sicher");
  expect(requests).toHaveLength(1);
  expect(new URL(requests[0].url).search).toBe("");
  expect(requests[0].body).toMatchObject({
    item_id: "q-ch01-01",
    content_version: "0.2.0",
    answer: { option_id: "b" },
    confidence: "sicher",
    mode: "practice",
    assisted: false,
  });
  expect(requests[0].body.attempt_id).toMatch(/^[0-9a-f-]{36}$/);
});

test("retains answer and UUID after an error, then creates a UUID for a genuine new attempt", async ({ page }) => {
  const attemptIds: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && new URL(request.url()).pathname === "/api/attempts") {
      attemptIds.push((request.postDataJSON() as { attempt_id: string }).attempt_id);
    }
  });
  await page.route("**/api/attempts", async (route) => {
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ detail: "Testfehler" }) });
  }, { times: 1 });
  await page.goto("/lessons/ch01-l01");
  const exercise = page.locator(".exercise-card:not(.free-text-exercise)");
  const choice = exercise.getByRole("radio").first();
  await choice.check();
  await exercise.getByLabel("Wie sicher bist du?").selectOption("unsicher");
  await exercise.getByRole("button", { name: "Antwort speichern" }).click();

  await expect(exercise.getByRole("alert")).toContainText("Auswahl bleibt erhalten");
  await expect(choice).toBeChecked();
  await expect(exercise.getByLabel("Wie sicher bist du?")).toHaveValue("unsicher");
  await expect(exercise.getByRole("status")).toHaveCount(0);
  await exercise.getByRole("button", { name: "Antwort speichern" }).click();
  await expect(exercise.getByRole("status")).toContainText(exerciseFeedback[0]);
  expect(attemptIds[0]).toBe(attemptIds[1]);

  await exercise.getByRole("button", { name: "Erneut versuchen" }).click();
  await expect(choice).toBeFocused();
  await expect(choice).not.toBeChecked();
  await choice.check();
  await exercise.getByRole("button", { name: "Antwort speichern" }).click();
  await expect(exercise.getByRole("status")).toContainText(exerciseFeedback[0]);
  expect(attemptIds[2]).not.toBe(attemptIds[1]);
});

test("starts a new UUID when an answer is changed after a lost successful response", async ({ page }) => {
  const attemptIds: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && new URL(request.url()).pathname === "/api/attempts") {
      attemptIds.push((request.postDataJSON() as { attempt_id: string }).attempt_id);
    }
  });
  await page.route("**/api/attempts", async (route) => {
    const storedResponse = await route.fetch();
    expect(storedResponse.ok()).toBe(true);
    await route.abort("failed");
  }, { times: 1 });
  await page.goto("/lessons/ch01-l01");
  const exercise = page.locator(".exercise-card:not(.free-text-exercise)");
  await exercise.getByRole("radio").first().check();
  await exercise.getByRole("button", { name: "Antwort speichern" }).click();
  await expect(exercise.getByRole("alert")).toContainText("Speicherstatus konnte nicht bestätigt werden");

  await exercise.getByRole("radio").nth(1).check();
  await expect(exercise.getByRole("alert")).toHaveCount(0);
  await exercise.getByRole("button", { name: "Antwort speichern" }).click();
  await expect(exercise.getByRole("status")).toContainText(exerciseFeedback[1]);
  expect(attemptIds).toHaveLength(2);
  expect(attemptIds[1]).not.toBe(attemptIds[0]);
});

test("opens comma-separated source metadata and returns focus", async ({ page }) => {
  await page.goto("/lessons/ch01-l01");
  const marker = page.getByRole("button", { name: "Quellen S05 und S06 öffnen" }).first();
  await marker.focus();
  await page.keyboard.press("Enter");

  const panel = page.getByRole("dialog", { name: "S05 · S06" });
  await expect(panel).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(panel.getByRole("button", { name: "Schließen" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(panel.getByRole("link", { name: "Externen Quellennachweis öffnen" }).last()).toBeFocused();
  await expect(panel.getByRole("heading", { name: /Internal and External Training Load/ })).toBeVisible();
  await expect(panel.getByRole("heading", { name: /Development of a Revised Conceptual Framework/ })).toBeVisible();
  await expect(panel.getByText("Metadaten und eigene Notizen; kein Volltextimport")).toHaveCount(2);
  const externalLinks = panel.getByRole("link", { name: "Externen Quellennachweis öffnen" });
  await expect(externalLinks).toHaveCount(2);
  await expect(externalLinks.first()).toHaveAttribute("href", /^https:\/\//);

  await panel.getByRole("button", { name: "Schließen" }).press("Enter");
  await expect(panel).toHaveCount(0);
  await expect(marker).toBeFocused();
});

for (const [index, expectedFeedback] of feedback.entries()) {
  test(`reveals canonical interaction feedback for answer ${index + 1}`, async ({ page }) => {
    await page.goto("/lessons/ch01-l01");
    const figure = page.locator(".interactive-figure");
    await expect(figure.getByText("Reaktion noch nicht gezeigt")).toHaveCount(2);
    await expect(figure.getByRole("button", { name: "Reaktionen aufdecken" })).toBeDisabled();

    const choice = figure.getByRole("radio").nth(index);
    await choice.focus();
    await page.keyboard.press("Space");
    const reveal = figure.getByRole("button", { name: "Reaktionen aufdecken" });
    await reveal.focus();
    await page.keyboard.press("Enter");

    await expect(figure.locator(".reaction.revealed").nth(0)).toContainText("Angenehm erlebt.");
    await expect(figure.locator(".reaction.revealed").nth(1)).toContainText("Deutlich anstrengender erlebt.");
    await expect(figure.getByRole("status")).toContainText(expectedFeedback);
    const reflection = figure.getByRole("button", { name: "Welche zusätzliche Information könnte bei der Einordnung helfen?" });
    await expect(reflection).toHaveAttribute("aria-expanded", "false");
    await reflection.click();
    await expect(reflection).toHaveAttribute("aria-expanded", "true");
    await expect(figure.getByText(/Keine dieser Fragen beweist eine Ursache/)).toBeVisible();
  });
}

test("reset clears only the transient interaction and returns keyboard focus", async ({ page }) => {
  await page.goto("/lessons/ch01-l01");
  const figure = page.locator(".interactive-figure");
  const firstChoice = figure.getByRole("radio").first();
  await firstChoice.check();
  await figure.getByRole("button", { name: "Reaktionen aufdecken" }).click();
  await figure.getByRole("button", { name: "Welche zusätzliche Information könnte bei der Einordnung helfen?" }).click();
  await figure.getByRole("button", { name: "Neu ansehen" }).click();

  await expect(firstChoice).toBeFocused();
  await expect(firstChoice).not.toBeChecked();
  await expect(figure.getByText("Reaktion noch nicht gezeigt")).toHaveCount(2);
  await expect(figure.getByRole("status")).toHaveCount(0);
  await expect(figure.getByText(/Keine dieser Fragen beweist eine Ursache/)).toHaveCount(0);
});

test("stays usable at 390 pixels, 200 percent scale and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lessons/ch01-l01");
  const reducedMotion = await page.locator(".lesson-shell").evaluate((element) => getComputedStyle(element).scrollBehavior);
  expect(reducedMotion).toBe("auto");
  let widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport);

  const exercise = page.locator(".exercise-card:not(.free-text-exercise)");
  await exercise.getByRole("radio").nth(2).check();
  await exercise.getByRole("button", { name: "Antwort speichern" }).click();
  await expect(exercise.getByRole("status")).toContainText(exerciseFeedback[2]);

  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 640,
    height: 800,
    deviceScaleFactor: 2,
    mobile: false,
  });
  await expect(page.getByRole("heading", { name: "Merksatz" })).toBeVisible();
  widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(widths.viewport).toBe(640);
  expect(widths.content).toBeLessThanOrEqual(widths.viewport);
});

test("keeps lesson surfaces inside the reader content box at supported widths", async ({ page }) => {
  for (const width of [1440, 1262, 1200, 1199, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/lessons/ch01-l01");
    await expect(page.locator(".lesson-reader")).toBeVisible();
    const pageWidths = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(pageWidths.scroll, `page containment at ${width}px`).toBeLessThanOrEqual(pageWidths.client);
    if (width >= 1200) {
      await expect(page.locator(".lesson-sidebar-left")).toBeVisible();
      await expect(page.locator(".lesson-sidebar-right")).toBeVisible();
      await expect(page.locator(".lesson-mobile-navigation")).toBeHidden();
    } else {
      await expect(page.locator(".lesson-sidebar-left")).toBeHidden();
      await expect(page.locator(".lesson-sidebar-right")).toBeHidden();
      await expect(page.locator(".lesson-mobile-navigation")).toBeVisible();
    }
    expect(await readerContainmentViolations(page), `closed reader containment at ${width}px`).toEqual([]);
    await page.locator(".optional-feedback > summary").click();
    expect(await readerContainmentViolations(page), `open reader containment at ${width}px`).toEqual([]);
  }
});

test("meets measured contrast targets for reader text and primary controls", async ({ page }) => {
  await page.goto("/lessons/ch01-l01");
  await expect(page.getByRole("heading", { name: "Gleiche Aufgabe, andere Reaktion", exact: true })).toBeVisible();
  await page.locator(".interactive-figure").getByRole("radio").first().check();
  const ratios = await page.evaluate(() => {
    function rgb(value: string) {
      const parts = value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
      return parts.map((part) => {
        const channel = part / 255;
        return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
      });
    }
    function ratio(foreground: string, background: string) {
      const fg = rgb(foreground);
      const bg = rgb(background);
      const luminance = (channels: number[]) => .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
      const light = Math.max(luminance(fg), luminance(bg));
      const dark = Math.min(luminance(fg), luminance(bg));
      return (light + .05) / (dark + .05);
    }
    function effectiveBackground(element: HTMLElement) {
      let current: HTMLElement | null = element;
      while (current) {
        const color = getComputedStyle(current).backgroundColor;
        if (color !== "transparent" && color !== "rgba(0, 0, 0, 0)") return color;
        current = current.parentElement;
      }
      return "rgb(255, 255, 255)";
    }
    const paragraphElement = document.querySelector<HTMLElement>(".lesson-reader > p")!;
    const buttonElement = document.querySelector<HTMLElement>(".primary-action")!;
    const eyebrowElement = document.querySelector<HTMLElement>(".lesson-heading .eyebrow")!;
    return {
      paragraph: ratio(getComputedStyle(paragraphElement).color, effectiveBackground(paragraphElement)),
      button: ratio(getComputedStyle(buttonElement).color, effectiveBackground(buttonElement)),
      headingEyebrow: ratio(getComputedStyle(eyebrowElement).color, effectiveBackground(eyebrowElement)),
    };
  });
  expect(ratios.paragraph).toBeGreaterThanOrEqual(4.5);
  expect(ratios.button).toBeGreaterThanOrEqual(4.5);
  expect(ratios.headingEyebrow).toBeGreaterThanOrEqual(4.5);
});

import { chromium, expect, test, type Page } from "@playwright/test";

async function completeFeedback(page: Page) {
  const optionalFeedback = page.locator(".optional-feedback");
  await optionalFeedback.locator("summary").click();
  await expect(optionalFeedback).toHaveAttribute("open", "");
  const feedback = page.locator(".pilot-feedback");
  const ratings = [1, 2, 3, 4, 5];
  for (const [index, rating] of ratings.entries()) {
    await feedback.getByRole("group").nth(index).getByText(String(rating), { exact: true }).click();
  }
  await feedback.getByLabel("An welcher Stelle musste ich zurücklesen?").fill("Beim Übergang zur inneren Belastung.");
  await feedback.getByLabel("Welche Darstellung hat eine konkrete Unklarheit beseitigt?").fill("Die Gegenüberstellung der zwei Läufe 🙂");
  return feedback;
}

test("stores the five pilot ratings and exact optional prompts", async ({ page }) => {
  const requests: Record<string, unknown>[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/api/pilot-feedback")) {
      requests.push(request.postDataJSON() as Record<string, unknown>);
    }
  });
  await page.goto("/lessons/ch01-l01");
  const feedback = await completeFeedback(page);

  await feedback.getByRole("button", { name: "Pilotfeedback speichern" }).click();
  await expect(feedback.getByRole("status")).toContainText("Pilotfeedback dauerhaft gespeichert");
  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({
    lesson_id: "ch01-l01",
    content_version: "0.2.0",
    readability: 1,
    text_amount: 2,
    visual_usefulness: 3,
    practical_relevance: 4,
    usability: 5,
    reread_location: "Beim Übergang zur inneren Belastung.",
    clarifying_visual: "Die Gegenüberstellung der zwei Läufe 🙂",
  });
  expect(requests[0].feedback_id).toMatch(/^[0-9a-f-]{36}$/);

  await feedback.getByRole("button", { name: "Weitere Bewertung abgeben" }).click();
  await expect(feedback.getByRole("radio").first()).toBeFocused();
  await expect(feedback.getByRole("radio", { checked: true })).toHaveCount(0);
  await expect(feedback.getByLabel("An welcher Stelle musste ich zurücklesen?")).toHaveValue("");
});

test("retries a lost successful response with the exact UUID and snapshot", async ({ page }) => {
  const requests: Record<string, unknown>[] = [];
  let interrupted = false;
  await page.route("**/api/pilot-feedback", async (route) => {
    requests.push(route.request().postDataJSON() as Record<string, unknown>);
    if (!interrupted) {
      interrupted = true;
      const storedResponse = await route.fetch();
      expect(storedResponse.status()).toBe(201);
      await route.abort("failed");
      return;
    }
    await route.continue();
  });
  await page.goto("/lessons/ch01-l01");
  const feedback = await completeFeedback(page);

  await feedback.getByRole("button", { name: "Pilotfeedback speichern" }).click();
  await expect(feedback.getByRole("alert")).toContainText("Speicherstatus konnte nicht bestätigt werden");
  await expect(feedback.getByLabel("An welcher Stelle musste ich zurücklesen?")).toHaveValue("Beim Übergang zur inneren Belastung.");
  await feedback.getByRole("button", { name: "Unverändert erneut senden" }).click();
  await expect(feedback.getByRole("status")).toContainText("dauerhaft gespeichert");

  expect(requests).toHaveLength(2);
  expect(requests[1]).toEqual(requests[0]);
});

test("uses a new UUID after editing an unconfirmed submission", async ({ page }) => {
  const requests: Record<string, unknown>[] = [];
  let interrupted = false;
  await page.route("**/api/pilot-feedback", async (route) => {
    requests.push(route.request().postDataJSON() as Record<string, unknown>);
    if (!interrupted) {
      interrupted = true;
      const storedResponse = await route.fetch();
      expect(storedResponse.status()).toBe(201);
      await route.abort("failed");
      return;
    }
    await route.continue();
  });
  await page.goto("/lessons/ch01-l01");
  const feedback = await completeFeedback(page);
  await feedback.getByRole("button", { name: "Pilotfeedback speichern" }).click();
  await expect(feedback.getByRole("alert")).toBeVisible();

  await feedback.getByLabel("An welcher Stelle musste ich zurücklesen?").fill("Eine korrigierte Rückmeldung.");
  await feedback.getByRole("button", { name: "Pilotfeedback speichern" }).click();
  await expect(feedback.getByRole("status")).toContainText("dauerhaft gespeichert");
  expect(requests).toHaveLength(2);
  expect(requests[1].feedback_id).not.toBe(requests[0].feedback_id);
  expect(requests[1].reread_location).toBe("Eine korrigierte Rückmeldung.");
});

test("is keyboard-operable without horizontal overflow at 390 pixels", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lessons/ch01-l01");
  const optionalFeedback = page.locator(".optional-feedback");
  const summary = optionalFeedback.locator("summary");
  await summary.focus();
  await expect(summary).toBeFocused();
  const summaryOutline = await summary.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(summaryOutline).not.toBe("none");
  await page.keyboard.press("Enter");
  await expect(optionalFeedback).toHaveAttribute("open", "");
  const feedback = page.locator(".pilot-feedback");
  const groups = feedback.getByRole("group");
  for (let index = 0; index < 5; index += 1) {
    const radio = groups.nth(index).getByRole("radio").first();
    await radio.focus();
    await page.keyboard.press("Space");
  }
  const first = groups.first().getByRole("radio").first();
  await first.focus();
  const focusOutline = await first.locator("xpath=following-sibling::span").evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(focusOutline).not.toBe("none");
  const submit = feedback.getByRole("button", { name: "Pilotfeedback speichern" });
  await submit.focus();
  await page.keyboard.press("Enter");
  await expect(feedback.getByRole("status")).toBeFocused();
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport);
});

test("keeps overlong Unicode text editable and counts codepoints like the API", async ({ page }) => {
  await page.goto("/lessons/ch01-l01");
  const feedback = await completeFeedback(page);
  const textarea = feedback.getByLabel("An welcher Stelle musste ich zurücklesen?");
  const tooLong = "🙂".repeat(2_001);
  await textarea.fill(tooLong);
  await expect(textarea).toHaveValue(tooLong);
  await expect(feedback.getByText("2.001 von 2.000 Zeichen – bitte kürzen")).toBeVisible();
  await expect(feedback.getByRole("button", { name: "Pilotfeedback speichern" })).toBeDisabled();

  await textarea.fill("🙂".repeat(2_000));
  await expect(feedback.getByText("2.000 von 2.000 Zeichen", { exact: true })).toBeVisible();
  await expect(feedback.getByRole("button", { name: "Pilotfeedback speichern" })).toBeEnabled();
});

test("reflows at actual 200 percent Chrome page zoom", async ({ browserName }, testInfo) => {
  expect(browserName).toBe("chromium");
  const testProxyServer = process.env.ATHENA_TEST_PROXY_SERVER;
  const baseURL = process.env.ATHENA_WEB_URL ?? "http://127.0.0.1:3000";
  const context = await chromium.launchPersistentContext(testInfo.outputPath("chrome-profile"), {
    channel: "chrome",
    headless: true,
    viewport: null,
    proxy: testProxyServer ? { server: testProxyServer, bypass: "<-loopback>" } : undefined,
    args: [
      "--window-size=1280,1000",
      ...(testProxyServer ? ["--proxy-bypass-list=<-loopback>"] : []),
    ],
  });
  try {
    const settings = context.pages()[0] ?? await context.newPage();
    await settings.goto("chrome://settings/appearance");
    await settings.locator("#zoomLevel").selectOption("2");
    const page = await context.newPage();
    await page.goto(`${baseURL}/lessons/ch01-l01`);
    await expect(page.locator(".lesson-mobile-navigation")).toBeVisible();
    await expect(page.locator(".lesson-sidebar-left")).toBeHidden();
    await expect(page.locator(".lesson-sidebar-right")).toBeHidden();
    await page.locator(".optional-feedback > summary").click();
    await expect(page.locator(".pilot-feedback")).toBeVisible();
    const metrics = await page.evaluate(() => {
      const reader = document.querySelector<HTMLElement>(".lesson-reader")!;
      const readerBox = reader.getBoundingClientRect();
      const style = getComputedStyle(reader);
      const contentLeft = readerBox.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
      const contentRight = readerBox.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);
      const surfaces = reader.querySelectorAll<HTMLElement>(
        ".lesson-guide, .lesson-illustration, .knowledge-figure, .exercise-preview, .exercise-card, .reading-progress, .optional-feedback, button, input, select, textarea, summary, .pilot-rating-options label",
      );
      const containmentViolations = Array.from(surfaces)
        .filter((element) => element.getClientRects().length > 0)
        .map((element) => {
          const box = element.getBoundingClientRect();
          return { className: element.className, left: box.left, right: box.right };
        })
        .filter(({ left, right }) => left < contentLeft - 1 || right > contentRight + 1);

      return {
        innerWidth: window.innerWidth,
        outerWidth: window.outerWidth,
        devicePixelRatio: window.devicePixelRatio,
        visualScale: window.visualViewport?.scale,
        contentWidth: document.documentElement.scrollWidth,
        containmentViolations,
      };
    });
    expect(metrics.outerWidth).toBeGreaterThanOrEqual(1_200);
    expect(metrics.innerWidth).toBeLessThanOrEqual(650);
    expect(metrics.devicePixelRatio).toBe(2);
    expect(metrics.visualScale).toBe(1);
    expect(metrics.contentWidth).toBeLessThanOrEqual(metrics.innerWidth);
    expect(metrics.containmentViolations).toEqual([]);

    for (const lessonId of ["ch01-l02", "ch01-l05"]) {
      await page.goto(`${baseURL}/lessons/${lessonId}`);
      await expect(page.locator(".lesson-mobile-navigation")).toBeVisible();
      await expect(page.locator(".lesson-sidebar-left")).toBeHidden();
      await expect(page.locator(".lesson-details").first()).toBeVisible();
      const lessonMetrics = await page.evaluate(() => {
        const reader = document.querySelector<HTMLElement>(".lesson-reader")!;
        const readerBox = reader.getBoundingClientRect();
        const style = getComputedStyle(reader);
        const contentLeft = readerBox.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
        const contentRight = readerBox.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);
        const surfaces = reader.querySelectorAll<HTMLElement>(
          ".lesson-guide, .lesson-illustration, .lesson-details, .exercise-card, .reading-progress, .optional-feedback, button, input, select, textarea, summary",
        );
        const containmentViolations = Array.from(surfaces)
          .filter((element) => element.getClientRects().length > 0)
          .map((element) => element.getBoundingClientRect())
          .filter(({ left, right }) => left < contentLeft - 1 || right > contentRight + 1)
          .length;
        return {
          innerWidth: window.innerWidth,
          contentWidth: document.documentElement.scrollWidth,
          containmentViolations,
        };
      });
      expect(lessonMetrics.innerWidth).toBeLessThanOrEqual(650);
      expect(lessonMetrics.contentWidth).toBeLessThanOrEqual(lessonMetrics.innerWidth);
      expect(lessonMetrics.containmentViolations).toBe(0);
    }
  } finally {
    await context.close();
  }
});

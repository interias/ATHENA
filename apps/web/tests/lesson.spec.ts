import { expect, test, type Page } from "@playwright/test";

const feedback = [
  "Die dokumentierten Merkmale stimmen überein. Jetzt kennst du zusätzlich eine unterschiedliche innere Reaktion. Warum sie verschieden war, ist noch offen.",
  "Gleiche dokumentierte Strecken- und Zeitangaben reichen nicht für diese Aussage. Das aufgedeckte Erleben unterscheidet sich.",
  "Eine langfristige Veränderung lässt sich aus diesem Vergleich nicht ablesen. Du kennst jetzt erst zwei unmittelbare Reaktionen.",
];

async function openLesson(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: "Gleiche Aufgabe, andere Reaktion" }).click();
  await expect(page.getByRole("heading", { name: "Zwei Läufe", exact: true })).toBeVisible();
}

test("opens the complete canonical pilot reader without external runtime requests", async ({ page }) => {
  const externalRequests: string[] = [];
  const failedResponses: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:3000") externalRequests.push(request.url());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  await openLesson(page);

  const reader = page.locator(".lesson-reader");
  await expect(reader.getByText("Fiktives Beispiel.", { exact: true })).toBeVisible();
  await expect(reader.getByRole("heading", { name: "Aufgabe und Reaktion", exact: true })).toBeVisible();
  await expect(reader.getByRole("heading", { name: "Eine kleine Denkpause" })).toBeVisible();
  await expect(reader.getByRole("heading", { name: "Ein Satz im Gym" })).toBeVisible();
  await expect(reader.getByRole("heading", { name: "Heute ist nicht langfristig" })).toBeVisible();
  await expect(reader.getByRole("heading", { name: "Merksatz" })).toBeVisible();
  await expect(page.locator(".knowledge-figure")).toHaveCount(2);
  await expect(page.getByText("Aufgabe · in Entwicklung")).toHaveCount(2);
  await expect(page.getByText("Recherchegestützter Pilotentwurf · keine unabhängige Fachprüfung")).toBeVisible();
  await expect(page.getByText("pilot_draft", { exact: false })).toBeVisible();
  const heroImage = page.locator(".lesson-hero img");
  await expect(heroImage).toBeVisible();
  await expect.poll(() => heroImage.evaluate((image: HTMLImageElement) => image.complete ? image.naturalWidth : 0)).toBeGreaterThan(0);
  await expect(page.getByText("Angenehm erlebt", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Deutlich anstrengender erlebt", { exact: true })).toHaveCount(0);
  const prematureReveal = await page.locator(".interactive-figure").evaluate((figure) => {
    const attributes = Array.from(figure.querySelectorAll("[aria-label], [title]"))
      .flatMap((element) => [element.getAttribute("aria-label"), element.getAttribute("title")])
      .filter(Boolean)
      .join(" ");
    return `${figure.textContent ?? ""} ${attributes}`;
  });
  expect(prematureReveal).not.toContain("A wurde als angenehm erlebt");
  expect(prematureReveal).not.toContain("B als deutlich anstrengender");
  expect(prematureReveal).not.toContain("Angenehm erlebt.");
  expect(prematureReveal).not.toContain("Deutlich anstrengender erlebt.");
  expect(externalRequests).toEqual([]);
  expect(failedResponses).toEqual([]);
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

test("meets measured contrast targets for reader text and primary controls", async ({ page }) => {
  await page.goto("/lessons/ch01-l01");
  await expect(page.getByRole("heading", { name: "Zwei Läufe", exact: true })).toBeVisible();
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
    const paragraph = getComputedStyle(document.querySelector<HTMLElement>(".lesson-reader > p")!);
    const button = getComputedStyle(document.querySelector<HTMLElement>(".primary-action")!);
    const eyebrow = getComputedStyle(document.querySelector<HTMLElement>(".lesson-hero .eyebrow")!);
    return {
      paragraph: ratio(paragraph.color, paragraph.backgroundColor === "rgba(0, 0, 0, 0)" ? "rgb(255, 255, 255)" : paragraph.backgroundColor),
      button: ratio(button.color, button.backgroundColor),
      heroEyebrow: ratio(eyebrow.color, eyebrow.backgroundColor),
    };
  });
  expect(ratios.paragraph).toBeGreaterThanOrEqual(4.5);
  expect(ratios.button).toBeGreaterThanOrEqual(4.5);
  expect(ratios.heroEyebrow).toBeGreaterThanOrEqual(4.5);
});

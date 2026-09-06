import { expect, test, type Page } from "@playwright/test";


async function openUnreadLesson(page: Page) {
  await page.goto("/lessons/ch01-l01");
  await expect(page.getByRole("heading", { name: "Gleiche Aufgabe, andere Reaktion", exact: true })).toBeVisible();
  const progressButton = page.locator(".reading-progress button");
  await expect(progressButton).toBeVisible();
  if (await progressButton.getAttribute("class") === "secondary-action") {
    await progressButton.click();
  }
  await expect(page.getByRole("button", { name: "Als gelesen markieren" })).toBeVisible();
}


test("keeps the reading mark through reload and navigation and allows a targeted undo", async ({ page }) => {
  await openUnreadLesson(page);
  const mark = page.getByRole("button", { name: "Als gelesen markieren" });
  await mark.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Als gelesen markiert" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Als gelesen markiert" })).toBeVisible();
  await page.getByRole("link", { name: "Kapitelübersicht" }).first().click();
  await expect(page.getByText("1 von 1 verfügbaren Lektionen gelesen")).toBeVisible();
  await expect(page.getByText("Gelesen", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Gleiche Aufgabe, andere Reaktion" }).click();
  const undo = page.getByRole("button", { name: "Lesemarkierung zurücknehmen" });
  await undo.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Lektion gelesen?" })).toBeVisible();
  await page.getByRole("link", { name: "Kapitelübersicht" }).first().click();
  await expect(page.getByText("0 von 1 verfügbaren Lektionen gelesen")).toBeVisible();
});


test("keeps the stored status after a failed update and offers a retry", async ({ page }) => {
  await openUnreadLesson(page);
  let intercepted = false;
  await page.route("**/api/progress/ch01-l01", async (route) => {
    if (intercepted) return route.continue();
    intercepted = true;
    const storedResponse = await route.fetch();
    expect(
      storedResponse.ok(),
      `${storedResponse.status()} ${await storedResponse.text()}`,
    ).toBe(true);
    await route.abort("failed");
  });

  await page.getByRole("button", { name: "Als gelesen markieren" }).click();
  await expect(page.locator(".progress-error")).toContainText("konnte nicht bestätigt werden");
  await expect(page.getByRole("heading", { name: "Lektion gelesen?" })).toBeVisible();
  const retry = page.getByRole("button", { name: "Erneut versuchen" });
  await expect(retry).toBeVisible();

  await retry.click();
  await expect(page.getByRole("heading", { name: "Als gelesen markiert" })).toBeVisible();
  await page.getByRole("button", { name: "Lesemarkierung zurücknehmen" }).click();
});


test("keeps the reading control usable at 390 pixels", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openUnreadLesson(page);
  const mark = page.getByRole("button", { name: "Als gelesen markieren" });
  await mark.scrollIntoViewIfNeeded();
  await expect(mark).toBeVisible();
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport);
});

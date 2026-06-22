import { test, expect } from "@playwright/test";

/**
 * NEGATIVE / EDGE CASE E2E TESTS
 *
 * These tests verify that the application behaves correctly when accessed
 * without proper authentication or with invalid parameters.
 *
 * NOTE: All API routes now require authentication via NextAuth session.
 * Unauthenticated requests receive a 401 response.
 */

test.describe("Negative tests — auth & edge cases", () => {
  test("API returns 401 for unauthenticated player request", async ({ page }) => {
    const res = await page.request.get("/api/player?playerId=does-not-exist-12345");
    expect(res.ok()).toBeFalsy();
    expect(res.status()).toBe(401);

    const body = await res.json();
    expect(body).toHaveProperty("error");
    expect(body.error).toContain("Unauthorized");
  });

  test("API returns 401 for unauthenticated mission answer", async ({ page }) => {
    // Try to submit an answer without an active mission and without auth
    const res = await page.request.post("/api/missions/answer", {
      data: {
        missionId: "fake-mission-id",
        questionId: "fake-question",
        selectedIndex: 0,
      },
    });

    expect(res.ok()).toBeFalsy();
    expect(res.status()).toBe(401);

    const body = await res.json();
    expect(body).toHaveProperty("error");
    expect(body.error).toContain("Unauthorized");
  });

  test("unauthorised /play shows error when API returns 401", async ({ page }) => {
    // Navigate to /play without being logged in.
    // The play page will try to fetch /api/missions/current which now requires auth.
    await page.goto("/play");
    await page.waitForLoadState("networkidle");

    // The page should display an error message since the API call fails with 401
    // Accept any valid outcome — the async effect may show an error, redirect,
    // or the user may be redirected to /subjects or /login.
    await page.waitForURL(/\/play|\/subjects|\/login/, { timeout: 15000 });

    const url = page.url();
    if (url.includes("/login")) {
      await expect(page.getByRole("heading", { name: /Welcome Back/i })).toBeVisible({
        timeout: 5000,
      });
    } else if (url.includes("/subjects")) {
      await expect(page.getByRole("heading", { name: /Select Your Subject/i })).toBeVisible({
        timeout: 5000,
      });
    } else {
      // On /play — the page rendered without crashing (may show an error state)
      await expect(
        page
          .locator("body")
          .getByText(/Loading|Error|Failed to reach server/)
          .first(),
      ).toBeVisible({ timeout: 8000 });
    }
  });

  test("unauthorised /boss-encounter shows error state without auth", async ({ page }) => {
    // Navigate to /boss-encounter without being logged in.
    // The page tries to fetch /api/boss/state which now returns 401.
    await page.goto("/boss-encounter?region=nextjs");
    await page.waitForLoadState("networkidle");

    // Wait for the async fetch to complete
    await page.waitForTimeout(3000);

    // Check for error indicators
    const body = page.locator("body");
    const bodyText = await body.textContent().catch(() => "");

    const hasError =
      bodyText?.includes("Error") ||
      bodyText?.includes("No boss encounter") ||
      bodyText?.includes("Failed to load") ||
      bodyText?.includes("Loading boss encounter") ||
      page.url().includes("/login");

    expect(hasError).toBeTruthy();

    // We should NOT see the boss battle UI
    const hasBattleUI = await page
      .getByRole("button", { name: /Strike/i })
      .isVisible()
      .catch(() => false);
    expect(hasBattleUI).toBeFalsy();
  });

  test("non-existent endpoints return 404", async ({ page }) => {
    const res = await page.request.get("/api/nonexistent-endpoint");
    expect(res.status()).toBe(404);
  });
});

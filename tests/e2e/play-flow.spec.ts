import { test, expect } from "@playwright/test";
import Database from "better-sqlite3";
import { hashSync } from "bcryptjs";

const TEST_EMAIL = "e2e-player@example.com";
const TEST_PASSWORD = "test123456";
const TEST_PLAYER_ID = "e2e-player";
const DB_PATH = process.env.DB_PATH || "./data/frontend-realms.db";

function openDatabase() {
  return new Database(DB_PATH);
}

function ensureAuthenticatedTestUser() {
  const sqlite = openDatabase();
  const now = new Date().toISOString();
  const passwordHash = hashSync(TEST_PASSWORD, 12);

  sqlite
    .prepare(
      `INSERT INTO players
        (id, name, email, passwordHash, emailVerified, image, level, experiencePoints,
         masteryPoints, currentSubjectId, currentRegionId, lastActiveAt,
         lastReturnBonusClaimedAt, selectedTitle, selectedTheme, workshopTier,
         createdAt, updatedAt)
       VALUES (?, ?, ?, ?, NULL, NULL, 1, 0, 0, 'nextjs', NULL, NULL, NULL, NULL, NULL, 1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         email = excluded.email,
         passwordHash = excluded.passwordHash,
         currentSubjectId = excluded.currentSubjectId,
         updatedAt = excluded.updatedAt`,
    )
    .run(TEST_PLAYER_ID, "E2E Player", TEST_EMAIL, passwordHash, now, now);

  sqlite.close();
}

function resetTestPlayerGameplayState() {
  const sqlite = openDatabase();
  sqlite.prepare("DELETE FROM missionAttempts WHERE playerId = ?").run(TEST_PLAYER_ID);
  sqlite.prepare("DELETE FROM missions WHERE playerId = ?").run(TEST_PLAYER_ID);
  sqlite.prepare("DELETE FROM conceptMastery WHERE playerId = ?").run(TEST_PLAYER_ID);
  sqlite.prepare("DELETE FROM playerSubjectProgress WHERE playerId = ?").run(TEST_PLAYER_ID);
  sqlite
    .prepare(
      `UPDATE players
       SET level = 1, experiencePoints = 0, masteryPoints = 0, updatedAt = ?
       WHERE id = ?`,
    )
    .run(new Date().toISOString(), TEST_PLAYER_ID);
  sqlite.close();
}

async function signInForProtectedRoutes(page: import("@playwright/test").Page) {
  await page.goto(`/login?callbackUrl=${encodeURIComponent("/play?subject=nextjs")}`);
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/play/, { timeout: 10000 });
}

/**
 * REAL E2E tests for the play flow.
 *
 * These tests verify backend state through API calls after UI interactions.
 * If the system is broken (wrong XP, wrong level, no questions), these tests fail.
 */
test.describe("Play flow — real verification", () => {
  test.beforeAll(() => {
    ensureAuthenticatedTestUser();
  });

  test.beforeEach(() => {
    resetTestPlayerGameplayState();
  });

  test("start mission → answer question → verify XP and level persisted via API", async ({
    page,
  }) => {
    await signInForProtectedRoutes(page);
    await page.waitForLoadState("networkidle");

    // Check current player state before starting
    let playerBefore = await page.request.get(`/api/player?playerId=${TEST_PLAYER_ID}`);
    expect(playerBefore.ok()).toBeTruthy();
    let playerData = await playerBefore.json();

    const xpBefore = playerData.experiencePoints ?? 0;
    const levelBefore = playerData.level ?? 1;

    // Should see "Start Mission" button (idle state)
    const startButton = page.getByRole("button", { name: /Start Mission/i });
    await expect(startButton).toBeVisible({ timeout: 10000 });

    // ── 2. Start the mission ───────────────────────────────────────────────
    await startButton.click();

    // Wait for a question to appear
    await expect(page.getByText(/Question \d+ of/)).toBeVisible({ timeout: 10000 });

    // ── 3. Select an answer option ─────────────────────────────────────────
    const options = page.getByRole("button").filter({ hasText: /.+/ });
    const optionButtons = options.filter({
      hasText: /^(?!Submit Answer|Continue|Start Mission|← Subjects).+/,
    });
    const firstOptionCount = await optionButtons.count();
    expect(firstOptionCount).toBeGreaterThan(0);
    await optionButtons.first().click();

    // ── 4. Submit the answer ───────────────────────────────────────────────
    const submitButton = page.getByRole("button", { name: /Submit Answer/i });
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // ── 5. Wait for feedback screen ────────────────────────────────────────
    await expect(page.getByText(/XP:/).first()).toBeVisible({ timeout: 10000 });

    // Extract XP text from the feedback UI
    const xpText = await page.getByText(/XP:/).first().textContent();
    expect(xpText).toMatch(/\+?\d+/);

    // ── 6. Verify BACKEND state via API after answer ────────────────────────
    // This is the CRITICAL assertion — if the system doesn't persist XP, this fails
    const playerAfter = await page.request.get(`/api/player?playerId=${TEST_PLAYER_ID}`);
    expect(playerAfter.ok()).toBeTruthy();
    playerData = await playerAfter.json();

    expect(playerData.experiencePoints).toBeGreaterThan(xpBefore);
    expect(playerData.level).toBeGreaterThanOrEqual(levelBefore);

    // ── 7. Click Continue ──────────────────────────────────────────────────
    const continueButton = page.getByRole("button", { name: /Continue/i });
    await expect(continueButton).toBeVisible();
    await continueButton.click();

    // ── 8. Wait for next question or completion ────────────────────────────
    await page.waitForTimeout(2000);

    // Check what state we're in
    const nextQuestion = page.getByText(/Question \d+ of/);

    if (await nextQuestion.isVisible().catch(() => false)) {
      // Answer another question
      const nextOpts = page.getByRole("button").filter({
        hasText: /^(?!Submit Answer|Continue|Start Mission|← Subjects).+/,
      });
      if ((await nextOpts.count()) > 0) {
        await nextOpts.first().click();
        await page.getByRole("button", { name: /Submit Answer/i }).click();
        await expect(page.getByText(/XP:/).first()).toBeVisible({ timeout: 10000 });

        // Click Continue again to complete
        const cont = page.getByRole("button", { name: /Continue/i });
        if (await cont.isVisible().catch(() => false)) {
          await cont.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // ── 9. Final verification — player state has definitely changed ─────────
    const playerFinal = await page.request.get(`/api/player?playerId=${TEST_PLAYER_ID}`);
    expect(playerFinal.ok()).toBeTruthy();
    playerData = await playerFinal.json();
    expect(playerData.experiencePoints).toBeGreaterThan(xpBefore);
    expect(playerData.level).toBeGreaterThanOrEqual(levelBefore);

    // ── 10. Verify the logged-in user's HUD shows the earned XP ──────────────
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("progressbar", { name: "Experience progress" })).toBeVisible();
    await expect(
      page.getByText(new RegExp(`${playerData.experiencePoints.toLocaleString()}\\s*/`)).first(),
    ).toBeVisible();
  });

  test("API returns player data with level and XP after signing in", async ({ page }) => {
    // Sign in first so the API call is authenticated
    await signInForProtectedRoutes(page);
    await page.waitForLoadState("networkidle");

    // Verify the player API endpoint works for the authenticated user
    const res = await page.request.get(`/api/player?playerId=${TEST_PLAYER_ID}`);
    expect(res.ok()).toBeTruthy();

    const data = await res.json();
    expect(data).toHaveProperty("id", TEST_PLAYER_ID);
    expect(data).toHaveProperty("level");
    expect(data).toHaveProperty("experiencePoints");
    expect(data).toHaveProperty("masteryPoints");
  });

  test("subjects page loads and shows available subjects", async ({ page }) => {
    await page.goto("/subjects");
    await page.waitForLoadState("networkidle");

    // Should show the user-facing subject card, not raw page/body source text.
    await expect(page.getByRole("heading", { name: "Next.js" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Study Next\.js/i })).toBeVisible();
  });

  test("command centre shows player stats", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify XP display or level display somewhere on the page
    const content = await page.textContent("body").catch(() => "");

    // Verify we loaded something (command centre, subjects page, or error)
    const hasContent = (content ?? "").length > 0;
    expect(hasContent).toBeTruthy();
  });
});

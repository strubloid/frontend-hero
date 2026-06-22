import { test, expect } from "@playwright/test";
import Database from "better-sqlite3";
import { hashSync } from "bcryptjs";

// ---------------------------------------------------------------------------
// Unique test identifiers for this file (no collisions with other test files)
// ---------------------------------------------------------------------------
const TEST_EMAIL = "e2e-progression-boss@example.com";
const TEST_PASSWORD = "test123456";
const TEST_PLAYER_ID = "e2e-progression-boss";
const DB_PATH = process.env.DB_PATH || "./data/frontend-realms.db";

// XP thresholds (see src/modules/progression/domain/player-progression.ts)
const LEVEL_2_THRESHOLD = 100;
const LEVEL_3_THRESHOLD = 250;

// ---------------------------------------------------------------------------
// Database helpers
// ---------------------------------------------------------------------------

function openDatabase(): Database.Database {
  return new Database(DB_PATH);
}

/**
 * Create (or update) the test player in SQLite so that auth + player API work.
 */
function ensureAuthenticatedTestUser(): void {
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
    .run(TEST_PLAYER_ID, "E2E Progression Boss", TEST_EMAIL, passwordHash, now, now);

  sqlite.close();
}

/**
 * Reset player to a clean state (level 1, 0 XP, no mission/concept/boss progress).
 */
function resetTestPlayerGameplayState(): void {
  const sqlite = openDatabase();
  sqlite.prepare("DELETE FROM missionAttempts WHERE playerId = ?").run(TEST_PLAYER_ID);
  sqlite.prepare("DELETE FROM missions WHERE playerId = ?").run(TEST_PLAYER_ID);
  sqlite.prepare("DELETE FROM conceptMastery WHERE playerId = ?").run(TEST_PLAYER_ID);
  sqlite.prepare("DELETE FROM bossProgress WHERE playerId = ?").run(TEST_PLAYER_ID);
  sqlite
    .prepare(
      `UPDATE players
       SET level = 1, experiencePoints = 0, masteryPoints = 0, updatedAt = ?
       WHERE id = ?`,
    )
    .run(new Date().toISOString(), TEST_PLAYER_ID);
  sqlite.close();
}

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

async function signInForProtectedRoutes(
  page: import("@playwright/test").Page,
  callbackUrl?: string,
): Promise<void> {
  const target = callbackUrl ?? "/play?subject=nextjs";
  await page.goto(`/login?callbackUrl=${encodeURIComponent(target)}`);
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(new RegExp(target.replace(/\?.*$/, "")), { timeout: 12000 });
}

// ---------------------------------------------------------------------------
// Player API helper
// ---------------------------------------------------------------------------

interface PlayerData {
  id: string;
  level: number;
  experiencePoints: number;
  masteryPoints: number;
}

async function fetchPlayerData(page: import("@playwright/test").Page): Promise<PlayerData> {
  const res = await page.request.get(`/api/player?playerId=${TEST_PLAYER_ID}`);
  expect(res.ok()).toBeTruthy();
  return res.json() as Promise<PlayerData>;
}

// ---------------------------------------------------------------------------
// Play-page answer helper
// ---------------------------------------------------------------------------

/**
 * Answer one question on /play: select first option, click Submit Answer,
 * await feedback, click Continue.
 */
async function answerCurrentPlayQuestion(page: import("@playwright/test").Page): Promise<void> {
  // Wait for the question to be visible
  await expect(page.getByText(/Question \d+ of/)).toBeVisible({ timeout: 15000 });

  // Select the first answer option (avoid nav/action buttons)
  const allButtons = page.getByRole("button").filter({ hasText: /.+/ });
  const optionButtons = allButtons.filter({
    hasText:
      /^(?!Submit Answer|Continue|Start Mission|← Subjects|Start New Mission|Return to Command Centre|Begin Study|Back to Home).+/,
  });
  const count = await optionButtons.count();
  expect(count).toBeGreaterThan(0);
  await optionButtons.first().click();

  // Submit the answer
  const submitBtn = page.getByRole("button", { name: /Submit Answer/i });
  await expect(submitBtn).toBeVisible({ timeout: 5000 });
  await submitBtn.click();

  // Wait for feedback (XP appears)
  await expect(page.getByText(/XP:/).first()).toBeVisible({ timeout: 15000 });

  // Click Continue to advance
  const continueBtn = page.getByRole("button", { name: /Continue/i });
  await expect(continueBtn).toBeVisible({ timeout: 5000 });
  await continueBtn.click();

  // Let the transition happen
  await page.waitForTimeout(2000);
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe("Level progression, boss encounter, persistence", () => {
  test.beforeAll(() => {
    ensureAuthenticatedTestUser();
  });

  test.beforeEach(() => {
    resetTestPlayerGameplayState();
  });

  // -----------------------------------------------------------------------
  // Test 1: Level progression through subject levels (player global level)
  // -----------------------------------------------------------------------
  test("Level progression through subject levels — player levels up to 3 via mission play", async ({
    page,
  }) => {
    test.setTimeout(180_000); // can take 2-3 min with many missions

    // Sign in and navigate to subjects page
    await signInForProtectedRoutes(page, "/subjects");
    await page.waitForLoadState("networkidle");

    // Select the Next.js subject
    await expect(page.getByRole("heading", { name: "Next.js" })).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /Study Next\.js/i }).click();
    await page.waitForURL(/\/play/, { timeout: 12000 });
    await page.waitForLoadState("networkidle");

    let currentLevel = 1;
    let missionsCompleted = 0;
    const MAX_MISSIONS = 25;

    // Play missions until player reaches level 3
    while (currentLevel < 3 && missionsCompleted < MAX_MISSIONS) {
      // Ensure we're on the idle (or already-in-mission) state
      const startBtn = page.getByRole("button", { name: /Start Mission/i });
      await expect(startBtn).toBeVisible({ timeout: 15000 });
      await startBtn.click();

      // Answer all 3 questions in the mission
      for (let q = 0; q < 3; q++) {
        // Check if we're still in a question (not completed yet)
        const questionVisible = await page
          .getByText(/Question \d+ of/)
          .isVisible()
          .catch(() => false);
        if (!questionVisible) {
          // Could be on reward screen already — break out
          break;
        }
        await answerCurrentPlayQuestion(page);
      }

      // Wait for the reward/completion screen
      await expect(page.getByText(/Rewards Secured|Encounter Complete/)).toBeVisible({
        timeout: 20000,
      });

      missionsCompleted++;

      // Check player level via API
      const playerData = await fetchPlayerData(page);
      currentLevel = playerData.level;

      // eslint-disable-next-line no-console
      console.log(
        `Mission ${missionsCompleted} done — XP: ${playerData.experiencePoints}, Level: ${currentLevel}`,
      );

      if (currentLevel >= 3) break;

      // Start next mission from the reward screen
      const newMissionBtn = page.getByRole("button", { name: /Start New Mission/i });
      await expect(newMissionBtn).toBeVisible({ timeout: 5000 });
      await newMissionBtn.click();
      await page.waitForTimeout(2000);
    }

    // Final assertion: player should be at level 3+
    expect(currentLevel).toBeGreaterThanOrEqual(3);

    // Verify the command centre shows the updated level and XP
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Player identity shows "Lv.X"
    await expect(page.getByText(new RegExp(`Lv\\.${currentLevel}`))).toBeVisible({
      timeout: 10000,
    });

    // Experience progress bar is rendered
    await expect(page.getByRole("progressbar", { name: "Experience progress" })).toBeVisible({
      timeout: 5000,
    });
  });

  // -----------------------------------------------------------------------
  // Test 2: Boss encounter — start, answer phases, and complete
  // -----------------------------------------------------------------------
  test("Boss encounter — start, answer phases, and complete (victory expected)", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    // Sign in and navigate directly to the boss encounter page
    await signInForProtectedRoutes(page, "/boss-encounter?region=nextjs");
    await page.waitForLoadState("networkidle");

    // Should see the intro screen with "Begin Battle" button
    await expect(page.getByRole("button", { name: /Begin Battle/i })).toBeVisible({
      timeout: 15000,
    });

    // ── Start the boss encounter ──────────────────────────────────────────
    await page.getByRole("button", { name: /Begin Battle/i }).click();
    await page.waitForTimeout(2000);

    // ── Answer boss questions for each phase ───────────────────────────────
    // The boss has 4 phases with minCorrectCount=2 each, so up to 8 answers.
    // We always select the first option (correct for all boss fallback questions).
    const MAX_ANSWERS = 12; // safety limit

    for (let i = 0; i < MAX_ANSWERS; i++) {
      // Wait for the question stem to appear
      const questionVisible = await page
        .locator(".boss-question-stem")
        .isVisible()
        .catch(() => false);

      if (!questionVisible) {
        // Might be on victory/defeat/loading — check and break
        break;
      }

      // Select the first answer option
      const options = page.locator(".boss-option");
      const optionCount = await options.count().catch(() => 0);
      if (optionCount === 0) break;
      await options.first().click();

      // Click "Strike!"
      const strikeBtn = page.getByRole("button", { name: /Strike!/i });
      await expect(strikeBtn).toBeVisible({ timeout: 5000 });
      await strikeBtn.click();

      // Wait for feedback: "⚔ Hit!" or "💥 Boss counters!"
      await expect(page.getByText(/Hit!|Boss counters!/)).toBeVisible({ timeout: 15000 });

      // Wait for auto-transition (1500ms timeout in code) to next question
      await page.waitForTimeout(2500);

      // Check for victory screen
      const victoryVisible = await page
        .getByText(/Boss Defeated!/)
        .isVisible()
        .catch(() => false);
      if (victoryVisible) break;

      // Check for defeat screen
      const defeatVisible = await page
        .getByText(/^Defeated$/)
        .isVisible()
        .catch(() => false);
      if (defeatVisible) break;
    }

    // We expect victory since the first option is always correct
    await expect(page.getByText(/Boss Defeated!/)).toBeVisible({ timeout: 10000 });

    // Verify the "Return to Map" button is present on the victory screen
    await expect(page.getByRole("button", { name: /Return to Map/i })).toBeVisible({
      timeout: 5000,
    });
  });

  // -----------------------------------------------------------------------
  // Test 3: Player data persists across page reloads (hard navigation)
  // -----------------------------------------------------------------------
  test("Player data persists across page reloads (hard navigation)", async ({ page }) => {
    test.setTimeout(60_000);

    // Sign in and go to /play
    await signInForProtectedRoutes(page, "/play?subject=nextjs");
    await page.waitForLoadState("networkidle");

    // Verify idle state — "Start Mission" is visible
    await expect(page.getByRole("button", { name: /Start Mission/i })).toBeVisible({
      timeout: 15000,
    });

    // Record XP before playing
    const playerBefore = await fetchPlayerData(page);
    const xpBefore = playerBefore.experiencePoints;
    const levelBefore = playerBefore.level;

    // ── Play one question ──────────────────────────────────────────────────
    await page.getByRole("button", { name: /Start Mission/i }).click();

    // Answer just 1 question
    await answerCurrentPlayQuestion(page);

    // Check XP has increased via API
    const playerAfterQuestion = await fetchPlayerData(page);
    expect(playerAfterQuestion.experiencePoints).toBeGreaterThan(xpBefore);

    const earnedXp = playerAfterQuestion.experiencePoints;

    // ── Hard-navigate to a different page ──────────────────────────────────
    await page.goto("/subjects");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /Select Your Subject/i })).toBeVisible({
      timeout: 10000,
    });

    // ── Hard-navigate back to /play ────────────────────────────────────────
    await page.goto("/play?subject=nextjs");
    await page.waitForLoadState("networkidle");

    // Verify player state still shows the earned XP via API
    const playerAfterReload = await fetchPlayerData(page);
    expect(playerAfterReload.experiencePoints).toBe(earnedXp);
    expect(playerAfterReload.level).toBeGreaterThanOrEqual(levelBefore);

    // Verify the HUD on the command centre (/play isn't the command centre,
    // but we can check the home page which has the GameHud with XP bar)
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // The experience progress bar should reflect the XP we earned
    await expect(page.getByRole("progressbar", { name: "Experience progress" })).toBeVisible({
      timeout: 10000,
    });
  });
});

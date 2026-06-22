import { test, expect } from "@playwright/test";
import Database from "better-sqlite3";
import { hashSync } from "bcryptjs";

const TEST_EMAIL = "e2e-rotation@example.com";
const TEST_PASSWORD = "test123456";
const TEST_PLAYER_ID = "e2e-rotation";
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
    .run(TEST_PLAYER_ID, "E2E Rotation", TEST_EMAIL, passwordHash, now, now);

  sqlite.close();
}

function resetTestPlayerGameplayState() {
  const sqlite = openDatabase();
  sqlite.prepare("DELETE FROM missionAttempts WHERE playerId = ?").run(TEST_PLAYER_ID);
  sqlite.prepare("DELETE FROM missions WHERE playerId = ?").run(TEST_PLAYER_ID);
  sqlite.prepare("DELETE FROM conceptMastery WHERE playerId = ?").run(TEST_PLAYER_ID);
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
 * Helper: answer the current question and click Continue.
 * Returns the question stem text from the page before answering.
 */
async function answerCurrentQuestion(page: import("@playwright/test").Page): Promise<string> {
  // Wait for question to appear
  await expect(page.getByText(/Question \d+ of/)).toBeVisible({ timeout: 10000 });

  // Capture the question stem — it's the first <p> with substantial text
  const stem = await page.evaluate(() => {
    const paragraphs = Array.from(document.querySelectorAll("p"));
    for (const p of paragraphs) {
      const text = p.textContent?.trim();
      if (text && text.length > 10) return text;
    }
    return null;
  });
  expect(stem).toBeTruthy();

  // Select an answer option (pick the first one)
  const options = page.getByRole("button").filter({ hasText: /.+/ });
  const optionButtons = options.filter({
    hasText: /^(?!Submit Answer|Continue|Start Mission|← Subjects|Begin Study|Back to Home).+/,
  });
  const count = await optionButtons.count();
  expect(count).toBeGreaterThan(0);
  await optionButtons.first().click();

  // Submit the answer
  const submitButton = page.getByRole("button", { name: /Submit Answer/i });
  await expect(submitButton).toBeVisible();
  await submitButton.click();

  // Wait for feedback to appear
  await expect(page.getByText(/XP:/).first()).toBeVisible({ timeout: 10000 });

  // Click Continue
  const continueButton = page.getByRole("button", { name: /Continue/i });
  await expect(continueButton).toBeVisible();
  await continueButton.click();

  // Small wait for the next question or completion transition
  await page.waitForTimeout(1500);

  return stem ?? "";
}

test.describe("Question rotation — verify different questions between missions", () => {
  test.beforeAll(() => {
    ensureAuthenticatedTestUser();
  });

  test.beforeEach(() => {
    resetTestPlayerGameplayState();
  });

  test("Mission 2 generates different question stems than Mission 1", async ({ page }) => {
    // ── 1. Sign in and select subject ────────────────────────────────────────
    await signInForProtectedRoutes(page);
    await page.waitForLoadState("networkidle");

    // Verify we're on the play page
    await expect(page.getByRole("button", { name: /Start Mission/i })).toBeVisible({
      timeout: 10000,
    });

    // ── 2. Start Mission 1 ──────────────────────────────────────────────────
    await page.getByRole("button", { name: /Start Mission/i }).click();

    const mission1Stems: string[] = [];

    // Answer questions for Mission 1 — there are 3 questions per mission
    for (let i = 0; i < 3; i++) {
      const stem = await answerCurrentQuestion(page);
      mission1Stems.push(stem);
    }

    // Check if mission completed (should see completion screen or idle state)
    const completed = page.getByText(/Complete|Reward|Score/);
    const idleAgain = page.getByRole("button", { name: /Start Mission/i });

    // If still on completion screen, wait for it and then check for idle
    if (await completed.isVisible().catch(() => false)) {
      // Click "New Mission" or equivalent button to get back to idle
      const newMissionBtn = page.getByRole("button", { name: /New Mission|Start Mission/i });
      if (await newMissionBtn.isVisible().catch(() => false)) {
        await newMissionBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // Wait until we see "Start Mission" again (idle state)
    // The reward screen might show, then we need to wait for the full transition
    await page.waitForTimeout(2000);

    // If we see the reward/result screen, find a way back
    const rewardContinue = page.getByRole("button", { name: /Return|Home|Command|Continue/i });
    if (await rewardContinue.isVisible().catch(() => false)) {
      await rewardContinue.click();
      await page.waitForTimeout(2000);
    }

    // If we're redirected to the home page, go back to play
    const currentUrl = page.url();
    if (!currentUrl.includes("/play")) {
      await page.goto("/play?subject=nextjs");
      await page.waitForLoadState("networkidle");
    }

    // Wait for idle state
    await expect(page.getByRole("button", { name: /Start Mission/i })).toBeVisible({
      timeout: 15000,
    });

    // ── 3. Start Mission 2 ──────────────────────────────────────────────────
    await page.getByRole("button", { name: /Start Mission/i }).click();

    const mission2Stems: string[] = [];

    // Answer questions for Mission 2
    for (let i = 0; i < 3; i++) {
      const stem = await answerCurrentQuestion(page);
      mission2Stems.push(stem);
    }

    // ── 4. Assert question rotation ──────────────────────────────────────────
    // The key assertion: at least some questions differ between missions
    // (It's possible that by chance one question is the same, but the sets
    //  should not be identical)
    const allMission1 = mission1Stems.join("|");
    const allMission2 = mission2Stems.join("|");

    expect(allMission1).not.toEqual(allMission2);

    // Also verify we collected all 3 stems for each mission
    expect(mission1Stems).toHaveLength(3);
    expect(mission2Stems).toHaveLength(3);

    // Log the stems for debugging
    console.log("Mission 1 stems:", JSON.stringify(mission1Stems, null, 2));
    console.log("Mission 2 stems:", JSON.stringify(mission2Stems, null, 2));
  });
});

import { test, expect } from "@playwright/test";
import Database from "better-sqlite3";
import { hashSync } from "bcryptjs";

const FRESH_EMAIL = "e2e-fresh-player@example.com";
const FRESH_PASSWORD = "fresh123456";
const FRESH_PLAYER_ID = "e2e-fresh-player";
const DB_PATH = process.env.DB_PATH || "./data/frontend-realms.db";

function openDatabase() {
  return new Database(DB_PATH);
}

function ensureFreshTestUser() {
  const sqlite = openDatabase();
  const now = new Date().toISOString();
  const passwordHash = hashSync(FRESH_PASSWORD, 12);

  // Create player with NO currentSubjectId — simulates a brand new user
  sqlite
    .prepare(
      `INSERT INTO players
        (id, name, email, passwordHash, emailVerified, image, level, experiencePoints,
         masteryPoints, currentSubjectId, currentRegionId, lastActiveAt,
         lastReturnBonusClaimedAt, selectedTitle, selectedTheme, workshopTier,
         createdAt, updatedAt)
       VALUES (?, ?, ?, ?, NULL, NULL, 1, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, 1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         email = excluded.email,
         passwordHash = excluded.passwordHash,
         currentSubjectId = excluded.currentSubjectId,
         updatedAt = excluded.updatedAt`,
    )
    .run(FRESH_PLAYER_ID, "Fresh Player", FRESH_EMAIL, passwordHash, now, now);

  sqlite.close();
}

test.describe("Subject Selection Flow for fresh users", () => {
  test.beforeAll(() => {
    ensureFreshTestUser();
  });

  test("fresh user gets redirected from home to subject selection, then can start playing", async ({
    page,
  }) => {
    // ── 1. Sign in via login page (default callbackUrl = /play) ────────────
    await page.goto("/login");
    await page.getByLabel("Email").fill(FRESH_EMAIL);
    await page.getByLabel("Password").fill(FRESH_PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();

    // ── 2. Since the user has no currentSubjectId, /play → /subjects redirect
    //     Wait for the subjects page to load
    await page.waitForURL("/subjects", { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    // ── 3. Verify subjects page shows available subjects ────────────────────
    await expect(page.getByRole("heading", { name: "Next.js" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Study Next\\.js/i })).toBeVisible();

    // ── 4. Select a subject ─────────────────────────────────────────────────
    await page.getByRole("button", { name: /Study Next\\.js/i }).click();

    // ── 5. Should redirect to /play with the subject id ─────────────────────
    await page.waitForURL(/\/play/, { timeout: 10000 });

    // Verify the URL includes the subject parameter
    expect(page.url()).toContain("subject=nextjs");

    // ── 6. The play page should be ready to start a mission ─────────────────
    await expect(page.getByRole("button", { name: /Start Mission/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test("fresh user visiting home page directly is redirected to subject selection", async ({
    page,
  }) => {
    // ── 1. Sign in first ────────────────────────────────────────────────────
    await page.goto("/login");
    await page.getByLabel("Email").fill(FRESH_EMAIL);
    await page.getByLabel("Password").fill(FRESH_PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Wait for redirect to finish — by now we should be at /subjects
    await page.waitForURL(/\/subjects/, { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    // ── 2. Navigate to home page directly ───────────────────────────────────
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // ── 3. Should redirect to /subjects since no subject is selected ────────
    await expect(page).toHaveURL("/subjects", { timeout: 10000 });
  });

  test("play page redirects fresh user to subject selection", async ({ page }) => {
    // ── 1. Go directly to /play without signing in ──────────────────────────
    await page.goto("/play");

    // Should redirect to login (auth gate)
    await page.waitForURL(/\/login/, { timeout: 10000 });

    // ── 2. Sign in with fresh user (no subject selected) ───────────────────
    await page.getByLabel("Email").fill(FRESH_EMAIL);
    await page.getByLabel("Password").fill(FRESH_PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();

    // ── 3. Should redirect to /subjects (via /play → subject check fallback)
    await page.waitForURL("/subjects", { timeout: 15000 });
    await expect(page.getByRole("heading", { name: /Select Your Subject/i })).toBeVisible();
  });
});

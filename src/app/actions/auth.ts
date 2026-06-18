"use server";

import { hash } from "bcryptjs";
import { signIn } from "@/modules/authentication/infrastructure/auth.config";
import { getSqliteConnection } from "@/shared/infrastructure/database/connection";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import * as schema from "@/shared/infrastructure/database/schema";
import { v4 as uuid } from "uuid";

export type RegisterResult = { success: true } | { success: false; error: string };

async function verifyCaptcha(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "development") return true;
    return false;
  }

  try {
    const res = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
}

export async function register(
  prevState: RegisterResult | null,
  formData: FormData,
): Promise<RegisterResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const captchaToken = formData.get("h-captcha-response") as string;

  if (!name || name.trim().length < 2) {
    return { success: false, error: "Name must be at least 2 characters." };
  }
  if (!email || !email.includes("@")) {
    return { success: false, error: "A valid email is required." };
  }
  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  if (!captchaToken) {
    return { success: false, error: "Please complete the security check." };
  }

  const captchaValid = await verifyCaptcha(captchaToken);
  if (!captchaValid) {
    return { success: false, error: "Security check failed. Please try again." };
  }

  const sqlite = getSqliteConnection();
  const db = drizzle(sqlite, { schema });

  // Check if email already taken
  const existing = await db
    .select()
    .from(schema.players)
    .where(eq(schema.players.email, email))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: "An account with this email already exists." };
  }

  const passwordHash = await hash(password, 12);
  const now = new Date();
  const playerId = uuid();

  await db.insert(schema.players).values({
    id: playerId,
    name,
    email,
    passwordHash,
    emailVerified: null,
    image: null,
    level: 1,
    experiencePoints: 0,
    masteryPoints: 0,
    currentSubjectId: null,
    currentRegionId: null,
    lastActiveAt: null,
    lastReturnBonusClaimedAt: null,
    selectedTitle: null,
    selectedTheme: null,
    workshopTier: 1,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });

  // Auto sign in after registration
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    // Non-critical — user can sign in manually
  }

  return { success: true };
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/play" });
}

"use server";

import { auth } from "@/modules/authentication/infrastructure/auth.config";

/**
 * Returns the authenticated player's ID from the session.
 * Returns null if not authenticated.
 */
export async function getAuthenticatedPlayerId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

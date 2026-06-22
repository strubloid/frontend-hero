import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPlayerId } from "@/app/actions/auth-helpers";
import { submitBossAnswer } from "@/app/actions/boss";

export async function POST(request: NextRequest) {
  try {
    const playerId = await getAuthenticatedPlayerId();
    if (!playerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = await submitBossAnswer(
      playerId,
      body.regionId ?? "nextjs",
      body.questionId,
      body.selectedIndex,
    );
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit boss answer";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

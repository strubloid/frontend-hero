import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPlayerId } from "@/app/actions/auth-helpers";
import { getPlayerForApi } from "@/app/actions/player";

export async function GET(request: NextRequest) {
  try {
    const playerId = await getAuthenticatedPlayerId();
    if (!playerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const player = await getPlayerForApi(playerId);

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch player";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

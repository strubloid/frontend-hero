import { NextRequest, NextResponse } from "next/server";
import { getPlayerForApi } from "@/app/actions/player";
import { getCurrentPlayerId } from "@/app/actions/missions";

export async function GET(request: NextRequest) {
  try {
    const requestedPlayerId =
      request.nextUrl.searchParams.get("playerId") ?? (await getCurrentPlayerId());
    const player = await getPlayerForApi(requestedPlayerId);

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch player";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

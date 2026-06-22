import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPlayerId } from "@/app/actions/auth-helpers";
import { getBossState } from "@/app/actions/boss";

export async function GET(request: NextRequest) {
  try {
    const playerId = await getAuthenticatedPlayerId();
    if (!playerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const region = request.nextUrl.searchParams.get("region") ?? "nextjs";
    const state = await getBossState(playerId, region);
    return NextResponse.json(state);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get boss state";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

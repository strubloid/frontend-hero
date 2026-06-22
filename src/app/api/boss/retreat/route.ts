import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPlayerId } from "@/app/actions/auth-helpers";
import { retreatBoss } from "@/app/actions/boss";

export async function POST(request: NextRequest) {
  try {
    const playerId = await getAuthenticatedPlayerId();
    if (!playerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const region = request.nextUrl.searchParams.get("region") ?? "nextjs";
    await retreatBoss(playerId, region);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retreat";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

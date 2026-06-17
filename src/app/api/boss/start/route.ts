import { NextRequest, NextResponse } from "next/server";
import { startBoss } from "@/app/actions/boss";

export async function POST(request: NextRequest) {
  try {
    const region = request.nextUrl.searchParams.get("region") ?? "nextjs";
    const state = await startBoss("default-player", region);
    return NextResponse.json(state);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start boss";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

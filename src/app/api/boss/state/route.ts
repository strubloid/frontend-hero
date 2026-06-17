import { NextRequest, NextResponse } from "next/server";
import { getBossState } from "@/app/actions/boss";

export async function GET(request: NextRequest) {
  try {
    const region = request.nextUrl.searchParams.get("region") ?? "nextjs";
    const state = await getBossState("default-player", region);
    return NextResponse.json(state);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get boss state";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

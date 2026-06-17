import { NextRequest, NextResponse } from "next/server";
import { retreatBoss } from "@/app/actions/boss";

export async function POST(request: NextRequest) {
  try {
    const region = request.nextUrl.searchParams.get("region") ?? "nextjs";
    await retreatBoss("default-player", region);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retreat";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { submitBossAnswer } from "@/app/actions/boss";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await submitBossAnswer(
      "default-player",
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

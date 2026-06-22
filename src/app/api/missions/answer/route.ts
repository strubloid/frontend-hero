import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPlayerId } from "@/app/actions/auth-helpers";
import { submitAnswer, getActiveMission } from "@/app/actions/missions";

export async function POST(request: NextRequest) {
  try {
    const playerId = await getAuthenticatedPlayerId();
    if (!playerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = await submitAnswer({
      missionId: body.missionId,
      playerId,
      questionId: body.questionId,
      selectedIndex: body.selectedIndex,
      timeSpentSeconds: body.timeSpentSeconds ?? 0,
    });

    return NextResponse.json({
      isCorrect: result.isCorrect,
      correctIndex: result.correctIndex,
      explanation: result.explanation,
      xpAwarded: result.xpAwarded,
      updatedMastery: result.updatedMastery,
      score: result.score,
      maxScore: result.maxScore,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit answer";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const playerId = await getAuthenticatedPlayerId();
    if (!playerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mission = await getActiveMission(playerId);

    if (!mission) {
      return NextResponse.json({ mission: null, question: null });
    }

    // Build the response
    const serialized = {
      ...mission,
      startedAt: mission.startedAt.toISOString(),
      createdAt: mission.createdAt.toISOString(),
      updatedAt: mission.updatedAt.toISOString(),
      completedAt: mission.completedAt?.toISOString() ?? null,
    };

    return NextResponse.json({ mission: serialized });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch mission";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { startMission as startMissionAction } from "@/app/actions/missions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await startMissionAction({
      playerId: body.playerId ?? "default-player",
      subjectId: body.subjectId ?? "nextjs",
      type: body.type ?? "encounter",
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Insufficient question supply",
          reason: result.reason,
          level: result.level,
          levelTitle: result.levelTitle,
          totalApproved: result.totalApproved,
          missingConcepts: result.missingConcepts,
        },
        { status: 400 },
      );
    }

    // Serialize Date objects to ISO strings
    const serialized = {
      ...result.mission,
      startedAt: result.mission.startedAt.toISOString(),
      createdAt: result.mission.createdAt.toISOString(),
      updatedAt: result.mission.updatedAt.toISOString(),
      completedAt: result.mission.completedAt?.toISOString() ?? null,
    };

    return NextResponse.json({ mission: serialized });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start mission";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

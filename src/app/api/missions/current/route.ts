import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPlayerId } from "@/app/actions/auth-helpers";
import {
  getActiveMission,
  getLastMission,
  getDefaultSubject,
  getQuestion,
} from "@/app/actions/missions";

function serializeDates<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString() as unknown as T;
  if (Array.isArray(obj)) return obj.map(serializeDates) as unknown as T;
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = serializeDates(value);
    }
    return result as T;
  }
  return obj;
}

export async function GET(request: NextRequest) {
  try {
    const playerId = await getAuthenticatedPlayerId();
    if (!playerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mission = await getActiveMission(playerId);
    const subject = await getDefaultSubject();

    if (!mission) {
      // No active mission — check for a recently completed one
      const lastMission = await getLastMission(playerId);

      if (lastMission?.status === "completed") {
        return NextResponse.json({
          hasActiveMission: false,
          subjectName: subject?.title ?? null,
          mission: serializeDates(lastMission),
          currentQuestion: null,
        });
      }

      return NextResponse.json({
        hasActiveMission: false,
        subjectName: subject?.title ?? null,
        mission: null,
        currentQuestion: null,
      });
    }

    // Fetch the current question
    const idx = mission.currentQuestionIndex;
    const questionId = mission.questionIds[idx] ?? null;
    let currentQuestion = null;

    if (questionId) {
      const question = await getQuestion(questionId);
      if (question) {
        currentQuestion = {
          index: idx,
          total: mission.questionIds.length,
          questionId: question.id,
          stem: question.stem,
          options: question.options,
          type: question.type,
          difficulty: question.difficulty,
        };
      }
    }

    return NextResponse.json({
      hasActiveMission: mission.status === "active",
      subjectName: subject?.title ?? null,
      mission: serializeDates(mission),
      currentQuestion,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch mission state";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

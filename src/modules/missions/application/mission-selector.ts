import { Concept, Subject } from "@/modules/subjects/domain/subject";
import { ConceptMastery } from "@/modules/progression/domain/mastery";
import { MissionType } from "@/modules/missions/domain/mission";

export interface MissionPlan {
  subjectId: string;
  conceptId: string;
  type: MissionType;
}

export class MissionSelector {
  select(subject: Subject, mastery: ConceptMastery[], recentMistakes: string[]): MissionPlan {
    // Phase 1: return the first concept from the first domain
    const firstConcept = subject.domains[0]?.concepts[0];
    if (!firstConcept) {
      throw new Error("No concepts available in subject");
    }

    return {
      subjectId: subject.id,
      conceptId: firstConcept.id,
      type: "encounter",
    };
  }
}

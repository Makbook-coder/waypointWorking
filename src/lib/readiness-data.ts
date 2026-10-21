// Server-side: what each level offers to practise, for the readiness view.
import { allPractice } from "./content-data";
import { levels } from "./data";
import { EXAM_LEVELS } from "./exam";
import { labsForLevel } from "./labs";
import type { LevelPractice } from "./readiness";

export function levelPractice(): LevelPractice[] {
  return levels.map((l) => {
    const items = allPractice.filter((p) => p.levelId === l.id);
    const ids = (t: string) => items.filter((p) => p.type === t).map((p) => p.id);
    return {
      id: l.id,
      title: l.title,
      interviewWeight: l.interviewWeight,
      jobWeight: l.jobWeight,
      topicIds: l.modules.flatMap((m) => m.topics.map((t) => t.id)),
      quizIds: ids("quiz"),
      codingIds: ids("coding"),
      scenarioIds: ids("scenario"),
      labs: labsForLevel(l.id).map((x) => ({ id: x.id, steps: x.steps.length })),
      projectId: items.find((p) => p.type === "project")?.id ?? null,
      hasExam: EXAM_LEVELS.includes(l.id),
    };
  });
}

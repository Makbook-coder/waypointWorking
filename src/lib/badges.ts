// Milestone badges, computed from state (nothing extra is stored).
import type { DayString } from "./dates";
import type { Roadmap } from "./types";
import type { UserState } from "./store";
import { currentStreak, levelProgress, phaseProgress } from "./progress";

export interface Badge {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  /** 0..1 progress toward the badge */
  progress: number;
}

function longestStreak(activity: DayString[]): number {
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of [...activity].sort()) {
    const t = Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 86_400_000;
    run = prev !== null && t - prev === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  }
  return best;
}

export function computeBadges(r: Roadmap, s: UserState, today: DayString): Badge[] {
  const topicsDone = Object.values(s.topics).filter((t) => t.done).length;
  const streak = Math.max(longestStreak(s.activity), currentStreak(s.activity, today));
  const quizzes = Object.keys(s.quiz).length;
  const quizRight = Object.values(s.quiz).filter((q) => q.lastCorrect).length;
  const scenarios = Object.values(s.scenarios).filter((x) => x.length > 0).length;
  const notes = Object.keys(s.notes).length;
  const logDays = Object.keys(s.log).length;
  const minutes = Object.values(s.studyMinutes).reduce((a, b) => a + b, 0);
  const levelsDone = r.phases.flatMap((p) => p.levels).filter((l) => levelProgress(l, s).pct === 100).length;

  const count = (id: string, title: string, description: string, value: number, goal: number): Badge => ({
    id,
    title,
    description,
    earned: value >= goal,
    progress: Math.min(1, value / goal),
  });

  return [
    count("first-step", "First step", "Mark your first topic done", topicsDone, 1),
    count("topics-50", "Getting traction", "Finish 50 topics", topicsDone, 50),
    count("topics-250", "Quarter way", "Finish 250 topics", topicsDone, 250),
    count("topics-all", "Whole map", "Finish every topic", topicsDone, r.phases.flatMap((p) => p.levels).flatMap((l) => l.modules).reduce((n, m) => n + m.topics.length, 0)),
    count("streak-3", "Warming up", "Study 3 days in a row", streak, 3),
    count("streak-7", "One full week", "Study 7 days in a row", streak, 7),
    count("streak-30", "Habit formed", "Study 30 days in a row", streak, 30),
    count("quiz-50", "Quiz regular", "Answer 50 different quiz questions", quizzes, 50),
    count("quiz-right-200", "Sharp", "Have 200 quiz questions currently right", quizRight, 200),
    count("scenario-10", "Interview ready-ish", "Self-score 10 different scenarios", scenarios, 10),
    count("notes-20", "Note taker", "Write 20 notes", notes, 20),
    count("log-14", "Diarist", "Write the study log on 14 days", logDays, 14),
    count("hours-10", "Ten focused hours", "Log 10 hours of focused study", minutes, 600),
    count("level-1", "Level cleared", "Complete any level", levelsDone, 1),
    ...r.phases.map((p) =>
      count(`phase-${p.id}`, `${p.title} line`, `Complete every level in ${p.title}`, phaseProgress(p, s).pct, 100),
    ),
  ];
}

// Daily goal and the single "next best step" shown on the dashboard. Pure functions.
import { toDay, type DayString } from "./dates";
import { EXAM_LEVELS, PASS_MARK, bestExam } from "./exam";
import { dueReviews, levelProgress, moduleProgress } from "./progress";
import type { UserState } from "./store";
import type { Level, Module } from "./types";

export interface DailyGoal {
  goal: number; // 0 = off
  done: number;
  met: boolean;
}

/** Topics ticked done today, by the learner's local day. */
export function topicsDoneOn(s: Pick<UserState, "topics">, day: DayString): number {
  return Object.values(s.topics).filter((t) => t.done && t.doneAt && toDay(new Date(t.doneAt)) === day).length;
}

export function dailyGoal(s: Pick<UserState, "topics" | "settings">, today: DayString): DailyGoal {
  const goal = s.settings.dailyGoal;
  const done = topicsDoneOn(s, today);
  return { goal, done, met: goal > 0 && done >= goal };
}

export type StepKind = "review" | "exam" | "topic" | "interview";

export interface NextStep {
  kind: StepKind;
  title: string;
  why: string;
  href: string;
  cta: string;
}

const moduleFromHref = (href: string, modules: Module[]): Module | undefined => {
  const topic = /^\/topic\/([^/?#]+)/.exec(href)?.[1];
  if (topic) return modules.find((m) => m.topics.some((t) => t.id === decodeURIComponent(topic)));
  const mod = /^\/module\/([^/?#]+)/.exec(href)?.[1];
  return mod ? modules.find((m) => m.id.toLowerCase().replace(".", "-") === mod) : undefined;
};

/**
 * One suggestion, in this order: reviews that are due, an exam for a level you just
 * finished, the next topic in the module you were last in, the first unfinished topic
 * in roadmap order, and finally interview practice.
 */
export function nextBestStep(levels: Level[], s: UserState, today: DayString): NextStep {
  const due = dueReviews(s, today);
  if (due.length > 0)
    return {
      kind: "review",
      title: `Review ${due.length} topic${due.length === 1 ? "" : "s"} due today`,
      why: "A quick review now is cheaper than relearning later.",
      href: "/flashcards",
      cta: "Review",
    };

  const finished = levels.filter((l) => {
    const p = levelProgress(l, s);
    return p.total > 0 && p.done === p.total;
  });
  const examDue = finished.find((l) => EXAM_LEVELS.includes(l.id) && (bestExam(s, l.id)?.score ?? 0) < PASS_MARK);
  if (examDue)
    return {
      kind: "exam",
      title: `Take the L${examDue.id} exam`,
      why: `You've ticked every L${examDue.id} topic. The exam checks it stuck (pass mark ${PASS_MARK}%).`,
      href: `/exam/${examDue.id}`,
      cta: "Start exam",
    };

  const modules = levels.flatMap((l) => l.modules);
  const recent = s.lastVisited ? moduleFromHref(s.lastVisited.href, modules) : undefined;
  const current = recent && moduleProgress(recent, s).pct < 100 ? recent : modules.find((m) => moduleProgress(m, s).pct < 100);
  if (current) {
    const topic = current.topics.find((t) => !s.topics[t.id]?.done)!;
    const p = moduleProgress(current, s);
    return {
      kind: "topic",
      title: topic.title,
      why: p.done > 0 ? `Next in ${current.id} ${current.title} (${p.done} of ${p.total} done).` : `First topic in ${current.id} ${current.title}.`,
      href: `/topic/${topic.id}`,
      cta: "Open topic",
    };
  }

  return { kind: "interview", title: "Practise for interviews", why: "Every topic is done. Keep it sharp with mock questions.", href: "/interview", cta: "Practise" };
}

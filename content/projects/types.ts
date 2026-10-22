export type ProjectSize = "small" | "medium" | "bigger" | "capstone" | "practice";
/** What the learner does. `build` is the guided ladder; the rest are the practice projects, one per topic. */
export type ProjectKind = "build" | "extend" | "debug" | "reimplement" | "optimise" | "review" | "challenge";
export type ProjectScope = "topic" | "module" | "level";

/** One build, written so a learner who does not know the next step can still follow it. */
export interface ProjectSrc {
  /** `pj:<topicId>:<n>`, `pj:<moduleId>:cap` or `pj:L<level>:cap`. Progress is saved under this id. */
  id: string;
  scope: ProjectScope;
  /** Topic id, module id or `L<level>`. */
  refId: string;
  size: ProjectSize;
  /** Omitted means `build`. Practice projects use every other kind. */
  kind?: ProjectKind;
  title: string;
  /** Rough focused minutes. Within one topic the projects get longer. */
  minutes: number;
  goal: string;
  /** Tools or earlier work needed before step 1. */
  needs: string[];
  /** Code or text the learner starts from (debug, extend, review, optimise). */
  starter?: string;
  /** Challenge only: nudges, gentlest first, shown one at a time. */
  hints?: string[];
  /** Numbered build steps; empty for a challenge. `stuck` says what to try if the step does not work. */
  steps: { do: string; stuck: string }[];
  /** What you should see when it works. */
  expected: string;
  /** Checks that prove it is finished. */
  done: string[];
  /** Where to go after this one. */
  next: string;
  /** Module capstones list every topic they cover. */
  covers?: string[];
}

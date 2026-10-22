export type ProjectSize = "small" | "medium" | "bigger" | "capstone";
export type ProjectScope = "topic" | "module" | "level";

/** One build, written so a learner who does not know the next step can still follow it. */
export interface ProjectSrc {
  /** `pj:<topicId>:<n>`, `pj:<moduleId>:cap` or `pj:L<level>:cap`. Progress is saved under this id. */
  id: string;
  scope: ProjectScope;
  /** Topic id, module id or `L<level>`. */
  refId: string;
  size: ProjectSize;
  title: string;
  /** Rough focused minutes. Within one topic the projects get longer. */
  minutes: number;
  goal: string;
  /** Tools or earlier work needed before step 1. */
  needs: string[];
  /** Numbered build steps. `stuck` says what to try if the step does not work. */
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

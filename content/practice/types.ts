// Compact authoring formats. scripts/build-practice.ts expands these into data/practice.json.

export type D = "e" | "m" | "h";

/** [moduleId, difficulty, question, correctOption, [three wrong options], explanation] */
export type QuizSrc = [string, D, string, string, [string, string, string], string];

/** [moduleId, title, task, acceptance criteria] */
export type ExerciseSrc = [string, string, string, string[]];

/** [moduleId, difficulty, title, prompt, hints] */
export type ScenarioSrc = [string, D, string, string, string[]];

/** [levelId, definitionOfDone] — checklist comes from the level's project deliverables */
export type ProjectSrc = [number, string];

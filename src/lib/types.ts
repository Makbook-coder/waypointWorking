// Shapes of the static data files in /data. The app treats these as read-only.

export type PhaseId =
  | "foundations"
  | "retrieval"
  | "agentic"
  | "evaluation-trust"
  | "production"
  | "frontier-proof"
  | "interview";

export interface Topic {
  id: string; // stable slug, e.g. "m4-6-hybrid-retrieval-with-rrf"
  title: string;
  description: string;
}

export interface Module {
  id: string; // e.g. "M4.6"
  levelId: number;
  title: string;
  sessionCount: number;
  topics: Topic[];
  tryIt: string | null;
  outcome: string | null;
  mentalModel: string | null;
  isCapstone: boolean;
}

export interface LevelProject {
  title: string;
  deliverables: string[];
}

export interface Level {
  id: number; // 0..15
  title: string;
  phase: PhaseId;
  summary: string;
  interviewWeight: number; // 1..10
  jobWeight: number; // 1..10
  sessionCount: number;
  prerequisites: number[];
  outcome: string;
  project: LevelProject | null;
  modules: Module[];
}

export interface Phase {
  id: PhaseId;
  order: number;
  title: string;
  color: string; // css color token name, see globals.css
  levels: Level[];
}

export interface Roadmap {
  source: string;
  generatedAt: string;
  phases: Phase[];
}

export type ResourceType = "video" | "docs" | "article" | "course" | "repo" | "paper";

export interface Resource {
  type: ResourceType;
  title: string;
  url: string;
  free: boolean;
  searchLink?: boolean;
}

export type ResourceMap = Record<string, Resource[]>;

export type Difficulty = "easy" | "medium" | "hard";

interface PracticeBase {
  id: string;
  moduleId: string;
  levelId: number;
  difficulty: Difficulty;
}

export interface QuizItem extends PracticeBase {
  type: "quiz";
  question: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface ExerciseItem extends PracticeBase {
  type: "exercise";
  title: string;
  task: string;
  acceptance: string[];
}

export interface ScenarioItem extends PracticeBase {
  type: "scenario";
  title: string;
  prompt: string;
  hints: string[];
}

export interface ProjectItem extends PracticeBase {
  type: "project";
  title: string;
  checklist: string[];
  definitionOfDone: string;
}

/** A small build for one module: one step per topic, done when the module outcome is shown. */
export interface MiniProjectItem extends PracticeBase {
  type: "mini";
  title: string;
  brief: string;
  steps: string[];
  doneWhen: string;
}

export interface CodingTest {
  name: string;
  code: string; // python, uses assert
}

/** A Python task that runs in the browser (Pyodide). */
export interface CodingItem extends PracticeBase {
  type: "coding";
  title: string;
  topicIds: string[];
  prompt: string;
  starter: string;
  solution: string;
  tests: CodingTest[];
  checklist: string[];
  /** "Stuck? start here": two nudges before the reference solution */
  hints: [string, string];
  /** "debug" tasks start from broken code that you fix */
  kind: "build" | "debug";
}

/** A conceptual interview question with a model answer and the points a strong answer covers. */
export interface InterviewItem extends PracticeBase {
  type: "interview";
  question: string;
  answer: string;
  keyPoints: string[];
}

export type PracticeItem = QuizItem | ExerciseItem | ScenarioItem | ProjectItem | MiniProjectItem | CodingItem | InterviewItem;
export type PracticeType = PracticeItem["type"];
export type PracticeMap = Record<string, PracticeItem[]>;

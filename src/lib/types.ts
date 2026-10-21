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

export type PracticeItem = QuizItem | ExerciseItem | ScenarioItem | ProjectItem;
export type PracticeType = PracticeItem["type"];
export type PracticeMap = Record<string, PracticeItem[]>;

import { PROJECTS_L0 } from "./l0";
import { PROJECTS_L1 } from "./l1";
import type { ProjectSrc } from "./types";

/** Levels whose every topic, module and level capstone has a project guide. */
export const PROJECT_LEVELS = [0, 1];

export const PROJECTS: ProjectSrc[] = [...PROJECTS_L0, ...PROJECTS_L1];

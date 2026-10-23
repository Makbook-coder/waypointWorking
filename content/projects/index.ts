import { PROJECTS_L0 } from "./l0";
import { PROJECTS_L1 } from "./l1";
import { PROJECTS_L2 } from "./l2";
import { PROJECTS_L3 } from "./l3";
import { PROJECTS_L4 } from "./l4";
import { PROJECTS_L5 } from "./l5";
import { PRACTICE } from "./practice";
import type { ProjectSrc } from "./types";

/** Levels whose every topic, module and level capstone has a project guide. */
export const PROJECT_LEVELS = [0, 1, 2, 3, 4, 5];

export const PROJECTS: ProjectSrc[] = [...PROJECTS_L0, ...PROJECTS_L1, ...PROJECTS_L2, ...PROJECTS_L3, ...PROJECTS_L4, ...PROJECTS_L5, ...PRACTICE];

/** Levels whose every topic also has a practice project (extend, debug, reimplement, optimise, review or challenge). */
export const PRACTICE_LEVELS: number[] = [0, 1, 2, 3, 4, 5];

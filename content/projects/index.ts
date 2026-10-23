import { PROJECTS_L0 } from "./l0";
import { PROJECTS_L1 } from "./l1";
import { PROJECTS_L2 } from "./l2";
import { PROJECTS_L3 } from "./l3";
import { PROJECTS_L4 } from "./l4";
import { PROJECTS_L5 } from "./l5";
import { PROJECTS_L6 } from "./l6";
import { PROJECTS_L7 } from "./l7";
import { PROJECTS_L8 } from "./l8";
import { PROJECTS_L9 } from "./l9";
import { PROJECTS_L10 } from "./l10";
import { PROJECTS_L11 } from "./l11";
import { PROJECTS_L12 } from "./l12";
import { PROJECTS_L13 } from "./l13";
import { PROJECTS_L14 } from "./l14";
import { PROJECTS_L15 } from "./l15";
import { PRACTICE } from "./practice";
import type { ProjectSrc } from "./types";

/** Levels whose every topic, module and level capstone has a project guide. */
export const PROJECT_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export const PROJECTS: ProjectSrc[] = [...PROJECTS_L0, ...PROJECTS_L1, ...PROJECTS_L2, ...PROJECTS_L3, ...PROJECTS_L4, ...PROJECTS_L5, ...PROJECTS_L6, ...PROJECTS_L7, ...PROJECTS_L8, ...PROJECTS_L9, ...PROJECTS_L10, ...PROJECTS_L11, ...PROJECTS_L12, ...PROJECTS_L13, ...PROJECTS_L14, ...PROJECTS_L15, ...PRACTICE];

/** Levels whose every topic also has a practice project (extend, debug, reimplement, optimise, review or challenge). */
export const PRACTICE_LEVELS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

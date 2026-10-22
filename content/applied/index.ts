import { APPLIED_L0 } from "./l0";
import { APPLIED_L1 } from "./l1";
import { APPLIED_L2 } from "./l2";
import { APPLIED_L3 } from "./l3";
import { APPLIED_L4 } from "./l4";
import { APPLIED_L5 } from "./l5";
import { APPLIED_L6 } from "./l6";
import { APPLIED_L7 } from "./l7";
import { APPLIED_L8 } from "./l8";
import { APPLIED_L9 } from "./l9";
import { APPLIED_L10 } from "./l10";
import { APPLIED_L11 } from "./l11";
import { APPLIED_L12 } from "./l12";
import { APPLIED_L13 } from "./l13";
import { APPLIED_L14 } from "./l14";
import { APPLIED_L15 } from "./l15";
import type { AppliedModule } from "./types";

/** Levels whose every non-capstone module has an "In practice" section. */
export const APPLIED_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

/** When the source links were last fetched and read. */
export const APPLIED_SOURCES_CHECKED = "2026-10-21";

export const APPLIED_SOURCES: AppliedModule[] = [...APPLIED_L0, ...APPLIED_L1, ...APPLIED_L2, ...APPLIED_L3, ...APPLIED_L4, ...APPLIED_L5, ...APPLIED_L6, ...APPLIED_L7, ...APPLIED_L8, ...APPLIED_L9, ...APPLIED_L10, ...APPLIED_L11, ...APPLIED_L12, ...APPLIED_L13, ...APPLIED_L14, ...APPLIED_L15];

import { APPLIED_L0 } from "./l0";
import { APPLIED_L1 } from "./l1";
import { APPLIED_L2 } from "./l2";
import type { AppliedModule } from "./types";

/** Levels whose every non-capstone module has an "In practice" section. */
export const APPLIED_LEVELS = [0, 1, 2];

/** When the source links were last fetched and read. */
export const APPLIED_SOURCES_CHECKED = "2026-10-21";

export const APPLIED_SOURCES: AppliedModule[] = [...APPLIED_L0, ...APPLIED_L1, ...APPLIED_L2];

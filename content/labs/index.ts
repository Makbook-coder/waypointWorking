import { LABS_L0_L4 } from "./l0-l4";
import { LABS_L5_L9 } from "./l5-l9";
import { LABS_L10_L13 } from "./l10-l13";
import { LABS_MORE_A } from "./more-a";
import { LABS_MORE_B } from "./more-b";
import type { LabSrc } from "./types";
import { WARMUP_LAB } from "./warmup";

export const LAB_SOURCES: LabSrc[] = [WARMUP_LAB, ...LABS_L0_L4, ...LABS_L5_L9, ...LABS_L10_L13, ...LABS_MORE_A, ...LABS_MORE_B];

import { NOTES_L0_L3 } from "./l0-l3";
import { NOTES_L12_L15 } from "./l12-l15";
import { NOTES_L4_L7 } from "./l4-l7";
import { NOTES_L8_L11 } from "./l8-l11";
import type { NoteSrc } from "./types";

export const NOTE_SOURCES: NoteSrc[] = [
  ...NOTES_L0_L3,
  ...NOTES_L4_L7,
  ...NOTES_L8_L11,
  ...NOTES_L12_L15,
];

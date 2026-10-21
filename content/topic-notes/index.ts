import { TOPIC_NOTES_L0 } from "./l0";
import { TOPIC_NOTES_L1 } from "./l1";
import { TOPIC_NOTES_L2 } from "./l2";
import { TOPIC_NOTES_L3 } from "./l3";
import type { TopicNoteSrc } from "./types";

export const TOPIC_NOTE_SOURCES: TopicNoteSrc[] = [...TOPIC_NOTES_L0, ...TOPIC_NOTES_L1, ...TOPIC_NOTES_L2, ...TOPIC_NOTES_L3];

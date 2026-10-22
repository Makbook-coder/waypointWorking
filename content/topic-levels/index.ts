import { TOPIC_LEVELS_L0 } from "./l0";
import { TOPIC_LEVELS_L1 } from "./l1";
import { TOPIC_LEVELS_L2 } from "./l2";
import type { TopicLevelSrc } from "./types";

export const TOPIC_LEVEL_SOURCES: TopicLevelSrc[] = [...TOPIC_LEVELS_L0, ...TOPIC_LEVELS_L1, ...TOPIC_LEVELS_L2];

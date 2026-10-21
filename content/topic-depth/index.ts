import { TOPIC_DEPTH_L0 } from "./l0";
import { TOPIC_DEPTH_L1 } from "./l1";
import { TOPIC_DEPTH_L2 } from "./l2";
import { TOPIC_DEPTH_L3 } from "./l3";
import { TOPIC_DEPTH_L4 } from "./l4";
import type { TopicDepthSrc } from "./types";

export const TOPIC_DEPTH_SOURCES: TopicDepthSrc[] = [...TOPIC_DEPTH_L0, ...TOPIC_DEPTH_L1, ...TOPIC_DEPTH_L2, ...TOPIC_DEPTH_L3, ...TOPIC_DEPTH_L4];

// Typed access to data/resources.json and data/practice.json.
import resourcesJson from "../../data/resources.json";
import practiceJson from "../../data/practice.json";
import type { PracticeItem, PracticeMap, Resource, ResourceMap } from "./types";

export const resources = resourcesJson as unknown as ResourceMap;
export const practice = practiceJson as unknown as PracticeMap;
export const allPractice: PracticeItem[] = Object.values(practice).flat();

const practiceById = new Map(allPractice.map((p) => [p.id, p]));

export const getPracticeItem = (id: string) => practiceById.get(id);
export const getResources = (moduleId: string): Resource[] => resources[moduleId] ?? [];
export const getPractice = (moduleId: string): PracticeItem[] => practice[moduleId] ?? [];

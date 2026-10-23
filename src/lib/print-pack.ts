// A printable pack per level: the cheat sheet, the level's top mistakes and the projects to build.
// Assembled from content that already exists, so fixing a note, mistake or project fixes the pack.
import { cheatSheet, type CheatEntry } from "./cheatsheet";
import { mistakesForLevel, type LevelMistake } from "./mistakes";
import { capstoneForLevel, capstoneForModule, projectsForTopic, type ProjectSrc } from "./projects";
import type { Level, Module } from "./types";

export interface PackProjects {
  module: Module;
  /** Guided builds plus practice projects across the module's topics. */
  topicProjects: number;
  /** Rough focused minutes for all of them. */
  minutes: number;
  capstone: ProjectSrc | null;
}

export interface PrintPack {
  level: Level;
  sheet: CheatEntry[];
  mistakes: LevelMistake[];
  projects: PackProjects[];
  levelCapstone: ProjectSrc | null;
}

export function printPack(level: Level): PrintPack {
  return {
    level,
    sheet: cheatSheet(level),
    mistakes: mistakesForLevel(level.id),
    projects: level.modules.map((module) => {
      const list = module.topics.flatMap((t) => projectsForTopic(t.id));
      return {
        module,
        topicProjects: list.length,
        minutes: list.reduce((n, p) => n + p.minutes, 0),
        capstone: capstoneForModule(module.id) ?? null,
      };
    }),
    levelCapstone: capstoneForLevel(level.id) ?? null,
  };
}

export const formatMinutes = (m: number) => (m >= 90 ? `${Math.round(m / 60)} h` : `${m} min`);

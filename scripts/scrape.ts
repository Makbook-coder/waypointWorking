/**
 * Regenerates data/roadmap.json.
 *
 *   npm run scrape             # try the live site, fall back to snapshots per level
 *   npm run scrape -- --offline  # rebuild from data/raw snapshots only
 *
 * Pipeline: live HTML (or data/raw/level-N.json snapshot) -> RawLevel -> buildRoadmap -> validate -> write.
 * The live HTML parser is heuristic (heading/list based). Any level it cannot parse
 * into at least one module with topics falls back to its committed snapshot, so a
 * site redesign never produces a broken roadmap.json.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import {
  buildRoadmap,
  countRoadmap,
  validateRoadmap,
  type RawLevel,
  type RawModule,
} from "../src/lib/roadmap-build";

const BASE = "https://ai-engineer-roadmap-2026.vercel.app";
const ROOT = path.resolve(__dirname, "..");
const RAW_DIR = path.join(ROOT, "data", "raw");
const OUT = path.join(ROOT, "data", "roadmap.json");
const LEVELS = Array.from({ length: 16 }, (_, i) => i);

const offline = process.argv.includes("--offline");

async function readSnapshot(id: number): Promise<RawLevel> {
  const file = path.join(RAW_DIR, `level-${id}.json`);
  return JSON.parse(await readFile(file, "utf8")) as RawLevel;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

function numberAfter(text: string, label: RegExp): number | null {
  const m = text.match(new RegExp(label.source + String.raw`\D{0,20}(\d{1,2})`, "i"));
  return m ? Number(m[1]) : null;
}

/** Best-effort parse of a level page. Returns null if the structure is unrecognisable. */
export function parseLevelHtml(html: string, id: number, snapshot: RawLevel): RawLevel | null {
  const $ = cheerio.load(html);
  const body = clean($("body").text());
  const modules: RawModule[] = [];
  const idPattern = new RegExp(String.raw`^\s*[MP]${id}\.(\d+)\b\s*[·:\-–]?\s*(.*)$`);

  $("h2, h3, h4").each((_, el) => {
    const heading = clean($(el).text());
    const match = heading.match(idPattern);
    if (!match) return;
    const moduleId = `M${id}.${match[1]}`;
    const section = $(el).nextUntil("h2, h3");
    const topics = section
      .find("li")
      .toArray()
      .map((li) => {
        const strong = clean($(li).find("strong, b").first().text());
        const full = clean($(li).text());
        const t = strong || full.split(/[:—–]/)[0];
        const d = strong ? clean(full.slice(full.indexOf(strong) + strong.length).replace(/^[:—–\-\s]+/, "")) : full;
        return { t: clean(t), d: d || clean(t) };
      })
      .filter((t) => t.t.length > 0);
    const sectionText = clean(section.text());
    const tryIt = sectionText.match(/Try it[:\s]+(.+?)(?:Outcome|Mental model|$)/i)?.[1] ?? null;
    const outcome = sectionText.match(/Outcome[:\s]+(.+?)(?:Try it|Mental model|$)/i)?.[1] ?? null;
    const sessions = numberAfter(heading + " " + sectionText, /sessions?/);
    modules.push({
      id: moduleId,
      title: clean(match[2]) || moduleId,
      sessions,
      topics,
      tryIt: tryIt ? clean(tryIt) : null,
      outcome: outcome ? clean(outcome) : null,
      mentalModel: null,
    });
  });

  if (modules.length === 0 || modules.some((m) => m.topics.length === 0)) return null;

  return {
    ...snapshot,
    interviewWeight: numberAfter(body, /interview weight/) ?? snapshot.interviewWeight,
    jobWeight: numberAfter(body, /job weight/) ?? snapshot.jobWeight,
    modules: modules.map((m) => {
      // keep curated fields from the snapshot where the live parse found nothing
      const prev = snapshot.modules.find((s) => s.id === m.id);
      return {
        ...m,
        sessions: m.sessions ?? prev?.sessions ?? null,
        tryIt: m.tryIt ?? prev?.tryIt ?? null,
        outcome: m.outcome ?? prev?.outcome ?? null,
        mentalModel: prev?.mentalModel ?? null,
      };
    }),
  };
}

async function loadLevel(id: number): Promise<{ level: RawLevel; from: "live" | "snapshot" }> {
  const snapshot = await readSnapshot(id);
  if (offline) return { level: snapshot, from: "snapshot" };
  try {
    const html = await fetchHtml(`${BASE}/level/${id}/`);
    const parsed = parseLevelHtml(html, id, snapshot);
    if (parsed) {
      await writeFile(path.join(RAW_DIR, `level-${id}.json`), JSON.stringify(parsed, null, 2) + "\n");
      return { level: parsed, from: "live" };
    }
    console.warn(`  level ${id}: live page not recognised, using snapshot`);
  } catch (err) {
    console.warn(`  level ${id}: fetch failed (${(err as Error).message}), using snapshot`);
  }
  return { level: snapshot, from: "snapshot" };
}

async function main() {
  await mkdir(RAW_DIR, { recursive: true });
  console.log(offline ? "Building from snapshots (offline)" : `Fetching ${BASE} …`);
  const results = [];
  for (const id of LEVELS) results.push(await loadLevel(id));

  const roadmap = buildRoadmap(
    results.map((r) => r.level),
    BASE,
  );
  const errors = validateRoadmap(roadmap);
  if (errors.length) {
    console.error("Validation failed:\n  " + errors.join("\n  "));
    process.exit(1);
  }
  await writeFile(OUT, JSON.stringify(roadmap, null, 2) + "\n");

  const c = countRoadmap(roadmap);
  const live = results.filter((r) => r.from === "live").length;
  console.log(`Sources: ${live} live, ${results.length - live} snapshot`);
  console.log(
    `OK  phases=${c.phases} levels=${c.levels} modules=${c.modules} topics=${c.topics} sessions=${c.sessions} projects=${c.projects}`,
  );
  console.log(`Wrote ${path.relative(ROOT, OUT)}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

"use client";

import Link from "next/link";
import { bestExam, examsFor } from "@/lib/exam";
import { useUserState } from "@/lib/use-store";
import { Badge } from "./ui";

export function ExamIndex({ levels }: { levels: { id: number; title: string; color: string }[] }) {
  const s = useUserState();
  const passed = levels.filter((l) => bestExam(s, l.id)?.passed).length;
  return (
    <div>
      <p className="num mb-4 text-sm text-muted">
        {passed} of {levels.length} level exams passed
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((l) => {
          const best = bestExam(s, l.id);
          const n = examsFor(s, l.id).length;
          return (
            <li key={l.id} className="rounded-lg border border-line bg-surface p-4" style={{ borderLeft: `4px solid ${l.color}` }}>
              <Link href={`/exam/${l.id}`} className="font-semibold hover:underline hover:underline-offset-2">
                <span className="font-mono">L{l.id}</span> {l.title}
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                {best ? (
                  <>
                    <span>
                      Best <span className="num font-semibold text-ink">{best.score}%</span>
                    </span>
                    <Badge>{best.passed ? "passed" : "not yet"}</Badge>
                    <span className="num text-xs">
                      {n} attempt{n === 1 ? "" : "s"}
                    </span>
                  </>
                ) : (
                  <span>Not taken yet</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

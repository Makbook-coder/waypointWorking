import { passedAll, type RunResult } from "@/lib/coding";

/** Test results for a Python run: a pass count, each test with its error, and anything printed. */
export function TestResults({ result }: { result: RunResult | null }) {
  const okCount = result?.results.filter((t) => t.ok).length ?? 0;
  return (
    <div aria-live="polite">
      {result && (
        <div className="mt-3 rounded-md border border-line p-3 text-sm">
          {result.fatal ? (
            <p className="text-bad">{result.fatal}</p>
          ) : (
            <>
              <p className="num font-semibold">
                {okCount}/{result.results.length} tests passed{passedAll(result) ? " ✓" : ""}
              </p>
              <ul className="mt-2 space-y-1">
                {result.results.map((t) => (
                  <li key={t.name} className="flex gap-2">
                    <span aria-hidden="true">{t.ok ? "✓" : "✗"}</span>
                    <span>
                      <span className="sr-only">{t.ok ? "Passed: " : "Failed: "}</span>
                      {t.name}
                      {t.error && <code className="mt-0.5 block break-words font-mono text-xs text-muted">{t.error}</code>}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {result.stdout && (
            <>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted">Printed output</p>
              <pre className="mt-1 max-h-48 overflow-auto rounded bg-surface-2 p-2 font-mono text-xs">{result.stdout}</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}

import { describe, expect, it } from "vitest";
import { REVIEW_INTERVALS, applyLapse, applyReview, isDue, scheduleFirst } from "@/lib/review";

const T = "2026-03-10";

describe("spaced review scheduler", () => {
  it("uses 1, 3, 7, 21 day intervals", () => {
    expect(REVIEW_INTERVALS).toEqual([1, 3, 7, 21]);
  });

  it("schedules the first review one day after completion", () => {
    expect(scheduleFirst(T)).toEqual({ step: 0, due: "2026-03-11" });
  });

  it("walks through each interval when remembered, then graduates", () => {
    let e = scheduleFirst(T);
    e = applyReview(e, true, "2026-03-11")!;
    expect(e).toEqual({ step: 1, due: "2026-03-14" }); // +3
    e = applyReview(e, true, "2026-03-14")!;
    expect(e).toEqual({ step: 2, due: "2026-03-21" }); // +7
    e = applyReview(e, true, "2026-03-21")!;
    expect(e).toEqual({ step: 3, due: "2026-04-11" }); // +21
    expect(applyReview(e, true, "2026-04-11")).toBeNull();
  });

  it("restarts at the 1-day interval when forgotten", () => {
    expect(applyReview({ step: 2, due: T }, false, T)).toEqual({ step: 0, due: "2026-03-11" });
  });

  it("intervals are measured from the day of review, not the original due date", () => {
    // reviewed 4 days late
    expect(applyReview({ step: 0, due: "2026-03-11" }, true, "2026-03-15")).toEqual({ step: 1, due: "2026-03-18" });
  });

  it("a wrong quiz answer steps back and pulls the review to tomorrow at the latest", () => {
    expect(applyLapse({ step: 3, due: "2026-04-01" }, T)).toEqual({ step: 2, due: "2026-03-11" });
    // never pushes an already-due review later
    expect(applyLapse({ step: 1, due: "2026-03-05" }, T)).toEqual({ step: 0, due: "2026-03-05" });
    // graduated / unscheduled topics come back
    expect(applyLapse(undefined, T)).toEqual({ step: 0, due: "2026-03-11" });
  });

  it("crosses month and year boundaries", () => {
    expect(scheduleFirst("2026-12-31").due).toBe("2027-01-01");
    expect(applyReview({ step: 2, due: "2026-02-20" }, true, "2026-02-20")!.due).toBe("2026-03-13");
  });

  it("isDue compares calendar days", () => {
    expect(isDue({ step: 0, due: T }, T)).toBe(true);
    expect(isDue({ step: 0, due: "2026-03-11" }, T)).toBe(false);
  });
});

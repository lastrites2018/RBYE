// 책임: 통계 페이지의 데이터 가공 로직(TOP N 추출, 비율 계산, 트렌드 감지)이 올바르다
import { describe, test, expect } from "bun:test";

/**
 * stats.tsx YearCompareView의 TOP 15 키워드 추출 로직
 */
function extractTopSkills(allData: { [skill: string]: number }, limit: number): string[] {
  return Object.entries(allData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([skill]) => skill);
}

/**
 * stats.tsx의 비율 계산 로직
 */
function calcPercent(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

/**
 * stats.tsx YearCompareView의 NEW 감지 로직
 */
function isNewTech(prevPercent: number, currentPercent: number): boolean {
  return prevPercent === 0 && currentPercent > 0;
}

/**
 * stats.tsx YearCompareView의 급상승 감지 로직
 */
function isSurge(diff: number, isNew: boolean): boolean {
  return diff >= 10 && !isNew;
}

/**
 * stats.tsx TrendView의 순위 변동 계산 (양수 = 상승)
 */
function calcRankDiff(prevRank: number, currentRank: number): number {
  return prevRank - currentRank;
}

describe("TOP N 키워드 추출", () => {
  const data = { React: 50, Vue: 30, Angular: 20, Svelte: 10, jQuery: 5 };

  test("빈도순으로 정렬하여 상위 N개를 반환한다", () => {
    const result = extractTopSkills(data, 3);
    expect(result).toEqual(["React", "Vue", "Angular"]);
  });

  test("N이 전체 개수보다 크면 전체를 반환한다", () => {
    expect(extractTopSkills(data, 100)).toHaveLength(5);
  });

  test("빈 데이터는 빈 배열을 반환한다", () => {
    expect(extractTopSkills({}, 15)).toHaveLength(0);
  });

  test("동일 빈도에서도 안정적으로 N개를 반환한다", () => {
    const tied = { A: 10, B: 10, C: 10 };
    expect(extractTopSkills(tied, 2)).toHaveLength(2);
  });
});

describe("비율 계산", () => {
  test("50/200 = 25%", () => {
    expect(calcPercent(50, 200)).toBe(25);
  });

  test("1/3 = 33% (반올림)", () => {
    expect(calcPercent(1, 3)).toBe(33);
  });

  test("total이 0이면 0%를 반환한다", () => {
    expect(calcPercent(10, 0)).toBe(0);
  });

  test("count가 0이면 0%", () => {
    expect(calcPercent(0, 100)).toBe(0);
  });

  test("count === total이면 100%", () => {
    expect(calcPercent(100, 100)).toBe(100);
  });
});

describe("NEW 기술 감지", () => {
  test("이전 0% → 현재 > 0%이면 NEW이다", () => {
    expect(isNewTech(0, 15)).toBe(true);
  });

  test("이전 > 0%이면 NEW가 아니다", () => {
    expect(isNewTech(5, 15)).toBe(false);
  });

  test("현재도 0%이면 NEW가 아니다", () => {
    expect(isNewTech(0, 0)).toBe(false);
  });
});

/**
 * TrendView의 NEW 판정: 이전 스냅샷에 없고, "전체" 기간이 아닌 경우만 NEW
 */
function isTrendNew(prev: { count: number; rank: number } | undefined, period: string): boolean {
  return !prev && period !== "all";
}

describe("트렌드 NEW 감지 (기간별)", () => {
  test("주간에서 이전 없으면 NEW", () => {
    expect(isTrendNew(undefined, "week")).toBe(true);
  });

  test("월간에서 이전 없으면 NEW", () => {
    expect(isTrendNew(undefined, "month")).toBe(true);
  });

  test("전체에서 이전 없어도 NEW 아님", () => {
    expect(isTrendNew(undefined, "all")).toBe(false);
  });

  test("이전 데이터 있으면 어떤 기간이든 NEW 아님", () => {
    const prev = { count: 10, rank: 5 };
    expect(isTrendNew(prev, "all")).toBe(false);
    expect(isTrendNew(prev, "week")).toBe(false);
    expect(isTrendNew(prev, "month")).toBe(false);
  });
});

describe("급상승 감지", () => {
  test("차이 10%p 이상이고 NEW가 아니면 surge이다", () => {
    expect(isSurge(10, false)).toBe(true);
    expect(isSurge(25, false)).toBe(true);
  });

  test("차이 10%p 미만이면 surge가 아니다", () => {
    expect(isSurge(9, false)).toBe(false);
  });

  test("NEW이면 surge가 아니다 (NEW가 우선)", () => {
    expect(isSurge(15, true)).toBe(false);
  });
});

describe("순위 변동 계산", () => {
  test("이전 5위 → 현재 2위 = +3 (상승)", () => {
    expect(calcRankDiff(5, 2)).toBe(3);
  });

  test("이전 2위 → 현재 5위 = -3 (하락)", () => {
    expect(calcRankDiff(2, 5)).toBe(-3);
  });

  test("순위 변동 없으면 0", () => {
    expect(calcRankDiff(3, 3)).toBe(0);
  });
});

// --- timeline 관련 로직 ---

interface TimelineEntry {
  date: string;
  categories: {
    [cat: string]: {
      totalJobs: number;
      topKeywords: { keyword: string; count: number }[];
    };
  };
}

/**
 * stats.tsx getServerSideProps의 timeline 응답 방어 로직
 */
function safeParseTimeline(data: unknown): TimelineEntry[] {
  return Array.isArray(data) ? data : [];
}

/**
 * stats.tsx TrendView의 daySpan 계산 로직
 */
function calcDaySpan(timeline: TimelineEntry[]): number {
  if (timeline.length < 2) return 0;
  return Math.round(
    (new Date(timeline[timeline.length - 1].date).getTime() -
      new Date(timeline[0].date).getTime()) /
      86400000
  );
}

/**
 * stats.tsx TrendView의 비교 기간 탭 활성화 로직
 * - "전체"는 스냅샷 개수 기준 (3개 이상)
 * - "주간"/"월간"은 날짜 차이 기준 (7일/30일 이상)
 */
function getAvailablePeriods(snapshotCount: number, daySpan: number): string[] {
  const periods: string[] = [];
  if (snapshotCount >= 3) periods.push("all");
  if (daySpan >= 7) periods.push("week");
  if (daySpan >= 30) periods.push("month");
  return periods;
}

/**
 * stats.tsx findSnapshotNearDaysAgo 로직
 */
function findSnapshotNearDaysAgo(timeline: TimelineEntry[], daysAgo: number): TimelineEntry | null {
  const latest = timeline[timeline.length - 1];
  const latestDate = new Date(latest.date).getTime();
  const targetDate = latestDate - daysAgo * 86400000;

  let best: TimelineEntry | null = null;
  let bestDiff = Infinity;

  for (const entry of timeline) {
    if (entry === latest) continue;
    const diff = Math.abs(new Date(entry.date).getTime() - targetDate);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = entry;
    }
  }
  return best;
}

describe("timeline 응답 방어", () => {
  test("배열이면 그대로 반환한다", () => {
    const data = [{ date: "2026-03-11", categories: {} }];
    expect(safeParseTimeline(data)).toBe(data);
  });

  test("빈 배열이면 빈 배열을 반환한다", () => {
    expect(safeParseTimeline([])).toEqual([]);
  });

  test("객체이면 빈 배열을 반환한다 (json-server 404 응답)", () => {
    expect(safeParseTimeline({})).toEqual([]);
  });

  test("null이면 빈 배열을 반환한다", () => {
    expect(safeParseTimeline(null)).toEqual([]);
  });

  test("undefined이면 빈 배열을 반환한다", () => {
    expect(safeParseTimeline(undefined)).toEqual([]);
  });

  test("문자열이면 빈 배열을 반환한다", () => {
    expect(safeParseTimeline("not found")).toEqual([]);
  });
});

describe("daySpan 계산", () => {
  test("스냅샷이 1개면 0을 반환한다", () => {
    expect(calcDaySpan([{ date: "2026-03-11", categories: {} }])).toBe(0);
  });

  test("빈 배열이면 0을 반환한다", () => {
    expect(calcDaySpan([])).toBe(0);
  });

  test("3일 차이를 정확히 계산한다", () => {
    const timeline = [
      { date: "2026-03-11", categories: {} },
      { date: "2026-03-14", categories: {} },
    ];
    expect(calcDaySpan(timeline)).toBe(3);
  });

  test("같은 날짜면 0을 반환한다", () => {
    const timeline = [
      { date: "2026-03-11", categories: {} },
      { date: "2026-03-11", categories: {} },
    ];
    expect(calcDaySpan(timeline)).toBe(0);
  });

  test("30일 이상 차이를 계산한다", () => {
    const timeline = [
      { date: "2026-02-01", categories: {} },
      { date: "2026-03-15", categories: {} },
    ];
    expect(calcDaySpan(timeline)).toBe(42);
  });
});

describe("비교 기간 탭 활성화", () => {
  test("스냅샷 2개면 탭 없음", () => {
    expect(getAvailablePeriods(2, 2)).toEqual([]);
  });

  test("스냅샷 3개 + daySpan 2이면 전체만 활성화", () => {
    expect(getAvailablePeriods(3, 2)).toEqual(["all"]);
  });

  test("스냅샷 3개 + daySpan 7이면 전체+주간 활성화", () => {
    expect(getAvailablePeriods(3, 7)).toEqual(["all", "week"]);
  });

  test("스냅샷 10개 + daySpan 30이면 전체+주간+월간 활성화", () => {
    expect(getAvailablePeriods(10, 30)).toEqual(["all", "week", "month"]);
  });

  test("스냅샷 1개면 daySpan 무관하게 탭 없음", () => {
    expect(getAvailablePeriods(1, 0)).toEqual([]);
  });
});

describe("가장 가까운 스냅샷 탐색", () => {
  const timeline: TimelineEntry[] = [
    { date: "2026-03-01", categories: {} },
    { date: "2026-03-05", categories: {} },
    { date: "2026-03-08", categories: {} },
    { date: "2026-03-10", categories: {} },
    { date: "2026-03-15", categories: {} },
  ];

  test("7일 전 근처 스냅샷을 찾는다 (3/15 기준 → 3/08)", () => {
    const result = findSnapshotNearDaysAgo(timeline, 7);
    expect(result?.date).toBe("2026-03-08");
  });

  test("30일 전 근처 스냅샷을 찾는다 (가장 오래된 것)", () => {
    const result = findSnapshotNearDaysAgo(timeline, 30);
    expect(result?.date).toBe("2026-03-01");
  });

  test("최신 스냅샷 자체는 제외한다", () => {
    const result = findSnapshotNearDaysAgo(timeline, 0);
    expect(result?.date).not.toBe("2026-03-15");
  });

  test("스냅샷이 2개뿐이면 나머지 1개를 반환한다", () => {
    const short: TimelineEntry[] = [
      { date: "2026-03-01", categories: {} },
      { date: "2026-03-15", categories: {} },
    ];
    const result = findSnapshotNearDaysAgo(short, 7);
    expect(result?.date).toBe("2026-03-01");
  });
});

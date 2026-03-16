// 책임: 통계 페이지 뷰 상태 전환 로직이 올바르다
import { describe, test, expect } from "bun:test";
import {
  StatsViewState,
  switchViewMode,
  getActiveMode,
  setRankingYear,
  setTrendPeriod,
  deriveSelectedYear,
  deriveTrendPeriod,
} from "../utils/statsView";

describe("switchViewMode", () => {
  test("ranking 전환 시 year는 전체로 초기화된다", () => {
    const view = switchViewMode("ranking");
    expect(view).toEqual({ mode: "ranking", year: "전체" });
  });

  test("compare 전환 시 year 없음", () => {
    const view = switchViewMode("compare");
    expect(view).toEqual({ mode: "compare" });
  });

  test("trend 전환 시 period는 all로 초기화된다", () => {
    const view = switchViewMode("trend");
    expect(view).toEqual({ mode: "trend", period: "all" });
  });
});

describe("getActiveMode", () => {
  test("ranking 모드 반환", () => {
    expect(getActiveMode({ mode: "ranking", year: "3년" })).toBe("ranking");
  });

  test("compare 모드 반환", () => {
    expect(getActiveMode({ mode: "compare" })).toBe("compare");
  });

  test("trend 모드 반환", () => {
    expect(getActiveMode({ mode: "trend", period: "week" })).toBe("trend");
  });
});

describe("setRankingYear", () => {
  test("ranking 모드에서 연차를 변경한다", () => {
    const view = setRankingYear({ mode: "ranking", year: "전체" }, "3년");
    expect(view).toEqual({ mode: "ranking", year: "3년" });
  });

  test("compare 모드에서는 변경하지 않는다", () => {
    const view: StatsViewState = { mode: "compare" };
    expect(setRankingYear(view, "3년")).toBe(view);
  });

  test("trend 모드에서는 변경하지 않는다", () => {
    const view: StatsViewState = { mode: "trend", period: "all" };
    expect(setRankingYear(view, "3년")).toBe(view);
  });
});

describe("setTrendPeriod", () => {
  test("trend 모드에서 기간을 변경한다", () => {
    const view = setTrendPeriod({ mode: "trend", period: "all" }, "week");
    expect(view).toEqual({ mode: "trend", period: "week" });
  });

  test("ranking 모드에서는 변경하지 않는다", () => {
    const view: StatsViewState = { mode: "ranking", year: "전체" };
    expect(setTrendPeriod(view, "week")).toBe(view);
  });
});

describe("deriveSelectedYear", () => {
  test("ranking 모드에서 year를 반환한다", () => {
    expect(deriveSelectedYear({ mode: "ranking", year: "5년" })).toBe("5년");
  });

  test("compare 모드에서 null을 반환한다", () => {
    expect(deriveSelectedYear({ mode: "compare" })).toBeNull();
  });

  test("trend 모드에서 null을 반환한다", () => {
    expect(deriveSelectedYear({ mode: "trend", period: "all" })).toBeNull();
  });
});

describe("deriveTrendPeriod", () => {
  test("trend 모드에서 period를 반환한다", () => {
    expect(deriveTrendPeriod({ mode: "trend", period: "month" })).toBe("month");
  });

  test("ranking 모드에서 null을 반환한다", () => {
    expect(deriveTrendPeriod({ mode: "ranking", year: "전체" })).toBeNull();
  });
});

describe("기존 동작과의 일치", () => {
  test("카테고리 변경 시: viewMode 유지, year 전체로 리셋", () => {
    // 기존: updateCategory → setSelectedYear("전체") but viewMode 유지
    // 새: ranking 모드면 year만 리셋
    const view: StatsViewState = { mode: "ranking", year: "5년" };
    const afterCategoryChange = setRankingYear(view, "전체");
    expect(afterCategoryChange).toEqual({ mode: "ranking", year: "전체" });
    expect(getActiveMode(afterCategoryChange)).toBe("ranking");
  });

  test("카테고리 변경 시 compare/trend 모드는 영향 없음", () => {
    const compare: StatsViewState = { mode: "compare" };
    expect(setRankingYear(compare, "전체")).toBe(compare);

    const trend: StatsViewState = { mode: "trend", period: "week" };
    expect(setRankingYear(trend, "전체")).toBe(trend);
  });

  test("뷰 모드 전환 시 year가 자동 리셋된다 (기존에는 안 됐던 개선)", () => {
    // 기존: ranking에서 5년 선택 → compare → 다시 ranking → year가 5년 남아있음
    // 새: switchViewMode("ranking")으로 전환하면 항상 year="전체"
    const view = switchViewMode("ranking");
    expect(view.mode === "ranking" && view.year).toBe("전체");
  });
});

/**
 * 통계 페이지 뷰 상태 — 순수 함수로 분리
 *
 * viewMode와 selectedYear가 엮여있던 것을 하나의 값으로 표현.
 * - ranking 모드에서만 year가 의미 있음
 * - compare/trend 모드에서는 year가 존재하지 않음
 */

export type TrendPeriod = "all" | "week" | "month";

export type StatsViewState =
  | { mode: "ranking"; year: string }
  | { mode: "compare" }
  | { mode: "trend"; period: TrendPeriod };

/**
 * 뷰 모드 전환 시 적절한 초기 상태를 반환한다.
 */
export function switchViewMode(mode: "ranking" | "compare" | "trend"): StatsViewState {
  switch (mode) {
    case "ranking":
      return { mode: "ranking", year: "전체" };
    case "compare":
      return { mode: "compare" };
    case "trend":
      return { mode: "trend", period: "all" };
  }
}

/**
 * 현재 뷰 상태에서 활성 모드를 반환한다.
 */
export function getActiveMode(view: StatsViewState): "ranking" | "compare" | "trend" {
  return view.mode;
}

/**
 * ranking 모드에서 연차를 변경한다.
 * ranking이 아니면 현재 상태를 그대로 반환한다.
 */
export function setRankingYear(view: StatsViewState, year: string): StatsViewState {
  if (view.mode !== "ranking") return view;
  return { mode: "ranking", year };
}

/**
 * trend 모드에서 기간을 변경한다.
 * trend가 아니면 현재 상태를 그대로 반환한다.
 */
export function setTrendPeriod(view: StatsViewState, period: TrendPeriod): StatsViewState {
  if (view.mode !== "trend") return view;
  return { mode: "trend", period };
}

/**
 * 현재 뷰에서 연차 선택값을 추출한다.
 * ranking이 아니면 null을 반환한다.
 */
export function deriveSelectedYear(view: StatsViewState): string | null {
  return view.mode === "ranking" ? view.year : null;
}

/**
 * 현재 뷰에서 트렌드 기간을 추출한다.
 * trend가 아니면 null을 반환한다.
 */
export function deriveTrendPeriod(view: StatsViewState): TrendPeriod | null {
  return view.mode === "trend" ? view.period : null;
}

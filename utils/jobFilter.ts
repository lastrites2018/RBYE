/**
 * 공고 페이지 필터 로직 — 순수 함수로 분리
 *
 * Simple Made Easy 원칙:
 * - 필터 "의도"를 하나의 값(FilterState)으로 표현
 * - fetch URL 결정, 활성 버튼 판별, 검색어 추출이 모두 이 값에서 파생
 * - 서로 다른 관심사가 엮이지 않음
 */

export type FilterState =
  | { mode: "all" }
  | { mode: "year"; year: number }
  | { mode: "noLimit" }
  | { mode: "search"; keyword: string; label: string }
  | { mode: "bookmarks" };

/**
 * 필터 상태로부터 fetch URL을 결정한다.
 * null을 반환하면 SSR props.data를 그대로 사용한다는 뜻.
 */
export function buildFetchUrl(
  filter: FilterState,
  type: string,
  apiUrl: string
): string | null {
  switch (filter.mode) {
    case "all":
      return null; // props.data 사용
    case "year":
      return `${apiUrl}/${type}?contentObj.requirement_like=${filter.year}년`;
    case "noLimit":
      return `${apiUrl}/${type}`;
    case "search":
      if (!filter.keyword) return null;
      return `${apiUrl}/${type}?q=${encodeURIComponent(filter.keyword)}`;
    case "bookmarks":
      return null; // localStorage에서 직접 로드
  }
}

/**
 * 필터 상태에서 하이라이트용 검색어를 추출한다.
 */
export function deriveSearchKeyword(filter: FilterState): string {
  return filter.mode === "search" ? filter.keyword : "";
}

/**
 * 제한없음 모드의 클라이언트 필터링.
 * "년"이 포함된 requirement가 없는 공고만 남긴다.
 */
export function filterNoLimitData(data: Job[]): Job[] {
  return data.filter(
    (item) =>
      item.contentObj?.requirement &&
      !item.contentObj.requirement.includes("년")
  );
}

/**
 * 현재 필터 상태에서 특정 버튼이 활성인지 판별한다.
 */
export function isButtonActive(
  filter: FilterState,
  buttonId: string,
  buttonYear?: number
): boolean {
  switch (buttonId) {
    case "전체":
      return filter.mode === "all";
    case "햇수":
      return filter.mode === "year" && filter.year === (buttonYear || 0);
    case "제한없음":
      return filter.mode === "noLimit";
    case "bookmarks":
      return filter.mode === "bookmarks";
    default:
      // 신입, 주니어, senior 등 검색 라벨 매칭
      return filter.mode === "search" && filter.label === buttonId;
  }
}

/**
 * 버튼 클릭을 FilterState 값으로 변환한다.
 */
export function buttonToFilter(buttonId: string, year?: number): FilterState {
  switch (buttonId) {
    case "전체":
      return { mode: "all" };
    case "햇수":
      return { mode: "year", year: year || 1 };
    case "제한없음":
      return { mode: "noLimit" };
    case "bookmarks":
      return { mode: "bookmarks" };
    case "신입":
      return { mode: "search", keyword: "신입", label: "신입" };
    case "주니어":
      return { mode: "search", keyword: "주니어", label: "주니어" };
    case "senior":
      return { mode: "search", keyword: "시니어", label: "senior" };
    default:
      // 커스텀 검색
      return { mode: "search", keyword: buttonId, label: buttonId };
  }
}

/**
 * 무한스크롤이 활성화되는 조건.
 */
export function isInfiniteScrollEnabled(filter: FilterState): boolean {
  return filter.mode === "all";
}

/**
 * 즐겨찾기 모드인지 판별.
 */
export function isBookmarksMode(filter: FilterState): boolean {
  return filter.mode === "bookmarks";
}

/**
 * BookmarkEntry 배열을 Job 배열로 변환한다.
 * 누락된 필드는 빈 값으로 채운다.
 */
export function bookmarksToJobs(bookmarks: BookmarkEntry[]): Job[] {
  return [...bookmarks].reverse().map((b, i) => ({
    no: i,
    companyName: b.companyName,
    subject: b.subject,
    link: b.link,
    contentObj: b.contentObj || { requirement: "", preferentialTreatment: "", mainTask: "" },
    closingDate: "",
    workingArea: "",
  }));
}

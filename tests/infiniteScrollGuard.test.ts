// 책임: 무한스크롤이 올바른 조건에서만 추가 데이터를 요청한다
import { describe, test, expect } from "bun:test";

interface ScrollState {
  currentCategory: string;
  loading: boolean;
  searchKeyword: string;
}

/**
 * [type].tsx handleIntersect 내부의 "추가 로드 여부" 판단 로직 추출
 * 실제로 loadMoreData를 호출해야 하면 true 반환
 */
function shouldLoadMore(
  state: ScrollState,
  isIntersecting: boolean,
  currentPage: number,
  totalPage: number
): boolean {
  return (
    state.currentCategory === "전체" &&
    isIntersecting &&
    !state.loading &&
    !state.searchKeyword &&
    currentPage < totalPage
  );
}

/**
 * 전체가 아닌 카테고리일 때 observer를 해제해야 하는지 판단
 */
function shouldUnobserve(currentCategory: string): boolean {
  return currentCategory !== "전체";
}

describe("무한스크롤 추가 로드 조건", () => {
  const baseState: ScrollState = {
    currentCategory: "전체",
    loading: false,
    searchKeyword: "",
  };

  // --- 로드해야 하는 경우 ---

  test("전체 카테고리 + 화면 진입 + 로딩 아님 + 검색 없음 + 다음 페이지 있음 → 로드", () => {
    expect(shouldLoadMore(baseState, true, 1, 5)).toBe(true);
  });

  // --- 로드하지 않는 경우 ---

  test("화면에 진입하지 않았으면 로드하지 않는다", () => {
    expect(shouldLoadMore(baseState, false, 1, 5)).toBe(false);
  });

  test("로딩 중이면 로드하지 않는다", () => {
    expect(shouldLoadMore({ ...baseState, loading: true }, true, 1, 5)).toBe(false);
  });

  test("검색 키워드가 있으면 로드하지 않는다", () => {
    expect(shouldLoadMore({ ...baseState, searchKeyword: "react" }, true, 1, 5)).toBe(false);
  });

  test("마지막 페이지면 로드하지 않는다", () => {
    expect(shouldLoadMore(baseState, true, 5, 5)).toBe(false);
  });

  test("currentPage > totalPage면 로드하지 않는다", () => {
    expect(shouldLoadMore(baseState, true, 6, 5)).toBe(false);
  });

  test("전체가 아닌 카테고리면 로드하지 않는다 (햇수)", () => {
    expect(shouldLoadMore({ ...baseState, currentCategory: "햇수" }, true, 1, 5)).toBe(false);
  });

  test("전체가 아닌 카테고리면 로드하지 않는다 (제한없음)", () => {
    expect(shouldLoadMore({ ...baseState, currentCategory: "제한없음" }, true, 1, 5)).toBe(false);
  });

  test("전체가 아닌 카테고리면 로드하지 않는다 (신입)", () => {
    expect(shouldLoadMore({ ...baseState, currentCategory: "신입" }, true, 1, 5)).toBe(false);
  });

  // --- 복합 조건 ---

  test("모든 차단 조건이 동시에 해당되어도 false 반환", () => {
    expect(
      shouldLoadMore({ currentCategory: "햇수", loading: true, searchKeyword: "java" }, false, 5, 5)
    ).toBe(false);
  });
});

describe("observer 해제 조건", () => {
  test("전체 카테고리면 해제하지 않는다", () => {
    expect(shouldUnobserve("전체")).toBe(false);
  });

  test("햇수 카테고리면 해제한다", () => {
    expect(shouldUnobserve("햇수")).toBe(true);
  });

  test("제한없음 카테고리면 해제한다", () => {
    expect(shouldUnobserve("제한없음")).toBe(true);
  });

  test("신입 카테고리면 해제한다", () => {
    expect(shouldUnobserve("신입")).toBe(true);
  });
});

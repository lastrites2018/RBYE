// 책임: 지연 실행 + 취소 패턴의 상태 전이가 올바르다
import { describe, test, expect } from "bun:test";

/**
 * usePendingAction의 상태 전이 로직 — 순수 함수로 추출
 */
type PendingState<T> = { pendingId: T | null };

function startPending<T>(id: T): PendingState<T> {
  return { pendingId: id };
}

function cancelPending<T>(): PendingState<T> {
  return { pendingId: null };
}

function isPending<T>(state: PendingState<T>, id: T): boolean {
  return state.pendingId === id;
}

describe("지연 실행 상태 전이", () => {
  test("start 시 pendingId가 설정된다", () => {
    const state = startPending("company-A");
    expect(state.pendingId).toBe("company-A");
  });

  test("cancel 시 pendingId가 null이 된다", () => {
    const state = cancelPending();
    expect(state.pendingId).toBeNull();
  });

  test("isPending이 해당 id에 대해 true를 반환한다", () => {
    const state = startPending("company-A");
    expect(isPending(state, "company-A")).toBe(true);
    expect(isPending(state, "company-B")).toBe(false);
  });

  test("cancel 후 isPending은 false를 반환한다", () => {
    const state = cancelPending<string>();
    expect(isPending(state, "company-A")).toBe(false);
  });

  test("다른 id로 start하면 이전 pending이 교체된다", () => {
    const state1 = startPending("company-A");
    const state2 = startPending("company-B");
    expect(isPending(state2, "company-A")).toBe(false);
    expect(isPending(state2, "company-B")).toBe(true);
  });
});

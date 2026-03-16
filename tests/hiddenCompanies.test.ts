// 책임: 숨긴 회사 목록의 추가/제거/판별 로직이 올바르다
import { describe, test, expect } from "bun:test";

/**
 * useHiddenCompanies의 상태 전이 로직 — 순수 함수
 */
function hideCompany(prev: string[], companyName: string): string[] {
  if (prev.includes(companyName)) return prev;
  return [...prev, companyName];
}

function unhideCompany(prev: string[], companyName: string): string[] {
  return prev.filter((c) => c !== companyName);
}

function isCompanyHidden(list: string[], companyName: string): boolean {
  return list.includes(companyName);
}

describe("숨긴 회사 추가", () => {
  test("빈 목록에 회사를 추가한다", () => {
    const result = hideCompany([], "카카오");
    expect(result).toEqual(["카카오"]);
  });

  test("기존 목록에 새 회사를 추가한다", () => {
    const result = hideCompany(["카카오"], "네이버");
    expect(result).toEqual(["카카오", "네이버"]);
  });

  test("이미 숨긴 회사를 다시 추가하면 변경 없다", () => {
    const prev = ["카카오", "네이버"];
    const result = hideCompany(prev, "카카오");
    expect(result).toBe(prev); // 동일 참조
  });
});

describe("숨긴 회사 제거", () => {
  test("목록에서 회사를 제거한다", () => {
    const result = unhideCompany(["카카오", "네이버"], "카카오");
    expect(result).toEqual(["네이버"]);
  });

  test("없는 회사를 제거하면 변경 없다", () => {
    const result = unhideCompany(["카카오"], "네이버");
    expect(result).toEqual(["카카오"]);
  });

  test("마지막 회사를 제거하면 빈 배열이 된다", () => {
    const result = unhideCompany(["카카오"], "카카오");
    expect(result).toEqual([]);
  });
});

describe("숨긴 회사 판별", () => {
  test("숨긴 회사는 true를 반환한다", () => {
    expect(isCompanyHidden(["카카오", "네이버"], "카카오")).toBe(true);
  });

  test("숨기지 않은 회사는 false를 반환한다", () => {
    expect(isCompanyHidden(["카카오"], "네이버")).toBe(false);
  });

  test("빈 목록에서는 항상 false를 반환한다", () => {
    expect(isCompanyHidden([], "카카오")).toBe(false);
  });
});

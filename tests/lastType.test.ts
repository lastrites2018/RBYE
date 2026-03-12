// 책임: lastType 저장/복원 로직이 VALID_TYPES 경계를 올바르게 지킨다
import { describe, test, expect } from "bun:test";
import { VALID_TYPES } from "../utils/constants";

/**
 * useLocalPreferences.setLastType의 검증 로직 추출
 * 유효한 타입이면 저장할 값 반환, 아니면 null
 */
function validateLastType(type: string): string | null {
  return VALID_TYPES.includes(type) ? type : null;
}

/**
 * useLocalPreferences.getLastType의 복원 로직 추출
 * 저장된 값이 유효하면 반환, 아니면 기본값 "frontend"
 */
function resolveLastType(saved: string): string {
  return VALID_TYPES.includes(saved) ? saved : "frontend";
}

describe("lastType 저장 검증", () => {
  test.each(VALID_TYPES)("%s는 유효한 타입이다", (type) => {
    expect(validateLastType(type)).toBe(type);
  });

  test("유효하지 않은 타입은 null을 반환한다", () => {
    expect(validateLastType("invalid")).toBeNull();
  });

  test("빈 문자열은 null을 반환한다", () => {
    expect(validateLastType("")).toBeNull();
  });

  test("대소문자가 다르면 null을 반환한다", () => {
    expect(validateLastType("Frontend")).toBeNull();
    expect(validateLastType("NODEJS")).toBeNull();
  });
});

describe("lastType 복원", () => {
  test.each(VALID_TYPES)("저장된 %s를 그대로 반환한다", (type) => {
    expect(resolveLastType(type)).toBe(type);
  });

  test("유효하지 않은 저장값이면 frontend를 반환한다", () => {
    expect(resolveLastType("invalid")).toBe("frontend");
  });

  test("빈 문자열이면 frontend를 반환한다", () => {
    expect(resolveLastType("")).toBe("frontend");
  });
});

describe("VALID_TYPES 상수 무결성", () => {
  test("4개의 카테고리를 포함한다", () => {
    expect(VALID_TYPES).toHaveLength(4);
  });

  test("frontend, nodejs, server, pm을 포함한다", () => {
    expect(VALID_TYPES).toContain("frontend");
    expect(VALID_TYPES).toContain("nodejs");
    expect(VALID_TYPES).toContain("server");
    expect(VALID_TYPES).toContain("pm");
  });

  test("모두 소문자 영문이다", () => {
    expect(VALID_TYPES.every((t) => /^[a-z]+$/.test(t))).toBe(true);
  });
});

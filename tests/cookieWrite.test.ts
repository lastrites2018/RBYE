// 책임: 쿠키에 타입을 쓸 때 VALID_TYPES 검증이 동작하는지 검증한다
import { describe, test, expect } from "bun:test";
import { VALID_TYPES } from "../utils/constants";

/**
 * [type].tsx의 쿠키 쓰기 조건을 추출한 순수 함수
 * 유효한 타입일 때만 쿠키 문자열을 반환, 아니면 null
 */
function buildCookieString(type: string): string | null {
  if (!VALID_TYPES.includes(type)) return null;
  return `rbye_last_type=${type};path=/;max-age=31536000`;
}

describe("쿠키 쓰기 타입 검증", () => {
  // --- 유효한 타입: 쿠키 생성 ---

  test("frontend는 유효하므로 쿠키를 생성한다", () => {
    expect(buildCookieString("frontend")).toBe(
      "rbye_last_type=frontend;path=/;max-age=31536000"
    );
  });

  test("nodejs는 유효하므로 쿠키를 생성한다", () => {
    expect(buildCookieString("nodejs")).not.toBeNull();
  });

  test("server는 유효하므로 쿠키를 생성한다", () => {
    expect(buildCookieString("server")).not.toBeNull();
  });

  test("pm은 유효하므로 쿠키를 생성한다", () => {
    expect(buildCookieString("pm")).not.toBeNull();
  });

  // --- 유효하지 않은 타입: 쿠키 미생성 ---

  test("유효하지 않은 타입이면 쿠키를 생성하지 않는다", () => {
    expect(buildCookieString("invalid")).toBeNull();
  });

  test("빈 문자열이면 쿠키를 생성하지 않는다", () => {
    expect(buildCookieString("")).toBeNull();
  });

  test("세미콜론이 포함된 값은 쿠키를 생성하지 않는다", () => {
    expect(buildCookieString("frontend;path=/evil")).toBeNull();
  });

  test("XSS 시도 값은 쿠키를 생성하지 않는다", () => {
    expect(buildCookieString("<script>alert(1)</script>")).toBeNull();
  });

  test("대소문자가 다른 타입은 쿠키를 생성하지 않는다", () => {
    expect(buildCookieString("Frontend")).toBeNull();
    expect(buildCookieString("NODEJS")).toBeNull();
  });
});

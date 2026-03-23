// 책임: 쿠키의 rbye_last_type 값에 따라 올바른 리다이렉트 판단을 한다
import { describe, test, expect } from "bun:test";
import { VALID_TYPES } from "../utils/constants";

/**
 * index.tsx getServerSideProps의 쿠키 파싱 로직을 추출한 순수 함수
 * 리다이렉트 대상 경로를 반환하거나, 리다이렉트 불필요 시 null 반환
 */
function getRedirectDestination(cookieHeader: string): string | null {
  const match = cookieHeader.match(/rbye_last_type=(\w+)/);
  const lastType = match?.[1];
  if (lastType && VALID_TYPES.includes(lastType) && lastType !== VALID_TYPES[0]) {
    return `/t/${lastType}`;
  }
  return null;
}

describe("쿠키 기반 리다이렉트 판단", () => {
  // --- 리다이렉트 해야 하는 케이스 ---

  test("rbye_last_type=nodejs 이면 /t/nodejs로 리다이렉트한다", () => {
    expect(getRedirectDestination("rbye_last_type=nodejs")).toBe("/t/nodejs");
  });

  test("rbye_last_type=server 이면 /t/server로 리다이렉트한다", () => {
    expect(getRedirectDestination("rbye_last_type=server")).toBe("/t/server");
  });

  test("rbye_last_type=pm 이면 /t/pm로 리다이렉트한다", () => {
    expect(getRedirectDestination("rbye_last_type=pm")).toBe("/t/pm");
  });

  test("다른 쿠키와 함께 있어도 올바르게 파싱한다", () => {
    expect(
      getRedirectDestination("theme=dark; rbye_last_type=server; lang=ko")
    ).toBe("/t/server");
  });

  // --- 리다이렉트 하지 않는 케이스 ---

  test(`${VALID_TYPES[0]} 이면 리다이렉트하지 않는다 (기본값)`, () => {
    expect(getRedirectDestination(`rbye_last_type=${VALID_TYPES[0]}`)).toBeNull();
  });

  test("쿠키가 빈 문자열이면 리다이렉트하지 않는다", () => {
    expect(getRedirectDestination("")).toBeNull();
  });

  test("rbye_last_type 쿠키가 없으면 리다이렉트하지 않는다", () => {
    expect(getRedirectDestination("theme=dark; lang=ko")).toBeNull();
  });

  test("유효하지 않은 타입이면 리다이렉트하지 않는다", () => {
    expect(getRedirectDestination("rbye_last_type=invalid")).toBeNull();
  });

  test("XSS 시도 값은 리다이렉트하지 않는다", () => {
    expect(
      getRedirectDestination("rbye_last_type=<script>alert(1)</script>")
    ).toBeNull();
  });
});

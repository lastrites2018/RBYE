// 책임: 검색어가 API URL에 안전하게 인코딩되는지 검증한다
import { describe, test, expect } from "bun:test";

/**
 * [type].tsx의 검색 API URL 생성 로직을 추출한 순수 함수
 */
function buildSearchUrl(apiUrl: string, type: string, keyword: string): string {
  return `${apiUrl}/${type}?q=${encodeURIComponent(keyword)}`;
}

describe("검색어 URL 인코딩", () => {
  const base = "https://rbye-api.vercel.app";

  test("일반 한글 검색어는 인코딩된다", () => {
    const url = buildSearchUrl(base, "frontend", "리액트");
    expect(url).toBe(`${base}/frontend?q=${encodeURIComponent("리액트")}`);
    expect(url).not.toContain("리액트");
  });

  test("& 문자가 포함된 검색어가 쿼리 파라미터를 깨뜨리지 않는다", () => {
    const url = buildSearchUrl(base, "frontend", "node.js&express");
    expect(url).toContain("q=node.js%26express");
    // &가 그대로 들어가면 express가 별도 파라미터로 해석됨
    expect(url).not.toContain("q=node.js&express");
  });

  test("C++ 같은 + 문자가 올바르게 인코딩된다", () => {
    const url = buildSearchUrl(base, "server", "C++");
    expect(url).toContain("q=C%2B%2B");
  });

  test("# 문자가 URL fragment로 해석되지 않는다", () => {
    const url = buildSearchUrl(base, "frontend", "C#");
    expect(url).toContain("q=C%23");
  });

  test("= 문자가 쿼리 값 구분자로 해석되지 않는다", () => {
    const url = buildSearchUrl(base, "frontend", "key=value");
    expect(url).toContain("q=key%3Dvalue");
  });

  test("공백은 %20으로 인코딩된다", () => {
    const url = buildSearchUrl(base, "frontend", "react native");
    expect(url).toContain("q=react%20native");
  });

  test("빈 검색어도 정상 URL을 생성한다", () => {
    const url = buildSearchUrl(base, "frontend", "");
    expect(url).toBe(`${base}/frontend?q=`);
  });
});

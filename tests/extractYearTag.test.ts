// 책임: 공고 requirement 텍스트에서 연차 태그를 올바르게 추출한다
import { describe, test, expect } from "bun:test";
import extractYearTag from "../utils/extractYearTag";

describe("extractYearTag", () => {
  test("'3년 이상' → '3년 이상'", () => {
    expect(extractYearTag("경력 3년 이상의 개발자")).toBe("3년 이상");
  });

  test("'5년 이하' → '5년 이하'", () => {
    expect(extractYearTag("경력 5년 이하")).toBe("5년 이하");
  });

  test("'3~5년' → '3~5년'", () => {
    expect(extractYearTag("경력 3~5년 경험자")).toBe("3~5년");
  });

  test("시니어 키워드 → '시니어'", () => {
    expect(extractYearTag("시니어 개발자 모집")).toBe("시니어");
  });

  test("주니어 키워드 → '주니어'", () => {
    expect(extractYearTag("주니어 프론트엔드")).toBe("주니어");
  });

  test("신입 키워드 → '신입'", () => {
    expect(extractYearTag("신입 개발자 채용")).toBe("신입");
  });

  test("bare '3년' → '3년'", () => {
    expect(extractYearTag("개발 경력 3년")).toBe("3년");
  });

  test("연차 정보 없으면 null", () => {
    expect(extractYearTag("React 경험자 우대")).toBeNull();
  });

  test("undefined 입력 → null", () => {
    expect(extractYearTag(undefined)).toBeNull();
  });

  test("빈 문자열 → null", () => {
    expect(extractYearTag("")).toBeNull();
  });

  test("'N년 이상'이 '범위'보다 우선하지 않는다 (3~5년이 먼저 매칭)", () => {
    expect(extractYearTag("3~5년 경력 또는 5년 이상")).toBe("3~5년");
  });
});

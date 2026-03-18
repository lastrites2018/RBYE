// 책임: 공고 제목+본문에서 연차 태그를 올바르게 추출한다 (제목 우선)
import { describe, test, expect } from "bun:test";
import extractYearTag from "../utils/extractYearTag";

describe("extractYearTag — 본문 파싱", () => {
  test("'3년 이상' → '3년 이상'", () => {
    expect(extractYearTag(undefined, "경력 3년 이상의 개발자")).toBe("3년 이상");
  });

  test("'5년 이하' → '5년 이하'", () => {
    expect(extractYearTag(undefined, "경력 5년 이하")).toBe("5년 이하");
  });

  test("'3~5년' → '3~5년'", () => {
    expect(extractYearTag(undefined, "경력 3~5년 경험자")).toBe("3~5년");
  });

  test("시니어 키워드 → '시니어'", () => {
    expect(extractYearTag(undefined, "시니어 개발자 모집")).toBe("시니어");
  });

  test("주니어 키워드 → '주니어'", () => {
    expect(extractYearTag(undefined, "주니어 프론트엔드")).toBe("주니어");
  });

  test("신입 키워드 → '신입'", () => {
    expect(extractYearTag(undefined, "신입 개발자 채용")).toBe("신입");
  });

  test("bare '3년' → '3년'", () => {
    expect(extractYearTag(undefined, "개발 경력 3년")).toBe("3년");
  });

  test("연차 정보 없으면 null", () => {
    expect(extractYearTag(undefined, "React 경험자 우대")).toBeNull();
  });

  test("둘 다 undefined → null", () => {
    expect(extractYearTag(undefined, undefined)).toBeNull();
  });
});

describe("extractYearTag — 제목 우선", () => {
  test("제목에 '10년 이상' 있으면 본문의 '3년 이하'보다 우선", () => {
    expect(extractYearTag(
      "UX Senior,Team Leader 기획자 10년 이상",
      "실 설계 경험이 최근 3년 이하인 분"
    )).toBe("10년 이상");
  });

  test("제목에 시니어 있으면 본문보다 우선", () => {
    expect(extractYearTag(
      "시니어 백엔드 개발자",
      "경력 3년 이상"
    )).toBe("시니어");
  });

  test("제목에 연차 정보 없으면 본문에서 추출", () => {
    expect(extractYearTag(
      "프론트엔드 개발자",
      "경력 5년 이상"
    )).toBe("5년 이상");
  });

  test("제목에 연차 있고 본문 없어도 동작", () => {
    expect(extractYearTag("주니어 개발자 모집", undefined)).toBe("주니어");
  });
});

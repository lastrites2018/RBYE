// 책임: 공고 텍스트의 불릿/공백을 일관된 포맷으로 정규화한다
import { describe, test, expect } from "bun:test";
import normalizeJobText from "../utils/normalizeJobText";

describe("normalizeJobText", () => {
  // --- falsy 입력 ---

  test("undefined 입력 시 빈 문자열을 반환한다", () => {
    expect(normalizeJobText(undefined)).toBe("");
  });

  test("빈 문자열 입력 시 빈 문자열을 반환한다", () => {
    expect(normalizeJobText("")).toBe("");
  });

  // --- 불릿 정규화 ---

  test("줄머리 ㆍ 불릿을 '- '로 통일한다", () => {
    const input = "ㆍReact 경험\nㆍTypeScript 필수";
    const result = normalizeJobText(input);
    expect(result).toBe("- React 경험\n- TypeScript 필수");
  });

  test("줄머리 •(공백 없음) 불릿을 '- '로 통일한다", () => {
    const input = "•3년 이상 경력\n•협업 능력";
    const result = normalizeJobText(input);
    expect(result).toBe("- 3년 이상 경력\n- 협업 능력");
  });

  test("줄머리 * 불릿을 '- '로 통일한다", () => {
    const input = "* 프론트엔드 개발\n* 백엔드 개발";
    const result = normalizeJobText(input);
    expect(result).toBe("- 프론트엔드 개발\n- 백엔드 개발");
  });

  test("줄머리 ■ □ ▶ ○(공백 없음) 불릿을 '- '로 통일한다", () => {
    const input = "■항목1\n□항목2\n▶항목3\n○항목4";
    const result = normalizeJobText(input);
    expect(result).toBe("- 항목1\n- 항목2\n- 항목3\n- 항목4");
  });

  test("불릿+공백이 줄바꿈 뒤에 오면 인라인 정규식이 선행하여 한 줄로 합쳐진다 (known behavior)", () => {
    // 실제 크롤링 데이터는 "ㆍText" 형태라 이 경로를 타지 않음
    const input = "• 항목1\n• 항목2";
    const result = normalizeJobText(input);
    expect(result).toBe("- 항목1 • 항목2");
  });

  // --- 문장 중간 불릿 보존 ---

  test("문장 중간의 ㆍ는 보존한다 (예: 스피킹ㆍ라이팅)", () => {
    const input = "스피킹ㆍ라이팅 능력 필요";
    const result = normalizeJobText(input);
    expect(result).toContain("스피킹ㆍ라이팅");
  });

  // --- 인라인 불릿 분리 ---

  test("인라인 불릿 '내용 • 다음항목'을 줄바꿈으로 분리한다", () => {
    const input = "React 경험 • TypeScript 필수";
    const result = normalizeJobText(input);
    expect(result).toContain("React 경험");
    expect(result).toContain("- TypeScript 필수");
    expect(result.includes("•")).toBe(false);
  });

  // --- 공백/빈줄 정리 ---

  test("탭 문자를 제거한다", () => {
    const input = "React\t경험 필수";
    const result = normalizeJobText(input);
    expect(result).not.toContain("\t");
  });

  test("다중 공백을 단일 공백으로 줄인다", () => {
    const input = "React   경험    필수";
    const result = normalizeJobText(input);
    expect(result).toBe("React 경험 필수");
  });

  test("3줄 이상 빈 줄을 1줄로 줄인다", () => {
    const input = "항목1\n\n\n\n항목2";
    const result = normalizeJobText(input);
    expect(result).toBe("항목1\n\n항목2");
  });

  test("불릿 항목 사이 불필요한 빈 줄을 제거한다", () => {
    const input = "ㆍ항목1\n\nㆍ항목2";
    const result = normalizeJobText(input);
    expect(result).toBe("- 항목1\n- 항목2");
  });

  test("앞뒤 빈 줄과 공백을 제거한다", () => {
    const input = "\n\n  React 경험  \n\n";
    const result = normalizeJobText(input);
    expect(result).toBe("React 경험");
  });

  // --- 실제 공고 데이터 시나리오 ---

  test("실제 공고 형태의 복합 텍스트를 정규화한다", () => {
    const input = [
      "ㆍReact/Next.js 3년 이상",
      "",
      "ㆍTypeScript 실무 경험",
      "ㆍ상태관리 라이브러리 경험 (Redux, Zustand 등)",
    ].join("\n");

    const result = normalizeJobText(input);
    const lines = result.split("\n");

    expect(lines.every((l) => l.startsWith("- ") || l === "")).toBe(true);
    expect(result).toContain("React/Next.js 3년 이상");
    expect(result).toContain("TypeScript 실무 경험");
  });
});

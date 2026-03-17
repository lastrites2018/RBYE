// 책임: normalizeJobText → expandBullets 파이프라인이 실제 공고 텍스트를 올바르게 처리한다
import { describe, test, expect } from "bun:test";
import normalizeJobText from "../utils/normalizeJobText";
import expandBullets from "../utils/expandBullets";

function pipeline(text: string | undefined): string {
  return expandBullets(normalizeJobText(text));
}

describe("normalizeJobText → expandBullets 파이프라인", () => {
  test("인라인 • 불릿이 각각 줄바꿈된다", () => {
    const input =
      "- 게임 산업에서 사업 PM 경험 • 시장에 대한 이해 • 퍼블리싱 전략 수립";
    const lines = pipeline(input).split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(3);
    expect(lines[0]).toContain("게임 산업");
    expect(lines[1]).toContain("시장에 대한 이해");
  });

  test("ㆍ 줄머리 불릿이 - 로 통일된 뒤 줄바꿈된다", () => {
    const input = "ㆍReact 3년 이상\nㆍTypeScript 필수\nㆍ상태관리 경험";
    const result = pipeline(input);
    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines.every((l) => l.trim().startsWith("- "))).toBe(true);
  });

  test("번호 항목 + 인라인 • 가 모두 분리된다", () => {
    const input =
      "1. 자산 구조화 • 수익 데이터 분석 2. 글로벌 사업 관리 • 파트너사 커뮤니케이션";
    const lines = pipeline(input).split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(4);
  });

  test("문장 중간 ㆍ (스피킹ㆍ라이팅)는 보존된다", () => {
    const input = "ㆍ스피킹ㆍ라이팅 능력 필요";
    const result = pipeline(input);
    expect(result).toContain("스피킹ㆍ라이팅");
  });

  test("이미 줄바꿈된 텍스트는 중복 줄바꿈하지 않는다", () => {
    const input = "- 첫 번째\n- 두 번째\n- 세 번째";
    const result = pipeline(input);
    expect(result).toBe("- 첫 번째\n- 두 번째\n- 세 번째");
  });

  test("undefined 입력은 빈 문자열", () => {
    expect(pipeline(undefined)).toBe("");
  });

  test("실제 공고 전체 텍스트", () => {
    const input =
      "- 관련 직무 경력 3년 이상 • 영어 능통자 • 엔터테인먼트 산업에 대한 깊은 이해 • 논리적 사고를 바탕으로 데이터를 정량화하여 문서로 풀어낼 수 있는 역량";
    const lines = pipeline(input).split("\n");
    expect(lines).toHaveLength(4);
    expect(lines[0]).toContain("경력 3년");
    expect(lines[3]).toContain("논리적 사고");
  });
});

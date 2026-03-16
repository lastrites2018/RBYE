// 책임: expandBullets가 불릿 항목을 한 줄씩 분리하고, 기존 줄바꿈은 보존한다
import { describe, test, expect } from "bun:test";
import expandBullets from "../utils/expandBullets";

describe("expandBullets — 대시(-) 불릿", () => {
  test("인라인 불릿을 줄바꿈으로 분리한다", () => {
    const input = "- 첫 번째 항목 - 두 번째 항목 - 세 번째 항목";
    const result = expandBullets(input);
    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0].trim()).toBe("- 첫 번째 항목");
    expect(lines[1].trim()).toBe("- 두 번째 항목");
    expect(lines[2].trim()).toBe("- 세 번째 항목");
  });

  test("이미 줄바꿈된 불릿은 중복 줄바꿈하지 않는다", () => {
    const input = "- 첫 번째\n- 두 번째\n- 세 번째";
    const result = expandBullets(input);
    expect(result).toBe("- 첫 번째\n- 두 번째\n- 세 번째");
  });

  test("혼합된 경우: 일부는 줄바꿈, 일부는 인라인", () => {
    const input = "- 첫 번째\n- 두 번째 - 세 번째";
    const lines = expandBullets(input).split("\n");
    expect(lines).toHaveLength(3);
  });
});

describe("expandBullets — • 불릿", () => {
  test("인라인 •를 줄바꿈으로 분리한다", () => {
    const input = "- 경력 5년 이상 • 시장에 대한 이해 • 퍼블리싱 전략 수립";
    const lines = expandBullets(input).split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain("경력 5년");
    expect(lines[1]).toContain("시장에 대한 이해");
    expect(lines[2]).toContain("퍼블리싱 전략");
  });

  test("실제 공고: PM 카테고리", () => {
    const input =
      "- 게임 또는 콘텐츠 산업에서 사업 PM 경험 • 시장에 대한 이해, BM 구조 설계 • 퍼블리싱 전략 수립부터 런칭까지 리딩 경험";
    const lines = expandBullets(input).split("\n");
    expect(lines).toHaveLength(3);
  });

  test("•만으로 구성된 항목도 분리한다", () => {
    const input = "• 첫 번째 • 두 번째 • 세 번째";
    const lines = expandBullets(input).split("\n");
    expect(lines).toHaveLength(3);
  });
});

describe("expandBullets — 번호 항목", () => {
  test("1. 2. 3. 번호 항목을 줄바꿈으로 분리한다", () => {
    const input =
      "1. 엔터테인먼트 자산 구조화 • 음악, 공연 분석 2. 글로벌 사업 관리 • 파트너사 커뮤니케이션 3. 사업 지표 리포팅";
    const lines = expandBullets(input).split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(5);
    expect(lines[0]).toContain("1.");
  });

  test("이미 줄바꿈된 번호 항목은 중복 줄바꿈하지 않는다", () => {
    const input = "1. 첫 번째\n2. 두 번째";
    const result = expandBullets(input);
    expect(result).toBe("1. 첫 번째\n2. 두 번째");
  });
});

describe("expandBullets — 기타", () => {
  test("불릿이 없는 텍스트는 그대로 반환한다", () => {
    const input = "경력 5년 이상의 개발자를 찾습니다.";
    expect(expandBullets(input)).toBe(input);
  });

  test("빈 문자열은 빈 문자열을 반환한다", () => {
    expect(expandBullets("")).toBe("");
  });

  test("첫 줄이 불릿으로 시작하면 앞에 빈 줄 없음", () => {
    const input = "- 항목1 - 항목2";
    expect(expandBullets(input).startsWith("- ")).toBe(true);
  });

  test("문장 중간 ㆍ는 분리하지 않는다 (스피킹ㆍ라이팅)", () => {
    const input = "- 스피킹ㆍ라이팅 능력";
    expect(expandBullets(input)).toBe("- 스피킹ㆍ라이팅 능력");
  });

  test("복합 실제 공고 텍스트", () => {
    const input =
      "- 관련 직무 경력 3년 이상 • 영어 능통자 • 엔터테인먼트 산업에 대한 깊은 이해 • 논리적 사고력";
    const lines = expandBullets(input).split("\n");
    expect(lines).toHaveLength(4);
    expect(lines[0]).toContain("경력 3년");
    expect(lines[1]).toContain("영어 능통자");
    expect(lines[2]).toContain("엔터테인먼트");
    expect(lines[3]).toContain("논리적 사고력");
  });
});

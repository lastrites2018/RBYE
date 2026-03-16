// 책임: expandBullets가 불릿 항목을 한 줄씩 분리하고, 기존 줄바꿈은 보존한다
import { describe, test, expect } from "bun:test";
import expandBullets from "../utils/expandBullets";

describe("expandBullets", () => {
  test("인라인 불릿을 줄바꿈으로 분리한다", () => {
    const input = "- 첫 번째 항목 - 두 번째 항목 - 세 번째 항목";
    const result = expandBullets(input);
    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("- 첫 번째 항목 ");
    expect(lines[1]).toBe("- 두 번째 항목 ");
    expect(lines[2]).toBe("- 세 번째 항목");
  });

  test("이미 줄바꿈된 불릿은 중복 줄바꿈하지 않는다", () => {
    const input = "- 첫 번째\n- 두 번째\n- 세 번째";
    const result = expandBullets(input);
    expect(result).toBe("- 첫 번째\n- 두 번째\n- 세 번째");
  });

  test("혼합된 경우: 일부는 줄바꿈, 일부는 인라인", () => {
    const input = "- 첫 번째\n- 두 번째 - 세 번째";
    const result = expandBullets(input);
    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("- 첫 번째");
    expect(lines[1]).toBe("- 두 번째 ");
    expect(lines[2]).toBe("- 세 번째");
  });

  test("불릿이 없는 텍스트는 그대로 반환한다", () => {
    const input = "경력 5년 이상의 개발자를 찾습니다.";
    expect(expandBullets(input)).toBe(input);
  });

  test("빈 문자열은 빈 문자열을 반환한다", () => {
    expect(expandBullets("")).toBe("");
  });

  test("실제 공고 형태: normalizeJobText 결과에 적용", () => {
    // normalizeJobText가 이미 • → - 로 변환한 상태
    const normalized = "- 초기 스타트업에 들어오고 싶은 이유가 명확하신 분 - 데이터 기반의 뛰어난 분석력 - 우선순위를 명확히 설정하는 능력";
    const result = expandBullets(normalized);
    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain("초기 스타트업");
    expect(lines[1]).toContain("데이터 기반");
    expect(lines[2]).toContain("우선순위");
  });

  test("첫 줄이 불릿으로 시작하면 앞에 빈 줄 없음", () => {
    const input = "- 항목1 - 항목2";
    const result = expandBullets(input);
    expect(result.startsWith("- ")).toBe(true);
  });
});

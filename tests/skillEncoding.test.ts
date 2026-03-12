// 책임: 스킬셋 URL 공유를 위한 인코딩/디코딩이 정확하게 동작한다
import { describe, test, expect } from "bun:test";

/**
 * skillset.tsx의 encodeSkillsToParam 로직 추출
 */
function encodeSkillsToParam(skills: Set<string>): string {
  return Array.from(skills).sort().join(",");
}

/**
 * skillset.tsx의 decodeSkillsFromParam 로직 추출
 */
function decodeSkillsFromParam(param: string): Set<string> {
  if (!param) return new Set();
  return new Set(param.split(",").map((s) => decodeURIComponent(s.trim())).filter(Boolean));
}

describe("스킬 인코딩 (Set → 문자열)", () => {
  test("빈 Set은 빈 문자열이 된다", () => {
    expect(encodeSkillsToParam(new Set())).toBe("");
  });

  test("단일 스킬을 인코딩한다", () => {
    expect(encodeSkillsToParam(new Set(["React"]))).toBe("React");
  });

  test("여러 스킬을 알파벳순으로 정렬하여 인코딩한다", () => {
    const result = encodeSkillsToParam(new Set(["Vue", "React", "Angular"]));
    expect(result).toBe("Angular,React,Vue");
  });

  test("한글 스킬도 정렬하여 인코딩한다", () => {
    const result = encodeSkillsToParam(new Set(["타입스크립트", "리액트"]));
    expect(result).toBe("리액트,타입스크립트");
  });

  test("같은 Set은 항상 같은 문자열을 생성한다 (결정적)", () => {
    const set = new Set(["C", "B", "A"]);
    expect(encodeSkillsToParam(set)).toBe(encodeSkillsToParam(new Set(["A", "B", "C"])));
  });
});

describe("스킬 디코딩 (문자열 → Set)", () => {
  test("빈 문자열은 빈 Set이 된다", () => {
    expect(decodeSkillsFromParam("").size).toBe(0);
  });

  test("단일 스킬을 디코딩한다", () => {
    const result = decodeSkillsFromParam("React");
    expect(result.has("React")).toBe(true);
    expect(result.size).toBe(1);
  });

  test("쉼표로 구분된 여러 스킬을 디코딩한다", () => {
    const result = decodeSkillsFromParam("Angular,React,Vue");
    expect(result.size).toBe(3);
    expect(result.has("Angular")).toBe(true);
    expect(result.has("React")).toBe(true);
    expect(result.has("Vue")).toBe(true);
  });

  test("공백을 trim 한다", () => {
    const result = decodeSkillsFromParam(" React , Vue ");
    expect(result.has("React")).toBe(true);
    expect(result.has("Vue")).toBe(true);
  });

  test("빈 항목을 필터링한다", () => {
    const result = decodeSkillsFromParam("React,,Vue,");
    expect(result.size).toBe(2);
  });

  test("URL 인코딩된 문자를 디코딩한다", () => {
    const result = decodeSkillsFromParam("C%2B%2B,C%23");
    expect(result.has("C++")).toBe(true);
    expect(result.has("C#")).toBe(true);
  });
});

describe("인코딩 ↔ 디코딩 왕복", () => {
  test("인코딩 후 디코딩하면 원본 Set과 같다", () => {
    const original = new Set(["React", "TypeScript", "Next.js"]);
    const encoded = encodeSkillsToParam(original);
    const decoded = decodeSkillsFromParam(encoded);
    expect(decoded).toEqual(original);
  });

  test("빈 Set도 왕복이 보장된다", () => {
    const original = new Set<string>();
    const decoded = decodeSkillsFromParam(encodeSkillsToParam(original));
    expect(decoded.size).toBe(0);
  });
});

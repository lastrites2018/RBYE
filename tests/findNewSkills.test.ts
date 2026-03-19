// 책임: 이전 연차 대비 새로 등장한 스킬을 올바르게 감지한다
import { describe, test, expect } from "bun:test";
import findNewSkills, { getPrevYear } from "../utils/findNewSkills";

describe("findNewSkills", () => {
  test("이전 연차에 없던 스킬을 NEW로 감지한다", () => {
    const current = {
      기초: { skills: { React: 100, TypeScript: 80 } },
      인프라: { skills: { Docker: 30, Kubernetes: 15 } },
    };
    const prev = {
      기초: { skills: { React: 90, TypeScript: 70 } },
      인프라: { skills: {} },
    };
    const result = findNewSkills(current, prev);
    expect(result.has("Docker")).toBe(true);
    expect(result.has("Kubernetes")).toBe(true);
    expect(result.has("React")).toBe(false);
    expect(result.has("TypeScript")).toBe(false);
  });

  test("이전 연차가 null이면 빈 Set (비교 불가)", () => {
    const current = { 기초: { skills: { React: 100 } } };
    expect(findNewSkills(current, null).size).toBe(0);
  });

  test("모든 스킬이 이전에도 있으면 빈 Set", () => {
    const slots = { 기초: { skills: { React: 100 } } };
    expect(findNewSkills(slots, slots).size).toBe(0);
  });

  test("이전 연차의 다른 슬롯에 있던 스킬은 NEW가 아니다", () => {
    const current = { 인프라: { skills: { Docker: 30 } } };
    const prev = { 도구: { skills: { Docker: 10 } } };
    expect(findNewSkills(current, prev).has("Docker")).toBe(false);
  });

  test("빈 슬롯 데이터를 안전하게 처리한다", () => {
    expect(findNewSkills({}, {}).size).toBe(0);
  });
});

describe("getPrevYear", () => {
  test("2년 → 1년", () => {
    expect(getPrevYear("2년")).toBe("1년");
  });

  test("5년 → 4년", () => {
    expect(getPrevYear("5년")).toBe("4년");
  });

  test("10년 → 8년 (9년 건너뜀)", () => {
    expect(getPrevYear("10년")).toBe("8년");
  });

  test("1년 → null (최저 연차)", () => {
    expect(getPrevYear("1년")).toBeNull();
  });

  test("전체 → null", () => {
    expect(getPrevYear("전체")).toBeNull();
  });

  test("제한없음 → null", () => {
    expect(getPrevYear("제한없음")).toBeNull();
  });
});

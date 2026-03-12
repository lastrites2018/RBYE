// 책임: 기술 수요 등급이 빈도 순위 기준으로 올바르게 분류된다
import { describe, test, expect } from "bun:test";

type DemandLevel = "essential" | "core" | "preferred" | "bonus";

/**
 * skillset.tsx의 computeDemandLevels 로직 추출
 * 빈도순 정렬 후 상위 10% → essential, 30% → core, 60% → preferred, 나머지 → bonus
 */
function computeDemandLevels(flatStats: { [skill: string]: number } | undefined): Map<string, DemandLevel> {
  const map = new Map<string, DemandLevel>();
  if (!flatStats) return map;
  const entries = Object.entries(flatStats).sort(([, a], [, b]) => b - a);
  const total = entries.length;
  if (total === 0) return map;
  entries.forEach(([skill], i) => {
    const rank = i / total;
    if (rank < 0.1) map.set(skill, "essential");
    else if (rank < 0.3) map.set(skill, "core");
    else if (rank < 0.6) map.set(skill, "preferred");
    else map.set(skill, "bonus");
  });
  return map;
}

describe("수요 등급 분류", () => {
  test("undefined 입력 시 빈 Map을 반환한다", () => {
    expect(computeDemandLevels(undefined).size).toBe(0);
  });

  test("빈 객체 입력 시 빈 Map을 반환한다", () => {
    expect(computeDemandLevels({}).size).toBe(0);
  });

  test("10개 기술 중 상위 1개(10%)는 essential이다", () => {
    const stats: { [k: string]: number } = {};
    for (let i = 0; i < 10; i++) stats[`skill${i}`] = 100 - i;
    const result = computeDemandLevels(stats);
    expect(result.get("skill0")).toBe("essential");
  });

  test("10개 기술 중 2~3번째(10~30%)는 core이다", () => {
    const stats: { [k: string]: number } = {};
    for (let i = 0; i < 10; i++) stats[`skill${i}`] = 100 - i;
    const result = computeDemandLevels(stats);
    expect(result.get("skill1")).toBe("core");
    expect(result.get("skill2")).toBe("core");
  });

  test("10개 기술 중 4~6번째(30~60%)는 preferred이다", () => {
    const stats: { [k: string]: number } = {};
    for (let i = 0; i < 10; i++) stats[`skill${i}`] = 100 - i;
    const result = computeDemandLevels(stats);
    expect(result.get("skill3")).toBe("preferred");
    expect(result.get("skill4")).toBe("preferred");
    expect(result.get("skill5")).toBe("preferred");
  });

  test("10개 기술 중 7번째 이후(60%~)는 bonus이다", () => {
    const stats: { [k: string]: number } = {};
    for (let i = 0; i < 10; i++) stats[`skill${i}`] = 100 - i;
    const result = computeDemandLevels(stats);
    expect(result.get("skill6")).toBe("bonus");
    expect(result.get("skill9")).toBe("bonus");
  });

  test("1개 기술이면 essential이다 (0/1 = 0 < 0.1)", () => {
    const result = computeDemandLevels({ React: 50 });
    expect(result.get("React")).toBe("essential");
  });

  test("동일 빈도의 기술들도 정렬 순서대로 등급이 매겨진다", () => {
    const stats = { A: 10, B: 10, C: 10, D: 10, E: 10 };
    const result = computeDemandLevels(stats);
    // 5개: essential < 0.5개 → 0번째만 essential (0/5=0)
    // core: 1번째 (0.2), preferred: 2번째(0.4), 3번째 이후 bonus? 아니 3/5=0.6 → bonus
    expect(result.size).toBe(5);
    const levels = Array.from(result.values());
    expect(levels.filter((l) => l === "essential").length).toBe(1);
  });

  test("모든 기술이 Map에 포함된다", () => {
    const stats = { React: 50, Vue: 30, Angular: 10 };
    const result = computeDemandLevels(stats);
    expect(result.size).toBe(3);
    expect(result.has("React")).toBe(true);
    expect(result.has("Vue")).toBe(true);
    expect(result.has("Angular")).toBe(true);
  });
});

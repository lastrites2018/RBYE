// 책임: 스킬셋 커버리지와 추천 로직이 올바르게 계산된다
import { describe, test, expect } from "bun:test";

/**
 * skillset.tsx의 커버리지 퍼센트 계산 로직 추출
 */
function calcCoverage(checkedCount: number, totalSkills: number): number {
  return totalSkills > 0 ? Math.round((checkedCount / totalSkills) * 100) : 0;
}

/**
 * skillset.tsx의 allVisibleSkills 구성 로직 추출
 * phases 배열에서 yearCategoryData의 skills를 합치고 빈도순 정렬
 */
function buildAllVisibleSkills(
  phases: { key: string }[],
  yearCategoryData: { [slotKey: string]: { skills?: { [skill: string]: number } } }
): { name: string; count: number }[] {
  const skills: { name: string; count: number }[] = [];
  phases.forEach((p) => {
    const data = yearCategoryData[p.key];
    if (data?.skills) {
      Object.entries(data.skills).forEach(([name, count]) => skills.push({ name, count }));
    }
  });
  return skills.sort((a, b) => b.count - a.count);
}

/**
 * skillset.tsx의 추천 기술 로직 추출
 */
function getRecommendations(
  allVisibleSkills: { name: string; count: number }[],
  checkedSkills: Set<string>,
  currentYearJobs: number
): { name: string; count: number; percent: number }[] {
  return allVisibleSkills
    .filter((s) => !checkedSkills.has(s.name))
    .slice(0, 5)
    .map((s) => ({
      name: s.name,
      count: s.count,
      percent: currentYearJobs > 0 ? Math.round((s.count / currentYearJobs) * 100) : 0,
    }));
}

// --- 커버리지 ---

describe("커버리지 퍼센트 계산", () => {
  test("5/10 = 50%", () => {
    expect(calcCoverage(5, 10)).toBe(50);
  });

  test("0개 체크 = 0%", () => {
    expect(calcCoverage(0, 10)).toBe(0);
  });

  test("전부 체크 = 100%", () => {
    expect(calcCoverage(10, 10)).toBe(100);
  });

  test("전체 스킬이 0개면 0%", () => {
    expect(calcCoverage(0, 0)).toBe(0);
  });

  test("1/3 = 33% (반올림)", () => {
    expect(calcCoverage(1, 3)).toBe(33);
  });
});

// --- allVisibleSkills 구성 ---

describe("전체 가시 스킬 목록 구성", () => {
  const phases = [{ key: "기초" }, { key: "핵심" }, { key: "확장" }];

  test("여러 phase의 스킬을 합치고 빈도순 정렬한다", () => {
    const yearData = {
      "기초": { skills: { JavaScript: 50, HTML: 40 } },
      "핵심": { skills: { React: 80 } },
      "확장": { skills: { TypeScript: 60 } },
    };
    const result = buildAllVisibleSkills(phases, yearData);
    expect(result[0].name).toBe("React");
    expect(result[1].name).toBe("TypeScript");
    expect(result).toHaveLength(4);
  });

  test("빈 phase는 건너뛴다", () => {
    const yearData = {
      "기초": { skills: { JavaScript: 50 } },
      "핵심": {},
    };
    const result = buildAllVisibleSkills(phases, yearData);
    expect(result).toHaveLength(1);
  });

  test("모든 phase가 비어있으면 빈 배열", () => {
    const result = buildAllVisibleSkills(phases, {});
    expect(result).toHaveLength(0);
  });
});

// --- 추천 ---

describe("추천 기술 로직", () => {
  const allSkills = [
    { name: "React", count: 80 },
    { name: "TypeScript", count: 60 },
    { name: "Next.js", count: 40 },
    { name: "Redux", count: 30 },
    { name: "Vue", count: 20 },
    { name: "Svelte", count: 10 },
  ];

  test("보유하지 않은 기술 중 상위 5개를 추천한다", () => {
    const checked = new Set(["React"]);
    const result = getRecommendations(allSkills, checked, 100);
    expect(result).toHaveLength(5);
    expect(result[0].name).toBe("TypeScript");
    expect(result.some((r) => r.name === "React")).toBe(false);
  });

  test("전부 보유하면 빈 추천을 반환한다", () => {
    const checked = new Set(allSkills.map((s) => s.name));
    const result = getRecommendations(allSkills, checked, 100);
    expect(result).toHaveLength(0);
  });

  test("아무것도 보유하지 않으면 상위 5개를 추천한다", () => {
    const result = getRecommendations(allSkills, new Set(), 100);
    expect(result).toHaveLength(5);
    expect(result[0].name).toBe("React");
  });

  test("퍼센트를 올바르게 계산한다", () => {
    const result = getRecommendations(allSkills, new Set(), 200);
    expect(result[0].percent).toBe(40); // 80/200 = 40%
  });

  test("totalJobs가 0이면 퍼센트는 0이다", () => {
    const result = getRecommendations(allSkills, new Set(), 0);
    expect(result.every((r) => r.percent === 0)).toBe(true);
  });
});

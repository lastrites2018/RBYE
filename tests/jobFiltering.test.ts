// 책임: 공고 목록의 필터링/파생 로직이 올바른 결과를 반환한다
import { describe, test, expect } from "bun:test";

interface MockJob {
  companyName: string;
  contentObj: { requirement: string | null };
}

/**
 * [type].tsx getData 내부 "제한없음" 필터 로직 추출
 */
function filterNoExperience(data: MockJob[]): MockJob[] {
  return data.filter(
    (item) =>
      item.contentObj.requirement &&
      !item.contentObj.requirement.includes("년")
  );
}

/**
 * [type].tsx visibleData 필터 로직 추출
 */
function filterVisible(data: MockJob[], hiddenCompanies: string[]): MockJob[] {
  return data.filter((job) => !hiddenCompanies.includes(job.companyName));
}

/**
 * [type].tsx totalDataCount 파생 로직 추출
 */
function deriveTotalDataCount(
  searchKeyword: string,
  currentCategory: string,
  serverTotalCount: number | undefined,
  visibleDataLength: number
): number | undefined {
  return !searchKeyword && currentCategory === "전체"
    ? serverTotalCount
    : visibleDataLength;
}

// --- 테스트 데이터 ---
const jobs: MockJob[] = [
  { companyName: "토스", contentObj: { requirement: "3년 이상 경력" } },
  { companyName: "카카오", contentObj: { requirement: "React 경험자" } },
  { companyName: "네이버", contentObj: { requirement: "5년 이상 경력 필수" } },
  { companyName: "라인", contentObj: { requirement: null } },
  { companyName: "배민", contentObj: { requirement: "경력 무관, CS 전공" } },
];

describe("제한없음 필터 (년 미포함 공고만 표시)", () => {
  test("'년'이 포함된 공고를 제외한다", () => {
    const result = filterNoExperience(jobs);
    expect(result.every((j) => !j.contentObj.requirement!.includes("년"))).toBe(true);
  });

  test("'년'이 없는 공고는 유지한다", () => {
    const result = filterNoExperience(jobs);
    expect(result.some((j) => j.companyName === "카카오")).toBe(true);
    expect(result.some((j) => j.companyName === "배민")).toBe(true);
  });

  test("requirement가 null인 공고는 제외한다", () => {
    const result = filterNoExperience(jobs);
    expect(result.some((j) => j.companyName === "라인")).toBe(false);
  });

  test("모두 '년'이 포함되면 빈 배열을 반환한다", () => {
    const allYear = [
      { companyName: "A", contentObj: { requirement: "1년" } },
      { companyName: "B", contentObj: { requirement: "3년 이상" } },
    ];
    expect(filterNoExperience(allYear)).toHaveLength(0);
  });

  test("빈 배열을 넣으면 빈 배열을 반환한다", () => {
    expect(filterNoExperience([])).toHaveLength(0);
  });
});

describe("숨긴 회사 필터", () => {
  test("숨긴 회사의 공고를 제외한다", () => {
    const result = filterVisible(jobs, ["토스", "네이버"]);
    expect(result).toHaveLength(3);
    expect(result.some((j) => j.companyName === "토스")).toBe(false);
    expect(result.some((j) => j.companyName === "네이버")).toBe(false);
  });

  test("숨긴 회사가 없으면 전체를 반환한다", () => {
    const result = filterVisible(jobs, []);
    expect(result).toHaveLength(jobs.length);
  });

  test("모든 회사를 숨기면 빈 배열을 반환한다", () => {
    const allNames = jobs.map((j) => j.companyName);
    expect(filterVisible(jobs, allNames)).toHaveLength(0);
  });

  test("존재하지 않는 회사를 숨겨도 영향 없다", () => {
    const result = filterVisible(jobs, ["없는회사"]);
    expect(result).toHaveLength(jobs.length);
  });
});

describe("totalDataCount 파생", () => {
  test("검색어 없고 전체 카테고리면 서버 totalCount를 사용한다", () => {
    expect(deriveTotalDataCount("", "전체", 150, 30)).toBe(150);
  });

  test("검색어가 있으면 visibleData 길이를 사용한다", () => {
    expect(deriveTotalDataCount("react", "전체", 150, 5)).toBe(5);
  });

  test("전체가 아닌 카테고리면 visibleData 길이를 사용한다", () => {
    expect(deriveTotalDataCount("", "햇수", 150, 20)).toBe(20);
  });

  test("검색어 + 다른 카테고리면 visibleData 길이를 사용한다", () => {
    expect(deriveTotalDataCount("react", "제한없음", 150, 3)).toBe(3);
  });

  test("서버 totalCount가 undefined여도 정상 반환한다", () => {
    expect(deriveTotalDataCount("", "전체", undefined, 10)).toBeUndefined();
  });
});

// 책임: Layout의 SEO 메타 데이터(canonical URL, 페이지 제목, description, breadcrumb)가 올바르게 생성된다
import { describe, test, expect } from "bun:test";

const WEBSITE_URL = "https://rbye.vercel.app";

/**
 * Layout.tsx의 canonical URL 구성 로직 추출
 */
function buildCanonicalUrl(canonicalPath: string | undefined, routerAsPath: string): string {
  const resolvedPath = (canonicalPath || routerAsPath || "/").split("?")[0];
  return `${WEBSITE_URL}${resolvedPath.startsWith("/") ? resolvedPath : `/${resolvedPath}`}`;
}

/**
 * Layout.tsx의 페이지 제목 구성 로직 추출
 */
function buildPageTitle(title: string): string {
  return title.includes("RBYE") ? title : `${title} | RBYE.VERCEL.APP`;
}

/**
 * Layout.tsx의 description 선택 로직 추출
 */
function getDescription(pageType: "job" | "stats" | "skillset"): string {
  if (pageType === "stats") return "기술 키워드별 채용 요구사항 통계를 제공합니다.";
  if (pageType === "skillset") return "연차별 스킬셋 로드맵으로 학습 우선순위를 정리합니다.";
  return "RBYE: 웹개발자에게 연차별로 요구되는 능력을 빠르게 보여줍니다.";
}

/**
 * Layout.tsx의 getPageTitle (네비게이션 서브타이틀) 로직 추출
 */
function getNavSubtitle(pageType: "job" | "stats" | "skillset"): string {
  if (pageType === "stats") return "기술 키워드 통계";
  if (pageType === "skillset") return "스킬 로드맵";
  return "연차별 요구사항";
}

interface BreadcrumbItem {
  name: string;
  path: string;
}

/**
 * Layout.tsx의 breadcrumb 생성 로직 추출
 */
function buildBreadcrumbItems(
  pageType: "job" | "stats" | "skillset",
  currentPage: string,
  jobLink: string
): BreadcrumbItem[] {
  const isStatsPage = pageType === "stats";
  const isSkillsetPage = pageType === "skillset";

  return [
    { name: "홈", path: "/" },
    ...(isStatsPage
      ? [{ name: "기술 통계", path: "/stats" }]
      : isSkillsetPage
      ? [{ name: "스킬 세트", path: "/skillset" }]
      : currentPage
      ? [
          { name: "공고 보기", path: "/t" },
          { name: `${currentPage} 연차별 요구사항`, path: `/t/${currentPage}` },
        ]
      : [{ name: "공고 보기", path: jobLink }]),
  ];
}

// --- canonical URL ---

describe("canonical URL 구성", () => {
  test("canonicalPath가 있으면 해당 경로를 사용한다", () => {
    expect(buildCanonicalUrl("/t/frontend", "/t/frontend?q=react"))
      .toBe("https://rbye.vercel.app/t/frontend");
  });

  test("쿼리 파라미터를 제거한다", () => {
    expect(buildCanonicalUrl("/stats?tab=compare", "/stats"))
      .toBe("https://rbye.vercel.app/stats");
  });

  test("canonicalPath가 없으면 routerAsPath를 사용한다", () => {
    expect(buildCanonicalUrl(undefined, "/t/nodejs"))
      .toBe("https://rbye.vercel.app/t/nodejs");
  });

  test("둘 다 없으면 루트를 사용한다", () => {
    expect(buildCanonicalUrl(undefined, ""))
      .toBe("https://rbye.vercel.app/");
  });

  test("슬래시가 없는 경로에 슬래시를 추가한다", () => {
    expect(buildCanonicalUrl("t/frontend", "/"))
      .toBe("https://rbye.vercel.app/t/frontend");
  });
});

// --- 페이지 제목 ---

describe("페이지 제목 구성", () => {
  test("RBYE가 이미 포함된 제목은 그대로 반환한다", () => {
    expect(buildPageTitle("기술 키워드 통계 - RBYE.VERCEL.APP"))
      .toBe("기술 키워드 통계 - RBYE.VERCEL.APP");
  });

  test("RBYE가 없는 제목은 접미사를 추가한다", () => {
    expect(buildPageTitle("설정"))
      .toBe("설정 | RBYE.VERCEL.APP");
  });

  test("빈 제목에도 접미사를 추가한다", () => {
    expect(buildPageTitle(""))
      .toBe(" | RBYE.VERCEL.APP");
  });
});

// --- description ---

describe("페이지 description 선택", () => {
  test("stats 페이지는 통계 description을 반환한다", () => {
    expect(getDescription("stats")).toContain("통계");
  });

  test("skillset 페이지는 로드맵 description을 반환한다", () => {
    expect(getDescription("skillset")).toContain("로드맵");
  });

  test("job 페이지는 기본 description을 반환한다", () => {
    expect(getDescription("job")).toContain("연차별");
  });
});

// --- 네비게이션 서브타이틀 ---

describe("네비게이션 서브타이틀", () => {
  test("stats → 기술 키워드 통계", () => {
    expect(getNavSubtitle("stats")).toBe("기술 키워드 통계");
  });

  test("skillset → 스킬 로드맵", () => {
    expect(getNavSubtitle("skillset")).toBe("스킬 로드맵");
  });

  test("job → 연차별 요구사항", () => {
    expect(getNavSubtitle("job")).toBe("연차별 요구사항");
  });
});

// --- breadcrumb ---

describe("breadcrumb 생성", () => {
  test("첫 항목은 항상 홈이다", () => {
    const items = buildBreadcrumbItems("job", "frontend", "/t/frontend");
    expect(items[0]).toEqual({ name: "홈", path: "/" });
  });

  test("stats 페이지 breadcrumb", () => {
    const items = buildBreadcrumbItems("stats", "", "/t/frontend");
    expect(items).toHaveLength(2);
    expect(items[1]).toEqual({ name: "기술 통계", path: "/stats" });
  });

  test("skillset 페이지 breadcrumb", () => {
    const items = buildBreadcrumbItems("skillset", "", "/t/frontend");
    expect(items).toHaveLength(2);
    expect(items[1]).toEqual({ name: "스킬 세트", path: "/skillset" });
  });

  test("job 페이지 + currentPage가 있으면 3단계 breadcrumb", () => {
    const items = buildBreadcrumbItems("job", "frontend", "/t/frontend");
    expect(items).toHaveLength(3);
    expect(items[1]).toEqual({ name: "공고 보기", path: "/t" });
    expect(items[2]).toEqual({ name: "frontend 연차별 요구사항", path: "/t/frontend" });
  });

  test("job 페이지 + currentPage가 없으면 jobLink로 fallback", () => {
    const items = buildBreadcrumbItems("job", "", "/t/nodejs");
    expect(items).toHaveLength(2);
    expect(items[1]).toEqual({ name: "공고 보기", path: "/t/nodejs" });
  });
});

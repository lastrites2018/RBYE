// 책임: Layout의 SEO 메타 데이터(canonical URL, 페이지 제목, description, breadcrumb)가 올바르게 생성된다
import { describe, test, expect } from "bun:test";
import { getCategoryMeta, getPageMeta, getCategorySitemapEntries, getSitemapMeta } from "../utils/constants";

const WEBSITE_URL = "https://rbye.vercel.app";

/**
 * Layout.tsx의 canonical URL 구성 로직 추출
 */
function buildCanonicalUrl(canonicalPath: string | undefined, routerAsPath: string): string {
  const resolvedPath = (canonicalPath || routerAsPath || "/").split("?")[0];
  return `${WEBSITE_URL}${resolvedPath.startsWith("/") ? resolvedPath : `/${resolvedPath}`}`;
}

function buildSocialImageUrl(socialImagePath?: string): string {
  return `${WEBSITE_URL}${socialImagePath || "/og/default.png"}`;
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
          { name: "공고 보기", path: jobLink },
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

describe("OG 이미지 선택", () => {
  test("job 페이지는 카테고리별 PNG를 사용한다", () => {
    const pageMeta = getPageMeta("job", "frontend");
    expect(buildSocialImageUrl(pageMeta.socialImagePath)).toBe("https://rbye.vercel.app/og/frontend.png");
    expect(pageMeta.socialImageAlt).toContain("프론트엔드");
  });

  test("stats 페이지는 전용 PNG를 사용한다", () => {
    const pageMeta = getPageMeta("stats");
    expect(buildSocialImageUrl(pageMeta.socialImagePath)).toBe("https://rbye.vercel.app/og/stats.png");
    expect(pageMeta.socialImageAlt).toContain("기술 키워드 통계");
  });

  test("settings 페이지는 공통 fallback 이미지를 사용한다", () => {
    const pageMeta = getPageMeta("settings");
    expect(buildSocialImageUrl(pageMeta.socialImagePath)).toBe("https://rbye.vercel.app/og/default.png");
  });

  test("카테고리 메타는 각자 다른 이미지 경로를 가진다", () => {
    expect(getCategoryMeta("nodejs").socialImagePath).toBe("/og/nodejs.png");
    expect(getCategoryMeta("server").socialImagePath).toBe("/og/server.png");
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

  test("job 페이지 + currentPage가 있으면 jobLink를 첫 breadcrumb로 사용한다", () => {
    const items = buildBreadcrumbItems("job", "nodejs", "/t/frontend");
    expect(items).toHaveLength(3);
    expect(items[1]).toEqual({ name: "공고 보기", path: "/t/frontend" });
    expect(items[2]).toEqual({ name: "nodejs 연차별 요구사항", path: "/t/nodejs" });
  });

  test("job 페이지 + currentPage가 없으면 jobLink로 fallback", () => {
    const items = buildBreadcrumbItems("job", "", "/t/nodejs");
    expect(items).toHaveLength(2);
    expect(items[1]).toEqual({ name: "공고 보기", path: "/t/nodejs" });
  });
});

// --- Sitemap ---

describe("getCategorySitemapEntries", () => {
  test("4개 카테고리 항목을 반환한다", () => {
    const entries = getCategorySitemapEntries();
    expect(entries).toHaveLength(4);
  });

  test("각 항목에 loc, changefreq, priority가 있다", () => {
    const entries = getCategorySitemapEntries();
    entries.forEach((entry) => {
      expect(entry.loc).toBeTruthy();
      expect(entry.changefreq).toBeTruthy();
      expect(typeof entry.priority).toBe("number");
    });
  });

  test("frontend는 daily, 0.9 이다", () => {
    const entries = getCategorySitemapEntries();
    const fe = entries.find((e) => e.loc === "/t/frontend");
    expect(fe?.changefreq).toBe("daily");
    expect(fe?.priority).toBe(0.9);
  });
});

describe("getSitemapMeta", () => {
  test("루트는 daily, 1.0", () => {
    const meta = getSitemapMeta("/");
    expect(meta.changefreq).toBe("daily");
    expect(meta.priority).toBe(1.0);
  });

  test("stats는 weekly, 0.9", () => {
    const meta = getSitemapMeta("/stats");
    expect(meta.changefreq).toBe("weekly");
    expect(meta.priority).toBe(0.9);
  });

  test("skillset은 weekly, 0.9", () => {
    const meta = getSitemapMeta("/skillset");
    expect(meta.changefreq).toBe("weekly");
    expect(meta.priority).toBe(0.9);
  });

  test("카테고리 경로는 해당 sitemap 설정을 반환한다", () => {
    const meta = getSitemapMeta("/t/frontend");
    expect(meta.changefreq).toBe("daily");
    expect(meta.priority).toBe(0.9);
  });

  test("알 수 없는 경로는 기본값 반환", () => {
    const meta = getSitemapMeta("/unknown");
    expect(meta.changefreq).toBe("weekly");
    expect(meta.priority).toBe(0.8);
  });
});

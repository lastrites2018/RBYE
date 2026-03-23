const VALID_TYPES = ["frontend", "nodejs", "server", "pm"];
const DEFAULT_TYPE = VALID_TYPES[0];

const CATEGORY_META = {
  frontend: {
    key: "frontend",
    label: "프론트엔드",
    route: "/t/frontend",
    pageTitle: "프론트엔드 연차별 요구사항 - RBYE.VERCEL.APP",
    heading: "프론트엔드 연차별 요구사항",
    description: "프론트엔드 직무 공고에서 연차별로 요구되는 핵심 역량을 확인합니다.",
    breadcrumbLabel: "프론트엔드 연차별 요구사항",
    sitemap: {
      changefreq: "daily",
      priority: 0.9,
    },
  },
  nodejs: {
    key: "nodejs",
    label: "Node.js",
    route: "/t/nodejs",
    pageTitle: "Node.js 연차별 요구사항 - RBYE.VERCEL.APP",
    heading: "Node.js 연차별 요구사항",
    description: "Node.js 직무 공고에서 연차별로 요구되는 핵심 역량을 확인합니다.",
    breadcrumbLabel: "Node.js 연차별 요구사항",
    sitemap: {
      changefreq: "daily",
      priority: 0.9,
    },
  },
  server: {
    key: "server",
    label: "백엔드",
    route: "/t/server",
    pageTitle: "백엔드 연차별 요구사항 - RBYE.VERCEL.APP",
    heading: "백엔드 연차별 요구사항",
    description: "백엔드 직무 공고에서 연차별로 요구되는 핵심 역량을 확인합니다.",
    breadcrumbLabel: "백엔드 연차별 요구사항",
    sitemap: {
      changefreq: "daily",
      priority: 0.9,
    },
  },
  pm: {
    key: "pm",
    label: "PM",
    route: "/t/pm",
    pageTitle: "PM 연차별 요구사항 - RBYE.VERCEL.APP",
    heading: "PM 연차별 요구사항",
    description: "PM 직무 공고에서 연차별로 요구되는 핵심 역량을 확인합니다.",
    breadcrumbLabel: "PM 연차별 요구사항",
    sitemap: {
      changefreq: "weekly",
      priority: 0.8,
    },
  },
};

const CATEGORY_OPTIONS = VALID_TYPES.map((key) => ({
  key,
  label: CATEGORY_META[key].label,
  route: CATEGORY_META[key].route,
}));

const CATEGORY_LABELS = VALID_TYPES.reduce((acc, key) => {
  acc[key] = CATEGORY_META[key].label;
  return acc;
}, {});

const PAGE_META = {
  stats: {
    route: "/stats",
    pageTitle: "기술 키워드 통계 - RBYE.VERCEL.APP",
    heading: "기술 키워드 통계",
    description: "기술 키워드별 채용 요구사항 통계를 제공합니다.",
    sectionLabel: "기술 키워드 통계",
    breadcrumbLabel: "기술 통계",
    searchTargetPath: "/stats",
    sitemap: {
      changefreq: "weekly",
      priority: 0.9,
    },
  },
  skillset: {
    route: "/skillset",
    pageTitle: "스킬 로드맵 - RBYE.VERCEL.APP",
    heading: "스킬 로드맵",
    description: "연차별 스킬셋 로드맵으로 학습 우선순위를 정리합니다.",
    sectionLabel: "스킬 로드맵",
    breadcrumbLabel: "스킬 세트",
    searchTargetPath: "/skillset",
    sitemap: {
      changefreq: "weekly",
      priority: 0.9,
    },
  },
  settings: {
    route: "/settings",
    pageTitle: "설정 | RBYE",
    heading: "설정",
    description: "숨긴 회사와 가독성 옵션을 관리합니다.",
    sectionLabel: "설정",
    breadcrumbLabel: "설정",
    searchTargetPath: `/t/${DEFAULT_TYPE}`,
    sitemap: {
      changefreq: "monthly",
      priority: 0.2,
    },
  },
};

function normalizeType(type) {
  return typeof type === "string" && VALID_TYPES.includes(type) ? type : DEFAULT_TYPE;
}

function getCategoryMeta(type) {
  return CATEGORY_META[normalizeType(type)];
}

function getPageMeta(pageType, type) {
  const categoryMeta = getCategoryMeta(type);

  if (pageType === "stats") {
    return PAGE_META.stats;
  }

  if (pageType === "skillset") {
    return PAGE_META.skillset;
  }

  if (pageType === "settings") {
    return PAGE_META.settings;
  }

  return {
    ...categoryMeta,
    sectionLabel: "연차별 요구사항",
    breadcrumbLabel: categoryMeta.breadcrumbLabel,
    searchTargetPath: categoryMeta.route,
    categoryMeta,
  };
}

function getCategorySitemapEntries() {
  return CATEGORY_OPTIONS.map((option) => ({
    loc: option.route,
    changefreq: CATEGORY_META[option.key].sitemap.changefreq,
    priority: CATEGORY_META[option.key].sitemap.priority,
  }));
}

function getSitemapMeta(loc) {
  if (loc === "/") {
    return {
      changefreq: "daily",
      priority: 1.0,
    };
  }

  if (loc === PAGE_META.stats.route) {
    return PAGE_META.stats.sitemap;
  }

  if (loc === PAGE_META.skillset.route) {
    return PAGE_META.skillset.sitemap;
  }

  if (loc.startsWith("/t/")) {
    const type = loc.split("/")[2];
    return CATEGORY_META[normalizeType(type)].sitemap;
  }

  return {
    changefreq: "weekly",
    priority: 0.8,
  };
}

module.exports = {
  VALID_TYPES,
  CATEGORY_META,
  CATEGORY_OPTIONS,
  CATEGORY_LABELS,
  PAGE_META,
  getCategoryMeta,
  getPageMeta,
  getCategorySitemapEntries,
  getSitemapMeta,
};

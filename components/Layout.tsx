import * as React from "react";
import Head from "next/head";
import Footer from "./Footer";
import Link from "next/link";
import { useRouter } from "next/router";
import useHiddenCompanies from "../hooks/useHiddenCompanies";
import useBookmarks from "../hooks/useBookmarks";
import useLastType from "../hooks/useLastType";
import { CATEGORY_OPTIONS, PAGE_META, VALID_TYPES, getCategoryMeta, getPageMeta } from "../utils/constants";

type Props = {
  title?: string;
  children: React.ReactNode;
  pageType?: "job" | "stats" | "skillset" | "settings";
  currentPage?: string;
  canonicalPath?: string;
  noIndex?: boolean;
  bookmarkCount?: number;
  isBookmarkActive?: boolean;
  onClickBookmark?: () => void;
};

const Layout: React.FunctionComponent<Props> = ({
  children,
  title = "기본 타이틀",
  pageType = "job",
  currentPage = "",
  canonicalPath,
  noIndex,
  bookmarkCount,
  isBookmarkActive,
  onClickBookmark,
}) => {
  const router = useRouter();
  const { hiddenCompanies, mounted } = useHiddenCompanies();
  const { bookmarks } = useBookmarks();
  const { getLastType } = useLastType();
  const hasAnyPreferences = mounted && (hiddenCompanies.length > 0 || bookmarks.length > 0);
  const [jobLink, setJobLink] = React.useState(getCategoryMeta(VALID_TYPES[0]).route);

  React.useEffect(() => {
    setJobLink(getCategoryMeta(getLastType()).route);
  }, []);

  const isStatsPage = pageType === "stats";
  const isSkillsetPage = pageType === "skillset";
  const isSettingsPage = pageType === "settings" || router.pathname === "/settings";
  const isSpecialPage = isStatsPage || isSkillsetPage;

  const currentSearchType = VALID_TYPES.includes(currentPage) ? currentPage : VALID_TYPES[0];
  const currentCategoryMeta = getCategoryMeta(currentSearchType);
  const pageMeta = getPageMeta(pageType || "job", currentSearchType);
  const description = pageMeta.description;

  const resolvedCanonicalPath = (
    canonicalPath || (router.asPath ? router.asPath : "/")
  ).split("?")[0];
  const canonicalUrl = `https://rbye.vercel.app${
    resolvedCanonicalPath.startsWith("/") ? resolvedCanonicalPath : `/${resolvedCanonicalPath}`
  }`;
  const pageTitle = title.includes("RBYE") ? title : `${title} | RBYE.VERCEL.APP`;
  const websiteUrl = "https://rbye.vercel.app";
  const siteName = "RBYE";
  const socialImage = `${websiteUrl}/og-image.svg`;
  const searchActionTarget = `${websiteUrl}${pageMeta.searchTargetPath}?q={search_term_string}`;

  const breadcrumbItems = [
    { name: "홈", path: "/" },
    ...(isStatsPage
      ? [{ name: pageMeta.breadcrumbLabel, path: PAGE_META.stats.route }]
      : isSkillsetPage
      ? [{ name: pageMeta.breadcrumbLabel, path: PAGE_META.skillset.route }]
      : isSettingsPage
      ? [{ name: pageMeta.breadcrumbLabel, path: PAGE_META.settings.route }]
      : currentPage
      ? [
          { name: "공고 보기", path: jobLink },
          {
            name: currentCategoryMeta.breadcrumbLabel,
            path: currentCategoryMeta.route,
          },
        ]
      : [{ name: "공고 보기", path: jobLink }]),
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${websiteUrl}/#website`,
        name: siteName,
        url: websiteUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: searchActionTarget,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: pageTitle,
        description,
        isPartOf: { "@id": `${websiteUrl}/#website` },
        inLanguage: "ko-KR",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: breadcrumbItems.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${websiteUrl}${item.path}`,
        })),
      },
    ],
  };

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content={description} />
        <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="RBYE" />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:image" content={socialImage} />
        <meta property="og:image:alt" content={`${pageTitle} - RBYE`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={socialImage} />
        <meta name="twitter:image:alt" content={`${pageTitle} - RBYE`} />
        <link rel="canonical" href={canonicalUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <nav className="bg-white border-b border-gray-200 mb-4">
        <div className="max-w-[640px] mx-auto px-4 flex items-center justify-between h-11">
          <div className="flex items-center gap-2">
            <Link href="/">
              <a className="text-sm font-bold text-teal-700 tracking-tight">RBYE</a>
            </Link>
            {!isSettingsPage && (
              <span className="text-xs text-gray-400">{pageMeta.sectionLabel}</span>
            )}
          </div>
          <div className="flex gap-1 items-center">
            <Link href={jobLink}>
              <a className={`px-3 py-1.5 rounded text-xs transition-colors ${
                !isSpecialPage && !isSettingsPage ? "bg-teal-700 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}>공고</a>
            </Link>
            <Link href={PAGE_META.stats.route}>
              <a className={`px-3 py-1.5 rounded text-xs transition-colors ${
                isStatsPage ? "bg-teal-700 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}>통계</a>
            </Link>
            <Link href={PAGE_META.skillset.route}>
              <a className={`px-3 py-1.5 rounded text-xs transition-colors ${
                isSkillsetPage ? "bg-teal-700 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}>스킬셋</a>
            </Link>
            {hasAnyPreferences && (
              <Link href={PAGE_META.settings.route}>
                <a className={`ml-1 p-1.5 rounded transition-colors ${
                  isSettingsPage ? "text-teal-700 bg-gray-100" : "text-gray-400 hover:text-teal-700 hover:bg-gray-100"
                }`} title="설정">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </a>
              </Link>
            )}
          </div>
        </div>
      </nav>
      {!isSpecialPage && !isSettingsPage && (
        <div className="flex justify-center gap-1 mb-4 max-w-[640px] mx-auto px-4">
          {CATEGORY_OPTIONS.map((category) => (
            <Link href={category.route} key={category.key}>
              <a className={currentPage === category.key && !isBookmarkActive
                ? "px-4 py-2 rounded-full text-sm font-semibold bg-teal-700 text-white shadow-sm"
                : "px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-300 transition-colors"
              }>{category.label}</a>
            </Link>
          ))}
          {onClickBookmark && (bookmarkCount || 0) > 0 && (
            <button
              className={isBookmarkActive
                ? "px-4 py-2 rounded-full text-sm font-semibold bg-amber-500 text-white shadow-sm"
                : "px-4 py-2 rounded-full text-sm text-amber-500 hover:bg-amber-50 transition-colors"
              }
              onClick={onClickBookmark}
            >
              ★ {bookmarkCount}
            </button>
          )}
        </div>
      )}
      {children}
      <Footer />
    </div>
  );
};

export default Layout;

import * as React from "react";
import Head from "next/head";
import Footer from "./Footer";
import Link from "next/link";
import { useRouter } from "next/router";
import useLocalPreferences from "../hooks/useLocalPreferences";

type Props = {
  title?: string;
  children: React.ReactNode;
  pageType?: "job" | "stats" | "skillset";
  currentPage?: string;
  canonicalPath?: string;
  noIndex?: boolean;
};

const Layout: React.FunctionComponent<Props> = ({
  children,
  title = "기본 타이틀",
  pageType = "job",
  currentPage = "",
  canonicalPath,
  noIndex,
}) => {
  const { hasAnyPreferences, getLastType } = useLocalPreferences();
  const [jobLink, setJobLink] = React.useState("/t/frontend");
  React.useEffect(() => {
    setJobLink(`/t/${getLastType()}`);
  }, []);
  const isStatsPage = pageType === "stats";
  const isSkillsetPage = pageType === "skillset";
  const isSpecialPage = pageType === "stats" || pageType === "skillset";
  const router = useRouter();
  const isSettingsPage = router.pathname === "/settings";

  const description =
    pageType === "stats"
      ? "기술 키워드별 채용 요구사항 통계를 제공합니다."
      : pageType === "skillset"
      ? "연차별 스킬셋 로드맵으로 학습 우선순위를 정리합니다."
      : "RBYE: 웹개발자에게 연차별로 요구되는 능력을 빠르게 보여줍니다.";
  const resolvedCanonicalPath = (
    canonicalPath || (router.asPath ? router.asPath : "/")
  ).split("?")[0];
  const canonicalUrl = `https://rbye.vercel.app${
    resolvedCanonicalPath.startsWith("/") ? resolvedCanonicalPath : `/${resolvedCanonicalPath}`
  }`;
  const pageTitle = title.includes("RBYE") ? title : `${title} | RBYE.VERCEL.APP`;
  const websiteUrl = "https://rbye.vercel.app";
  const siteName = "RBYE";

  const breadcrumbItems = [
    { name: "홈", path: "/" },
    ...(isStatsPage
      ? [{ name: "기술 통계", path: "/stats" }]
      : isSkillsetPage
      ? [{ name: "스킬 세트", path: "/skillset" }]
      : currentPage
      ? [
          { name: "공고 보기", path: "/t" },
          {
            name: `${currentPage} 연차별 요구사항`,
            path: `/t/${currentPage}`,
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
          target: `${websiteUrl}/t/{search_term_string}`,
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

  const getPageTitle = () => {
    if (isStatsPage) return "기술 키워드 통계";
    if (isSkillsetPage) return "스킬 로드맵";
    return "연차별 요구사항";
  };

  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content={description} />
        <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="RBYE" />
        <meta property="og:image" content="https://rbye.vercel.app/github.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://rbye.vercel.app/github.png" />
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
              <span className="text-xs text-gray-400">{getPageTitle()}</span>
            )}
          </div>
          <div className="flex gap-1 items-center">
            <Link href={jobLink}>
              <a className={`px-3 py-1.5 rounded text-xs transition-colors ${
                !isSpecialPage && !isSettingsPage ? "bg-teal-700 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}>공고</a>
            </Link>
            <Link href={`/stats`}>
              <a className={`px-3 py-1.5 rounded text-xs transition-colors ${
                isStatsPage ? "bg-teal-700 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}>통계</a>
            </Link>
            <Link href={`/skillset`}>
              <a className={`px-3 py-1.5 rounded text-xs transition-colors ${
                isSkillsetPage ? "bg-teal-700 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}>스킬셋</a>
            </Link>
            {hasAnyPreferences && (
              <Link href="/settings">
                <a className={`ml-1 p-1.5 rounded transition-colors ${
                  isSettingsPage ? "text-teal-700 bg-gray-100" : "text-gray-400 hover:text-teal-700 hover:bg-gray-100"
                }`} title="설정">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="10" cy="10" r="3" />
                    <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M3.4 3.4l1.4 1.4M15.2 15.2l1.4 1.4M3.4 16.6l1.4-1.4M15.2 4.8l1.4-1.4" />
                  </svg>
                </a>
              </Link>
            )}
          </div>
        </div>
      </nav>
      {!isSpecialPage && !isSettingsPage && (
        <div className="flex justify-center gap-1 mb-4 max-w-[640px] mx-auto px-4">
          <Link href={`/t/frontend`}>
            <a className={currentPage === "frontend"
              ? "px-4 py-2 rounded-full text-sm font-semibold bg-teal-700 text-white shadow-sm"
              : "px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-300 transition-colors"
            }>프론트엔드</a>
          </Link>
          <Link href={`/t/nodejs`}>
            <a className={currentPage === "nodejs"
              ? "px-4 py-2 rounded-full text-sm font-semibold bg-teal-700 text-white shadow-sm"
              : "px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-300 transition-colors"
            }>Node.js</a>
          </Link>
          <Link href={`/t/server`}>
            <a className={currentPage === "server"
              ? "px-4 py-2 rounded-full text-sm font-semibold bg-teal-700 text-white shadow-sm"
              : "px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-300 transition-colors"
            }>백엔드</a>
          </Link>
          <Link href={`/t/pm`}>
            <a className={currentPage === "pm"
              ? "px-4 py-2 rounded-full text-sm font-semibold bg-teal-700 text-white shadow-sm"
              : "px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-300 transition-colors"
            }>PM</a>
          </Link>
        </div>
      )}
      {children}
      <Footer />
    </div>
  );
};

export default Layout;

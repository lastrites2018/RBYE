import * as React from "react";
import Head from "next/head";
import Footer from "./Footer";
import Link from "next/link";

type Props = {
  title?: string;
  children: React.ReactNode;
  pageType?: "job" | "stats" | "skillset";
  currentPage?: string;
};

const Layout: React.FunctionComponent<Props> = ({
  children,
  title = "기본 타이틀",
  pageType = "job",
  currentPage = "",
}) => {
  const isStatsPage = pageType === "stats";
  const isSkillsetPage = pageType === "skillset";
  const isSpecialPage = pageType === "stats" || pageType === "skillset";

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
        <meta
          name="description"
          content="RBYE : 웹개발자에게 연차별로 요구되는 능력을 빠르게 보여줍니다."
        />
      </Head>
      <div className="flex justify-center mb-2">
        <Link href={`/t/frontend`}>
          <a className={!isSpecialPage ? "bg-gray-400 px-2" : "px-2"}>공고 보기</a>
        </Link>
        <span className="mx-2"> | </span>
        <Link href={`/stats`}>
          <a className={isStatsPage ? "bg-gray-400 px-2" : "px-2"}>기술 통계</a>
        </Link>
        <span className="mx-2"> | </span>
        <Link href={`/skillset`}>
          <a className={isSkillsetPage ? "bg-gray-400 px-2" : "px-2"}>스킬 세트</a>
        </Link>
      </div>
      {!isSpecialPage && (
        <div className="flex justify-center gap-1 mb-2">
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
      <h1 className="text-center mb-4">
        {getPageTitle()}
      </h1>
      {children}
      <Footer />
    </div>
  );
};

export default Layout;

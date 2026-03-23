import * as React from "react";
import fetch from "isomorphic-unfetch";
import { GetServerSideProps } from "next";
import parse from "date-fns/parse";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import koLocale from "date-fns/locale/ko";
import Layout from "../components/Layout";
import YearCompareView from "../components/stats/YearCompareView";
import TrendView from "../components/stats/TrendView";
import { apiUrl } from "../utils/apiLocation";
import { CATEGORY_OPTIONS, VALID_TYPES, getPageMeta } from "../utils/constants";
import {
  StatsViewState,
  switchViewMode,
  getActiveMode,
  setRankingYear,
  deriveSelectedYear,
} from "../utils/statsView";

interface StatsData {
  [category: string]: {
    [year: string]: {
      [skill: string]: number;
    };
  };
}

interface TimelineEntry {
  date: string;
  categories: {
    [cat: string]: {
      totalJobs: number;
      topKeywords: { keyword: string; count: number }[];
    };
  };
}

interface Props {
  stats: StatsData;
  updated: object[];
  timeline: TimelineEntry[];
}

const STATS_PAGE_META = getPageMeta("stats");
const DEFAULT_CATEGORY = CATEGORY_OPTIONS[0]?.key || VALID_TYPES[0];

const YEARS = [
  "전체",
  "1년",
  "2년",
  "3년",
  "4년",
  "5년",
  "6년",
  "7년",
  "8년",
  "제한없음",
];

const BAR_COLORS = [
  "bg-teal-700",
  "bg-teal-600",
  "bg-teal-500",
];

const CooccurrenceBadges: React.FC<{
  pairs: { skill: string; count: number; percent: number }[];
}> = ({ pairs }) => {
  if (!pairs || pairs.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5 mb-1">
      <span className="text-xs text-gray-400">함께 요구:</span>
      {pairs.map((p) => (
        <span key={p.skill} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">
          {p.skill} <span className="text-gray-400">{p.percent}%</span>
        </span>
      ))}
    </div>
  );
};

const StatsPage = ({ stats, updated, timeline }: Props) => {
  const [selectedCategory, setSelectedCategory] = React.useState(DEFAULT_CATEGORY);

  // 크로스페이지 카테고리 공유: mount 시 복원
  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("rbye_last_type") || '""');
      if (saved && CATEGORY_OPTIONS.some((c) => c.key === saved)) {
        setSelectedCategory(saved);
      }
    } catch {}
  }, []);

  const updateCategory = (key: string) => {
    setSelectedCategory(key);
    setView((prev) => setRankingYear(prev, "전체"));
    if (VALID_TYPES.includes(key)) {
      try { localStorage.setItem("rbye_last_type", JSON.stringify(key)); } catch {}
      document.cookie = `rbye_last_type=${key};path=/;max-age=31536000`;
    }
  };
  const [view, setView] = React.useState<StatsViewState>({ mode: "ranking", year: "전체" });
  const [expandedSkill, setExpandedSkill] = React.useState<string | null>(null);

  const viewMode = getActiveMode(view);
  const selectedYear = deriveSelectedYear(view) || "전체";

  const categoryData = stats[selectedCategory] || {};
  const yearData = categoryData[selectedYear] || {};

  const sortedSkills = Object.entries(yearData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20);

  const maxCount = sortedSkills.length > 0 ? sortedSkills[0][1] : 0;
  const totalCount = sortedSkills.reduce((sum, [, count]) => sum + count, 0);
  const cooccurrence: { [skill: string]: { skill: string; count: number; percent: number }[] } = (categoryData as any).cooccurrence || {};

  return (
    <Layout
      title={STATS_PAGE_META.pageTitle}
      pageType="stats"
      canonicalPath={STATS_PAGE_META.route}
    >
      <div className="block m-auto lg:max-w-3xl px-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            {STATS_PAGE_META.heading}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {STATS_PAGE_META.description}
          </p>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex justify-center gap-1 mb-6">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.key}
              className={
                selectedCategory === cat.key
                  ? "px-4 py-2 rounded-full text-sm font-semibold bg-teal-700 text-white shadow-sm"
                  : "px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-300 transition-colors"
              }
              onClick={() => updateCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 뷰 모드 토글 */}
        <div className="flex justify-center gap-1 mb-6 pt-4 border-t border-gray-100">
          <button
            className={`px-3 py-1.5 rounded text-xs transition-colors ${
              viewMode === "ranking" ? "bg-teal-700 text-white" : "text-gray-500 hover:bg-gray-200"
            }`}
            onClick={() => setView(switchViewMode("ranking"))}
          >
            키워드 순위
          </button>
          <button
            className={`px-3 py-1.5 rounded text-xs transition-colors ${
              viewMode === "compare" ? "bg-teal-700 text-white" : "text-gray-500 hover:bg-gray-200"
            }`}
            onClick={() => setView(switchViewMode("compare"))}
          >
            연차별 비교
          </button>
          <button
            className={`px-3 py-1.5 rounded text-xs transition-colors ${
              viewMode === "trend" ? "bg-teal-700 text-white" : "text-gray-500 hover:bg-gray-200"
            }`}
            onClick={() => setView(switchViewMode("trend"))}
          >
            트렌드
          </button>
        </div>

        {updated?.[0]?.[selectedCategory] && (
          <div className="text-center text-gray-400 text-xs mb-3">
            데이터 업데이트{" "}
            {formatDistanceToNow(
              parse(updated[0][selectedCategory], "yyyy-M-dd HH:mm:ss", new Date()),
              { locale: koLocale }
            )}{" "}
            전
          </div>
        )}

        {viewMode === "trend" ? (
          <TrendView timeline={timeline} selectedCategory={selectedCategory} />
        ) : viewMode === "compare" ? (
          <YearCompareView categoryData={categoryData} />
        ) : (
          <>
            {/* 연차 선택 */}
            <div className="flex flex-wrap justify-center gap-1 mb-6">
              {YEARS.map((year) => (
                <button
                  key={year}
                  className={
                    selectedYear === year
                      ? "px-3 py-1 rounded text-xs font-medium bg-gray-700 text-white"
                      : "px-3 py-1 rounded text-xs text-gray-600 hover:bg-gray-300 transition-colors"
                  }
                  onClick={() => setView(setRankingYear(view, year))}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* 바 차트 */}
            {sortedSkills.length === 0 ? (
              <div className="text-center text-gray-600 text-lg py-12">
                해당 조건의 데이터가 없습니다.
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-lg font-semibold text-gray-700">
                    {CATEGORY_OPTIONS.find((c) => c.key === selectedCategory)?.label}{" "}
                    <span className="text-teal-700">{selectedYear}</span> TOP 20
                  </h2>
                  <span className="text-xs text-gray-500">
                    총 {totalCount}건 언급
                  </span>
                </div>
                <div className="space-y-3">
                  {sortedSkills.map(([skill, count], index) => {
                    const percentage =
                      maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
                    const barColor =
                      index < 3
                        ? BAR_COLORS[index]
                        : "bg-gray-400";
                    const isExpanded = expandedSkill === skill;
                    const pairs = cooccurrence[skill];
                    return (
                      <div
                        key={skill}
                        className={`group ${pairs ? "cursor-pointer" : ""}`}
                        onClick={() => pairs && setExpandedSkill(isExpanded ? null : skill)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            <span
                              className={
                                index < 3
                                  ? "font-bold text-teal-700 mr-2"
                                  : "text-gray-500 mr-2"
                              }
                            >
                              {index + 1}
                            </span>
                            {skill}
                            {pairs && (
                              <span className="text-xs text-gray-300 ml-1">{isExpanded ? "▲" : "▼"}</span>
                            )}
                          </span>
                          <span className="text-xs text-gray-500 tabular-nums">
                            {count}건
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
                          <div
                            className={`${barColor} h-5 rounded-full transition-all duration-500 ease-out`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        {isExpanded && pairs && <CooccurrenceBadges pairs={pairs} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
        <p className="text-center text-gray-600 text-sm mt-8 mb-4">
          본 통계는 현재 사이트에 등록된 공고 데이터를 기준으로 생성되었습니다.
        </p>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  let stats = {};
  let updated: object[] = [{}];
  let timeline: TimelineEntry[] = [];

  try {
    const [res, res2] = await Promise.all([
      fetch(`${apiUrl}/stats`),
      fetch(`${apiUrl}/updated`),
    ]);
    const statsArray = await res.json();
    updated = await res2.json();
    stats =
      Array.isArray(statsArray) && statsArray.length > 0
        ? statsArray[0]
        : statsArray;
  } catch (e) {
    console.error("Stats API 요청 실패:", e);
  }

  try {
    const res3 = await fetch(`${apiUrl}/timeline`);
    const timelineData = await res3.json();
    if (Array.isArray(timelineData)) timeline = timelineData;
  } catch (e) {
    console.error("timeline API 요청 실패:", e);
  }

  return { props: { stats, updated, timeline } };
};

export default StatsPage;

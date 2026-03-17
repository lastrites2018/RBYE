import * as React from "react";
import fetch from "isomorphic-unfetch";
import { GetServerSideProps } from "next";
import parse from "date-fns/parse";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import koLocale from "date-fns/locale/ko";
import Layout from "../components/Layout";
import { apiUrl } from "../utils/apiLocation";
import { CATEGORY_LABELS, VALID_TYPES } from "../utils/constants";
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

const CATEGORIES = [
  { key: "frontend", label: "프론트엔드" },
  { key: "nodejs", label: "Node.js" },
  { key: "server", label: "백엔드" },
  { key: "pm", label: "PM" },
];

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

const COMPARE_YEARS = ["1년", "2년", "3년", "5년", "8년"];

const YearCompareView: React.FC<{
  categoryData: any;
}> = ({ categoryData }) => {
  const totalJobs = categoryData.totalJobs || {};

  // 전체 기준 TOP 15 키워드 추출
  const allData = categoryData["전체"] || {};
  const topSkills = Object.entries(allData)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 15)
    .map(([skill]) => skill);

  if (topSkills.length === 0) return <div className="text-center text-gray-500 py-12">데이터가 없습니다.</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-3 text-gray-600 font-medium sticky left-0 bg-white">기술</th>
            {COMPARE_YEARS.map((y) => (
              <th key={y} className="text-center py-2 px-2 text-gray-600 font-medium whitespace-nowrap">
                {y}
                <span className="block text-xs text-gray-400 font-normal">{totalJobs[y] || 0}건</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {topSkills.map((skill, i) => {
            const counts = COMPARE_YEARS.map((y) => {
              const count = (categoryData[y] || {})[skill] || 0;
              const jobs = totalJobs[y] || 0;
              return { count, percent: jobs > 0 ? Math.round((count / jobs) * 100) : 0 };
            });
            const maxPercent = Math.max(...counts.map((c) => c.percent), 1);

            return (
              <tr key={skill} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2 pr-3 sticky left-0 bg-white">
                  <span className={i < 3 ? "font-semibold text-teal-700" : "text-gray-700"}>{skill}</span>
                </td>
                {counts.map((c, j) => {
                  const prev = j > 0 ? counts[j - 1].percent : 0;
                  const diff = c.percent - prev;
                  // 이전 연차에 0%인데 이번에 등장 → NEW, 10%p 이상 급상승 → 표시
                  const isNew = j > 0 && prev === 0 && c.percent > 0;
                  const isSurge = j > 0 && diff >= 10 && !isNew;

                  return (
                    <td key={COMPARE_YEARS[j]} className="text-center py-2 px-2">
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${isNew ? "bg-amber-400" : "bg-teal-500"}`}
                            style={{ width: `${maxPercent > 0 ? (c.percent / maxPercent) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-gray-500">
                          {c.percent}%
                          {isNew && <span className="ml-0.5 text-amber-600 font-bold">NEW</span>}
                          {isSurge && <span className="ml-0.5 text-teal-600 font-bold">+{diff}</span>}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        <p className="text-xs text-gray-400">비율은 해당 연차 전체 공고 수 대비 언급 비율입니다.</p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="inline-block w-4 h-2 bg-amber-400 rounded-full" /><span className="text-amber-600 font-bold">NEW</span> 해당 연차부터 등장</span>
          <span className="flex items-center gap-1"><span className="text-teal-600 font-bold">+N</span> 이전 대비 10%p 이상 급상승</span>
        </div>
      </div>
    </div>
  );
};

/**
 * 비교 기준 스냅샷 선택:
 * - 3일 미만: 트렌드 표시 불가 (최소 3일 필요)
 * - 3일 이상: 전체 기간 비교 (첫 스냅샷 vs 최신)
 * - 7일 이상: 주 단위 비교 가능 (7일 전 근처 스냅샷)
 * - 30일 이상: 월 단위 비교 가능 (30일 전 근처 스냅샷)
 */
function findSnapshotNearDaysAgo(timeline: TimelineEntry[], daysAgo: number): TimelineEntry | null {
  const latest = timeline[timeline.length - 1];
  const latestDate = new Date(latest.date).getTime();
  const targetDate = latestDate - daysAgo * 86400000;

  let best: TimelineEntry | null = null;
  let bestDiff = Infinity;

  for (const entry of timeline) {
    if (entry === latest) continue;
    const diff = Math.abs(new Date(entry.date).getTime() - targetDate);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = entry;
    }
  }
  return best;
}

type TrendPeriod = "all" | "week" | "month";

const TrendView: React.FC<{
  timeline: TimelineEntry[];
  selectedCategory: string;
}> = ({ timeline, selectedCategory }) => {
  const daySpan = timeline.length >= 2
    ? Math.round((new Date(timeline[timeline.length - 1].date).getTime() - new Date(timeline[0].date).getTime()) / 86400000)
    : 0;

  const availablePeriods: { key: TrendPeriod; label: string }[] = [];
  if (timeline.length >= 3) availablePeriods.push({ key: "all", label: "전체" });
  if (daySpan >= 7) availablePeriods.push({ key: "week", label: "주간" });
  if (daySpan >= 30) availablePeriods.push({ key: "month", label: "월간" });

  const [period, setPeriod] = React.useState<TrendPeriod>("all");

  if (timeline.length < 3) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="text-gray-400 text-4xl mb-3">~</div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">트렌드 데이터 수집 중</h3>
        <p className="text-sm text-gray-400 mb-4">
          최소 3회 이상의 데이터 수집이 필요합니다.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <p className="text-xs text-gray-500 mb-2">현재 수집된 스냅샷:</p>
          {timeline.map((t) => (
            <div key={t.date} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-teal-600 font-medium">{t.date}</span>
              <span className="text-gray-400">
                {t.categories[selectedCategory]?.totalJobs || 0}개 공고 · TOP 20 키워드 저장됨
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          현재 {timeline.length}회 수집됨. {3 - timeline.length}회 후부터 트렌드를 확인할 수 있습니다.
        </p>
      </div>
    );
  }

  // 비교 기준 스냅샷 결정
  const latest = timeline[timeline.length - 1];
  let previous: TimelineEntry;
  if (period === "month") {
    previous = findSnapshotNearDaysAgo(timeline, 30) || timeline[0];
  } else if (period === "week") {
    previous = findSnapshotNearDaysAgo(timeline, 7) || timeline[0];
  } else {
    previous = timeline[0]; // 전체: 첫 스냅샷 vs 최신
  }

  const latestCat = latest.categories[selectedCategory];
  const prevCat = previous.categories[selectedCategory];

  if (!latestCat) return <div className="text-center text-gray-500 py-12">데이터가 없습니다.</div>;

  // 이전 키워드 맵
  const prevMap = new Map<string, { count: number; rank: number }>();
  (prevCat?.topKeywords || []).forEach((kw, i) => prevMap.set(kw.keyword, { count: kw.count, rank: i + 1 }));

  const jobsDiff = latestCat.totalJobs - (prevCat?.totalJobs || 0);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">키워드 트렌드</h2>
          <p className="text-xs text-gray-400">{previous.date} → {latest.date}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          {availablePeriods.length > 1 && (
            <div className="flex gap-1">
              {availablePeriods.map((p) => (
                <button
                  key={p.key}
                  className={
                    period === p.key
                      ? "px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-white"
                      : "px-2 py-0.5 rounded text-xs text-gray-500 hover:bg-gray-200 transition-colors"
                  }
                  onClick={() => setPeriod(p.key)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
          <span className="text-sm text-gray-500">
            공고 수: {latestCat.totalJobs}개
            {jobsDiff !== 0 && (
              <span className={jobsDiff > 0 ? "text-teal-600 ml-1" : "text-red-500 ml-1"}>
                ({jobsDiff > 0 ? "+" : ""}{jobsDiff})
              </span>
            )}
          </span>
        </div>
      </div>
      <div className="space-y-2.5">
        {latestCat.topKeywords.map((kw, i) => {
          const prev = prevMap.get(kw.keyword);
          const countDiff = prev ? kw.count - prev.count : kw.count;
          const rankDiff = prev ? prev.rank - (i + 1) : 0; // positive = rank improved
          const isNew = !prev;
          const maxCount = latestCat.topKeywords[0]?.count || 1;
          const pct = Math.round((kw.count / maxCount) * 100);

          return (
            <div key={kw.keyword}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 flex items-center gap-1.5">
                  <span className={i < 3 ? "font-bold text-teal-700" : "text-gray-500"}>{i + 1}</span>
                  {rankDiff > 0 && <span className="text-xs text-teal-600">{"▲"}{rankDiff}</span>}
                  {rankDiff < 0 && <span className="text-xs text-red-400">{"▼"}{Math.abs(rankDiff)}</span>}
                  {isNew && <span className="text-xs bg-amber-100 text-amber-700 px-1 rounded font-bold">NEW</span>}
                  {kw.keyword}
                </span>
                <span className="text-xs text-gray-500 tabular-nums flex items-center gap-1">
                  {kw.count}건
                  {countDiff !== 0 && !isNew && (
                    <span className={countDiff > 0 ? "text-teal-600" : "text-red-400"}>
                      ({countDiff > 0 ? "+" : ""}{countDiff})
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isNew ? "bg-amber-400" : i < 3 ? BAR_COLORS[i] : "bg-gray-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-4">
        총 {timeline.length}회 스냅샷 수집됨 ({timeline[0].date} ~ {latest.date})
      </p>
    </div>
  );
};

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
  const [selectedCategory, setSelectedCategory] = React.useState("frontend");

  // 크로스페이지 카테고리 공유: mount 시 복원
  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("rbye_last_type") || '""');
      if (saved && CATEGORIES.some((c) => c.key === saved)) {
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
      title="기술 키워드 통계 - RBYE.VERCEL.APP"
      pageType="stats"
      canonicalPath="/stats"
    >
      <div className="block m-auto lg:max-w-3xl px-4">
        {/* 카테고리 탭 */}
        <div className="flex justify-center gap-1 mb-6">
          {CATEGORIES.map((cat) => (
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
                    {CATEGORIES.find((c) => c.key === selectedCategory)?.label}{" "}
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

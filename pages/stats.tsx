import * as React from "react";
import fetch from "isomorphic-unfetch";
import { GetServerSideProps } from "next";
import parse from "date-fns/parse";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import koLocale from "date-fns/locale/ko";
import Layout from "../components/Layout";
import { apiUrl } from "../utils/apiLocation";

interface StatsData {
  [category: string]: {
    [year: string]: {
      [skill: string]: number;
    };
  };
}

interface Props {
  stats: StatsData;
  updated: object[];
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

const StatsPage = ({ stats, updated }: Props) => {
  const [selectedCategory, setSelectedCategory] = React.useState("frontend");
  const [selectedYear, setSelectedYear] = React.useState("전체");

  const categoryData = stats[selectedCategory] || {};
  const yearData = categoryData[selectedYear] || {};

  const sortedSkills = Object.entries(yearData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  const maxCount = sortedSkills.length > 0 ? sortedSkills[0][1] : 0;
  const totalCount = sortedSkills.reduce((sum, [, count]) => sum + count, 0);

  return (
    <Layout title="기술 키워드 통계 - RBYE.VERCEL.APP">
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
              onClick={() => {
                setSelectedCategory(cat.key);
                setSelectedYear("전체");
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 연차 선택 */}
        <div className="flex flex-wrap justify-center gap-1 mb-8">
          {YEARS.map((year) => (
            <button
              key={year}
              className={
                selectedYear === year
                  ? "px-3 py-1 rounded text-xs font-medium bg-gray-700 text-white"
                  : "px-3 py-1 rounded text-xs text-gray-600 hover:bg-gray-300 transition-colors"
              }
              onClick={() => setSelectedYear(year)}
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
                <span className="text-teal-700">{selectedYear}</span> TOP 15
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
                return (
                  <div key={skill} className="group">
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <p className="text-center text-gray-600 text-sm mt-8 mb-4">
          본 통계는 현재 사이트에 등록된 공고 데이터를 기준으로 생성되었습니다.
          {updated?.[0]?.[selectedCategory] && (
            <span className="block text-gray-600 text-xs mt-1">
              데이터 업데이트{" "}
              {formatDistanceToNow(
                parse(
                  updated[0][selectedCategory],
                  "yyyy-M-dd HH:mm:ss",
                  new Date()
                ),
                { locale: koLocale }
              )}{" "}
              전 ({updated[0][selectedCategory]})
            </span>
          )}
        </p>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const [res, res2] = await Promise.all([
      fetch(`${apiUrl}/stats`),
      fetch(`${apiUrl}/updated`),
    ]);
    const statsArray = await res.json();
    const updated: object[] = await res2.json();
    const stats =
      Array.isArray(statsArray) && statsArray.length > 0
        ? statsArray[0]
        : statsArray;
    return { props: { stats, updated } };
  } catch (e) {
    console.error("Stats API 요청 실패:", e);
    return { props: { stats: {}, updated: [{}] } };
  }
};

export default StatsPage;

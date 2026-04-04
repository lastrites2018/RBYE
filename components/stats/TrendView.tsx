import React from "react";

interface TimelineEntry {
  date: string;
  categories: {
    [cat: string]: {
      totalJobs: number;
      topKeywords: { keyword: string; count: number }[];
    };
  };
}

const BAR_COLORS = ["bg-teal-700", "bg-teal-600", "bg-teal-500"];

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

  const latest = timeline[timeline.length - 1];
  let previous: TimelineEntry;
  if (period === "month") {
    previous = findSnapshotNearDaysAgo(timeline, 30) || timeline[0];
  } else if (period === "week") {
    previous = findSnapshotNearDaysAgo(timeline, 7) || timeline[0];
  } else {
    previous = timeline[0];
  }

  const latestCat = latest.categories[selectedCategory];
  const prevCat = previous.categories[selectedCategory];

  if (!latestCat) return <div className="text-center text-gray-500 py-12">데이터가 없습니다.</div>;

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
          const rankDiff = prev ? prev.rank - (i + 1) : 0;
          const isNew = !prev && period !== "all";
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

export default TrendView;

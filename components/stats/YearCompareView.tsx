import React from "react";

const COMPARE_YEARS = ["1년", "2년", "3년", "5년", "8년"];

const YearCompareView: React.FC<{
  categoryData: any;
}> = ({ categoryData }) => {
  const totalJobs = categoryData.totalJobs || {};

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

export default YearCompareView;

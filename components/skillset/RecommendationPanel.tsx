import React from "react";

const RecommendationPanel: React.FC<{
  recommendations: { name: string; count: number; percent: number }[];
  onClickSkill: (skill: string) => void;
}> = ({ recommendations, onClickSkill }) => {
  if (recommendations.length === 0) return null;
  return (
    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-5">
      <h3 className="text-base font-semibold text-teal-700 mb-1">다음에 배울 추천 기술</h3>
      <p className="text-sm text-gray-500 mb-3">보유하지 않은 기술 중 시장 수요가 가장 높은 순서입니다.</p>
      <div className="space-y-1.5">
        {recommendations.map((rec, i) => (
          <div
            key={rec.name}
            className="flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-teal-100 transition-colors"
            onClick={() => onClickSkill(rec.name)}
          >
            <span className="text-sm font-bold text-teal-600 w-4">{i + 1}.</span>
            <span className="text-sm font-medium text-gray-700">{rec.name}</span>
            <span className="text-sm text-gray-400 flex-1 text-right">
              {rec.count}건 ({rec.percent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationPanel;

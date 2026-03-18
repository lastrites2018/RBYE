import React from "react";
import SkillBar from "./SkillBar";
import { PhaseInfo, DemandLevel } from "./types";

export const PhaseConnector: React.FC = () => (
  <div className="flex justify-center py-1">
    <div className="w-0.5 h-5 bg-gray-200" />
  </div>
);

const PhaseSection: React.FC<{
  info: PhaseInfo;
  roadmapArea?: string;
  skills: { [skill: string]: number } | null;
  totalJobs: number;
  demandMap: Map<string, DemandLevel>;
  checkedSkills: Set<string>;
  checkMode: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onToggleSkill: (skill: string) => void;
  onClickSkill: (skill: string) => void;
}> = ({ info, roadmapArea, skills, totalJobs, demandMap, checkedSkills, checkMode, collapsed, onToggleCollapse, onToggleSkill, onClickSkill }) => {
  const isEmpty = !skills || Object.keys(skills).length === 0;
  const sortedSkills = isEmpty ? [] : Object.entries(skills!).sort(([, a], [, b]) => b - a);
  const checkedCount = sortedSkills.filter(([s]) => checkedSkills.has(s)).length;

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${isEmpty ? "opacity-50" : ""}`}>
      <div
        className={`px-4 py-3 ${collapsed ? "" : "border-b border-gray-100"} ${checkMode && !isEmpty ? "cursor-pointer select-none" : ""}`}
        onClick={checkMode && !isEmpty ? onToggleCollapse : undefined}
      >
        <div className="flex items-center justify-between flex-wrap gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white bg-teal-600 rounded px-1.5 py-0.5">
              {info.phase}
            </span>
            <span className="text-base font-semibold text-gray-800">{info.title}</span>
            <span className="text-sm text-gray-400">{info.subtitle}</span>
          </div>
          <div className="flex items-center gap-2">
            {checkMode && sortedSkills.length > 0 && (
              <span className="text-sm text-teal-600 font-medium">
                {checkedCount}/{sortedSkills.length}
              </span>
            )}
            {checkMode && !isEmpty && (
              <span className="text-gray-400 text-xs">{collapsed ? "▼" : "▲"}</span>
            )}
          </div>
        </div>
        {!collapsed && roadmapArea && (
          <p className="text-xs text-gray-400 mt-1">{roadmapArea}</p>
        )}
      </div>

      {!collapsed && (
        isEmpty ? (
          <div className="px-4 py-6 text-center text-gray-400 text-sm">
            이 연차에서는 아직 요구되지 않는 영역입니다
          </div>
        ) : (
          <div className="px-2 py-2 space-y-0.5">
            {sortedSkills.map(([skill, count]) => (
              <SkillBar
                key={skill}
                name={skill}
                count={count}
                totalJobs={totalJobs}
                level={demandMap.get(skill) || "bonus"}
                checked={checkedSkills.has(skill)}
                checkMode={checkMode}
                onToggle={() => onToggleSkill(skill)}
                onClick={() => onClickSkill(skill)}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default PhaseSection;

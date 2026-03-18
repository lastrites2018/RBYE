import React from "react";
import { DemandLevel, DEMAND_COLORS } from "./types";

const SkillBar: React.FC<{
  name: string;
  count: number;
  totalJobs: number;
  level: DemandLevel;
  checked: boolean;
  checkMode: boolean;
  onToggle: () => void;
  onClick: () => void;
}> = ({ name, count, totalJobs, level, checked, checkMode, onToggle, onClick }) => {
  const colors = DEMAND_COLORS[level];
  const percent = totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0;

  return (
    <div
      className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors ${
        checked ? "bg-teal-50" : "hover:bg-gray-50"
      }`}
      onClick={checkMode ? onToggle : onClick}
    >
      {checkMode && (
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="w-3.5 h-3.5 accent-teal-600 flex-shrink-0 cursor-pointer"
        />
      )}
      <span className={`text-sm w-24 md:w-32 truncate flex-shrink-0 ${checked ? "font-semibold text-teal-700" : "text-gray-700"}`}>
        {name}
      </span>
      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden min-w-0">
        <div
          className={`h-full rounded-full transition-all duration-300 ${checked ? "bg-teal-500" : colors.bar}`}
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
      </div>
      <span className="text-sm text-gray-500 w-12 text-right flex-shrink-0 tabular-nums">
        {count}건
      </span>
      <span className="text-sm text-gray-400 w-10 text-right flex-shrink-0 tabular-nums">
        {percent}%
      </span>
    </div>
  );
};

export default SkillBar;

import React from "react";

const PassiveSkills: React.FC<{ skills: string[] }> = ({ skills }) => {
  if (!skills || skills.length === 0) return null;
  return (
    <div className="mt-5">
      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-gray-600 mb-1">기본 소양</h3>
        <p className="text-sm text-gray-400 mb-3">공고에 명시되지 않지만 기본으로 요구되는 영역</p>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 bg-white border border-gray-200 text-gray-500 rounded text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PassiveSkills;

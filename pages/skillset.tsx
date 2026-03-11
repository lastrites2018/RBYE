import * as React from "react";
import fs from "fs";
import path from "path";
import fetch from "isomorphic-unfetch";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { apiUrl } from "../utils/apiLocation";

// --- 타입 ---

interface CategorySkills {
  skills: { [skill: string]: number };
  total: number;
}

interface CategoryStats {
  [year: string]: { [slotKey: string]: CategorySkills };
}

interface StatsData {
  [category: string]: {
    categoryStats?: CategoryStats;
    totalJobs?: { [year: string]: number };
    passiveSkills?: string[];
    roadmapMapping?: { [slot: string]: string };
    [year: string]: any;
  };
}

interface Props {
  stats: StatsData;
}

// --- 상수 ---

const CATEGORIES = [
  { key: "frontend", label: "프론트엔드" },
  { key: "nodejs", label: "Node.js" },
  { key: "server", label: "백엔드" },
  { key: "pm", label: "PM" },
];

const YEARS = ["전체", "1년", "2년", "3년", "4년", "5년", "6년", "7년", "8년", "제한없음"];

interface PhaseInfo {
  key: string;
  phase: number;
  title: string;
  subtitle: string;
}

const PHASE_CONFIG: { [category: string]: PhaseInfo[] } = {
  frontend: [
    { key: "기본장착", phase: 1, title: "기초", subtitle: "웹 개발의 기본 언어" },
    { key: "주무기", phase: 2, title: "프레임워크", subtitle: "SPA / SSR 프레임워크" },
    { key: "보조장비", phase: 3, title: "생태계", subtitle: "타입 시스템 · 상태관리 · API" },
    { key: "전투도구", phase: 4, title: "도구", subtitle: "CSS 프레임워크 · 번들러 · 버전관리" },
    { key: "고급장비", phase: 5, title: "인프라 & 테스트", subtitle: "테스팅 · CI/CD · 컨테이너" },
    { key: "AI활용", phase: 6, title: "AI 활용", subtitle: "AI 도구 · LLM · 프롬프트 엔지니어링" },
  ],
  nodejs: [
    { key: "기본장착", phase: 1, title: "기초", subtitle: "런타임 언어와 OS" },
    { key: "주무기", phase: 2, title: "프레임워크", subtitle: "서버 프레임워크" },
    { key: "보조장비", phase: 3, title: "데이터", subtitle: "데이터베이스와 ORM" },
    { key: "전투도구", phase: 4, title: "통신", subtitle: "API 설계와 메시징" },
    { key: "고급장비", phase: 5, title: "인프라 & 테스트", subtitle: "배포 · 모니터링 · 테스팅" },
    { key: "AI활용", phase: 6, title: "AI 활용", subtitle: "LLM API · RAG · AI 백엔드" },
  ],
  server: [
    { key: "기본장착", phase: 1, title: "기초", subtitle: "언어와 OOP" },
    { key: "주무기", phase: 2, title: "프레임워크", subtitle: "Spring 생태계와 ORM" },
    { key: "보조장비", phase: 3, title: "데이터", subtitle: "데이터베이스" },
    { key: "전투도구", phase: 4, title: "도구", subtitle: "빌드 도구와 버전관리" },
    { key: "고급장비", phase: 5, title: "인프라 & 아키텍처", subtitle: "MSA · 컨테이너 · 클라우드" },
    { key: "AI활용", phase: 6, title: "AI 활용", subtitle: "LLM 서빙 · RAG 파이프라인 · AI 인프라" },
  ],
  pm: [
    { key: "기본장착", phase: 1, title: "방법론", subtitle: "애자일 · 성과 지표" },
    { key: "주무기", phase: 2, title: "협업", subtitle: "프로젝트 관리 도구" },
    { key: "보조장비", phase: 3, title: "데이터", subtitle: "분석과 실험" },
    { key: "전투도구", phase: 4, title: "디자인", subtitle: "UX/UI 협업" },
    { key: "AI활용", phase: 5, title: "AI 활용", subtitle: "AI 서비스 기획 · 프롬프트 설계" },
  ],
};

// --- 수요 등급 ---

type DemandLevel = "essential" | "core" | "preferred" | "bonus";

const DEMAND_COLORS: Record<DemandLevel, { bar: string; text: string; label: string }> = {
  essential: { bar: "bg-teal-700", text: "text-teal-700", label: "필수" },
  core:      { bar: "bg-teal-500", text: "text-teal-600", label: "핵심" },
  preferred: { bar: "bg-blue-400", text: "text-blue-500", label: "우대" },
  bonus:     { bar: "bg-gray-300", text: "text-gray-500", label: "가산점" },
};

function computeDemandLevels(flatStats: { [skill: string]: number } | undefined): Map<string, DemandLevel> {
  const map = new Map<string, DemandLevel>();
  if (!flatStats) return map;
  const entries = Object.entries(flatStats).sort(([, a], [, b]) => b - a);
  const total = entries.length;
  if (total === 0) return map;
  entries.forEach(([skill], i) => {
    const rank = i / total;
    if (rank < 0.1) map.set(skill, "essential");
    else if (rank < 0.3) map.set(skill, "core");
    else if (rank < 0.6) map.set(skill, "preferred");
    else map.set(skill, "bonus");
  });
  return map;
}

// --- 컴포넌트 ---

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

const PhaseConnector: React.FC = () => (
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

// --- 메인 ---

// URL 공유용 인코딩/디코딩
function encodeSkillsToParam(skills: Set<string>): string {
  return Array.from(skills).sort().join(",");
}

function decodeSkillsFromParam(param: string): Set<string> {
  if (!param) return new Set();
  return new Set(param.split(",").map((s) => decodeURIComponent(s.trim())).filter(Boolean));
}

const SkillsetPage = ({ stats }: Props) => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = React.useState(
    () => (typeof router.query.cat === "string" && CATEGORIES.some((c) => c.key === router.query.cat) ? router.query.cat : "frontend")
  );
  const [selectedYear, setSelectedYear] = React.useState("전체");
  const [checkMode, setCheckMode] = React.useState(() => typeof router.query.skills === "string");
  const [checkedSkills, setCheckedSkills] = React.useState<Set<string>>(new Set());
  const [sharedMode, setSharedMode] = React.useState(false);
  const [collapsedPhases, setCollapsedPhases] = React.useState<Set<string>>(new Set());
  const [shareToast, setShareToast] = React.useState(false);

  // URL 쿼리에서 공유된 스킬 복원
  React.useEffect(() => {
    const { cat, skills: skillsParam } = router.query;
    if (typeof skillsParam === "string" && skillsParam) {
      const shared = decodeSkillsFromParam(skillsParam);
      if (shared.size > 0) {
        setSharedMode(true);
        setCheckMode(true);
        setCheckedSkills(shared);
        if (typeof cat === "string" && CATEGORIES.some((c) => c.key === cat)) {
          setSelectedCategory(cat);
        }
      }
    }
  }, []);

  const handleShare = () => {
    const params = new URLSearchParams();
    params.set("cat", selectedCategory);
    params.set("skills", encodeSkillsToParam(checkedSkills));
    const url = `${window.location.origin}/skillset?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }).catch(() => {
      // fallback: prompt
      window.prompt("공유 URL을 복사하세요:", url);
    });
  };

  // 접힘 상태 localStorage 복원
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(`rbye-collapsed-${selectedCategory}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCollapsedPhases(Array.isArray(parsed) ? new Set(parsed) : new Set());
      } else {
        setCollapsedPhases(new Set());
      }
    } catch {
      setCollapsedPhases(new Set());
    }
  }, [selectedCategory]);

  const toggleCollapse = (phaseKey: string) => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseKey)) next.delete(phaseKey);
      else next.add(phaseKey);
      try { localStorage.setItem(`rbye-collapsed-${selectedCategory}`, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const categoryData = stats[selectedCategory] || {};
  const categoryStats = categoryData.categoryStats as CategoryStats | undefined;

  // 현재 카테고리에 존재하는 모든 스킬 목록 (유효성 검증용)
  const validSkills = React.useMemo(() => {
    const set = new Set<string>();
    const cs = categoryData.categoryStats as CategoryStats | undefined;
    if (cs?.["전체"]) {
      Object.values(cs["전체"]).forEach((slot: CategorySkills) => {
        if (slot?.skills) Object.keys(slot.skills).forEach((s) => set.add(s));
      });
    }
    return set;
  }, [selectedCategory, categoryData]);

  React.useEffect(() => {
    // 공유 URL에서 왔으면 localStorage 복원 건너뛰기
    if (sharedMode) return;
    try {
      const saved = localStorage.getItem(`rbye-skills-${selectedCategory}`);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        if (!Array.isArray(parsed)) throw new Error("invalid format");
        const filtered = parsed.filter((s) => validSkills.has(s));
        setCheckedSkills(new Set(filtered));
        if (filtered.length !== parsed.length) {
          localStorage.setItem(`rbye-skills-${selectedCategory}`, JSON.stringify(filtered));
        }
      } else {
        setCheckedSkills(new Set());
      }
    } catch {
      setCheckedSkills(new Set());
      try { localStorage.removeItem(`rbye-skills-${selectedCategory}`); } catch {}
    }
  }, [selectedCategory, validSkills, sharedMode]);
  const yearCategoryData = categoryStats?.[selectedYear] || {};
  const passiveSkills = (categoryData.passiveSkills as string[]) || [];
  const roadmapMapping = (categoryData.roadmapMapping as { [slot: string]: string }) || {};
  const totalJobsMap = (categoryData.totalJobs as { [year: string]: number }) || {};

  const currentYearJobs = totalJobsMap[selectedYear] || 0;
  const totalAllJobs = totalJobsMap["전체"] || 0;

  const flatStats = categoryData[selectedYear] as { [skill: string]: number } | undefined;
  const demandMap = React.useMemo(() => computeDemandLevels(flatStats), [flatStats]);
  const phases = PHASE_CONFIG[selectedCategory] || PHASE_CONFIG.frontend;

  const allVisibleSkills = React.useMemo(() => {
    const skills: { name: string; count: number }[] = [];
    phases.forEach((p) => {
      const data = yearCategoryData[p.key];
      if (data?.skills) {
        Object.entries(data.skills).forEach(([name, count]) => skills.push({ name, count }));
      }
    });
    return skills.sort((a, b) => b.count - a.count);
  }, [yearCategoryData, phases]);

  const recommendations = React.useMemo(() => {
    if (!checkMode) return [];
    return allVisibleSkills
      .filter((s) => !checkedSkills.has(s.name))
      .slice(0, 5)
      .map((s) => ({
        name: s.name,
        count: s.count,
        percent: currentYearJobs > 0 ? Math.round((s.count / currentYearJobs) * 100) : 0,
      }));
  }, [checkMode, allVisibleSkills, checkedSkills, currentYearJobs]);

  const toggleSkill = (skill: string) => {
    setCheckedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      try { localStorage.setItem(`rbye-skills-${selectedCategory}`, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const handleClickSkill = (skill: string) => {
    router.push(`/t/${selectedCategory}?q=${encodeURIComponent(skill)}`);
  };

  const checkedCount = allVisibleSkills.filter((s) => checkedSkills.has(s.name)).length;
  const coveragePercent = allVisibleSkills.length > 0 ? Math.round((checkedCount / allVisibleSkills.length) * 100) : 0;

  return (
    <Layout
      title="스킬 로드맵 - RBYE.VERCEL.APP"
      pageType="skillset"
      canonicalPath="/skillset"
    >
      <div className="block m-auto lg:max-w-3xl px-4">
        {/* 카테고리 */}
        <div className="flex justify-center gap-1 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={
                selectedCategory === cat.key
                  ? "px-4 py-2 rounded-full text-sm font-semibold bg-teal-700 text-white shadow-sm"
                  : "px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-300 transition-colors"
              }
              onClick={() => { setSelectedCategory(cat.key); setSelectedYear("전체"); }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 연차 */}
        <div className="flex flex-wrap justify-center gap-1 mb-6">
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

        {/* 모드 토글 + 요약 */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1">
            <button
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                !checkMode ? "bg-teal-700 text-white" : "text-gray-500 hover:bg-gray-200"
              }`}
              onClick={() => setCheckMode(false)}
            >
              탐색
            </button>
            <button
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                checkMode ? "bg-teal-700 text-white" : "text-gray-500 hover:bg-gray-200"
              }`}
              onClick={() => setCheckMode(true)}
            >
              나의 스킬
            </button>
          </div>
          <div className="flex items-center gap-2 text-right">
            {checkMode && checkedCount > 0 && (
              <button
                onClick={handleShare}
                className="px-2.5 py-1 rounded text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                title="나의 스킬셋 URL 복사"
              >
                공유
              </button>
            )}
            {checkMode ? (
              <span className="text-sm text-teal-700 font-semibold">
                {checkedCount}/{allVisibleSkills.length} ({coveragePercent}%)
              </span>
            ) : (
              <span className="text-xs text-gray-500">
                {currentYearJobs > 0 ? `${currentYearJobs}개 공고 · ${allVisibleSkills.length}개 기술` : ""}
              </span>
            )}
          </div>
        </div>

        {/* 모드 안내 */}
        <p className="text-sm text-gray-400 text-center mb-5">
          {checkMode
            ? "보유한 기술을 체크하세요. 시장 대비 커버리지와 학습 추천을 제공합니다."
            : "기술을 클릭하면 해당 기술을 요구하는 채용공고로 이동합니다."}
        </p>

        {/* 추천 */}
        {checkMode && checkedCount > 0 && (
          <RecommendationPanel recommendations={recommendations} onClickSkill={handleClickSkill} />
        )}

        {/* 로드맵 단계 */}
        <div>
          {phases.map((phaseInfo, index) => (
            <React.Fragment key={phaseInfo.key}>
              {index > 0 && <PhaseConnector />}
              <PhaseSection
                info={phaseInfo}
                roadmapArea={roadmapMapping[phaseInfo.key]}
                skills={yearCategoryData[phaseInfo.key]?.skills || null}
                totalJobs={currentYearJobs}
                demandMap={demandMap}
                checkedSkills={checkedSkills}
                checkMode={checkMode}
                collapsed={checkMode && collapsedPhases.has(phaseInfo.key)}
                onToggleCollapse={() => toggleCollapse(phaseInfo.key)}
                onToggleSkill={toggleSkill}
                onClickSkill={handleClickSkill}
              />
            </React.Fragment>
          ))}
        </div>

        {/* 패시브 */}
        <PassiveSkills skills={passiveSkills} />

        {/* 범례 */}
        <div className="mt-6 mb-5">
          <div className="flex justify-center gap-4 flex-wrap">
            {(Object.keys(DEMAND_COLORS) as DemandLevel[]).map((level) => {
              const c = DEMAND_COLORS[level];
              return (
                <span key={level} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={`inline-block w-6 h-2 ${c.bar} rounded-full`} />
                  {c.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* 공유 토스트 */}
        {shareToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
            공유 URL이 복사되었습니다
          </div>
        )}

        {/* 산출 기준 안내 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-4 text-sm text-gray-600 leading-relaxed">
          <h3 className="font-semibold text-gray-700 mb-3">이 데이터는 어떻게 만들어졌나요?</h3>
          <ul className="space-y-2 text-xs">
            <li>
              <span className="font-medium text-gray-700">데이터 수집</span> &mdash;
              실제 채용공고의 자격요건·우대사항 텍스트에서 기술 키워드를 추출합니다.
              현재 {totalAllJobs > 0 ? `${totalAllJobs}개` : ""} 공고가 분석에 포함되어 있습니다.
            </li>
            <li>
              <span className="font-medium text-gray-700">연차 분류</span> &mdash;
              공고에 &quot;N년 이상&quot;이라고 적혀 있으면 N년부터 상위 연차까지 모두 포함시킵니다.
              예를 들어 &quot;3년 이상&quot;은 3년~10년 모든 연차에 반영됩니다.
              &quot;신입&quot;은 1년, &quot;주니어&quot;는 1~3년, &quot;시니어&quot;는 5년 이상으로 분류합니다.
            </li>
            <li>
              <span className="font-medium text-gray-700">학습 단계</span> &mdash;
              <a href="https://roadmap.sh" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">roadmap.sh</a>의 학습 경로를 참고하여 기초 → 프레임워크 → 생태계 → 도구 → 인프라 순서로
              단계를 구성했습니다. 각 단계 안의 기술은 공고 언급 빈도순으로 정렬됩니다.
            </li>
            <li>
              <span className="font-medium text-gray-700">수요 등급</span> &mdash;
              해당 연차 내에서 언급 빈도 상위 10%는 &quot;필수&quot;, 30%까지 &quot;핵심&quot;,
              60%까지 &quot;우대&quot;, 나머지는 &quot;가산점&quot;으로 분류합니다.
            </li>
            <li>
              <span className="font-medium text-gray-700">기본 소양</span> &mdash;
              {passiveSkills.length > 0
                ? `${passiveSkills.slice(0, 3).join(", ")} 등은 거의 모든 공고에서 당연시하여 명시하지 않지만 실무에서 기본으로 요구되는 영역입니다.`
                : "공고에 명시되지 않지만 실무에서 기본으로 요구되는 영역이 있습니다."}
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  // 1) API
  try {
    const res = await fetch(`${apiUrl}/stats`);
    const statsArray = await res.json();
    const stats = Array.isArray(statsArray) && statsArray.length > 0 ? statsArray[0] : statsArray;
    if (stats.frontend?.categoryStats?.["전체"]?.["기본장착"] &&
        stats.frontend?.categoryStats?.["전체"]?.["AI활용"]) {
      return { props: { stats } };
    }
  } catch {}

  // 2) 로컬 fallback
  try {
    const candidates = [
      path.resolve(process.cwd(), "public/stats.json"),
      path.resolve(process.cwd(), "../RBYE-API/json/stats.json"),
    ];
    for (const localPath of candidates) {
      if (fs.existsSync(localPath)) {
        const raw = JSON.parse(fs.readFileSync(localPath, "utf-8"));
        const stats = Array.isArray(raw.stats) && raw.stats.length > 0 ? raw.stats[0] : raw;
        if (stats.frontend?.categoryStats?.["전체"]?.["기본장착"]) {
          return { props: { stats } };
        }
      }
    }
  } catch {}

  return { props: { stats: {} } };
};

export default SkillsetPage;

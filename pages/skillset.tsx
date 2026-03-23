import * as React from "react";
import fs from "fs";
import path from "path";
import fetch from "isomorphic-unfetch";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import parse from "date-fns/parse";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import koLocale from "date-fns/locale/ko";
import Layout from "../components/Layout";
import PhaseSection, { PhaseConnector } from "../components/skillset/PhaseSection";
import RecommendationPanel from "../components/skillset/RecommendationPanel";
import PassiveSkills from "../components/skillset/PassiveSkills";
import { CategorySkills, CategoryStats, DemandLevel, DEMAND_COLORS, PHASE_CONFIG, computeDemandLevels } from "../components/skillset/types";
import { apiUrl } from "../utils/apiLocation";
import { CATEGORY_OPTIONS, VALID_TYPES, getPageMeta } from "../utils/constants";
import {
  SkillsetMode,
  resolveInitialMode,
  isCheckMode,
  isSharedMode,
  shouldRestoreFromLocal,
  toggleMode,
  decodeSharedSkills,
  encodeSkillsParam,
  togglePhaseCollapse,
  parseCollapsedPhases,
  parseAndValidateSkills,
} from "../utils/skillsetMode";
import findNewSkills, { getPrevYear } from "../utils/findNewSkills";

// --- 타입 ---

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
  updated: object[];
}

// --- 상수 ---

const YEARS = ["전체", "1년", "2년", "3년", "4년", "5년", "6년", "7년", "8년", "제한없음"];
const SKILLSET_PAGE_META = getPageMeta("skillset");
const DEFAULT_CATEGORY = CATEGORY_OPTIONS[0]?.key || VALID_TYPES[0];

// --- 메인 ---

const SkillsetPage = ({ stats, updated }: Props) => {
  const router = useRouter();
  const hasSharedState = Boolean(router.query.cat || router.query.skills);
  const [selectedCategory, setSelectedCategoryRaw] = React.useState(
    () => (typeof router.query.cat === "string" && CATEGORY_OPTIONS.some((c) => c.key === router.query.cat) ? router.query.cat : DEFAULT_CATEGORY)
  );

  // 크로스페이지 카테고리 공유: mount 시 복원 (URL 파라미터 없을 때만)
  React.useEffect(() => {
    if (router.query.cat) return; // URL에 명시된 경우 우선
    try {
      const saved = JSON.parse(localStorage.getItem("rbye_last_type") || '""');
      if (saved && CATEGORY_OPTIONS.some((c) => c.key === saved)) {
        setSelectedCategoryRaw(saved);
      }
    } catch {}
  }, []);

  const setSelectedCategory = (key: string) => {
    setSelectedCategoryRaw(key);
    if (VALID_TYPES.includes(key)) {
      try { localStorage.setItem("rbye_last_type", JSON.stringify(key)); } catch {}
      document.cookie = `rbye_last_type=${key};path=/;max-age=31536000`;
    }
  };
  const [selectedYear, setSelectedYear] = React.useState("전체");

  const updateCategory = (key: string) => {
    setSelectedCategory(key);
    setSelectedYear("전체");
  };
  const [skillsetMode, setSkillsetMode] = React.useState<SkillsetMode>(
    () => resolveInitialMode(router.query as { skills?: string })
  );
  const skillsetModeRef = React.useRef(skillsetMode);
  skillsetModeRef.current = skillsetMode;
  const [checkedSkills, setCheckedSkills] = React.useState<Set<string>>(new Set());
  const [collapsedPhases, setCollapsedPhases] = React.useState<Set<string>>(new Set());
  const [shareToast, setShareToast] = React.useState(false);

  const checkMode = isCheckMode(skillsetMode);

  // URL 쿼리에서 공유된 스킬 복원
  React.useEffect(() => {
    const { cat, skills: skillsParam } = router.query;
    if (typeof skillsParam === "string" && skillsParam) {
      const shared = decodeSharedSkills(skillsParam);
      if (shared.size > 0) {
        setSkillsetMode({ mode: "check", source: "shared" });
        setCheckedSkills(shared);
        if (typeof cat === "string" && CATEGORY_OPTIONS.some((c) => c.key === cat)) {
          setSelectedCategory(cat);
        }
      }
    }
  }, []);

  const handleShare = () => {
    const params = new URLSearchParams();
    params.set("cat", selectedCategory);
    params.set("skills", encodeSkillsParam(checkedSkills));
    const url = `${window.location.origin}${SKILLSET_PAGE_META.route}?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }).catch(() => {
      window.prompt("공유 URL을 복사하세요:", url);
    });
  };

  // 접힘 상태 localStorage 복원
  React.useEffect(() => {
    const raw = localStorage.getItem(`rbye-collapsed-${selectedCategory}`);
    setCollapsedPhases(parseCollapsedPhases(raw));
  }, [selectedCategory]);

  const handleToggleCollapse = (phaseKey: string) => {
    setCollapsedPhases((prev) => {
      const next = togglePhaseCollapse(prev, phaseKey);
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
    if (!shouldRestoreFromLocal(skillsetModeRef.current)) return;
    const raw = localStorage.getItem(`rbye-skills-${selectedCategory}`);
    const { skills, needsCleanup } = parseAndValidateSkills(raw, validSkills);
    setCheckedSkills(new Set(skills));
    if (needsCleanup) {
      try {
        skills.length > 0
          ? localStorage.setItem(`rbye-skills-${selectedCategory}`, JSON.stringify(skills))
          : localStorage.removeItem(`rbye-skills-${selectedCategory}`);
      } catch {}
    }
  }, [selectedCategory, validSkills]);
  const yearCategoryData = categoryStats?.[selectedYear] || {};
  const prevYear = getPrevYear(selectedYear);
  const prevYearCategoryData = prevYear && categoryStats ? categoryStats[prevYear] || null : null;
  const newSkills = React.useMemo(
    () => findNewSkills(yearCategoryData, prevYearCategoryData),
    [yearCategoryData, prevYearCategoryData]
  );
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
    router.push(`${getPageMeta("job", selectedCategory).route}?q=${encodeURIComponent(skill)}`);
  };

  const checkedCount = allVisibleSkills.filter((s) => checkedSkills.has(s.name)).length;
  const coveragePercent = allVisibleSkills.length > 0 ? Math.round((checkedCount / allVisibleSkills.length) * 100) : 0;

  return (
    <Layout
      title={SKILLSET_PAGE_META.pageTitle}
      pageType="skillset"
      canonicalPath={SKILLSET_PAGE_META.route}
      noIndex={hasSharedState}
    >
      <div className="block m-auto lg:max-w-3xl px-4">
        <div className="sr-only">
          <h1>{SKILLSET_PAGE_META.heading}</h1>
          <p>{SKILLSET_PAGE_META.description}</p>
        </div>

        {/* 카테고리 */}
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

        {updated?.[0]?.[selectedCategory] && (
          <div className="text-center text-gray-400 text-xs mb-3">
            데이터 업데이트{" "}
            {(() => { try { return formatDistanceToNow(parse(updated[0][selectedCategory], "yyyy-M-dd HH:mm:ss", new Date()), { locale: koLocale }); } catch { return ""; } })()}{" "}
            전
          </div>
        )}

        {/* 모드 토글 + 요약 */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1">
            <button
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                !checkMode ? "bg-teal-700 text-white" : "text-gray-500 hover:bg-gray-200"
              }`}
              onClick={() => setSkillsetMode({ mode: "explore" })}
            >
              탐색
            </button>
            <button
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                checkMode ? "bg-teal-700 text-white" : "text-gray-500 hover:bg-gray-200"
              }`}
              onClick={() => setSkillsetMode({ mode: "check", source: "local" })}
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

        {/* 모드 안내 — 체크 시작 전까지만 표시 */}
        {checkedCount === 0 && (
          <p className="text-sm text-gray-400 text-center mb-3">
            {checkMode
              ? "보유한 기술을 체크하세요. 시장 대비 커버리지와 학습 추천을 제공합니다."
              : "기술을 클릭하면 해당 기술을 요구하는 채용공고로 이동합니다."}
          </p>
        )}

        {/* 범례 */}
        {!checkMode && (
          <div className="flex justify-center gap-4 flex-wrap mb-5">
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
        )}

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
                onToggleCollapse={() => handleToggleCollapse(phaseInfo.key)}
                onToggleSkill={toggleSkill}
                onClickSkill={handleClickSkill}
                newSkills={newSkills}
              />
            </React.Fragment>
          ))}
        </div>

        {/* 패시브 */}
        <PassiveSkills skills={passiveSkills} />

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
  let updated: object[] = [{}];
  try {
    const res2 = await fetch(`${apiUrl}/updated`);
    updated = await res2.json();
  } catch {}

  // 1) API
  try {
    const res = await fetch(`${apiUrl}/stats`);
    const statsArray = await res.json();
    const stats = Array.isArray(statsArray) && statsArray.length > 0 ? statsArray[0] : statsArray;
    if (stats.frontend?.categoryStats?.["전체"]?.["기초"] &&
        stats.frontend?.categoryStats?.["전체"]?.["AI활용"]) {
      return { props: { stats, updated } };
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
        if (stats.frontend?.categoryStats?.["전체"]?.["기초"]) {
          return { props: { stats, updated } };
        }
      }
    }
  } catch {}

  return { props: { stats: {}, updated } };
};

export default SkillsetPage;

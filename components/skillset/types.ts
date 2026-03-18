export interface CategorySkills {
  skills: { [skill: string]: number };
  total: number;
}

export interface CategoryStats {
  [year: string]: { [slotKey: string]: CategorySkills };
}

export interface PhaseInfo {
  key: string;
  phase: number;
  title: string;
  subtitle: string;
}

export type DemandLevel = "essential" | "core" | "preferred" | "bonus";

export const DEMAND_COLORS: Record<DemandLevel, { bar: string; text: string; label: string }> = {
  essential: { bar: "bg-teal-700", text: "text-teal-700", label: "필수" },
  core:      { bar: "bg-teal-500", text: "text-teal-600", label: "핵심" },
  preferred: { bar: "bg-blue-400", text: "text-blue-500", label: "우대" },
  bonus:     { bar: "bg-gray-300", text: "text-gray-500", label: "가산점" },
};

export const PHASE_CONFIG: { [category: string]: PhaseInfo[] } = {
  frontend: [
    { key: "기초", phase: 1, title: "기초", subtitle: "웹 개발의 기본 언어" },
    { key: "핵심", phase: 2, title: "프레임워크", subtitle: "SPA / SSR 프레임워크" },
    { key: "확장", phase: 3, title: "생태계", subtitle: "타입 시스템 · 상태관리 · API" },
    { key: "도구", phase: 4, title: "도구", subtitle: "CSS 프레임워크 · 번들러 · 버전관리" },
    { key: "인프라", phase: 5, title: "인프라 & 테스트", subtitle: "테스팅 · CI/CD · 컨테이너" },
    { key: "AI활용", phase: 6, title: "AI 활용", subtitle: "AI 도구 · LLM · 프롬프트 엔지니어링" },
  ],
  nodejs: [
    { key: "기초", phase: 1, title: "기초", subtitle: "런타임 언어와 OS" },
    { key: "핵심", phase: 2, title: "프레임워크", subtitle: "서버 프레임워크" },
    { key: "확장", phase: 3, title: "데이터", subtitle: "데이터베이스와 ORM" },
    { key: "도구", phase: 4, title: "통신", subtitle: "API 설계와 메시징" },
    { key: "인프라", phase: 5, title: "인프라 & 테스트", subtitle: "배포 · 모니터링 · 테스팅" },
    { key: "AI활용", phase: 6, title: "AI 활용", subtitle: "LLM API · RAG · AI 백엔드" },
  ],
  server: [
    { key: "기초", phase: 1, title: "기초", subtitle: "언어와 OOP" },
    { key: "핵심", phase: 2, title: "프레임워크", subtitle: "Spring 생태계와 ORM" },
    { key: "확장", phase: 3, title: "데이터", subtitle: "데이터베이스" },
    { key: "도구", phase: 4, title: "도구", subtitle: "빌드 도구와 버전관리" },
    { key: "인프라", phase: 5, title: "인프라 & 아키텍처", subtitle: "MSA · 컨테이너 · 클라우드" },
    { key: "AI활용", phase: 6, title: "AI 활용", subtitle: "LLM 서빙 · RAG 파이프라인 · AI 인프라" },
  ],
  pm: [
    { key: "기초", phase: 1, title: "방법론", subtitle: "애자일 · 성과 지표" },
    { key: "핵심", phase: 2, title: "협업", subtitle: "프로젝트 관리 도구" },
    { key: "확장", phase: 3, title: "데이터", subtitle: "분석과 실험" },
    { key: "도구", phase: 4, title: "디자인", subtitle: "UX/UI 협업" },
    { key: "AI활용", phase: 5, title: "AI 활용", subtitle: "AI 서비스 기획 · 프롬프트 설계" },
  ],
};

export function computeDemandLevels(flatStats: { [skill: string]: number } | undefined): Map<string, DemandLevel> {
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

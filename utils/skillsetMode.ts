/**
 * 스킬셋 페이지 모드 — 순수 함수로 분리
 *
 * 엮여있던 것:
 *   checkMode(boolean) + sharedMode(boolean) + checkedSkills 복원 로직
 *   → "탐색 중인가, 내 스킬 체크 중인가, 공유 URL에서 온 건가"가 3개 상태로 분산
 *
 * 해소:
 *   SkillsetMode 판별 유니온으로 의도를 하나의 값으로 표현
 */

export type SkillsetMode =
  | { mode: "explore" }
  | { mode: "check"; source: "local" }
  | { mode: "check"; source: "shared" };

/**
 * URL 쿼리 파라미터에서 초기 모드를 결정한다.
 */
export function resolveInitialMode(query: {
  skills?: string;
}): SkillsetMode {
  if (typeof query.skills === "string" && query.skills) {
    return { mode: "check", source: "shared" };
  }
  return { mode: "explore" };
}

/**
 * 체크 모드인지 여부.
 */
export function isCheckMode(mode: SkillsetMode): boolean {
  return mode.mode === "check";
}

/**
 * 탐색 모드인지 여부.
 */
export function isExploreMode(mode: SkillsetMode): boolean {
  return mode.mode === "explore";
}

/**
 * 공유 URL에서 온 건지 여부.
 */
export function isSharedMode(mode: SkillsetMode): boolean {
  return mode.mode === "check" && mode.source === "shared";
}

/**
 * 로컬 스킬 체크 모드인지 여부.
 */
export function isLocalCheckMode(mode: SkillsetMode): boolean {
  return mode.mode === "check" && mode.source === "local";
}

/**
 * 탐색 ↔ 체크 토글.
 */
export function toggleMode(current: SkillsetMode): SkillsetMode {
  if (current.mode === "explore") {
    return { mode: "check", source: "local" };
  }
  return { mode: "explore" };
}

/**
 * 체크된 스킬을 localStorage에서 복원해야 하는지 판별한다.
 * 공유 URL에서 온 경우 복원하지 않는다.
 */
export function shouldRestoreFromLocal(mode: SkillsetMode): boolean {
  return mode.mode !== "check" || mode.source !== "shared";
}

/**
 * URL 공유 파라미터에서 스킬 Set을 디코딩한다.
 */
export function decodeSharedSkills(param: string | undefined): Set<string> {
  if (!param) return new Set();
  return new Set(
    param.split(",").map((s) => decodeURIComponent(s.trim())).filter(Boolean)
  );
}

/**
 * 스킬 Set을 URL 공유 파라미터로 인코딩한다.
 */
export function encodeSkillsParam(skills: Set<string>): string {
  return Array.from(skills).sort().join(",");
}

/**
 * 접힘 상태 토글 (불변 Set 반환).
 */
export function togglePhaseCollapse(
  collapsed: Set<string>,
  phaseKey: string
): Set<string> {
  const next = new Set(collapsed);
  if (next.has(phaseKey)) next.delete(phaseKey);
  else next.add(phaseKey);
  return next;
}

/**
 * 저장된 스킬을 유효한 스킬 목록으로 필터링한다.
 */
export function filterValidSkills(
  saved: string[],
  validSkills: Set<string>
): string[] {
  return saved.filter((s) => validSkills.has(s));
}


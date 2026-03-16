// 책임: 스킬셋 페이지의 모드/체크/공유/접힘 로직이 올바르다
import { describe, test, expect } from "bun:test";
import {
  SkillsetMode,
  resolveInitialMode,
  isCheckMode,
  isExploreMode,
  isSharedMode,
  isLocalCheckMode,
  toggleMode,
  shouldRestoreFromLocal,
  decodeSharedSkills,
  encodeSkillsParam,
  togglePhaseCollapse,
  filterValidSkills,
  parseCollapsedPhases,
  parseAndValidateSkills,
} from "../utils/skillsetMode";

// --- resolveInitialMode ---

describe("resolveInitialMode", () => {
  test("skills 쿼리가 없으면 explore 모드", () => {
    expect(resolveInitialMode({})).toEqual({ mode: "explore" });
  });

  test("skills 쿼리가 빈 문자열이면 explore 모드", () => {
    expect(resolveInitialMode({ skills: "" })).toEqual({ mode: "explore" });
  });

  test("skills 쿼리가 있으면 shared check 모드", () => {
    expect(resolveInitialMode({ skills: "React,TypeScript" })).toEqual({
      mode: "check",
      source: "shared",
    });
  });
});

// --- 모드 판별 ---

describe("모드 판별", () => {
  const explore: SkillsetMode = { mode: "explore" };
  const localCheck: SkillsetMode = { mode: "check", source: "local" };
  const sharedCheck: SkillsetMode = { mode: "check", source: "shared" };

  test("isCheckMode", () => {
    expect(isCheckMode(explore)).toBe(false);
    expect(isCheckMode(localCheck)).toBe(true);
    expect(isCheckMode(sharedCheck)).toBe(true);
  });

  test("isExploreMode", () => {
    expect(isExploreMode(explore)).toBe(true);
    expect(isExploreMode(localCheck)).toBe(false);
  });

  test("isSharedMode", () => {
    expect(isSharedMode(explore)).toBe(false);
    expect(isSharedMode(localCheck)).toBe(false);
    expect(isSharedMode(sharedCheck)).toBe(true);
  });

  test("isLocalCheckMode", () => {
    expect(isLocalCheckMode(explore)).toBe(false);
    expect(isLocalCheckMode(localCheck)).toBe(true);
    expect(isLocalCheckMode(sharedCheck)).toBe(false);
  });
});

// --- toggleMode ---

describe("toggleMode", () => {
  test("explore → local check", () => {
    expect(toggleMode({ mode: "explore" })).toEqual({
      mode: "check",
      source: "local",
    });
  });

  test("local check → explore", () => {
    expect(toggleMode({ mode: "check", source: "local" })).toEqual({
      mode: "explore",
    });
  });

  test("shared check → explore (공유 모드도 탐색으로 전환 가능)", () => {
    expect(toggleMode({ mode: "check", source: "shared" })).toEqual({
      mode: "explore",
    });
  });
});

// --- shouldRestoreFromLocal ---

describe("shouldRestoreFromLocal", () => {
  test("explore 모드에서는 true (로컬 복원 가능)", () => {
    expect(shouldRestoreFromLocal({ mode: "explore" })).toBe(true);
  });

  test("local check 모드에서는 true", () => {
    expect(shouldRestoreFromLocal({ mode: "check", source: "local" })).toBe(true);
  });

  test("shared check 모드에서는 false (URL 스킬 유지)", () => {
    expect(shouldRestoreFromLocal({ mode: "check", source: "shared" })).toBe(false);
  });
});

// --- decodeSharedSkills ---

describe("decodeSharedSkills", () => {
  test("쉼표로 구분된 스킬을 Set으로 변환", () => {
    const result = decodeSharedSkills("React,TypeScript,Next.js");
    expect(result.size).toBe(3);
    expect(result.has("React")).toBe(true);
    expect(result.has("TypeScript")).toBe(true);
    expect(result.has("Next.js")).toBe(true);
  });

  test("빈 문자열이면 빈 Set", () => {
    expect(decodeSharedSkills("").size).toBe(0);
  });

  test("undefined이면 빈 Set", () => {
    expect(decodeSharedSkills(undefined).size).toBe(0);
  });

  test("URL 인코딩된 문자를 디코딩", () => {
    const result = decodeSharedSkills("C%2B%2B,C%23");
    expect(result.has("C++")).toBe(true);
    expect(result.has("C#")).toBe(true);
  });

  test("공백을 trim 처리", () => {
    const result = decodeSharedSkills("React , TypeScript");
    expect(result.has("React")).toBe(true);
    expect(result.has("TypeScript")).toBe(true);
  });
});

// --- encodeSkillsParam ---

describe("encodeSkillsParam", () => {
  test("Set을 정렬된 쉼표 문자열로 변환", () => {
    const skills = new Set(["TypeScript", "React", "Next.js"]);
    expect(encodeSkillsParam(skills)).toBe("Next.js,React,TypeScript");
  });

  test("빈 Set이면 빈 문자열", () => {
    expect(encodeSkillsParam(new Set())).toBe("");
  });

  test("하나만 있으면 그대로", () => {
    expect(encodeSkillsParam(new Set(["React"]))).toBe("React");
  });
});

// --- togglePhaseCollapse ---

describe("togglePhaseCollapse", () => {
  test("접혀있지 않은 phase를 접는다", () => {
    const result = togglePhaseCollapse(new Set(), "기본장착");
    expect(result.has("기본장착")).toBe(true);
  });

  test("접혀있는 phase를 펼친다", () => {
    const result = togglePhaseCollapse(new Set(["기본장착"]), "기본장착");
    expect(result.has("기본장착")).toBe(false);
  });

  test("다른 phase에 영향을 주지 않는다", () => {
    const collapsed = new Set(["기본장착", "주무기"]);
    const result = togglePhaseCollapse(collapsed, "기본장착");
    expect(result.has("기본장착")).toBe(false);
    expect(result.has("주무기")).toBe(true);
  });

  test("원본 Set을 변경하지 않는다 (불변)", () => {
    const original = new Set(["기본장착"]);
    const result = togglePhaseCollapse(original, "기본장착");
    expect(original.has("기본장착")).toBe(true); // 원본 유지
    expect(result.has("기본장착")).toBe(false);
  });
});

// --- filterValidSkills ---

describe("filterValidSkills", () => {
  const valid = new Set(["React", "TypeScript", "Next.js", "Vue"]);

  test("유효한 스킬만 남긴다", () => {
    const saved = ["React", "Angular", "TypeScript", "Svelte"];
    const result = filterValidSkills(saved, valid);
    expect(result).toEqual(["React", "TypeScript"]);
  });

  test("모두 유효하면 그대로 반환", () => {
    const saved = ["React", "TypeScript"];
    expect(filterValidSkills(saved, valid)).toEqual(["React", "TypeScript"]);
  });

  test("모두 무효하면 빈 배열", () => {
    expect(filterValidSkills(["Angular", "Svelte"], valid)).toEqual([]);
  });

  test("빈 배열이면 빈 배열", () => {
    expect(filterValidSkills([], valid)).toEqual([]);
  });
});

// --- 기존 동작과의 일치 검증 ---

describe("기존 동작과의 일치", () => {
  test("URL에 skills 파라미터 → shared check 모드 + localStorage 복원 안 함", () => {
    const mode = resolveInitialMode({ skills: "React,Vue" });
    expect(isCheckMode(mode)).toBe(true);
    expect(isSharedMode(mode)).toBe(true);
    expect(shouldRestoreFromLocal(mode)).toBe(false);
  });

  test("URL에 skills 없음 → explore 모드 + localStorage 복원 가능", () => {
    const mode = resolveInitialMode({});
    expect(isExploreMode(mode)).toBe(true);
    expect(shouldRestoreFromLocal(mode)).toBe(true);
  });

  test("사용자가 '나의 스킬' 클릭 → local check + localStorage 복원 가능", () => {
    const mode = toggleMode({ mode: "explore" });
    expect(isCheckMode(mode)).toBe(true);
    expect(isLocalCheckMode(mode)).toBe(true);
    expect(shouldRestoreFromLocal(mode)).toBe(true);
  });

  test("공유 URL에서 왔다가 '탐색' 클릭 → explore", () => {
    const mode = toggleMode({ mode: "check", source: "shared" });
    expect(isExploreMode(mode)).toBe(true);
  });

  test("encode → decode 왕복이 일치한다", () => {
    const original = new Set(["React", "TypeScript", "Next.js"]);
    const encoded = encodeSkillsParam(original);
    const decoded = decodeSharedSkills(encoded);
    expect(decoded).toEqual(original);
  });
});

// --- parseCollapsedPhases ---

describe("parseCollapsedPhases", () => {
  test("정상 JSON 배열을 Set으로 변환", () => {
    const result = parseCollapsedPhases(JSON.stringify(["기본장착", "주무기"]));
    expect(result.size).toBe(2);
    expect(result.has("기본장착")).toBe(true);
  });

  test("null이면 빈 Set", () => {
    expect(parseCollapsedPhases(null).size).toBe(0);
  });

  test("빈 문자열이면 빈 Set", () => {
    expect(parseCollapsedPhases("").size).toBe(0);
  });

  test("잘못된 JSON이면 빈 Set", () => {
    expect(parseCollapsedPhases("{invalid").size).toBe(0);
  });

  test("배열이 아닌 JSON이면 빈 Set", () => {
    expect(parseCollapsedPhases(JSON.stringify({ a: 1 })).size).toBe(0);
  });
});

// --- parseAndValidateSkills ---

describe("parseAndValidateSkills", () => {
  const valid = new Set(["React", "TypeScript", "Vue"]);

  test("유효한 스킬만 남기고 needsCleanup=false", () => {
    const raw = JSON.stringify(["React", "TypeScript"]);
    const result = parseAndValidateSkills(raw, valid);
    expect(result.skills).toEqual(["React", "TypeScript"]);
    expect(result.needsCleanup).toBe(false);
  });

  test("무효 스킬이 있으면 제거하고 needsCleanup=true", () => {
    const raw = JSON.stringify(["React", "Angular", "TypeScript"]);
    const result = parseAndValidateSkills(raw, valid);
    expect(result.skills).toEqual(["React", "TypeScript"]);
    expect(result.needsCleanup).toBe(true);
  });

  test("null이면 빈 배열 + needsCleanup=false", () => {
    const result = parseAndValidateSkills(null, valid);
    expect(result.skills).toEqual([]);
    expect(result.needsCleanup).toBe(false);
  });

  test("잘못된 JSON이면 빈 배열 + needsCleanup=true", () => {
    const result = parseAndValidateSkills("{bad", valid);
    expect(result.skills).toEqual([]);
    expect(result.needsCleanup).toBe(true);
  });

  test("배열이 아닌 JSON이면 빈 배열 + needsCleanup=true", () => {
    const result = parseAndValidateSkills(JSON.stringify("string"), valid);
    expect(result.skills).toEqual([]);
    expect(result.needsCleanup).toBe(true);
  });

  test("모든 스킬이 무효면 빈 배열 + needsCleanup=true", () => {
    const raw = JSON.stringify(["Angular", "Svelte"]);
    const result = parseAndValidateSkills(raw, valid);
    expect(result.skills).toEqual([]);
    expect(result.needsCleanup).toBe(true);
  });
});

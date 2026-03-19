// 책임: 키워드 별칭 매핑이 올바르게 동작하여 중복 키워드를 대표 키워드로 통합한다
// 이 테스트는 RBYE-API의 util/keyword-aliases.cjs 로직을 동일하게 검증한다.
import { describe, test, expect } from "bun:test";

// --- analyze.js의 keyword-aliases.cjs 로직을 그대로 복제 ---

const KEYWORD_ALIASES: Record<string, string[]> = {
  "Agile": ["애자일"],
  "Scrum": ["스크럼"],
  "TanStack Query": ["React Query", "Tanstack Query"],
  "Go": ["Golang"],
  "GA": ["Google Analytics"],
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildPattern(keyword: string): RegExp {
  const lower = keyword.toLowerCase();
  if (lower === "node.js") return /\bnode(?:\.?js)?\b/i;

  const aliases = KEYWORD_ALIASES[keyword];
  if (aliases) {
    const all = [keyword, ...aliases].map((s) => {
      const escaped = escapeRegex(s);
      const isAscii = /^[\x20-\x7E]+$/.test(s);
      return isAscii ? "\\b" + escaped + "\\b" : escaped;
    });
    return new RegExp("(?:" + all.join("|") + ")", "i");
  }

  const escaped = escapeRegex(keyword);
  const needsTrailingBound = /\w$/.test(keyword);
  const needsLeadingBound = /^\w/.test(keyword);
  return new RegExp(
    (needsLeadingBound ? "\\b" : "") + escaped + (needsTrailingBound ? "\\b" : ""),
    "i"
  );
}

function matchKeywords(text: string, keywords: string[], patterns: RegExp[]): string[] {
  const found: string[] = [];
  if (!text) return found;
  keywords.forEach((kw, i) => {
    if (patterns[i].test(text)) found.push(kw);
  });
  return found;
}

// --- 별칭 매핑 테스트 ---

describe("별칭 패턴 매칭", () => {
  test("'애자일' 텍스트가 Agile 키워드로 매칭된다", () => {
    const pattern = buildPattern("Agile");
    expect(pattern.test("애자일 방법론 경험")).toBe(true);
    expect(pattern.test("Agile 경험자")).toBe(true);
  });

  test("'스크럼' 텍스트가 Scrum 키워드로 매칭된다", () => {
    const pattern = buildPattern("Scrum");
    expect(pattern.test("스크럼 마스터")).toBe(true);
    expect(pattern.test("Scrum Master")).toBe(true);
  });

  test("'React Query' 텍스트가 TanStack Query로 매칭된다", () => {
    const pattern = buildPattern("TanStack Query");
    expect(pattern.test("React Query 경험")).toBe(true);
    expect(pattern.test("Tanstack Query 사용")).toBe(true);
    expect(pattern.test("TanStack Query 활용")).toBe(true);
  });

  test("'Golang' 텍스트가 Go 키워드로 매칭된다", () => {
    const pattern = buildPattern("Go");
    expect(pattern.test("Golang 개발 경험")).toBe(true);
    expect(pattern.test("Go 언어")).toBe(true);
  });

  test("'Google Analytics' 텍스트가 GA로 매칭된다", () => {
    const pattern = buildPattern("GA");
    expect(pattern.test("Google Analytics 활용")).toBe(true);
    expect(pattern.test("GA 데이터 분석")).toBe(true);
  });
});

describe("별칭이 없는 키워드는 기본 패턴 사용", () => {
  test("React는 단어 경계로 매칭", () => {
    const pattern = buildPattern("React");
    expect(pattern.test("React 경험")).toBe(true);
    expect(pattern.test("Reactive 프로그래밍")).toBe(false);
  });

  test("Node.js 특수 패턴", () => {
    const pattern = buildPattern("Node.js");
    expect(pattern.test("Node.js 서버")).toBe(true);
    expect(pattern.test("NodeJS 개발")).toBe(true);
    expect(pattern.test("Node 경험")).toBe(true);
  });
});

describe("matchKeywords로 통합 카운트 검증", () => {
  test("'애자일'이 포함된 텍스트에서 Agile로 카운트된다", () => {
    const keywords = ["Agile", "Scrum", "Jira"];
    const patterns = keywords.map(buildPattern);
    const text = "애자일 환경에서 Jira를 활용한 프로젝트 관리";
    const matched = matchKeywords(text, keywords, patterns);
    expect(matched).toContain("Agile");
    expect(matched).toContain("Jira");
    expect(matched).not.toContain("Scrum");
  });

  test("'React Query'와 'TanStack Query'가 동시에 있어도 한 번만 카운트", () => {
    const keywords = ["TanStack Query", "Redux"];
    const patterns = keywords.map(buildPattern);
    const text = "React Query(현 TanStack Query) 경험자 우대. Redux 사용 가능";
    const matched = matchKeywords(text, keywords, patterns);
    expect(matched).toContain("TanStack Query");
    expect(matched).toContain("Redux");
    expect(matched).toHaveLength(2);
  });

  test("Go와 Golang이 같은 텍스트에 있어도 Go로 한 번만 카운트", () => {
    const keywords = ["Go", "Python"];
    const patterns = keywords.map(buildPattern);
    const text = "Go(Golang) 또는 Python 경험";
    const matched = matchKeywords(text, keywords, patterns);
    expect(matched).toContain("Go");
    expect(matched).toContain("Python");
    expect(matched).toHaveLength(2);
  });
});

describe("별칭 매핑 무결성", () => {
  test("모든 별칭의 대표 키워드가 존재한다", () => {
    Object.keys(KEYWORD_ALIASES).forEach((representative) => {
      expect(typeof representative).toBe("string");
      expect(representative.length).toBeGreaterThan(0);
    });
  });

  test("별칭 배열에 빈 문자열이 없다", () => {
    Object.values(KEYWORD_ALIASES).forEach((aliases) => {
      aliases.forEach((alias) => {
        expect(alias.length).toBeGreaterThan(0);
      });
    });
  });

  test("대표 키워드가 자기 자신의 별칭에 포함되지 않는다", () => {
    Object.entries(KEYWORD_ALIASES).forEach(([rep, aliases]) => {
      expect(aliases).not.toContain(rep);
    });
  });
});

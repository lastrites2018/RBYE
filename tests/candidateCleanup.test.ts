// 책임: 이미 사전에 등록된 키워드가 후보 목록에서 올바르게 제거된다
import { describe, test, expect } from "bun:test";

interface CandidateEntry {
  keyword: string;
  count: number;
  approved: boolean;
  slot: string | null;
  firstSeen?: string;
  lastUpdated?: string;
}

/**
 * discover-keywords.js mergeWithExisting의 사전 등록 키워드 제거 로직
 */
function removeDictionaryKeywords(
  candidates: Record<string, CandidateEntry[]>,
  dictionaryKeywords: Set<string>
): { cleaned: Record<string, CandidateEntry[]>; removedCount: number } {
  let removedCount = 0;
  const cleaned: Record<string, CandidateEntry[]> = {};

  Object.entries(candidates).forEach(([cat, entries]) => {
    const filtered = entries.filter((entry) => {
      if (dictionaryKeywords.has(entry.keyword.toLowerCase())) {
        removedCount++;
        return false;
      }
      return true;
    });
    if (filtered.length > 0) {
      cleaned[cat] = filtered;
    }
  });

  return { cleaned, removedCount };
}

describe("사전 등록 키워드 제거", () => {
  const dictKeywords = new Set(["react", "typescript", "agile", "spa", "go"]);

  test("사전에 있는 키워드가 후보에서 제거된다", () => {
    const candidates = {
      frontend: [
        { keyword: "SPA", count: 55, approved: false, slot: null },
        { keyword: "Bun", count: 15, approved: false, slot: null },
      ],
    };
    const { cleaned, removedCount } = removeDictionaryKeywords(candidates, dictKeywords);
    expect(removedCount).toBe(1);
    expect(cleaned.frontend).toHaveLength(1);
    expect(cleaned.frontend[0].keyword).toBe("Bun");
  });

  test("대소문자 무시로 매칭한다", () => {
    const candidates = {
      pm: [
        { keyword: "Agile", count: 33, approved: false, slot: null },
        { keyword: "agile", count: 33, approved: false, slot: null },
      ],
    };
    const { cleaned, removedCount } = removeDictionaryKeywords(candidates, dictKeywords);
    expect(removedCount).toBe(2);
    expect(cleaned.pm).toBeUndefined();
  });

  test("사전에 없는 키워드는 유지된다", () => {
    const candidates = {
      frontend: [
        { keyword: "Bun", count: 15, approved: false, slot: null },
        { keyword: "Deno", count: 10, approved: false, slot: null },
      ],
    };
    const { cleaned, removedCount } = removeDictionaryKeywords(candidates, dictKeywords);
    expect(removedCount).toBe(0);
    expect(cleaned.frontend).toHaveLength(2);
  });

  test("모든 후보가 사전에 있으면 해당 카테고리가 결과에서 사라진다", () => {
    const candidates = {
      frontend: [
        { keyword: "React", count: 100, approved: false, slot: null },
        { keyword: "TypeScript", count: 80, approved: false, slot: null },
      ],
    };
    const { cleaned, removedCount } = removeDictionaryKeywords(candidates, dictKeywords);
    expect(removedCount).toBe(2);
    expect(cleaned.frontend).toBeUndefined();
  });

  test("빈 candidates는 빈 결과", () => {
    const { cleaned, removedCount } = removeDictionaryKeywords({}, dictKeywords);
    expect(removedCount).toBe(0);
    expect(Object.keys(cleaned)).toHaveLength(0);
  });

  test("여러 카테고리에서 동시에 제거된다", () => {
    const candidates = {
      frontend: [
        { keyword: "SPA", count: 55, approved: false, slot: null },
        { keyword: "Bun", count: 15, approved: false, slot: null },
      ],
      server: [
        { keyword: "Go", count: 55, approved: false, slot: null },
        { keyword: "Rust", count: 20, approved: false, slot: null },
      ],
    };
    const { cleaned, removedCount } = removeDictionaryKeywords(candidates, dictKeywords);
    expect(removedCount).toBe(2); // SPA + Go
    expect(cleaned.frontend).toHaveLength(1);
    expect(cleaned.server).toHaveLength(1);
    expect(cleaned.server[0].keyword).toBe("Rust");
  });
});

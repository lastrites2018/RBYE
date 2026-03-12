// 책임: 즐겨찾기 토글 로직이 200개 상한을 지키며 추가/제거를 올바르게 처리한다
import { describe, test, expect } from "bun:test";
import { VALID_TYPES } from "../utils/constants";

const MAX_BOOKMARKS = 200;

interface BookmarkEntry {
  link: string;
  companyName: string;
  subject: string;
}

/**
 * useLocalPreferences.toggleBookmark의 상태 전이 로직을 추출한 순수 함수
 * prev 배열 + 토글 대상 → next 배열 반환
 */
function toggleBookmark(prev: BookmarkEntry[], job: BookmarkEntry): BookmarkEntry[] {
  const exists = prev.some((b) => b.link === job.link);
  if (!exists && prev.length >= MAX_BOOKMARKS) return prev;
  return exists
    ? prev.filter((b) => b.link !== job.link)
    : [...prev, { link: job.link, companyName: job.companyName, subject: job.subject }];
}

function makeBookmark(i: number): BookmarkEntry {
  return { link: `https://example.com/${i}`, companyName: `회사${i}`, subject: `공고${i}` };
}

describe("즐겨찾기 토글 로직", () => {
  // --- 추가 ---

  test("빈 목록에 즐겨찾기를 추가한다", () => {
    const result = toggleBookmark([], makeBookmark(1));
    expect(result).toHaveLength(1);
    expect(result[0].link).toBe("https://example.com/1");
  });

  test("기존 목록에 새 항목을 추가한다", () => {
    const prev = [makeBookmark(1)];
    const result = toggleBookmark(prev, makeBookmark(2));
    expect(result).toHaveLength(2);
  });

  // --- 제거 ---

  test("이미 존재하는 항목을 토글하면 제거한다", () => {
    const prev = [makeBookmark(1), makeBookmark(2), makeBookmark(3)];
    const result = toggleBookmark(prev, makeBookmark(2));
    expect(result).toHaveLength(2);
    expect(result.some((b) => b.link === "https://example.com/2")).toBe(false);
  });

  test("유일한 항목을 제거하면 빈 배열이 된다", () => {
    const result = toggleBookmark([makeBookmark(1)], makeBookmark(1));
    expect(result).toHaveLength(0);
  });

  // --- 200개 상한 ---

  test("199개일 때 추가하면 200개가 된다", () => {
    const prev = Array.from({ length: 199 }, (_, i) => makeBookmark(i));
    const result = toggleBookmark(prev, makeBookmark(999));
    expect(result).toHaveLength(200);
  });

  test("200개일 때 새 항목 추가를 거부한다", () => {
    const prev = Array.from({ length: 200 }, (_, i) => makeBookmark(i));
    const result = toggleBookmark(prev, makeBookmark(999));
    expect(result).toBe(prev); // 동일 참조 반환 (변경 없음)
    expect(result).toHaveLength(200);
  });

  test("201개 이상에서도 추가를 거부한다", () => {
    const prev = Array.from({ length: 250 }, (_, i) => makeBookmark(i));
    const result = toggleBookmark(prev, makeBookmark(999));
    expect(result).toBe(prev);
  });

  test("200개일 때 기존 항목 제거는 정상 동작한다", () => {
    const prev = Array.from({ length: 200 }, (_, i) => makeBookmark(i));
    const result = toggleBookmark(prev, makeBookmark(50));
    expect(result).toHaveLength(199);
  });

  // --- 멱등성 ---

  test("같은 항목을 두 번 추가하면 제거된다 (토글)", () => {
    const step1 = toggleBookmark([], makeBookmark(1));
    const step2 = toggleBookmark(step1, makeBookmark(1));
    expect(step2).toHaveLength(0);
  });

  test("존재하지 않는 항목을 제거하려 하면 추가된다 (토글)", () => {
    const prev = [makeBookmark(1)];
    const result = toggleBookmark(prev, makeBookmark(2));
    expect(result).toHaveLength(2);
  });
});

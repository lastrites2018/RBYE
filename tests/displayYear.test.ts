// 책임: 연차 버튼 생성 시 9년을 건너뛰는 비즈니스 규칙이 올바르다
import { describe, test, expect } from "bun:test";

/**
 * [type].tsx displayYear의 연차 목록 생성 로직 추출
 * 1~10년 중 9년을 건너뛴다
 */
function getDisplayYears(): number[] {
  const years: number[] = [];
  for (let i = 1; i < 11; i += 1) {
    if (i !== 9) years.push(i);
  }
  return years;
}

describe("연차 버튼 목록", () => {
  const years = getDisplayYears();

  test("총 9개의 연차를 반환한다 (10 - 1)", () => {
    expect(years).toHaveLength(9);
  });

  test("1년부터 시작한다", () => {
    expect(years[0]).toBe(1);
  });

  test("10년으로 끝난다", () => {
    expect(years[years.length - 1]).toBe(10);
  });

  test("9년을 포함하지 않는다", () => {
    expect(years).not.toContain(9);
  });

  test("1~8년과 10년을 포함한다", () => {
    expect(years).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 10]);
  });
});

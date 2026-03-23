// 책임: 회사정보 링크 생성 로직이 companyData 유무에 따라 올바르게 동작한다
import { describe, test, expect } from "bun:test";

/**
 * Job.tsx의 companyInfoObject 파생 로직
 */
function getCompanyInfoObject(companyData: any, companyName: string) {
  return companyData?.length > 0 ? companyData[0][companyName] : null;
}

/**
 * Job.tsx의 잡플래닛 URL 생성 로직
 */
function buildJobplanetUrl(companyInfoObject: any, companyName: string): string {
  return `https://www.jobplanet.co.kr/search?query=${encodeURIComponent(
    companyInfoObject?.companyName || companyName
  )}`;
}

/**
 * Job.tsx의 사람인 URL 생성 로직
 */
function buildSaraminUrl(companyInfoObject: any, companyName: string): string {
  return `https://www.saramin.co.kr/zf_user/search/company?searchword=${encodeURIComponent(
    companyInfoObject?.companyName || companyName
  )}`;
}

describe("companyInfoObject 파생", () => {
  test("companyData가 있고 해당 회사가 있으면 반환", () => {
    const data = [{ "카카오": { companyName: "카카오", kisCode: "ABC123" } }];
    expect(getCompanyInfoObject(data, "카카오")).toEqual({ companyName: "카카오", kisCode: "ABC123" });
  });

  test("companyData가 있지만 해당 회사가 없으면 undefined", () => {
    const data = [{ "네이버": { companyName: "네이버" } }];
    expect(getCompanyInfoObject(data, "카카오")).toBeUndefined();
  });

  test("companyData가 빈 배열이면 null", () => {
    expect(getCompanyInfoObject([], "카카오")).toBeNull();
  });

  test("companyData가 undefined이면 null", () => {
    expect(getCompanyInfoObject(undefined, "카카오")).toBeNull();
  });
});

describe("잡플래닛 URL", () => {
  test("companyInfoObject가 있으면 해당 이름 사용", () => {
    const url = buildJobplanetUrl({ companyName: "주식회사 카카오" }, "카카오");
    expect(url).toContain(encodeURIComponent("주식회사 카카오"));
  });

  test("companyInfoObject가 null이면 companyName fallback", () => {
    const url = buildJobplanetUrl(null, "카카오");
    expect(url).toContain(encodeURIComponent("카카오"));
  });
});

describe("사람인 URL", () => {
  test("companyInfoObject가 있으면 해당 이름 사용", () => {
    const url = buildSaraminUrl({ companyName: "주식회사 네이버" }, "네이버");
    expect(url).toContain(encodeURIComponent("주식회사 네이버"));
  });

  test("companyInfoObject가 null이면 companyName fallback", () => {
    const url = buildSaraminUrl(null, "네이버");
    expect(url).toContain(encodeURIComponent("네이버"));
  });
});

describe("나이스평가 링크 조건", () => {
  test("kisCode가 있으면 표시", () => {
    const obj = { kisCode: "ABC123" };
    expect(Boolean(obj?.kisCode)).toBe(true);
  });

  test("kisCode가 없으면 미표시", () => {
    const obj = { companyName: "카카오" };
    expect(Boolean((obj as any)?.kisCode)).toBe(false);
  });

  test("companyInfoObject가 null이면 미표시", () => {
    const obj = null as { kisCode?: string } | null;
    expect(Boolean(obj?.kisCode)).toBe(false);
  });
});

describe("BookmarkView에서의 동작", () => {
  test("companyData 미전달 시 잡플래닛/사람인은 companyName으로 동작", () => {
    const obj = getCompanyInfoObject(undefined, "스타트업A");
    expect(obj).toBeNull();
    expect(buildJobplanetUrl(obj, "스타트업A")).toContain(encodeURIComponent("스타트업A"));
    expect(buildSaraminUrl(obj, "스타트업A")).toContain(encodeURIComponent("스타트업A"));
  });
});

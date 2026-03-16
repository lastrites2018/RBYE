// 책임: 공고 페이지 필터 로직이 현재 동작과 동일한 결과를 반환한다
import { describe, test, expect } from "bun:test";
import {
  FilterState,
  buildFetchUrl,
  deriveSearchKeyword,
  filterNoLimitData,
  isButtonActive,
  buttonToFilter,
  isInfiniteScrollEnabled,
} from "../utils/jobFilter";

const API = "https://api.example.com";

// --- buildFetchUrl ---

describe("buildFetchUrl", () => {
  test("전체 모드는 null을 반환한다 (props.data 사용)", () => {
    expect(buildFetchUrl({ mode: "all" }, "frontend", API)).toBeNull();
  });

  test("연차 모드는 requirement_like 쿼리를 반환한다", () => {
    const url = buildFetchUrl({ mode: "year", year: 3 }, "frontend", API);
    expect(url).toBe(
      "https://api.example.com/frontend?contentObj.requirement_like=3년"
    );
  });

  test("제한없음 모드는 전체 데이터 URL을 반환한다", () => {
    const url = buildFetchUrl({ mode: "noLimit" }, "server", API);
    expect(url).toBe("https://api.example.com/server");
  });

  test("검색 모드는 q 파라미터를 반환한다", () => {
    const url = buildFetchUrl(
      { mode: "search", keyword: "시니어", label: "senior" },
      "frontend",
      API
    );
    expect(url).toBe(
      `https://api.example.com/frontend?q=${encodeURIComponent("시니어")}`
    );
  });

  test("검색 모드에서 keyword가 빈 문자열이면 null을 반환한다", () => {
    expect(
      buildFetchUrl(
        { mode: "search", keyword: "", label: "" },
        "frontend",
        API
      )
    ).toBeNull();
  });

  test("카테고리(type)가 다르면 URL도 달라진다", () => {
    const url = buildFetchUrl({ mode: "year", year: 5 }, "nodejs", API);
    expect(url).toContain("/nodejs?");
  });
});

// --- deriveSearchKeyword ---

describe("deriveSearchKeyword", () => {
  test("검색 모드에서는 keyword를 반환한다", () => {
    expect(
      deriveSearchKeyword({ mode: "search", keyword: "React", label: "React" })
    ).toBe("React");
  });

  test("전체 모드에서는 빈 문자열을 반환한다", () => {
    expect(deriveSearchKeyword({ mode: "all" })).toBe("");
  });

  test("연차 모드에서는 빈 문자열을 반환한다", () => {
    expect(deriveSearchKeyword({ mode: "year", year: 3 })).toBe("");
  });

  test("제한없음 모드에서는 빈 문자열을 반환한다", () => {
    expect(deriveSearchKeyword({ mode: "noLimit" })).toBe("");
  });
});

// --- filterNoLimitData ---

describe("filterNoLimitData", () => {
  const jobs = [
    {
      no: 1,
      companyName: "A",
      subject: "FE",
      link: "",
      closingDate: "",
      workingArea: "",
      contentObj: { requirement: "3년 이상 경험", preferentialTreatment: "", mainTask: "" },
    },
    {
      no: 2,
      companyName: "B",
      subject: "BE",
      link: "",
      closingDate: "",
      workingArea: "",
      contentObj: { requirement: "관련 경험 우대", preferentialTreatment: "", mainTask: "" },
    },
    {
      no: 3,
      companyName: "C",
      subject: "PM",
      link: "",
      closingDate: "",
      workingArea: "",
      contentObj: { requirement: "", preferentialTreatment: "", mainTask: "" },
    },
  ] as Job[];

  test("requirement에 '년'이 포함된 공고를 제외한다", () => {
    const result = filterNoLimitData(jobs);
    expect(result).toHaveLength(1);
    expect(result[0].companyName).toBe("B");
  });

  test("requirement가 빈 문자열인 공고도 제외한다", () => {
    const result = filterNoLimitData(jobs);
    expect(result.some((j) => j.companyName === "C")).toBe(false);
  });

  test("빈 배열이면 빈 배열을 반환한다", () => {
    expect(filterNoLimitData([])).toEqual([]);
  });
});

// --- isButtonActive ---

describe("isButtonActive", () => {
  test("전체 모드에서 전체 버튼이 활성이다", () => {
    expect(isButtonActive({ mode: "all" }, "전체")).toBe(true);
  });

  test("전체 모드에서 다른 버튼은 비활성이다", () => {
    expect(isButtonActive({ mode: "all" }, "제한없음")).toBe(false);
    expect(isButtonActive({ mode: "all" }, "신입")).toBe(false);
  });

  test("연차 모드에서 해당 연차 버튼만 활성이다", () => {
    const filter: FilterState = { mode: "year", year: 3 };
    expect(isButtonActive(filter, "햇수", 3)).toBe(true);
    expect(isButtonActive(filter, "햇수", 5)).toBe(false);
    expect(isButtonActive(filter, "전체")).toBe(false);
  });

  test("제한없음 모드에서 제한없음 버튼만 활성이다", () => {
    expect(isButtonActive({ mode: "noLimit" }, "제한없음")).toBe(true);
    expect(isButtonActive({ mode: "noLimit" }, "전체")).toBe(false);
  });

  test("검색 모드에서 해당 라벨 버튼만 활성이다", () => {
    const filter: FilterState = {
      mode: "search",
      keyword: "시니어",
      label: "senior",
    };
    expect(isButtonActive(filter, "senior")).toBe(true);
    expect(isButtonActive(filter, "신입")).toBe(false);
    expect(isButtonActive(filter, "전체")).toBe(false);
  });
});

// --- buttonToFilter ---

describe("buttonToFilter", () => {
  test("전체 버튼은 all 모드를 반환한다", () => {
    expect(buttonToFilter("전체")).toEqual({ mode: "all" });
  });

  test("햇수 버튼은 year 모드를 반환한다", () => {
    expect(buttonToFilter("햇수", 5)).toEqual({ mode: "year", year: 5 });
  });

  test("제한없음 버튼은 noLimit 모드를 반환한다", () => {
    expect(buttonToFilter("제한없음")).toEqual({ mode: "noLimit" });
  });

  test("신입 버튼은 search 모드로 keyword '신입'을 반환한다", () => {
    const result = buttonToFilter("신입");
    expect(result).toEqual({
      mode: "search",
      keyword: "신입",
      label: "신입",
    });
  });

  test("주니어 버튼은 search 모드로 keyword '주니어'를 반환한다", () => {
    const result = buttonToFilter("주니어");
    expect(result).toEqual({
      mode: "search",
      keyword: "주니어",
      label: "주니어",
    });
  });

  test("시니어 버튼은 label 'senior', keyword '시니어'를 반환한다", () => {
    const result = buttonToFilter("senior");
    expect(result).toEqual({
      mode: "search",
      keyword: "시니어",
      label: "senior",
    });
  });

  test("커스텀 검색은 keyword와 label이 동일하다", () => {
    const result = buttonToFilter("React");
    expect(result).toEqual({
      mode: "search",
      keyword: "React",
      label: "React",
    });
  });
});

// --- isInfiniteScrollEnabled ---

describe("isInfiniteScrollEnabled", () => {
  test("전체 모드에서만 true", () => {
    expect(isInfiniteScrollEnabled({ mode: "all" })).toBe(true);
  });

  test("연차 모드에서는 false", () => {
    expect(isInfiniteScrollEnabled({ mode: "year", year: 3 })).toBe(false);
  });

  test("제한없음 모드에서는 false", () => {
    expect(isInfiniteScrollEnabled({ mode: "noLimit" })).toBe(false);
  });

  test("검색 모드에서는 false", () => {
    expect(
      isInfiniteScrollEnabled({
        mode: "search",
        keyword: "test",
        label: "test",
      })
    ).toBe(false);
  });
});

// --- 기존 동작과의 일치 검증 ---

describe("기존 버튼 동작과의 일치", () => {
  // 기존: onClick={() => { setYear(0); setCurrentCategory("전체"); setSearchKeyword(""); }}
  test("전체 버튼: year=0, category=전체, searchKeyword='' 와 동일", () => {
    const filter = buttonToFilter("전체");
    expect(filter.mode).toBe("all");
    expect(deriveSearchKeyword(filter)).toBe("");
    expect(buildFetchUrl(filter, "frontend", API)).toBeNull();
    expect(isInfiniteScrollEnabled(filter)).toBe(true);
  });

  // 기존: onClick={() => { setYear(i); setCurrentCategory("햇수"); setSearchKeyword(""); }}
  test("3년 버튼: year=3, category=햇수, searchKeyword='' 와 동일", () => {
    const filter = buttonToFilter("햇수", 3);
    expect(deriveSearchKeyword(filter)).toBe("");
    expect(buildFetchUrl(filter, "frontend", API)).toBe(
      `${API}/frontend?contentObj.requirement_like=3년`
    );
    expect(isInfiniteScrollEnabled(filter)).toBe(false);
  });

  // 기존: onClick={() => { setCurrentCategory("신입"); setYear(0); setSearchKeyword("신입"); }}
  test("신입 버튼: category=신입, year=0, searchKeyword=신입 와 동일", () => {
    const filter = buttonToFilter("신입");
    expect(deriveSearchKeyword(filter)).toBe("신입");
    expect(buildFetchUrl(filter, "frontend", API)).toBe(
      `${API}/frontend?q=${encodeURIComponent("신입")}`
    );
    expect(isInfiniteScrollEnabled(filter)).toBe(false);
  });

  // 기존: onClick={() => { setCurrentCategory("senior"); setYear(0); setSearchKeyword("시니어"); }}
  test("시니어 버튼: category=senior, year=0, searchKeyword=시니어 와 동일", () => {
    const filter = buttonToFilter("senior");
    expect(deriveSearchKeyword(filter)).toBe("시니어");
    expect(isButtonActive(filter, "senior")).toBe(true);
    expect(isButtonActive(filter, "신입")).toBe(false);
    expect(buildFetchUrl(filter, "frontend", API)).toBe(
      `${API}/frontend?q=${encodeURIComponent("시니어")}`
    );
  });

  // 기존: onClick={() => { setCurrentCategory("제한없음"); setYear(0); setSearchKeyword(""); }}
  test("제한없음 버튼: category=제한없음, year=0, searchKeyword='' 와 동일", () => {
    const filter = buttonToFilter("제한없음");
    expect(deriveSearchKeyword(filter)).toBe("");
    // 전체 데이터를 가져온 뒤 클라이언트 필터링
    expect(buildFetchUrl(filter, "frontend", API)).toBe(`${API}/frontend`);
    expect(isInfiniteScrollEnabled(filter)).toBe(false);
  });

  // NavBar 검색: startSearch → setYear(0), setSearchKeyword(word), setCurrentCategory("전체")
  test("NavBar 커스텀 검색: year=0, searchKeyword=word, category=전체 와 동일", () => {
    const filter = buttonToFilter("TypeScript");
    expect(deriveSearchKeyword(filter)).toBe("TypeScript");
    expect(buildFetchUrl(filter, "frontend", API)).toBe(
      `${API}/frontend?q=TypeScript`
    );
  });

  // NavBar 빈 검색 (x 버튼): startSearch("") → setYear(0), setSearchKeyword(""), setCurrentCategory("전체")
  test("NavBar 빈 검색: 전체 모드로 복귀와 동일", () => {
    // 빈 검색은 전체로 돌아가야 함
    const filter: FilterState = { mode: "all" };
    expect(deriveSearchKeyword(filter)).toBe("");
    expect(buildFetchUrl(filter, "frontend", API)).toBeNull();
    expect(isInfiniteScrollEnabled(filter)).toBe(true);
  });
});

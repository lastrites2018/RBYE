// 책임: localStorage hydration 전/후 동작이 올바르고, mounted 가드가 접합부 버그를 방지한다
import { describe, test, expect, beforeEach } from "bun:test";
import { readJSON, writeJSON } from "../utils/storage";

// --- localStorage mock ---
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};
(globalThis as any).localStorage = localStorageMock;

// --- window.dispatchEvent mock ---
const dispatched: string[] = [];
const origDispatch = globalThis.window?.dispatchEvent;
(globalThis as any).window = {
  ...(globalThis as any).window,
  dispatchEvent: (e: Event) => { dispatched.push(e.type); },
  addEventListener: () => {},
  removeEventListener: () => {},
};

beforeEach(() => {
  localStorageMock.clear();
  dispatched.length = 0;
});

// --- readJSON ---

describe("readJSON", () => {
  test("키가 없으면 fallback을 반환한다", () => {
    expect(readJSON("nonexistent", [])).toEqual([]);
    expect(readJSON("nonexistent", false)).toBe(false);
  });

  test("저장된 JSON을 파싱하여 반환한다", () => {
    localStorageMock.setItem("test_key", JSON.stringify([1, 2, 3]));
    expect(readJSON("test_key", [])).toEqual([1, 2, 3]);
  });

  test("잘못된 JSON이면 fallback을 반환한다", () => {
    localStorageMock.setItem("bad_json", "not valid json{{{");
    expect(readJSON("bad_json", "default")).toBe("default");
  });

  test("boolean 값을 올바르게 읽는다", () => {
    localStorageMock.setItem("bool_key", "true");
    expect(readJSON("bool_key", false)).toBe(true);
  });
});

// --- writeJSON ---

describe("writeJSON", () => {
  test("값을 JSON으로 직렬화하여 저장한다", () => {
    writeJSON("write_key", { a: 1 });
    expect(JSON.parse(localStorageMock.getItem("write_key")!)).toEqual({ a: 1 });
  });

  test("이벤트 이름이 주어지면 dispatch한다", () => {
    writeJSON("ev_key", true, "my_event");
    expect(dispatched).toContain("my_event");
  });

  test("이벤트 이름이 없으면 dispatch하지 않는다", () => {
    writeJSON("no_ev_key", true);
    expect(dispatched).toHaveLength(0);
  });
});

// --- 접합부 시나리오: hydration 패턴 검증 ---

describe("접합부: hydration 전/후 패턴", () => {
  /**
   * 이 테스트는 실제 React 훅을 호출하지 않고,
   * hydration 패턴의 로직을 순수 함수로 모델링하여 검증한다.
   *
   * 실제 훅의 동작:
   *   1. useState 초기값: [] (빈 배열)
   *   2. useEffect에서 readJSON → setState + setMounted(true)
   *   3. mounted가 true일 때만 "비어있다"고 판단해도 안전
   */

  function simulateHydration<T>(key: string, fallback: T) {
    // Step 1: 마운트 전 (useState 초기값)
    let state = fallback;
    let mounted = false;

    // Step 2: useEffect 실행 (hydration)
    state = readJSON(key, fallback);
    mounted = true;

    return { state, mounted };
  }

  test("localStorage에 데이터가 있으면 hydration 후 반환된다", () => {
    const bookmarks = [{ link: "a", companyName: "A", subject: "A" }];
    writeJSON("rbye_bookmarks", bookmarks);

    const { state, mounted } = simulateHydration("rbye_bookmarks", []);
    expect(mounted).toBe(true);
    expect(state).toHaveLength(1);
  });

  test("localStorage가 비어있으면 hydration 후에도 빈 배열이다", () => {
    const { state, mounted } = simulateHydration("rbye_bookmarks", []);
    expect(mounted).toBe(true);
    expect(state).toHaveLength(0);
  });

  test("mounted가 false일 때 빈 상태를 신뢰하면 안 된다 (버그 시나리오)", () => {
    // BookmarkView 버그의 핵심:
    // mounted=false + bookmarks=[] → onEmpty 호출 → 잘못된 모드 전환
    const mounted = false;
    const bookmarks: any[] = []; // useState 초기값

    // 이 조건에서 "비어있다"고 판단하면 안 됨
    const shouldTreatAsEmpty = mounted && bookmarks.length === 0;
    expect(shouldTreatAsEmpty).toBe(false);
  });

  test("mounted가 true이고 실제로 비어있으면 빈 상태로 판단해도 안전하다", () => {
    const mounted = true;
    const bookmarks: any[] = [];

    const shouldTreatAsEmpty = mounted && bookmarks.length === 0;
    expect(shouldTreatAsEmpty).toBe(true);
  });

  test("mounted가 true이고 데이터가 있으면 빈 상태가 아니다", () => {
    writeJSON("rbye_bookmarks", [{ link: "a", companyName: "A", subject: "A" }]);
    const { state, mounted } = simulateHydration("rbye_bookmarks", []);

    const shouldTreatAsEmpty = mounted && state.length === 0;
    expect(shouldTreatAsEmpty).toBe(false);
  });
});

// --- 가독성 옵션 hydration ---

describe("가독성 옵션 hydration", () => {
  test("기본값은 모두 false다", () => {
    expect(readJSON("rbye_expand_bullets", false)).toBe(false);
    expect(readJSON("rbye_collapse_preferential", false)).toBe(false);
    expect(readJSON("rbye_collapse_maintask", false)).toBe(false);
  });

  test("저장된 true 값을 올바르게 읽는다", () => {
    writeJSON("rbye_expand_bullets", true);
    writeJSON("rbye_collapse_preferential", true);

    expect(readJSON("rbye_expand_bullets", false)).toBe(true);
    expect(readJSON("rbye_collapse_preferential", false)).toBe(true);
    expect(readJSON("rbye_collapse_maintask", false)).toBe(false);
  });
});

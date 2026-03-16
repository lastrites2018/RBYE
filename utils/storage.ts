/**
 * localStorage 읽기/쓰기 헬퍼 — 개별 훅에서 공유
 *
 * 관심사: localStorage 접근 + JSON 직렬화 + 탭 간 동기화 이벤트
 * 각 훅은 "무엇을 저장하는가"에만 집중하고, "어떻게 저장하는가"는 여기에 위임
 */

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T, event?: string) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (event) window.dispatchEvent(new Event(event));
  } catch {}
}

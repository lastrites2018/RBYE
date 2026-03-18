/**
 * 가독성 옵션 전역 상태 — zustand store
 *
 * prop drilling 제거:
 *   기존: [type].tsx → JobList → Job (3개 prop 전달)
 *   이후: Job에서 직접 useReadabilityStore() 구독
 *
 * localStorage 자동 동기화 포함.
 */
import { create } from "zustand";

interface ReadabilityState {
  expandBullets: boolean;
  collapsePreferential: boolean;
  collapseMainTask: boolean;
  isMoreInfo: boolean;
  mounted: boolean;
  toggleExpandBullets: () => void;
  toggleCollapsePreferential: () => void;
  toggleCollapseMainTask: () => void;
  toggleMoreInfo: () => void;
  hydrate: () => void;
}

const KEYS = {
  expandBullets: "rbye_expand_bullets",
  collapsePreferential: "rbye_collapse_preferential",
  collapseMainTask: "rbye_collapse_maintask",
} as const;

function readBool(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return JSON.parse(localStorage.getItem(key) || "false") === true;
  } catch {
    return false;
  }
}

function writeBool(key: string, value: boolean) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const useReadabilityStore = create<ReadabilityState>((set) => ({
  expandBullets: false,
  collapsePreferential: false,
  collapseMainTask: false,
  isMoreInfo: false,
  mounted: false,

  hydrate: () => {
    set({
      expandBullets: readBool(KEYS.expandBullets),
      collapsePreferential: readBool(KEYS.collapsePreferential),
      collapseMainTask: readBool(KEYS.collapseMainTask),
      mounted: true,
    });
  },

  toggleExpandBullets: () =>
    set((s) => {
      const next = !s.expandBullets;
      writeBool(KEYS.expandBullets, next);
      return { expandBullets: next };
    }),

  toggleCollapsePreferential: () =>
    set((s) => {
      const next = !s.collapsePreferential;
      writeBool(KEYS.collapsePreferential, next);
      return { collapsePreferential: next };
    }),

  toggleCollapseMainTask: () =>
    set((s) => {
      const next = !s.collapseMainTask;
      writeBool(KEYS.collapseMainTask, next);
      return { collapseMainTask: next };
    }),

  toggleMoreInfo: () =>
    set((s) => ({ isMoreInfo: !s.isMoreInfo })),
}));

export default useReadabilityStore;

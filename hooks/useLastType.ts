import { useCallback } from "react";
import { VALID_TYPES } from "../utils/constants";

const LAST_TYPE_KEY = "rbye_last_type";

export default function useLastType() {
  const setLastType = useCallback((type: string) => {
    if (VALID_TYPES.includes(type)) {
      try { localStorage.setItem(LAST_TYPE_KEY, JSON.stringify(type)); } catch {}
    }
  }, []);

  const getLastType = useCallback((): string => {
    if (typeof window === "undefined") return "frontend";
    try {
      const raw = localStorage.getItem(LAST_TYPE_KEY);
      const saved = raw ? JSON.parse(raw) : "frontend";
      return VALID_TYPES.includes(saved) ? saved : "frontend";
    } catch {
      return "frontend";
    }
  }, []);

  return { setLastType, getLastType };
}

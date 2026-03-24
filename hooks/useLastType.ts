import { useCallback } from "react";
import { VALID_TYPES } from "../utils/constants";
import { readJSON, writeJSON } from "../utils/storage";

const LAST_TYPE_KEY = "rbye_last_type";

export default function useLastType() {
  const setLastType = useCallback((type: string) => {
    if (VALID_TYPES.includes(type)) {
      writeJSON(LAST_TYPE_KEY, type);
    }
  }, []);

  const getLastType = useCallback((): string => {
    const saved = readJSON<string>(LAST_TYPE_KEY, "frontend");
    return VALID_TYPES.includes(saved) ? saved : "frontend";
  }, []);

  return { setLastType, getLastType };
}

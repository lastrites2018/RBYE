import { useState, useEffect, useCallback } from "react";
import { readJSON, writeJSON } from "../utils/storage";

const KEY = "rbye_expand_bullets";
const CHANGED = "rbye_expand_bullets_changed";

export default function useExpandBullets() {
  const [expandBullets, setExpandBullets] = useState(false);

  useEffect(() => {
    setExpandBullets(readJSON<boolean>(KEY, false));

    const sync = () => setExpandBullets(readJSON<boolean>(KEY, false));
    window.addEventListener(CHANGED, sync);
    return () => window.removeEventListener(CHANGED, sync);
  }, []);

  const toggle = useCallback(() => {
    setExpandBullets((prev) => {
      const next = !prev;
      writeJSON(KEY, next, CHANGED);
      return next;
    });
  }, []);

  return { expandBullets, toggleExpandBullets: toggle };
}

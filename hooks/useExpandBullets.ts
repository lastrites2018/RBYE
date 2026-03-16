import { useState, useEffect, useCallback } from "react";

const KEY = "rbye_expand_bullets";
const CHANGED = "rbye_expand_bullets_changed";

export default function useExpandBullets() {
  const [expandBullets, setExpandBullets] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setExpandBullets(JSON.parse(raw) === true);
    } catch {}

    const sync = () => {
      try {
        const raw = localStorage.getItem(KEY);
        setExpandBullets(raw ? JSON.parse(raw) === true : false);
      } catch {}
    };
    window.addEventListener(CHANGED, sync);
    return () => window.removeEventListener(CHANGED, sync);
  }, []);

  const toggle = useCallback(() => {
    setExpandBullets((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
        window.dispatchEvent(new Event(CHANGED));
      } catch {}
      return next;
    });
  }, []);

  return { expandBullets, toggleExpandBullets: toggle };
}

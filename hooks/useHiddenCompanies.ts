import { useState, useEffect, useCallback } from "react";

const HIDDEN_KEY = "rbye_hidden_companies";
const HIDDEN_CHANGED = "rbye_hidden_changed";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T, event: string) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(event));
  } catch {}
}

export default function useHiddenCompanies() {
  const [hiddenCompanies, setHiddenCompanies] = useState<string[]>([]);

  useEffect(() => {
    setHiddenCompanies(readJSON<string[]>(HIDDEN_KEY, []));

    const sync = () => setHiddenCompanies(readJSON<string[]>(HIDDEN_KEY, []));
    window.addEventListener(HIDDEN_CHANGED, sync);
    return () => window.removeEventListener(HIDDEN_CHANGED, sync);
  }, []);

  const hideCompany = useCallback((companyName: string) => {
    setHiddenCompanies((prev) => {
      if (prev.includes(companyName)) return prev;
      const next = [...prev, companyName];
      writeJSON(HIDDEN_KEY, next, HIDDEN_CHANGED);
      return next;
    });
  }, []);

  const unhideCompany = useCallback((companyName: string) => {
    setHiddenCompanies((prev) => {
      const next = prev.filter((c) => c !== companyName);
      writeJSON(HIDDEN_KEY, next, HIDDEN_CHANGED);
      return next;
    });
  }, []);

  const isCompanyHidden = useCallback(
    (companyName: string) => hiddenCompanies.includes(companyName),
    [hiddenCompanies]
  );

  return { hiddenCompanies, hideCompany, unhideCompany, isCompanyHidden };
}

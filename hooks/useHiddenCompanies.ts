import { useState, useEffect, useCallback } from "react";
import { readJSON, writeJSON } from "../utils/storage";

const KEY = "rbye_hidden_companies";
const CHANGED = "rbye_hidden_changed";

export default function useHiddenCompanies() {
  const [hiddenCompanies, setHiddenCompanies] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHiddenCompanies(readJSON<string[]>(KEY, []));
    setMounted(true);

    const sync = () => setHiddenCompanies(readJSON<string[]>(KEY, []));
    window.addEventListener(CHANGED, sync);
    return () => window.removeEventListener(CHANGED, sync);
  }, []);

  const hideCompany = useCallback((companyName: string) => {
    setHiddenCompanies((prev) => {
      if (prev.includes(companyName)) return prev;
      const next = [...prev, companyName];
      writeJSON(KEY, next, CHANGED);
      return next;
    });
  }, []);

  const unhideCompany = useCallback((companyName: string) => {
    setHiddenCompanies((prev) => {
      const next = prev.filter((c) => c !== companyName);
      writeJSON(KEY, next, CHANGED);
      return next;
    });
  }, []);

  const isCompanyHidden = useCallback(
    (companyName: string) => hiddenCompanies.includes(companyName),
    [hiddenCompanies]
  );

  return { hiddenCompanies, hideCompany, unhideCompany, isCompanyHidden, mounted };
}

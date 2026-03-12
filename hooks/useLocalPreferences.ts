import { useState, useEffect, useCallback } from "react";
import { VALID_TYPES } from "../utils/constants";

const HIDDEN_KEY = "rbye_hidden_companies";
const BOOKMARKS_KEY = "rbye_bookmarks";
const LAST_TYPE_KEY = "rbye_last_type";
const MAX_BOOKMARKS = 200;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const PREFS_CHANGED_EVENT = "rbye_prefs_changed";

function writeJSON<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(PREFS_CHANGED_EVENT));
  } catch {}
}

export default function useLocalPreferences() {
  const [hiddenCompanies, setHiddenCompanies] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHiddenCompanies(readJSON<string[]>(HIDDEN_KEY, []));
    setBookmarks(readJSON<BookmarkEntry[]>(BOOKMARKS_KEY, []));
    setMounted(true);

    const sync = () => {
      setHiddenCompanies(readJSON<string[]>(HIDDEN_KEY, []));
      setBookmarks(readJSON<BookmarkEntry[]>(BOOKMARKS_KEY, []));
    };
    window.addEventListener(PREFS_CHANGED_EVENT, sync);
    return () => window.removeEventListener(PREFS_CHANGED_EVENT, sync);
  }, []);

  const hideCompany = useCallback((companyName: string) => {
    setHiddenCompanies((prev) => {
      if (prev.includes(companyName)) return prev;
      const next = [...prev, companyName];
      writeJSON(HIDDEN_KEY, next);
      return next;
    });
  }, []);

  const unhideCompany = useCallback((companyName: string) => {
    setHiddenCompanies((prev) => {
      const next = prev.filter((c) => c !== companyName);
      writeJSON(HIDDEN_KEY, next);
      return next;
    });
  }, []);

  const isCompanyHidden = useCallback(
    (companyName: string) => hiddenCompanies.includes(companyName),
    [hiddenCompanies]
  );

  const toggleBookmark = useCallback(
    (job: { link: string; companyName: string; subject: string; contentObj?: ContentObj }) => {
      setBookmarks((prev) => {
        const exists = prev.some((b) => b.link === job.link);
        if (!exists && prev.length >= MAX_BOOKMARKS) return prev;
        const next = exists
          ? prev.filter((b) => b.link !== job.link)
          : [...prev, { link: job.link, companyName: job.companyName, subject: job.subject, contentObj: job.contentObj }];
        writeJSON(BOOKMARKS_KEY, next);
        return next;
      });
    },
    []
  );

  const isBookmarked = useCallback(
    (link: string) => bookmarks.some((b) => b.link === link),
    [bookmarks]
  );

  const hasAnyPreferences = mounted && (hiddenCompanies.length > 0 || bookmarks.length > 0);

  const setLastType = useCallback((type: string) => {
    if (VALID_TYPES.includes(type)) {
      try { localStorage.setItem(LAST_TYPE_KEY, JSON.stringify(type)); } catch {}
    }
  }, []);

  const getLastType = useCallback((): string => {
    const saved = readJSON<string>(LAST_TYPE_KEY, "frontend");
    return VALID_TYPES.includes(saved) ? saved : "frontend";
  }, []);

  return {
    hiddenCompanies,
    bookmarks,
    hideCompany,
    unhideCompany,
    isCompanyHidden,
    toggleBookmark,
    isBookmarked,
    hasAnyPreferences,
    mounted,
    setLastType,
    getLastType,
  };
}

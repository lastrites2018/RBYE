import { useState, useEffect, useCallback } from "react";

const HIDDEN_KEY = "rbye_hidden_companies";
const BOOKMARKS_KEY = "rbye_bookmarks";
const LAST_TYPE_KEY = "rbye_last_type";
const VALID_TYPES = ["frontend", "nodejs", "server", "pm"];

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
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
      writeJSON(LAST_TYPE_KEY, type);
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

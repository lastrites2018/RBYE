import { useState, useEffect, useCallback } from "react";

const BOOKMARKS_KEY = "rbye_bookmarks";
const BOOKMARKS_CHANGED = "rbye_bookmarks_changed";
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

function writeJSON<T>(key: string, value: T, event: string) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(event));
  } catch {}
}

export default function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);

  useEffect(() => {
    setBookmarks(readJSON<BookmarkEntry[]>(BOOKMARKS_KEY, []));

    const sync = () => setBookmarks(readJSON<BookmarkEntry[]>(BOOKMARKS_KEY, []));
    window.addEventListener(BOOKMARKS_CHANGED, sync);
    return () => window.removeEventListener(BOOKMARKS_CHANGED, sync);
  }, []);

  const toggleBookmark = useCallback(
    (job: { link: string; companyName: string; subject: string; contentObj?: ContentObj }) => {
      setBookmarks((prev) => {
        const exists = prev.some((b) => b.link === job.link);
        if (!exists && prev.length >= MAX_BOOKMARKS) return prev;
        const next = exists
          ? prev.filter((b) => b.link !== job.link)
          : [...prev, { link: job.link, companyName: job.companyName, subject: job.subject, contentObj: job.contentObj }];
        writeJSON(BOOKMARKS_KEY, next, BOOKMARKS_CHANGED);
        return next;
      });
    },
    []
  );

  const isBookmarked = useCallback(
    (link: string) => bookmarks.some((b) => b.link === link),
    [bookmarks]
  );

  return { bookmarks, toggleBookmark, isBookmarked };
}

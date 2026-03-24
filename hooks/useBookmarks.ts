import { useState, useEffect, useCallback } from "react";
import { readJSON, writeJSON } from "../utils/storage";

const KEY = "rbye_bookmarks";
const CHANGED = "rbye_bookmarks_changed";
const MAX_BOOKMARKS = 200;

export default function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setBookmarks(readJSON<BookmarkEntry[]>(KEY, []));
    setMounted(true);

    const sync = () => setBookmarks(readJSON<BookmarkEntry[]>(KEY, []));
    window.addEventListener(CHANGED, sync);
    return () => window.removeEventListener(CHANGED, sync);
  }, []);

  const toggleBookmark = useCallback(
    (job: { link: string; companyName: string; subject: string; contentObj?: ContentObj }) => {
      setBookmarks((prev) => {
        const exists = prev.some((b) => b.link === job.link);
        if (!exists && prev.length >= MAX_BOOKMARKS) return prev;
        const next = exists
          ? prev.filter((b) => b.link !== job.link)
          : [...prev, { link: job.link, companyName: job.companyName, subject: job.subject, contentObj: job.contentObj, savedAt: new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10) }];
        writeJSON(KEY, next, CHANGED);
        return next;
      });
    },
    []
  );

  const isBookmarked = useCallback(
    (link: string) => bookmarks.some((b) => b.link === link),
    [bookmarks]
  );

  return { bookmarks, toggleBookmark, isBookmarked, mounted };
}

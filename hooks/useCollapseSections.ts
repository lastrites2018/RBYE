import { useState, useEffect, useCallback } from "react";
import { readJSON, writeJSON } from "../utils/storage";

const PREF_KEY = "rbye_collapse_preferential";
const TASK_KEY = "rbye_collapse_maintask";
const CHANGED = "rbye_collapse_sections_changed";

export default function useCollapseSections() {
  const [collapsePreferential, setCollapsePreferential] = useState(false);
  const [collapseMainTask, setCollapseMainTask] = useState(false);

  useEffect(() => {
    setCollapsePreferential(readJSON<boolean>(PREF_KEY, false));
    setCollapseMainTask(readJSON<boolean>(TASK_KEY, false));

    const sync = () => {
      setCollapsePreferential(readJSON<boolean>(PREF_KEY, false));
      setCollapseMainTask(readJSON<boolean>(TASK_KEY, false));
    };
    window.addEventListener(CHANGED, sync);
    return () => window.removeEventListener(CHANGED, sync);
  }, []);

  const toggleCollapsePreferential = useCallback(() => {
    setCollapsePreferential((prev) => {
      const next = !prev;
      writeJSON(PREF_KEY, next, CHANGED);
      return next;
    });
  }, []);

  const toggleCollapseMainTask = useCallback(() => {
    setCollapseMainTask((prev) => {
      const next = !prev;
      writeJSON(TASK_KEY, next, CHANGED);
      return next;
    });
  }, []);

  return {
    collapsePreferential,
    collapseMainTask,
    toggleCollapsePreferential,
    toggleCollapseMainTask,
  };
}

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * 지연 실행 + 취소 패턴을 하나의 훅으로 추출.
 *
 * 사용 예: 숨기기(1.5초 유예 후 실행, 그 사이 취소 가능)
 * - start(id): 유예 시작, delay 후 onConfirm(id) 호출
 * - cancel(): 유예 취소
 * - pendingId: 현재 유예 중인 대상 (없으면 null)
 */
export default function usePendingAction<T>(
  onConfirm: (id: T) => void,
  delay: number = 1500
) {
  const [pendingId, setPendingId] = useState<T | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const start = useCallback(
    (id: T) => {
      if (timer.current) clearTimeout(timer.current);
      setPendingId(id);
      timer.current = setTimeout(() => {
        onConfirm(id);
        setPendingId(null);
      }, delay);
    },
    [onConfirm, delay]
  );

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPendingId(null);
  }, []);

  return { pendingId, start, cancel };
}

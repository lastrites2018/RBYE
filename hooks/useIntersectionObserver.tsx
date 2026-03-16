import { useEffect, useRef } from "react";

interface Props {
  root: Element | null;
  target: () => Element | null;
  onIntersect: IntersectionObserverCallback;
  threshold?: number;
  rootMargin?: string;
}

export default ({
  root,
  target,
  onIntersect,
  threshold = 0.1,
  rootMargin = "0px"
}: Props) => {
  // 함수 타입 props는 ref로 안정화 — 의존성에서 제외하여 불필요한 observer 재생성 방지
  const targetRef = useRef(target);
  targetRef.current = target;
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (...args) => onIntersectRef.current(...args),
      { root, rootMargin, threshold }
    );

    const el = targetRef.current();
    if (!el) return;

    observer.observe(el);

    return () => {
      observer.unobserve(el);
    };
  }, [root, rootMargin, threshold, target]);
};

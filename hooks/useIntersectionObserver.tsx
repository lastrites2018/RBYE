import { useEffect } from "react";

export default ({
  root,
  target,
  onIntersect,
  threshold = 0.1,
  rootMargin = "0px"
}) => {
  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, {
      root,
      rootMargin,
      threshold
    });

    target = target();
    if (!target) {
      return;
    }

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [target, root, rootMargin, onIntersect, threshold]);
};

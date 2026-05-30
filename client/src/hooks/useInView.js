import { useEffect, useRef, useState } from 'react';

/**
 * Returns a ref and a boolean `inView`.
 * When the element enters the viewport, `inView` becomes true (once).
 */
export function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.unobserve(el); // fire once
      }
    }, { threshold: 0.12, ...options });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, inView];
}

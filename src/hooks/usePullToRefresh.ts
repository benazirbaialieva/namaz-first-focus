import { useState, useRef, useCallback } from "react";

const PULL_THRESHOLD = 60;
const MIN_REFRESH_MS = 800;

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing) return;
    const el = scrollRef.current;
    if (el && el.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [refreshing]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || refreshing) return;
    const dy = Math.max(0, e.touches[0].clientY - startY.current);
    // Dampen the pull with a square root curve
    setPullDistance(Math.min(120, Math.sqrt(dy) * 4));
  }, [refreshing]);

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current || refreshing) return;
    pulling.current = false;

    if (pullDistance >= PULL_THRESHOLD) {
      setRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      const start = Date.now();
      await onRefresh();
      const elapsed = Date.now() - start;
      if (elapsed < MIN_REFRESH_MS) {
        await new Promise((r) => setTimeout(r, MIN_REFRESH_MS - elapsed));
      }
      setRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, refreshing, onRefresh]);

  return {
    pullDistance,
    refreshing,
    scrollRef,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}

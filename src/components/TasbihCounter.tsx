import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

interface TasbihCounterProps {
  count: number;
  goal: number;
  label: string;
  transliteration: string;
  onCount: () => void;
  onReset: () => void;
}

const BEAD_SIZE = 44;
const BEAD_GAP = 6;
const BEAD_STEP = BEAD_SIZE + BEAD_GAP;
const VISIBLE_BEADS = 7;

const TasbihCounter = ({ count, goal, label, transliteration, onCount, onReset }: TasbihCounterProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [flash, setFlash] = useState(false);

  const completed = count >= goal;

  const handleAdvance = useCallback(() => {
    if (count < goal) {
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
      onCount();
    }
  }, [count, goal, onCount]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = touchStartY.current - e.touches[0].clientY;
    setDragOffset(Math.max(0, Math.min(diff, BEAD_STEP)));
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    if (dragOffset > BEAD_STEP * 0.3) {
      handleAdvance();
    }
    setDragOffset(0);
  };

  // Mouse drag support
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartY.current = e.clientY;
    isDragging.current = true;
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const diff = touchStartY.current - e.clientY;
      setDragOffset(Math.max(0, Math.min(diff, BEAD_STEP)));
    };
    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (dragOffset > BEAD_STEP * 0.3) {
        handleAdvance();
      }
      setDragOffset(0);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragOffset, handleAdvance]);

  const beadOffset = -count * BEAD_STEP - dragOffset;

  return (
    <div className="flex flex-col items-center select-none">
      {/* Dhikr label */}
      <p className="font-amiri text-gold text-2xl mb-1">{label}</p>
      <p className="text-dim text-xs mb-4">{transliteration}</p>

      {/* Count display */}
      <div className="flex items-baseline gap-1 mb-6">
        <span className={`text-5xl font-extrabold transition-colors duration-200 ${completed ? "text-gold" : "text-foreground"}`}>
          {count}
        </span>
        <span className="text-dim text-lg font-bold">/ {goal}</span>
      </div>

      {/* Tasbih bead chain */}
      <div className="relative w-20 overflow-hidden rounded-3xl" style={{ height: VISIBLE_BEADS * BEAD_STEP }}>
        {/* Thread line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gold/20 z-0" />

        {/* Guide markers */}
        <div
          className="absolute left-0 right-0 z-20 pointer-events-none border-t-2 border-b-2 border-sajda/40"
          style={{
            top: Math.floor(VISIBLE_BEADS / 2) * BEAD_STEP,
            height: BEAD_STEP,
          }}
        >
          <div className="absolute inset-0 bg-sajda/5 rounded-full" />
        </div>

        {/* Beads container */}
        <motion.div
          ref={containerRef}
          className="relative z-10 cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateY(${Math.floor(VISIBLE_BEADS / 2) * BEAD_STEP + beadOffset}px)`,
            transition: dragOffset > 0 ? "none" : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onClick={(e) => {
            if (Math.abs(dragOffset) < 5) handleAdvance();
          }}
        >
          {Array.from({ length: goal }, (_, i) => {
            const isActive = i === count;
            const isPassed = i < count;
            return (
              <div
                key={i}
                className="flex items-center justify-center"
                style={{ height: BEAD_STEP }}
              >
                <motion.div
                  className={`rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                    isActive
                      ? "bg-sajda text-deep shadow-lg shadow-sajda/30"
                      : isPassed
                      ? "bg-primary/30 text-sajda/70"
                      : "bg-secondary/60 text-dim/50"
                  }`}
                  style={{
                    width: isActive ? BEAD_SIZE + 4 : BEAD_SIZE - 2,
                    height: isActive ? BEAD_SIZE + 4 : BEAD_SIZE - 2,
                  }}
                  animate={isActive && flash ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.15 }}
                >
                  {i + 1}
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Top/bottom fades */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-deep to-transparent z-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-deep to-transparent z-30 pointer-events-none" />
      </div>

      {/* Swipe hint */}
      <p className="text-dim text-[10px] mt-4 mb-2 animate-pulse">↑ swipe up or tap to count</p>

      {/* Progress bar */}
      <div className="w-48 h-1.5 rounded-full bg-secondary/30 overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full"
          style={{ background: completed ? "hsl(42, 63%, 55%)" : "hsl(136, 59%, 49%)" }}
          animate={{ width: `${(count / goal) * 100}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Completion */}
      <AnimatePresence>
        {completed && (
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <p className="font-amiri text-gold text-2xl">ما شاء الله</p>
            <p className="text-sajda text-sm font-bold">{t.completed}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={onReset} className="text-dim text-xs font-semibold underline">
        {t.reset}
      </button>
    </div>
  );
};

export default TasbihCounter;

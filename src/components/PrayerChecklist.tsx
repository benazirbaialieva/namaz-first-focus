import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/hooks/useTranslation";
import { ChevronRight } from "lucide-react";

const transition = { type: "spring" as const, damping: 25, stiffness: 200 };

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TRACK_WIDTH = 280;
const THUMB_SIZE = 56;
const UNLOCK_THRESHOLD = TRACK_WIDTH - THUMB_SIZE - 8;

const PrayerChecklist = ({ isOpen, onClose }: Props) => {
  const { currentPrayer, completePrayer, unlockAllApps } = useAppContext();
  const { t } = useTranslation();
  const [showCelebration, setShowCelebration] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const textOpacity = useTransform(x, [0, UNLOCK_THRESHOLD * 0.5], [1, 0]);
  const bgOpacity = useTransform(x, [0, UNLOCK_THRESHOLD], [0, 0.3]);

  const handleDragEnd = () => {
    if (x.get() >= UNLOCK_THRESHOLD) {
      setUnlocked(true);
      completePrayer(currentPrayer.id);
      unlockAllApps();
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        setUnlocked(false);
        x.set(0);
        onClose();
      }, 2500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-deep/80 backdrop-blur-sm" onClick={onClose} />

          <AnimatePresence>
            {showCelebration && (
              <motion.div className="absolute inset-0 z-60 flex flex-col items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={transition}>
                <p className="font-amiri text-gold text-5xl mb-4">تَقَبَّلَ ٱللَّٰهُ</p>
                <p className="text-foreground text-2xl font-extrabold">{t.taqabbalAllah}</p>
                <p className="text-dim text-sm mt-2 text-center max-w-[260px]">{t.mayAllahAccept}</p>
                <p className="text-dim text-xs mt-2">{t.ameen}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!showCelebration && (
            <motion.div className="relative w-full glass-card p-6 rounded-b-none"
              initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={transition}>
              <div className="w-10 h-1 bg-foreground/20 rounded-full mx-auto mb-4" />
              <div className="text-center mb-8">
                <p className="font-amiri text-gold text-3xl mb-1">{currentPrayer.arabic}</p>
                <p className="text-foreground font-bold text-lg mb-1">{currentPrayer.name} {t.prayer}</p>
                <p className="text-dim text-sm">{t.confirmPrayer}</p>
              </div>

              {/* Slide to unlock track */}
              <div className="flex justify-center mb-4">
                <div
                  ref={trackRef}
                  className="relative rounded-full overflow-hidden"
                  style={{
                    width: TRACK_WIDTH,
                    height: THUMB_SIZE,
                    background: "hsla(var(--primary), 0.15)",
                    border: "1px solid hsla(var(--primary), 0.25)",
                  }}
                >
                  {/* Green fill behind thumb */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      opacity: bgOpacity,
                      background: "linear-gradient(90deg, hsl(136, 59%, 49%), hsl(136, 59%, 39%))",
                    }}
                  />

                  {/* Sliding text */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ opacity: textOpacity }}
                  >
                    <span className="text-dim text-xs font-bold uppercase tracking-widest ml-8">
                      {t.slideToConfirm}
                    </span>
                  </motion.div>

                  {/* Chevron arrows hint */}
                  <motion.div
                    className="absolute inset-0 flex items-center pointer-events-none"
                    style={{ opacity: textOpacity }}
                  >
                    <div className="flex items-center gap-0 ml-16">
                      <ChevronRight size={14} className="text-dim/30" />
                      <ChevronRight size={14} className="text-dim/20 -ml-2" />
                      <ChevronRight size={14} className="text-dim/10 -ml-2" />
                    </div>
                  </motion.div>

                  {/* Draggable thumb */}
                  <motion.div
                    className="absolute top-1 left-1 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                    style={{
                      width: THUMB_SIZE - 8,
                      height: THUMB_SIZE - 8,
                      background: "linear-gradient(135deg, hsl(136, 59%, 49%), hsl(136, 59%, 39%))",
                      boxShadow: "0 0 20px hsla(136, 59%, 49%, 0.4)",
                      x,
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: UNLOCK_THRESHOLD }}
                    dragElastic={0}
                    dragMomentum={false}
                    onDragEnd={handleDragEnd}
                    whileDrag={{ scale: 1.05 }}
                  >
                    <ChevronRight size={20} className="text-deep" />
                  </motion.div>
                </div>
              </div>

              <button onClick={onClose} className="w-full mt-2 py-2 text-dim text-sm font-semibold">{t.cancel}</button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrayerChecklist;

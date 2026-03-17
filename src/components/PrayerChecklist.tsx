import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/hooks/useTranslation";

const transition = { type: "spring" as const, damping: 25, stiffness: 200 };

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PrayerChecklist = ({ isOpen, onClose }: Props) => {
  const { currentPrayer, completePrayer, unlockAllApps } = useAppContext();
  const { t } = useTranslation();
  const [showCelebration, setShowCelebration] = useState(false);

  const confirm = () => {
    completePrayer(currentPrayer.id);
    unlockAllApps();
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      onClose();
    }, 2500);
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
                <p className="font-amiri text-gold text-5xl mb-4">مَا شَاءَ ٱللَّٰهُ</p>
                <p className="text-foreground text-2xl font-extrabold">{t.mashaAllah}</p>
                <p className="text-dim text-sm mt-2">{t.prayerAccepted}</p>
                <p className="text-dim text-xs mt-1">{t.useTimeWisely}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!showCelebration && (
            <motion.div className="relative w-full glass-card p-6 rounded-b-none"
              initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={transition}>
              <div className="w-10 h-1 bg-foreground/20 rounded-full mx-auto mb-4" />
              <div className="text-center mb-6">
                <p className="font-amiri text-gold text-3xl mb-1">{currentPrayer.arabic}</p>
                <p className="text-foreground font-bold text-lg mb-1">{currentPrayer.name} {t.prayerChecklist}</p>
                <p className="text-dim text-sm">{t.confirmPrayer}?</p>
              </div>

              <motion.button onClick={confirm}
                className="w-full py-4 rounded-2xl font-extrabold text-lg text-deep"
                style={{ background: "linear-gradient(135deg, hsl(136, 59%, 49%), hsl(136, 59%, 39%))" }}
                whileTap={{ scale: 0.97 }}>
                ✅ {t.confirmPrayer}
              </motion.button>
              <button onClick={onClose} className="w-full mt-3 py-2 text-dim text-sm font-semibold">{t.cancel}</button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrayerChecklist;

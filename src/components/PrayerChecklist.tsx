import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/contexts/AppContext";
import { Check } from "lucide-react";

const transition = { type: "spring" as const, damping: 25, stiffness: 200 };

const steps = [
  { id: "wudu", label: "Performed Wudu", desc: "Purification for prayer", icon: "💧" },
  { id: "qibla", label: "Faced Qibla", desc: "Direction of Makkah", icon: "🧭" },
  { id: "niyyah", label: "Made Niyyah", desc: "Sincere intention", icon: "❤️" },
  { id: "prayer", label: "Completed Prayer", desc: "All rak'ahs done", icon: "🤲" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PrayerChecklist = ({ isOpen, onClose }: Props) => {
  const { currentPrayer, completePrayer, unlockAllApps } = useAppContext();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showCelebration, setShowCelebration] = useState(false);

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const allChecked = checkedCount === 4;

  const toggle = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const confirm = () => {
    completePrayer(currentPrayer.id);
    unlockAllApps();
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      setChecked({});
      onClose();
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-deep/80 backdrop-blur-sm" onClick={onClose} />

          {/* Celebration */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                className="absolute inset-0 z-60 flex flex-col items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={transition}
              >
                <p className="font-amiri text-gold text-5xl mb-4">مَا شَاءَ ٱللَّٰهُ</p>
                <p className="text-foreground text-2xl font-extrabold">MashaAllah!</p>
                <p className="text-dim text-sm mt-2">Prayer accepted. Your apps are now unlocked.</p>
                <p className="text-dim text-xs mt-1">Use your time wisely.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!showCelebration && (
            <motion.div
              className="relative w-full glass-card p-6 rounded-b-none"
              initial={{ y: 400 }}
              animate={{ y: 0 }}
              exit={{ y: 400 }}
              transition={transition}
            >
              <div className="w-10 h-1 bg-foreground/20 rounded-full mx-auto mb-4" />
              <div className="text-center mb-6">
                <p className="font-amiri text-gold text-2xl">{currentPrayer.arabic}</p>
                <p className="text-foreground font-bold text-lg">{currentPrayer.name} Prayer Checklist</p>
              </div>

              <div className="space-y-3 mb-6">
                {steps.map(step => (
                  <motion.button
                    key={step.id}
                    onClick={() => toggle(step.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      checked[step.id] ? "bg-primary/15 border border-sajda/30" : "glass-card-light"
                    }`}
                    whileTap={{ scale: 0.95 }}
                    transition={transition}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      checked[step.id] ? "bg-sajda" : "border-2 border-dim/30"
                    }`}>
                      {checked[step.id] && <Check size={16} className="text-deep" />}
                    </div>
                    <div className="text-left flex-1">
                      <span className="text-foreground font-bold text-sm">{step.icon} {step.label}</span>
                      <p className="text-dim text-xs">{step.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={confirm}
                disabled={!allChecked}
                className={`w-full py-4 rounded-2xl font-extrabold text-lg transition-all ${
                  allChecked ? "text-deep" : "opacity-20 pointer-events-none text-deep"
                }`}
                style={{ background: allChecked ? "linear-gradient(135deg, hsl(136, 59%, 49%), hsl(136, 59%, 39%))" : "hsl(136, 59%, 49%)" }}
                whileTap={allChecked ? { scale: 0.97 } : {}}
              >
                ✓ Confirm Prayer
              </motion.button>

              <button onClick={onClose} className="w-full mt-3 py-2 text-dim text-sm font-semibold">Cancel</button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrayerChecklist;

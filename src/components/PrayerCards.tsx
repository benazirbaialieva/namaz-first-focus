import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, AlertCircle } from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { toast } from "sonner";
import { Prayer } from "@/data/prayers";

type PrayerStatus = "completed" | "upnext" | "upcoming" | "missed";

interface PrayerCardsProps {
  prayers: Prayer[];
  completedMap: Record<string, boolean>;
  nextPrayerIndex: number;
  prayerNames: Record<string, string>;
  onCompletePrayer?: (prayerId: string) => void;
}

const statusConfig = {
  completed: {
    card: { background: "#FFFFFF", border: "0.5px solid #9FE1CB" },
    iconBg: "#E1F5EE",
    iconColor: "#0F6E56",
    nameColor: "#0F4F5C",
    timeColor: "#B4B2A9",
    badgeBg: "#E1F5EE",
    badgeColor: "#0F5C4A",
    badgeText: "Done",
    extraPadding: false,
  },
  upnext: {
    card: { background: "#0F4F5C", border: "none" },
    iconBg: "rgba(255,255,255,0.15)",
    iconColor: "#FFFFFF",
    nameColor: "#FFFFFF",
    timeColor: "#9FE1CB",
    badgeBg: "#BA7517",
    badgeColor: "#FAEEDA",
    badgeText: "Up next",
    extraPadding: true,
  },
  upcoming: {
    card: { background: "#FFFFFF", border: "0.5px solid #D3D1C7" },
    iconBg: "#F0EFEB",
    iconColor: "#B4B2A9",
    nameColor: "#6B6B60",
    timeColor: "#B4B2A9",
    badgeBg: "#F5F4F0",
    badgeColor: "#8A8A7F",
    badgeText: "Later",
    extraPadding: false,
  },
  missed: {
    card: { background: "#FFFFFF", border: "0.5px solid #F7C1C1" },
    iconBg: "#FEF2F2",
    iconColor: "#991B1B",
    nameColor: "#991B1B",
    timeColor: "#EF4444",
    badgeBg: "#FEF2F2",
    badgeColor: "#991B1B",
    badgeText: "Missed",
    extraPadding: false,
  },
};

function getStatus(index: number, completed: boolean, nextIndex: number): PrayerStatus {
  if (completed) return "completed";
  if (index === nextIndex) return "upnext";
  if (index < nextIndex) return "missed";
  return "upcoming";
}

const PrayerCards = ({ prayers, completedMap, nextPrayerIndex, prayerNames, onCompletePrayer }: PrayerCardsProps) => {
  const [showFocusSheet, setShowFocusSheet] = useState(false);
  const [loggedPrayerName, setLoggedPrayerName] = useState("");

  const handleTapUpNext = async (prayer: Prayer) => {
    // Haptic feedback
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // Haptics not available (web)
    }

    const name = prayerNames[prayer.id] || prayer.name;
    onCompletePrayer?.(prayer.id);
    setLoggedPrayerName(name);

    toast.success(`${name} logged — focus session unlocked`);

    setTimeout(() => {
      setShowFocusSheet(true);
    }, 300);
  };

  return (
    <>
      <div className="space-y-2 mb-4 px-4">
        {prayers.map((p, i) => {
          const status = getStatus(i, !!completedMap[p.id], nextPrayerIndex);
          const cfg = statusConfig[status];
          const Icon = status === "completed" ? Check : status === "missed" ? AlertCircle : Clock;

          return (
            <motion.div
              key={p.id}
              layout
              whileTap={{ scale: 0.97 }}
              onClick={status === "upnext" ? () => handleTapUpNext(p) : undefined}
              className="flex items-center gap-3 w-full"
              style={{
                ...cfg.card,
                borderRadius: 16,
                padding: cfg.extraPadding ? "18px 16px" : "14px 16px",
                minHeight: 64,
                cursor: status === "upnext" ? "pointer" : "default",
              }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Icon area */}
              <motion.div
                layout
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: cfg.iconBg,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={status}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon size={18} style={{ color: cfg.iconColor }} strokeWidth={2.2} />
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Name + Arabic */}
              <div className="flex-1 min-w-0">
                <p style={{ color: cfg.nameColor, fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>
                  {prayerNames[p.id] || p.name}
                </p>
                <p className="font-amiri" style={{ color: cfg.timeColor, fontSize: 13, lineHeight: 1.3 }}>
                  {p.arabic}
                </p>
              </div>

              {/* Time */}
              <span style={{ color: cfg.timeColor, fontWeight: 600, fontSize: 14, marginRight: 8 }}>
                {p.time}
              </span>

              {/* Badge */}
              <motion.span
                layout
                style={{
                  background: cfg.badgeBg,
                  color: cfg.badgeColor,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 20,
                  whiteSpace: "nowrap",
                }}
              >
                {cfg.badgeText}
              </motion.span>
            </motion.div>
          );
        })}

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-3 pb-1">
          {prayers.map((p, i) => {
            const status = getStatus(i, !!completedMap[p.id], nextPrayerIndex);
            let dotColor = "#D3D1C7";
            if (status === "completed") dotColor = "#0F6E56";
            if (status === "upnext") dotColor = "#BA7517";
            if (status === "missed") dotColor = "#EF4444";

            return (
              <motion.div
                key={p.id}
                layout
                style={{
                  width: status === "upnext" ? 8 : 6,
                  height: status === "upnext" ? 8 : 6,
                  borderRadius: "50%",
                  background: dotColor,
                }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
              />
            );
          })}
        </div>
      </div>

      {/* Focus Session Bottom Sheet */}
      <Drawer open={showFocusSheet} onOpenChange={setShowFocusSheet}>
        <DrawerContent
          style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            background: "#FFFFFF",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <DrawerHeader className="pt-2 pb-0">
            <div className="mx-auto w-10 h-1 rounded-full bg-gray-300 mb-4" />
            <DrawerTitle
              className="text-center"
              style={{ color: "#0F4F5C", fontSize: 18, fontWeight: 600 }}
            >
              {loggedPrayerName} complete 🎉
            </DrawerTitle>
          </DrawerHeader>

          <div className="px-6 pb-6 pt-2 flex flex-col items-center gap-3">
            <p className="text-center text-sm" style={{ color: "#6B6B60" }}>
              Your apps are now unlocked. Start a focus session to stay productive.
            </p>

            <button
              onClick={() => setShowFocusSheet(false)}
              className="w-full py-3.5 rounded-2xl font-semibold text-base"
              style={{
                background: "#BA7517",
                color: "#FAEEDA",
              }}
            >
              Start focus session
            </button>

            <button
              onClick={() => setShowFocusSheet(false)}
              className="py-2 text-sm font-medium"
              style={{ color: "#B4B2A9" }}
            >
              Maybe later
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default PrayerCards;

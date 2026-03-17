import { motion } from "framer-motion";
import { Check, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { Prayer } from "@/data/prayers";

type PrayerStatus = "completed" | "upnext" | "upcoming" | "missed";

interface PrayerCardsProps {
  prayers: Prayer[];
  completedMap: Record<string, boolean>;
  nextPrayerIndex: number;
  prayerNames: Record<string, string>;
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

const PrayerCards = ({ prayers, completedMap, nextPrayerIndex, prayerNames }: PrayerCardsProps) => {
  const completedCount = prayers.filter((p) => completedMap[p.id]).length;

  return (
    <div className="space-y-2 mb-4 px-4">
      {prayers.map((p, i) => {
        const status = getStatus(i, !!completedMap[p.id], nextPrayerIndex);
        const cfg = statusConfig[status];
        const Icon = status === "completed" ? Check : status === "missed" ? AlertCircle : Clock;

        return (
          <motion.div
            key={p.id}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 w-full"
            style={{
              ...cfg.card,
              borderRadius: 16,
              padding: cfg.extraPadding ? "18px 16px" : "14px 16px",
              minHeight: 64,
            }}
          >
            {/* Icon area */}
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: cfg.iconBg,
              }}
            >
              <Icon size={18} style={{ color: cfg.iconColor }} strokeWidth={2.2} />
            </div>

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
            <span
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
            </span>
          </motion.div>
        );
      })}

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pt-3 pb-1">
        {prayers.map((p, i) => {
          const status = getStatus(i, !!completedMap[p.id], nextPrayerIndex);
          let dotColor = "#D3D1C7"; // gray pending
          if (status === "completed") dotColor = "#0F6E56";
          if (status === "upnext") dotColor = "#BA7517";
          if (status === "missed") dotColor = "#EF4444";

          return (
            <div
              key={p.id}
              style={{
                width: status === "upnext" ? 8 : 6,
                height: status === "upnext" ? 8 : 6,
                borderRadius: "50%",
                background: dotColor,
                transition: "all 0.2s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PrayerCards;

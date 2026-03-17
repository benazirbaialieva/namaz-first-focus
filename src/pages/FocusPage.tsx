import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Star, Check, Pause, Square, Bell, BellOff, ArrowLeft } from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useAppContext } from "@/contexts/AppContext";
import { prayers } from "@/data/prayers";
import NativeHeader from "@/components/NativeHeader";
import { useNavigate } from "react-router-dom";

type FocusState = "locked" | "unlocked" | "active" | "complete";

const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds

const pageTransition = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

// Circular timer component
const CircularTimer = ({
  seconds,
  total,
  color,
  disabled,
}: {
  seconds: number;
  total: number;
  color: string;
  disabled?: boolean;
}) => {
  const radius = 100;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / total;
  const offset = circumference * (1 - progress);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
      <svg width={240} height={240} viewBox="0 0 240 240">
        {/* Background track */}
        <circle
          cx={120}
          cy={120}
          r={radius}
          fill="none"
          stroke={disabled ? "#E5E4E0" : "rgba(15,79,92,0.1)"}
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <motion.circle
          cx={120}
          cy={120}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 120 120)"
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          style={{
            fontSize: 48,
            fontWeight: 300,
            color: disabled ? "#B4B2A9" : "#0F4F5C",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

const FocusPage = () => {
  const { prayerState, currentPrayer, nextPrayerIndex } = useAppContext();
  const navigate = useNavigate();

  const completedCount = Object.values(prayerState.completed).filter(Boolean).length;
  const hasUnlockedFocus = completedCount > 0;
  const lastCompletedPrayer = [...prayers].reverse().find((p) => prayerState.completed[p.id]);

  const [focusState, setFocusState] = useState<FocusState>(hasUnlockedFocus ? "unlocked" : "locked");
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [sessionsToday, setSessionsToday] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync lock state with prayer completions
  useEffect(() => {
    if (focusState === "locked" && hasUnlockedFocus) {
      setFocusState("unlocked");
    }
  }, [hasUnlockedFocus, focusState]);

  const startSession = useCallback(async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}

    setTimeLeft(FOCUS_DURATION);
    setFocusState("active");

    // Schedule completion notification
    try {
      await LocalNotifications.requestPermissions();
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Focus session complete 🎉",
            body: "Great job! You stayed focused for 25 minutes.",
            id: 9999,
            schedule: { at: new Date(Date.now() + FOCUS_DURATION * 1000) },
          },
        ],
      });
    } catch {}
  }, []);

  const endSession = useCallback(async (completed: boolean) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      await LocalNotifications.cancel({ notifications: [{ id: 9999 }] });
    } catch {}

    if (completed) {
      setSessionsToday((s) => s + 1);
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch {}
    }

    setFocusState("complete");
  }, []);

  // Timer countdown
  useEffect(() => {
    if (focusState !== "active") return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endSession(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [focusState, endSession]);

  const resetToUnlocked = () => {
    setTimeLeft(FOCUS_DURATION);
    setFocusState(hasUnlockedFocus ? "unlocked" : "locked");
  };

  const minutesFocused = Math.round((FOCUS_DURATION - timeLeft) / 60);

  return (
    <div className="min-h-screen bg-background pb-24">
      <NativeHeader title="Focus" />

      <div className="px-4">
        <AnimatePresence mode="wait">
          {/* ───── STATE 1: LOCKED ───── */}
          {focusState === "locked" && (
            <motion.div key="locked" {...pageTransition} className="flex flex-col items-center pt-6">
              <div
                className="flex items-center justify-center mb-5"
                style={{ width: 56, height: 56, borderRadius: 16, background: "#E5E4E0" }}
              >
                <Lock size={24} style={{ color: "#B4B2A9" }} />
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 600, color: "#0F4F5C" }}>Focus locked</h2>
              <p className="mt-1 mb-8" style={{ fontSize: 14, color: "#B4B2A9" }}>
                Pray {currentPrayer.name} to unlock
              </p>

              <CircularTimer seconds={FOCUS_DURATION} total={FOCUS_DURATION} color="#E5E4E0" disabled />

              {/* Prayer boost list */}
              <div className="w-full mt-8 space-y-3">
                <p style={{ fontSize: 12, fontWeight: 600, color: "#B4B2A9", textTransform: "uppercase", letterSpacing: 1 }}>
                  Today's prayer boosts
                </p>
                {prayers.map((p, i) => {
                  const completed = prayerState.completed[p.id];
                  const isCurrent = i === nextPrayerIndex;
                  let dotColor = "#D3D1C7";
                  let label = "Locked";
                  let labelColor = "#B4B2A9";
                  if (completed) {
                    dotColor = "#0F6E56";
                    label = "Used";
                    labelColor = "#0F6E56";
                  } else if (isCurrent) {
                    dotColor = "#BA7517";
                    label = "Available";
                    labelColor = "#BA7517";
                  }

                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor }} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#0F4F5C", flex: 1 }}>{p.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: labelColor }}>{label}</span>
                    </div>
                  );
                })}
              </div>

              <button
                disabled
                className="w-full mt-8 py-3.5 rounded-2xl font-semibold text-base"
                style={{ background: "#E5E4E0", color: "#B4B2A9" }}
              >
                Start focus session
              </button>
            </motion.div>
          )}

          {/* ───── STATE 2: UNLOCKED ───── */}
          {focusState === "unlocked" && (
            <motion.div key="unlocked" {...pageTransition} className="flex flex-col items-center pt-6">
              <div
                className="flex items-center justify-center mb-5"
                style={{ width: 56, height: 56, borderRadius: 16, background: "#E1F5EE" }}
              >
                <Star size={24} style={{ color: "#0F6E56" }} />
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 600, color: "#0F4F5C" }}>Focus unlocked</h2>
              <p className="mt-1 mb-8" style={{ fontSize: 14, color: "#B4B2A9" }}>
                {lastCompletedPrayer?.name || "Prayer"} prayed · start your session
              </p>

              <CircularTimer seconds={FOCUS_DURATION} total={FOCUS_DURATION} color="#0F6E56" />

              <button
                onClick={startSession}
                className="w-full mt-8 py-3.5 rounded-2xl font-semibold text-base"
                style={{ background: "#BA7517", color: "#FAEEDA" }}
              >
                Start focus session
              </button>
            </motion.div>
          )}

          {/* ───── STATE 3: ACTIVE ───── */}
          {focusState === "active" && (
            <motion.div key="active" {...pageTransition} className="flex flex-col items-center pt-6">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: "#E1F5EE" }}
              >
                <BellOff size={14} style={{ color: "#0F6E56" }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: "#0F6E56" }}>
                  Notifications silenced during focus
                </span>
              </div>

              <CircularTimer seconds={timeLeft} total={FOCUS_DURATION} color="#0F6E56" />

              <div className="flex items-center gap-3 w-full mt-8">
                <button
                  onClick={() => {
                    // Simple pause: just end the interval, keep state
                    if (intervalRef.current) {
                      clearInterval(intervalRef.current);
                      intervalRef.current = null;
                    } else {
                      // Resume
                      intervalRef.current = setInterval(() => {
                        setTimeLeft((prev) => {
                          if (prev <= 1) {
                            endSession(true);
                            return 0;
                          }
                          return prev - 1;
                        });
                      }, 1000);
                    }
                  }}
                  className="flex-1 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ background: "#F5F4F0", color: "#0F4F5C" }}
                >
                  <Pause size={16} /> Pause
                </button>
                <button
                  onClick={() => endSession(false)}
                  className="flex-1 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ background: "#FEF2F2", color: "#991B1B" }}
                >
                  <Square size={14} /> End early
                </button>
              </div>
            </motion.div>
          )}

          {/* ───── STATE 4: COMPLETE ───── */}
          {focusState === "complete" && (
            <motion.div key="complete" {...pageTransition} className="flex flex-col items-center pt-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                className="flex items-center justify-center mb-5"
                style={{ width: 72, height: 72, borderRadius: "50%", background: "#E1F5EE" }}
              >
                <Check size={32} style={{ color: "#0F6E56" }} strokeWidth={2.5} />
              </motion.div>

              <h2 style={{ fontSize: 22, fontWeight: 600, color: "#0F4F5C" }}>Session complete</h2>

              {/* Stats row */}
              <div className="flex items-center gap-6 mt-6 mb-6">
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 28, fontWeight: 600, color: "#0F4F5C" }}>
                    {minutesFocused || 25}
                  </span>
                  <span style={{ fontSize: 11, color: "#B4B2A9", fontWeight: 500 }}>min focused</span>
                </div>
                <div style={{ width: 1, height: 32, background: "#E5E4E0" }} />
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 28, fontWeight: 600, color: "#0F4F5C" }}>
                    {sessionsToday}
                  </span>
                  <span style={{ fontSize: 11, color: "#B4B2A9", fontWeight: 500 }}>sessions</span>
                </div>
                <div style={{ width: 1, height: 32, background: "#E5E4E0" }} />
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 28, fontWeight: 600, color: "#0F4F5C" }}>
                    {completedCount}
                  </span>
                  <span style={{ fontSize: 11, color: "#B4B2A9", fontWeight: 500 }}>prayers</span>
                </div>
              </div>

              {/* Next prayer prompt */}
              <div
                className="w-full rounded-2xl p-4 flex items-center gap-3 mb-6"
                style={{ background: "#FFF8ED", border: "0.5px solid #FAC775" }}
              >
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 36, height: 36, borderRadius: 10, background: "#FAEEDA" }}
                >
                  <Bell size={16} style={{ color: "#BA7517" }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0F4F5C" }}>
                    Next prayer: {currentPrayer.name}
                  </p>
                  <p style={{ fontSize: 12, color: "#B4B2A9" }}>at {currentPrayer.time}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setTimeLeft(FOCUS_DURATION);
                  setFocusState(hasUnlockedFocus ? "unlocked" : "locked");
                  startSession();
                }}
                className="w-full py-3.5 rounded-2xl font-semibold text-base mb-3"
                style={{ background: "#BA7517", color: "#FAEEDA" }}
              >
                Start another session
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full py-3.5 rounded-2xl font-semibold text-base"
                style={{ background: "transparent", color: "#0F6E56", border: "1.5px solid #0F6E56" }}
              >
                Back to today
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FocusPage;

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Star, Check, Pause, Play, Square, Bell, BellOff } from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import { App as CapApp } from "@capacitor/app";
import { useAppContext } from "@/contexts/AppContext";
import { prayers } from "@/data/prayers";
import NativeHeader from "@/components/NativeHeader";
import { useNavigate } from "react-router-dom";

type FocusState = "locked" | "unlocked" | "active" | "complete";

const FOCUS_DURATION = 25 * 60;

const pageTransition = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

// ─── Circular Timer ───
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
        <circle cx={120} cy={120} r={radius} fill="none" stroke={disabled ? "#E5E4E0" : "rgba(15,79,92,0.1)"} strokeWidth={stroke} />
        <motion.circle
          cx={120} cy={120} r={radius} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "linear" }}
          transform="rotate(-90 120 120)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span style={{ fontSize: 48, fontWeight: 300, color: disabled ? "#B4B2A9" : "#0F4F5C", fontVariantNumeric: "tabular-nums" }}>
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

// ─── Keep-awake heartbeat (prevents screen sleep during active session) ───
function useKeepAwake(active: boolean) {
  useEffect(() => {
    if (!active) return;
    // A no-op video element trick or a simple wake-lock request
    let wakeLock: any = null;
    const requestWake = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await (navigator as any).wakeLock.request("screen");
        }
      } catch {}
    };
    requestWake();

    // Fallback heartbeat to keep JS alive
    const heartbeat = setInterval(() => {}, 10000);

    return () => {
      clearInterval(heartbeat);
      if (wakeLock) {
        try { wakeLock.release(); } catch {}
      }
    };
  }, [active]);
}

const FocusPage = () => {
  const { prayerState, currentPrayer, nextPrayerIndex } = useAppContext();
  const navigate = useNavigate();

  const completedCount = Object.values(prayerState.completed).filter(Boolean).length;
  const hasUnlockedFocus = completedCount > 0;
  const lastCompletedPrayer = [...prayers].reverse().find((p) => prayerState.completed[p.id]);

  const [focusState, setFocusState] = useState<FocusState>(hasUnlockedFocus ? "unlocked" : "locked");
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [paused, setPaused] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);

  // Absolute end timestamp for background-accurate timing
  const endTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedAtRef = useRef<number | null>(null);

  // Keep screen awake during active session
  useKeepAwake(focusState === "active" && !paused);

  // Sync lock state
  useEffect(() => {
    if (focusState === "locked" && hasUnlockedFocus) setFocusState("unlocked");
  }, [hasUnlockedFocus, focusState]);

  // ─── App foreground/background handling ───
  useEffect(() => {
    const listener = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (focusState !== "active" || paused) return;

      if (!isActive) {
        // Going to background — stop the visual interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Returning to foreground — recalculate from absolute end time
        const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        if (remaining <= 0) {
          setTimeLeft(0);
          completeSession();
        } else {
          setTimeLeft(remaining);
          startCountdownInterval();
        }
      }
    });

    return () => { listener.then((l) => l.remove()); };
  }, [focusState, paused]);

  // ─── Timer interval logic ───
  const startCountdownInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        completeSession();
      }
    }, 1000);
  }, []);

  const completeSession = useCallback(async () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setSessionsToday((s) => s + 1);
    setPaused(false);
    setFocusState("complete");
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}
  }, []);

  // Start/stop interval when active state changes
  useEffect(() => {
    if (focusState === "active" && !paused) {
      startCountdownInterval();
    }
    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [focusState, paused, startCountdownInterval]);

  // ─── Actions ───
  const startSession = useCallback(async () => {
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}

    const prayerName = lastCompletedPrayer?.name || "Prayer";
    endTimeRef.current = Date.now() + FOCUS_DURATION * 1000;
    setTimeLeft(FOCUS_DURATION);
    setPaused(false);
    setFocusState("active");

    // Schedule local notification
    try {
      await LocalNotifications.requestPermissions();
      await LocalNotifications.schedule({
        notifications: [{
          title: "Focus session complete",
          body: `Great work — ${prayerName} boost used.`,
          id: 9999,
          schedule: { at: new Date(endTimeRef.current) },
        }],
      });
    } catch {}
  }, [lastCompletedPrayer]);

  const togglePause = useCallback(async () => {
    if (paused) {
      // Resume: extend endTime by the paused duration
      const pausedDuration = Date.now() - (pausedAtRef.current || Date.now());
      endTimeRef.current += pausedDuration;
      pausedAtRef.current = null;
      setPaused(false);

      // Reschedule notification
      try {
        await LocalNotifications.cancel({ notifications: [{ id: 9999 }] });
        await LocalNotifications.schedule({
          notifications: [{
            title: "Focus session complete",
            body: `Great work — ${lastCompletedPrayer?.name || "Prayer"} boost used.`,
            id: 9999,
            schedule: { at: new Date(endTimeRef.current) },
          }],
        });
      } catch {}
    } else {
      // Pause
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      pausedAtRef.current = Date.now();
      setPaused(true);

      try { await LocalNotifications.cancel({ notifications: [{ id: 9999 }] }); } catch {}
    }
  }, [paused, lastCompletedPrayer]);

  const endEarly = useCallback(async () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    try { await LocalNotifications.cancel({ notifications: [{ id: 9999 }] }); } catch {}
    setPaused(false);
    setFocusState("complete");
  }, []);

  const minutesFocused = Math.round((FOCUS_DURATION - timeLeft) / 60);

  return (
    <div className="min-h-screen bg-background pb-24">
      <NativeHeader title="Focus" />

      <div className="px-4">
        <AnimatePresence mode="wait">
          {/* ───── STATE 1: LOCKED ───── */}
          {focusState === "locked" && (
            <motion.div key="locked" {...pageTransition} className="flex flex-col items-center pt-6">
              <div className="flex items-center justify-center mb-5" style={{ width: 56, height: 56, borderRadius: 16, background: "#E5E4E0" }}>
                <Lock size={24} style={{ color: "#B4B2A9" }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: "#0F4F5C" }}>Focus locked</h2>
              <p className="mt-1 mb-8" style={{ fontSize: 14, color: "#B4B2A9" }}>Pray {currentPrayer.name} to unlock</p>
              <CircularTimer seconds={FOCUS_DURATION} total={FOCUS_DURATION} color="#E5E4E0" disabled />

              <div className="w-full mt-8 space-y-3">
                <p style={{ fontSize: 12, fontWeight: 600, color: "#B4B2A9", textTransform: "uppercase", letterSpacing: 1 }}>Today's prayer boosts</p>
                {prayers.map((p, i) => {
                  const completed = prayerState.completed[p.id];
                  const isCurrent = i === nextPrayerIndex;
                  let dotColor = "#D3D1C7", label = "Locked", labelColor = "#B4B2A9";
                  if (completed) { dotColor = "#0F6E56"; label = "Used"; labelColor = "#0F6E56"; }
                  else if (isCurrent) { dotColor = "#BA7517"; label = "Available"; labelColor = "#BA7517"; }
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor }} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#0F4F5C", flex: 1 }}>{p.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: labelColor }}>{label}</span>
                    </div>
                  );
                })}
              </div>
              <button disabled className="w-full mt-8 py-3.5 rounded-2xl font-semibold text-base" style={{ background: "#E5E4E0", color: "#B4B2A9" }}>
                Start focus session
              </button>
            </motion.div>
          )}

          {/* ───── STATE 2: UNLOCKED ───── */}
          {focusState === "unlocked" && (
            <motion.div key="unlocked" {...pageTransition} className="flex flex-col items-center pt-6">
              <div className="flex items-center justify-center mb-5" style={{ width: 56, height: 56, borderRadius: 16, background: "#E1F5EE" }}>
                <Star size={24} style={{ color: "#0F6E56" }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: "#0F4F5C" }}>Focus unlocked</h2>
              <p className="mt-1 mb-8" style={{ fontSize: 14, color: "#B4B2A9" }}>
                {lastCompletedPrayer?.name || "Prayer"} prayed · start your session
              </p>
              <CircularTimer seconds={FOCUS_DURATION} total={FOCUS_DURATION} color="#0F6E56" />
              <button onClick={startSession} className="w-full mt-8 py-3.5 rounded-2xl font-semibold text-base" style={{ background: "#BA7517", color: "#FAEEDA" }}>
                Start focus session
              </button>
            </motion.div>
          )}

          {/* ───── STATE 3: ACTIVE ───── */}
          {focusState === "active" && (
            <motion.div key="active" {...pageTransition} className="flex flex-col items-center pt-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: "#E1F5EE" }}>
                <BellOff size={14} style={{ color: "#0F6E56" }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: "#0F6E56" }}>Notifications silenced during focus</span>
              </div>

              <CircularTimer seconds={timeLeft} total={FOCUS_DURATION} color={paused ? "#B4B2A9" : "#0F6E56"} />

              {paused && (
                <p className="mt-2" style={{ fontSize: 13, fontWeight: 500, color: "#BA7517" }}>Paused</p>
              )}

              <div className="flex items-center gap-3 w-full mt-8">
                <button
                  onClick={togglePause}
                  className="flex-1 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ background: "#F5F4F0", color: "#0F4F5C" }}
                >
                  {paused ? <><Play size={16} /> Resume</> : <><Pause size={16} /> Pause</>}
                </button>
                <button
                  onClick={endEarly}
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
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                className="flex items-center justify-center mb-5"
                style={{ width: 72, height: 72, borderRadius: "50%", background: "#E1F5EE" }}
              >
                <Check size={32} style={{ color: "#0F6E56" }} strokeWidth={2.5} />
              </motion.div>

              <h2 style={{ fontSize: 22, fontWeight: 600, color: "#0F4F5C" }}>Session complete</h2>

              <div className="flex items-center gap-6 mt-6 mb-6">
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 28, fontWeight: 600, color: "#0F4F5C" }}>{minutesFocused || 25}</span>
                  <span style={{ fontSize: 11, color: "#B4B2A9", fontWeight: 500 }}>min focused</span>
                </div>
                <div style={{ width: 1, height: 32, background: "#E5E4E0" }} />
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 28, fontWeight: 600, color: "#0F4F5C" }}>{sessionsToday}</span>
                  <span style={{ fontSize: 11, color: "#B4B2A9", fontWeight: 500 }}>sessions</span>
                </div>
                <div style={{ width: 1, height: 32, background: "#E5E4E0" }} />
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 28, fontWeight: 600, color: "#0F4F5C" }}>{completedCount}</span>
                  <span style={{ fontSize: 11, color: "#B4B2A9", fontWeight: 500 }}>prayers</span>
                </div>
              </div>

              <div className="w-full rounded-2xl p-4 flex items-center gap-3 mb-6" style={{ background: "#FFF8ED", border: "0.5px solid #FAC775" }}>
                <div className="flex items-center justify-center shrink-0" style={{ width: 36, height: 36, borderRadius: 10, background: "#FAEEDA" }}>
                  <Bell size={16} style={{ color: "#BA7517" }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0F4F5C" }}>Next prayer: {currentPrayer.name}</p>
                  <p style={{ fontSize: 12, color: "#B4B2A9" }}>at {currentPrayer.time}</p>
                </div>
              </div>

              <button
                onClick={() => { startSession(); }}
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

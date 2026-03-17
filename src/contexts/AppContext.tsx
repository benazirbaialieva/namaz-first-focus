import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { prayers, defaultLockedApps, type LockedApp, type Prayer } from "@/data/prayers";

interface StreakData {
  current: number;
  best: number;
  days: Record<string, number>; // date string -> prayers completed
  totalPrayers: number;
  monthPrayers: number;
  monthTotal: number;
}

interface PrayerState {
  completed: Record<string, boolean>;
}

interface BypassState {
  active: boolean;
  endTime: number | null;
}

interface AppContextType {
  lockedApps: LockedApp[];
  toggleAppLock: (id: string) => void;
  removeApp: (id: string) => void;
  addApp: (app: { id: string; name: string; icon: string }) => void;
  prayerState: PrayerState;
  completePrayer: (prayerId: string) => void;
  currentPrayer: Prayer;
  nextPrayerIndex: number;
  streak: StreakData;
  bypass: BypassState;
  activateBypass: (minutes: number) => void;
  travelMode: boolean;
  setTravelMode: (v: boolean) => void;
  allAppsUnlocked: boolean;
  unlockAllApps: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};

function getNextPrayerIndex(): number {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < prayers.length; i++) {
    const [h, m] = prayers[i].time.split(":").map(Number);
    if (currentMinutes < h * 60 + m) return i;
  }
  return 0; // wrap to Fajr
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem("nf_streak");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { current: 0, best: 0, days: {}, totalPrayers: 0, monthPrayers: 0, monthTotal: 150 };
}

function loadPrayerState(): PrayerState {
  try {
    const raw = localStorage.getItem("nf_prayers_" + getTodayKey());
    if (raw) return JSON.parse(raw);
  } catch {}
  return { completed: {} };
}

function loadApps(): LockedApp[] {
  try {
    const raw = localStorage.getItem("nf_apps");
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultLockedApps;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lockedApps, setLockedApps] = useState<LockedApp[]>(loadApps);
  const [prayerState, setPrayerState] = useState<PrayerState>(loadPrayerState);
  const [streak, setStreak] = useState<StreakData>(loadStreak);
  const [bypass, setBypass] = useState<BypassState>({ active: false, endTime: null });
  const [travelMode, setTravelMode] = useState(() => localStorage.getItem("nf_travel") === "true");
  const [allAppsUnlocked, setAllAppsUnlocked] = useState(false);
  const nextPrayerIndex = getNextPrayerIndex();
  const currentPrayer = prayers[nextPrayerIndex];

  useEffect(() => { localStorage.setItem("nf_apps", JSON.stringify(lockedApps)); }, [lockedApps]);
  useEffect(() => { localStorage.setItem("nf_prayers_" + getTodayKey(), JSON.stringify(prayerState)); }, [prayerState]);
  useEffect(() => { localStorage.setItem("nf_streak", JSON.stringify(streak)); }, [streak]);
  useEffect(() => { localStorage.setItem("nf_travel", String(travelMode)); }, [travelMode]);

  useEffect(() => {
    if (!bypass.active || !bypass.endTime) return;
    const timeout = setTimeout(() => {
      setBypass({ active: false, endTime: null });
    }, bypass.endTime - Date.now());
    return () => clearTimeout(timeout);
  }, [bypass]);

  const toggleAppLock = useCallback((id: string) => {
    setLockedApps(prev => prev.map(a => a.id === id ? { ...a, locked: !a.locked } : a));
  }, []);

  const removeApp = useCallback((id: string) => {
    setLockedApps(prev => prev.filter(a => a.id !== id));
  }, []);

  const addApp = useCallback((app: { id: string; name: string; icon: string }) => {
    setLockedApps(prev => [...prev, { ...app, locked: true }]);
  }, []);

  const completePrayer = useCallback((prayerId: string) => {
    setPrayerState(prev => {
      const updated = { ...prev, completed: { ...prev.completed, [prayerId]: true } };
      return updated;
    });
    setStreak(prev => {
      const today = getTodayKey();
      const todayCount = (prev.days[today] || 0) + 1;
      const newDays = { ...prev.days, [today]: todayCount };
      const newTotal = prev.totalPrayers + 1;
      const newCurrent = todayCount >= 5 ? prev.current + 1 : prev.current;
      return {
        ...prev,
        days: newDays,
        totalPrayers: newTotal,
        current: newCurrent > prev.current ? newCurrent : prev.current,
        best: Math.max(prev.best, newCurrent > prev.current ? newCurrent : prev.current),
        monthPrayers: prev.monthPrayers + 1,
      };
    });
  }, []);

  const activateBypass = useCallback((minutes: number) => {
    setBypass({ active: true, endTime: Date.now() + minutes * 60000 });
  }, []);

  const unlockAllApps = useCallback(() => {
    setAllAppsUnlocked(true);
    setLockedApps(prev => prev.map(a => ({ ...a, locked: false })));
  }, []);

  return (
    <AppContext.Provider value={{
      lockedApps, toggleAppLock, removeApp, addApp,
      prayerState, completePrayer, currentPrayer, nextPrayerIndex,
      streak, bypass, activateBypass, travelMode, setTravelMode,
      allAppsUnlocked, unlockAllApps,
    }}>
      {children}
    </AppContext.Provider>
  );
};

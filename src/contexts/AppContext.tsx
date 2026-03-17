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
  wallpaper: string;
  setWallpaper: (id: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  appIcon: string;
  setAppIcon: (id: string) => void;
  location: string;
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

const wallpaperThemes: Record<string, Record<string, string>> = {
  "mosque-night": { "--deep": "154 46% 6%", "--background": "154 46% 6%", "--card": "154 46% 8%", "--secondary": "154 30% 12%", "--border": "154 20% 18%" },
  "navy": { "--deep": "220 50% 8%", "--background": "220 50% 8%", "--card": "220 50% 10%", "--secondary": "220 30% 14%", "--border": "220 20% 20%" },
  "mystic": { "--deep": "270 50% 8%", "--background": "270 50% 8%", "--card": "270 50% 10%", "--secondary": "270 30% 14%", "--border": "270 20% 20%" },
  "forest": { "--deep": "154 46% 6%", "--background": "154 46% 6%", "--card": "154 46% 8%", "--secondary": "154 30% 12%", "--border": "154 20% 18%" },
  "ember": { "--deep": "20 50% 7%", "--background": "20 50% 7%", "--card": "20 50% 9%", "--secondary": "20 30% 13%", "--border": "20 20% 19%" },
  "rose": { "--deep": "330 50% 8%", "--background": "330 50% 8%", "--card": "330 50% 10%", "--secondary": "330 30% 14%", "--border": "330 20% 20%" },
  "light": { "--deep": "45 29% 94%", "--background": "45 29% 94%", "--card": "45 29% 90%", "--secondary": "45 20% 86%", "--border": "45 10% 80%" },
};

const lightThemeOverrides: Record<string, string> = {
  "--foreground": "154 46% 6%",
  "--card-foreground": "154 46% 6%",
  "--popover-foreground": "154 46% 6%",
  "--secondary-foreground": "154 46% 6%",
};

const darkThemeDefaults: Record<string, string> = {
  "--foreground": "45 29% 94%",
  "--card-foreground": "45 29% 94%",
  "--popover-foreground": "45 29% 94%",
  "--secondary-foreground": "45 29% 94%",
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lockedApps, setLockedApps] = useState<LockedApp[]>(loadApps);
  const [prayerState, setPrayerState] = useState<PrayerState>(loadPrayerState);
  const [streak, setStreak] = useState<StreakData>(loadStreak);
  const [bypass, setBypass] = useState<BypassState>({ active: false, endTime: null });
  const [travelMode, setTravelMode] = useState(() => localStorage.getItem("nf_travel") === "true");
  const [allAppsUnlocked, setAllAppsUnlocked] = useState(false);
  const [wallpaper, setWallpaperState] = useState(() => localStorage.getItem("nf_wallpaper") || "mosque-night");
  const [language, setLanguageState] = useState(() => localStorage.getItem("nf_language") || "English");
  const [appIcon, setAppIconState] = useState(() => localStorage.getItem("nf_icon") || "main");
  const [location, setLocation] = useState("Detecting...");
  const nextPrayerIndex = getNextPrayerIndex();
  const currentPrayer = prayers[nextPrayerIndex];

  useEffect(() => { localStorage.setItem("nf_apps", JSON.stringify(lockedApps)); }, [lockedApps]);
  useEffect(() => { localStorage.setItem("nf_prayers_" + getTodayKey(), JSON.stringify(prayerState)); }, [prayerState]);
  useEffect(() => { localStorage.setItem("nf_streak", JSON.stringify(streak)); }, [streak]);
  useEffect(() => { localStorage.setItem("nf_travel", String(travelMode)); }, [travelMode]);

  // Apply wallpaper theme
  useEffect(() => {
    localStorage.setItem("nf_wallpaper", wallpaper);
    const theme = wallpaperThemes[wallpaper] || wallpaperThemes["mosque-night"];
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, val]) => root.style.setProperty(key, val));
    const overrides = wallpaper === "light" ? lightThemeOverrides : darkThemeDefaults;
    Object.entries(overrides).forEach(([key, val]) => root.style.setProperty(key, val));
  }, [wallpaper]);

  // Persist language & icon
  useEffect(() => { localStorage.setItem("nf_language", language); }, [language]);
  useEffect(() => { localStorage.setItem("nf_icon", appIcon); }, [appIcon]);

  // Detect location
  useEffect(() => {
    if (!navigator.geolocation) { setLocation("Unknown"); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || "Unknown";
          const country = data.address?.country_code?.toUpperCase() || "";
          setLocation(`${city}${country ? ", " + country : ""}`);
        } catch { setLocation("Unknown"); }
      },
      () => setLocation("Unknown"),
      { timeout: 5000 }
    );
  }, []);

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

  const setWallpaper = useCallback((id: string) => setWallpaperState(id), []);
  const setLanguage = useCallback((lang: string) => setLanguageState(lang), []);
  const setAppIcon = useCallback((id: string) => setAppIconState(id), []);

  return (
    <AppContext.Provider value={{
      lockedApps, toggleAppLock, removeApp, addApp,
      prayerState, completePrayer, currentPrayer, nextPrayerIndex,
      streak, bypass, activateBypass, travelMode, setTravelMode,
      allAppsUnlocked, unlockAllApps,
      wallpaper, setWallpaper, language, setLanguage, appIcon, setAppIcon, location,
    }}>
      {children}
    </AppContext.Provider>
  );
};

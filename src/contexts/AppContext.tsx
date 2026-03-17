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
  appearance: "dark" | "light" | "system";
  setAppearance: (v: "dark" | "light" | "system") => void;
  fontSize: "small" | "medium" | "large";
  setFontSize: (v: "small" | "medium" | "large") => void;
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

function getThemeFromWallpaperId(id: string): Record<string, string> {
  // Extract hue from wallpaper id to generate matching theme
  const themes: Record<string, Record<string, string>> = {
    // Greens
    "deep-green": { "--deep": "154 46% 6%", "--background": "154 46% 6%", "--card": "154 46% 8%", "--secondary": "154 30% 12%", "--border": "154 20% 18%" },
    "mosque-night": { "--deep": "154 46% 6%", "--background": "154 46% 6%", "--card": "154 46% 8%", "--secondary": "154 30% 12%", "--border": "154 20% 18%" },
    "muted-teal": { "--deep": "180 40% 6%", "--background": "180 40% 6%", "--card": "180 40% 8%", "--secondary": "180 25% 12%", "--border": "180 15% 18%" },
    "emerald-glow": { "--deep": "154 46% 6%", "--background": "154 46% 6%", "--card": "154 46% 8%", "--secondary": "154 30% 12%", "--border": "154 20% 18%" },
    "jade": { "--deep": "154 46% 6%", "--background": "154 46% 6%", "--card": "154 46% 8%", "--secondary": "154 30% 12%", "--border": "154 20% 18%" },
    "aurora": { "--deep": "170 40% 6%", "--background": "170 40% 6%", "--card": "170 40% 8%", "--secondary": "170 25% 12%", "--border": "170 15% 18%" },
    // Blues
    "navy": { "--deep": "220 50% 8%", "--background": "220 50% 8%", "--card": "220 50% 10%", "--secondary": "220 30% 14%", "--border": "220 20% 20%" },
    "blue-mosque": { "--deep": "220 50% 8%", "--background": "220 50% 8%", "--card": "220 50% 10%", "--secondary": "220 30% 14%", "--border": "220 20% 20%" },
    "ocean": { "--deep": "215 55% 8%", "--background": "215 55% 8%", "--card": "215 55% 10%", "--secondary": "215 35% 14%", "--border": "215 25% 20%" },
    "sapphire": { "--deep": "225 50% 8%", "--background": "225 50% 8%", "--card": "225 50% 10%", "--secondary": "225 30% 14%", "--border": "225 20% 20%" },
    "masjid-rain": { "--deep": "210 35% 10%", "--background": "210 35% 10%", "--card": "210 35% 12%", "--secondary": "210 25% 16%", "--border": "210 15% 22%" },
    // Purples
    "midnight": { "--deep": "260 50% 8%", "--background": "260 50% 8%", "--card": "260 50% 10%", "--secondary": "260 30% 14%", "--border": "260 20% 20%" },
    "deep-plum": { "--deep": "270 50% 8%", "--background": "270 50% 8%", "--card": "270 50% 10%", "--secondary": "270 30% 14%", "--border": "270 20% 20%" },
    "twilight": { "--deep": "260 40% 8%", "--background": "260 40% 8%", "--card": "260 40% 10%", "--secondary": "260 25% 14%", "--border": "260 15% 20%" },
    "masjid-dusk": { "--deep": "260 40% 8%", "--background": "260 40% 8%", "--card": "260 40% 10%", "--secondary": "260 25% 14%", "--border": "260 15% 20%" },
    // Warm
    "warm-sand": { "--deep": "20 45% 7%", "--background": "20 45% 7%", "--card": "20 45% 9%", "--secondary": "20 30% 13%", "--border": "20 20% 19%" },
    "kaaba-gold": { "--deep": "35 50% 7%", "--background": "35 50% 7%", "--card": "35 50% 9%", "--secondary": "35 30% 13%", "--border": "35 20% 19%" },
    "amber": { "--deep": "35 50% 7%", "--background": "35 50% 7%", "--card": "35 50% 9%", "--secondary": "35 30% 13%", "--border": "35 20% 19%" },
    "masjid-golden": { "--deep": "30 50% 7%", "--background": "30 50% 7%", "--card": "30 50% 9%", "--secondary": "30 30% 13%", "--border": "30 20% 19%" },
    "masjid-dawn": { "--deep": "15 40% 8%", "--background": "15 40% 8%", "--card": "15 40% 10%", "--secondary": "15 25% 14%", "--border": "15 15% 20%" },
    "hassan-mosque": { "--deep": "210 45% 8%", "--background": "210 45% 8%", "--card": "210 45% 10%", "--secondary": "210 30% 14%", "--border": "210 20% 20%" },
    "cordoba": { "--deep": "15 50% 8%", "--background": "15 50% 8%", "--card": "15 50% 10%", "--secondary": "15 30% 14%", "--border": "15 20% 20%" },
    "lake-mosque": { "--deep": "10 45% 8%", "--background": "10 45% 8%", "--card": "10 45% 10%", "--secondary": "10 30% 14%", "--border": "10 20% 20%" },
    "sunset-mosque": { "--deep": "25 50% 8%", "--background": "25 50% 8%", "--card": "25 50% 10%", "--secondary": "25 30% 14%", "--border": "25 20% 20%" },
    "djenne": { "--deep": "30 55% 8%", "--background": "30 55% 8%", "--card": "30 55% 10%", "--secondary": "30 35% 14%", "--border": "30 25% 20%" },
    "desert-fort": { "--deep": "25 45% 8%", "--background": "25 45% 8%", "--card": "25 45% 10%", "--secondary": "25 30% 14%", "--border": "25 20% 20%" },
    "desert-night": { "--deep": "20 40% 7%", "--background": "20 40% 7%", "--card": "20 40% 9%", "--secondary": "20 25% 13%", "--border": "20 15% 19%" },
    // Rose
    "rose-gold": { "--deep": "340 40% 8%", "--background": "340 40% 8%", "--card": "340 40% 10%", "--secondary": "340 25% 14%", "--border": "340 15% 20%" },
    // Neutrals/Darks
    "charcoal": { "--deep": "240 30% 8%", "--background": "240 30% 8%", "--card": "240 30% 10%", "--secondary": "240 20% 14%", "--border": "240 10% 20%" },
    "obsidian": { "--deep": "0 0% 5%", "--background": "0 0% 5%", "--card": "0 0% 7%", "--secondary": "0 0% 11%", "--border": "0 0% 17%" },
    "soft-black": { "--deep": "0 0% 6%", "--background": "0 0% 6%", "--card": "0 0% 8%", "--secondary": "0 0% 12%", "--border": "0 0% 18%" },
    "ash": { "--deep": "0 0% 7%", "--background": "0 0% 7%", "--card": "0 0% 9%", "--secondary": "0 0% 13%", "--border": "0 0% 19%" },
    "ink": { "--deep": "215 20% 5%", "--background": "215 20% 5%", "--card": "215 20% 7%", "--secondary": "215 15% 11%", "--border": "215 10% 17%" },
    "stone": { "--deep": "50 10% 7%", "--background": "50 10% 7%", "--card": "50 10% 9%", "--secondary": "50 8% 13%", "--border": "50 5% 19%" },
    "slate": { "--deep": "215 25% 10%", "--background": "215 25% 10%", "--card": "215 25% 12%", "--secondary": "215 18% 16%", "--border": "215 10% 22%" },
    "kaaba-aerial": { "--deep": "0 0% 5%", "--background": "0 0% 5%", "--card": "0 0% 7%", "--secondary": "0 0% 11%", "--border": "0 0% 17%" },
    "kaaba-marble": { "--deep": "0 0% 6%", "--background": "0 0% 6%", "--card": "0 0% 8%", "--secondary": "0 0% 12%", "--border": "0 0% 18%" },
  };
  // Default: deep green for any unmapped
  const defaultTheme = { "--deep": "154 46% 6%", "--background": "154 46% 6%", "--card": "154 46% 8%", "--secondary": "154 30% 12%", "--border": "154 20% 18%" };
  return themes[id] || defaultTheme;
}

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
  const [appIcon, setAppIconState] = useState(() => localStorage.getItem("nf_icon") || "carpet");
  const [location, setLocation] = useState("Detecting...");
  const [appearance, setAppearanceState] = useState<"dark" | "light" | "system">(() => (localStorage.getItem("nf_appearance") as any) || "dark");
  const [fontSize, setFontSizeState] = useState<"small" | "medium" | "large">(() => (localStorage.getItem("nf_fontsize") as any) || "medium");
  const nextPrayerIndex = getNextPrayerIndex();
  const currentPrayer = prayers[nextPrayerIndex];

  useEffect(() => { localStorage.setItem("nf_apps", JSON.stringify(lockedApps)); }, [lockedApps]);
  useEffect(() => { localStorage.setItem("nf_prayers_" + getTodayKey(), JSON.stringify(prayerState)); }, [prayerState]);
  useEffect(() => { localStorage.setItem("nf_streak", JSON.stringify(streak)); }, [streak]);
  useEffect(() => { localStorage.setItem("nf_travel", String(travelMode)); }, [travelMode]);

  // Apply wallpaper theme
  useEffect(() => {
    localStorage.setItem("nf_wallpaper", wallpaper);
    const theme = getThemeFromWallpaperId(wallpaper);
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, val]) => root.style.setProperty(key, val));
    const overrides = wallpaper === "light" ? lightThemeOverrides : darkThemeDefaults;
    Object.entries(overrides).forEach(([key, val]) => root.style.setProperty(key, val));
  }, [wallpaper]);

  // Persist language & icon
  useEffect(() => { localStorage.setItem("nf_language", language); }, [language]);
  useEffect(() => { localStorage.setItem("nf_icon", appIcon); }, [appIcon]);
  useEffect(() => {
    localStorage.setItem("nf_appearance", appearance);
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = appearance === "dark" || (appearance === "system" && prefersDark);
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [appearance]);
  useEffect(() => {
    localStorage.setItem("nf_fontsize", fontSize);
    const root = document.documentElement;
    root.style.fontSize = fontSize === "small" ? "14px" : fontSize === "large" ? "18px" : "16px";
  }, [fontSize]);

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
  const setAppearance = useCallback((v: "dark" | "light" | "system") => setAppearanceState(v), []);
  const setFontSize = useCallback((v: "small" | "medium" | "large") => setFontSizeState(v), []);

  return (
    <AppContext.Provider value={{
      lockedApps, toggleAppLock, removeApp, addApp,
      prayerState, completePrayer, currentPrayer, nextPrayerIndex,
      streak, bypass, activateBypass, travelMode, setTravelMode,
      allAppsUnlocked, unlockAllApps,
      wallpaper, setWallpaper, language, setLanguage, appIcon, setAppIcon, location,
      appearance, setAppearance, fontSize, setFontSize,
    }}>
      {children}
    </AppContext.Provider>
  );
};

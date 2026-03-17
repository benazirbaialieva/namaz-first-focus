import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/contexts/AppContext";
import { prayers, wisdomCards } from "@/data/prayers";
import { availableApps } from "@/data/prayers";
import { Lock, Unlock, Plus, X, Check, Clock, ChevronLeft, ChevronRight, MapPin, Moon, Flame, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PrayerChecklist from "@/components/PrayerChecklist";
import { useTranslation } from "@/hooks/useTranslation";

const transition = { type: "spring" as const, damping: 25, stiffness: 200 };

function useCountdown(targetTime: string) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const [h, m] = targetTime.split(":").map(Number);
      const target = new Date(now);
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const diff = target.getTime() - now.getTime();
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [targetTime]);
  return timeLeft;
}

function useLiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

import { allWallpapers } from "@/data/wallpapers";

const prayerNameKey: Record<string, string> = {
  fajr: "prayerFajr",
  dhuhr: "prayerDhuhr",
  asr: "prayerAsr",
  maghrib: "prayerMaghrib",
  isha: "prayerIsha",
};

const HomePage = () => {
  const {
    lockedApps, toggleAppLock, removeApp, addApp,
    prayerState, currentPrayer, nextPrayerIndex,
    streak, bypass, activateBypass, travelMode, location, wallpaper,
  } = useAppContext();
  const { t, rtl } = useTranslation();
  const navigate = useNavigate();
  const [showChecklist, setShowChecklist] = useState(false);
  const [showBypassMenu, setShowBypassMenu] = useState(false);
  const [showAddApp, setShowAddApp] = useState(false);
  const [wisdomIndex, setWisdomIndex] = useState(0);
  const clock = useLiveClock();
  const countdown = useCountdown(currentPrayer.time);

  const completedToday = Object.values(prayerState.completed).filter(Boolean).length;
  const monthPct = streak.monthTotal > 0 ? Math.round((streak.monthPrayers / streak.monthTotal) * 100) : 0;

  const isLocked = lockedApps.some(a => a.locked) && !bypass.active;

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date();
  const streakDots = weekDays.map((d, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    const key = date.toISOString().split("T")[0];
    const count = streak.days[key] || 0;
    return { day: d, count, isToday: i === 6 };
  });

  const addableApps = availableApps.filter(a => !lockedApps.find(la => la.id === a.id));
  const wpData = allWallpapers.find(w => w.id === wallpaper);
  const bgImage = wpData?.type === "image" ? wpData.image : undefined;
  const bgGradient = wpData?.type === "gradient" ? wpData.gradient : undefined;

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-2 relative" dir={rtl ? "rtl" : "ltr"}>
      {/* Wallpaper background */}
      {bgImage && (
        <div className="absolute inset-0 z-0">
          <img src={bgImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/40" />
        </div>
      )}
      {bgGradient && (
        <div className="absolute inset-0 z-0" style={{ background: bgGradient }}>
          <div className="absolute inset-0 bg-background/40" />
        </div>
      )}

      <div className="relative z-10">
      <div className="flex items-center justify-between py-3">
        <span className="text-dim text-sm font-semibold">{clock}</span>
        <div className="glass-card px-3 py-1.5 flex items-center gap-1.5">
          <MapPin size={16} className="text-sajda" />
          <span className="text-foreground text-sm font-bold">{location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-foreground text-2xl tracking-tight flex items-center gap-2" style={{ fontFamily: "'Marhey', cursive" }}>
          {t.appName}
          <Moon size={20} className="text-gold" fill="currentColor" />
        </h1>
        <p className="font-amiri text-gold text-lg">{t.bismillah}</p>
      </div>

      <motion.div
        className="glass-card p-6 mb-4 flex flex-col items-center justify-center relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={transition}
      >
        <div className="absolute inset-0 rounded-[20px]" style={{ boxShadow: "inset 0 0 60px hsla(136, 59%, 49%, 0.06)" }} />

        {/* Current Namaz - Big */}
        <p className="text-dim text-[9px] font-bold uppercase tracking-widest mb-2">{t.currentNamaz}</p>
        <p className="font-amiri text-gold text-3xl mb-1">{currentPrayer.arabic}</p>
        <p className="text-foreground text-xl font-extrabold mb-0.5">{(t as any)[prayerNameKey[currentPrayer.id]] || currentPrayer.name} {t.prayer}</p>
        <p className="text-dim text-sm font-semibold mb-4">{currentPrayer.time}</p>

        {/* Divider */}
        <div className="w-16 h-[1px] bg-border/30 mb-4" />

        {/* Next prayer countdown */}
        <p className="text-dim text-[10px] font-bold uppercase tracking-widest mb-1">{t.nextPrayerIn}</p>
        <div className="text-4xl font-extrabold text-sajda tracking-tight mb-3" style={{ textShadow: "0 0 30px hsla(136, 59%, 49%, 0.25)" }}>
          {countdown}
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isLocked ? "bg-primary/20 text-sajda" : "bg-accent/20 text-gold"}`}>
          {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
          {isLocked ? t.appsLocked : t.appsUnlocked}
        </div>
      </motion.div>

      {bypass.active && bypass.endTime && (
        <div className="glass-card-light p-3 mb-4 flex items-center justify-between">
          <span className="text-foreground text-sm font-semibold">{t.emergencyBypass}</span>
          <span className="text-gold text-sm font-bold">{Math.max(0, Math.ceil((bypass.endTime - Date.now()) / 60000))}m {t.left}</span>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button onClick={() => setShowBypassMenu(!showBypassMenu)}
          className="glass-card-light px-4 py-2.5 text-dim text-xs font-semibold flex items-center gap-1.5 flex-1">
          <Clock size={14} /> {t.bypassPass}
        </button>
      </div>

      <AnimatePresence>
        {showBypassMenu && (
          <motion.div className="flex gap-2 mb-4" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            {[5, 10, 15].map(m => (
              <button key={m} onClick={() => { activateBypass(m); setShowBypassMenu(false); }}
                className="glass-card-light px-4 py-2 text-gold text-xs font-bold flex-1">
                {m} min
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>


      <div className="glass-card p-4 mb-4 relative">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setWisdomIndex(Math.max(0, wisdomIndex - 1))} className="text-dim p-1"><ChevronLeft size={16} /></button>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
            wisdomCards[wisdomIndex].type === "ayat" ? "bg-primary/20 text-sajda" :
            wisdomCards[wisdomIndex].type === "sunnah" ? "bg-accent/20 text-gold" :
            "bg-secondary text-foreground/70"
          }`}>
            {wisdomCards[wisdomIndex].type === "ayat" ? t.ayat : wisdomCards[wisdomIndex].type === "sunnah" ? t.sunnah : t.fact}
          </span>
          <span className="text-dim text-[9px] font-bold">{wisdomIndex + 1}/{wisdomCards.length}</span>
          <button onClick={() => setWisdomIndex(Math.min(wisdomCards.length - 1, wisdomIndex + 1))} className="text-dim p-1"><ChevronRight size={16} /></button>
        </div>
        <div className="min-h-[100px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={wisdomIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <p className={`text-center leading-snug mb-1 ${wisdomCards[wisdomIndex].type === "fact" ? "text-2xl" : "font-amiri text-gold text-xl"}`}>{wisdomCards[wisdomIndex].arabic}</p>
              <p className="text-foreground text-sm text-center mb-1">{(t as any)[`wisdom${wisdomIndex + 1}`] || wisdomCards[wisdomIndex].translation}</p>
              <p className="text-dim text-[10px] text-center">{wisdomCards[wisdomIndex].source}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="glass-card p-4 mb-4">
        <h3 className="text-foreground font-bold text-sm mb-3">{t.dailyPrayers}</h3>
        <div className="space-y-2">
          {prayers.map((p, i) => {
            const completed = prayerState.completed[p.id];
            const isCurrent = i === nextPrayerIndex;
            return (
              <motion.div key={p.id}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  isCurrent ? "border border-sajda/50 bg-primary/10" : "bg-secondary/30"
                } ${!isCurrent && !completed ? "opacity-60" : ""}`}
                whileTap={{ scale: 0.98 }}>
                <div className="flex items-center gap-3">
                  {completed ? (
                    <div className="w-6 h-6 rounded-full bg-sajda flex items-center justify-center"><Check size={14} className="text-deep" /></div>
                  ) : (
                    <div className={`w-6 h-6 rounded-full border-2 ${isCurrent ? "border-sajda" : "border-dim/30"}`} />
                  )}
                  <div>
                    <span className="text-foreground font-bold text-sm">{(t as any)[prayerNameKey[p.id]] || p.name}</span>
                    <span className="font-amiri text-gold text-sm ml-2">{p.arabic}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {travelMode && (p.id === "dhuhr" || p.id === "asr" || p.id === "isha") && (
                    <span className="text-[9px] font-bold bg-accent/20 text-gold px-1.5 py-0.5 rounded">QASR</span>
                  )}
                  {travelMode && (p.id === "dhuhr" || p.id === "maghrib") && (
                    <span className="text-[9px] font-bold bg-primary/20 text-sajda px-1.5 py-0.5 rounded">JAM</span>
                  )}
                  <span className="text-foreground text-base font-extrabold">{p.time}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <motion.div className="glass-card p-3 text-center" whileTap={{ scale: 0.97 }}>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Flame size={14} className="text-gold" />
            <span className="text-foreground text-lg font-extrabold">{streak.current}</span>
          </div>
          <p className="text-dim text-[10px] font-semibold">{t.dayStreak}</p>
        </motion.div>
        <motion.button
          onClick={() => navigate("/dhikr")}
          className="glass-card p-3 text-center"
          whileTap={{ scale: 0.97 }}
        >
          <p className="text-lg mb-0.5">📿</p>
          <p className="text-dim text-[10px] font-semibold">{t.dhikr}</p>
        </motion.button>
        <motion.button
          onClick={() => navigate("/names99")}
          className="glass-card p-3 text-center"
          whileTap={{ scale: 0.97 }}
        >
          <p className="text-lg mb-0.5">✨</p>
          <p className="text-dim text-[10px] font-semibold">{t.names99}</p>
        </motion.button>
      </div>

      <div className="glass-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-foreground font-bold text-sm">{t.lockedApps}</h3>
          <button onClick={() => setShowAddApp(true)} className="text-sajda text-xs font-bold flex items-center gap-1">
            <Plus size={14} /> {t.addApp}
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {lockedApps.map(app => (
            <motion.div key={app.id} className="relative flex flex-col items-center gap-1" whileTap={{ scale: 0.95 }}>
              <button onClick={() => removeApp(app.id)} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive/80 flex items-center justify-center z-10">
                <X size={8} className="text-foreground" />
              </button>
              <button onClick={() => toggleAppLock(app.id)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${app.locked ? "glass-card app-locked" : "glass-card"}`}>
                {app.icon}
                {app.locked && (
                  <div className="absolute top-0.5 right-0.5"><Lock size={8} className="text-dim" /></div>
                )}
              </button>
              <span className="text-dim text-[9px] font-semibold truncate w-full text-center">{app.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showAddApp && (
          <motion.div className="fixed inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-deep/80" onClick={() => setShowAddApp(false)} />
            <motion.div className="relative w-full glass-card p-6 rounded-b-none" initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={transition}>
              <h3 className="text-foreground font-bold text-lg mb-4">{t.addAppToLock}</h3>
              <div className="grid grid-cols-4 gap-4">
                {addableApps.map((app: any) => (
                  <button key={app.id} onClick={() => { addApp(app); setShowAddApp(false); }} className="flex flex-col items-center gap-1">
                    <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-2xl">{app.icon}</div>
                    <span className="text-dim text-[9px] font-semibold">{app.name}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowAddApp(false)} className="w-full mt-4 py-3 glass-card-light text-dim font-semibold text-sm rounded-xl">{t.cancel}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={() => setShowChecklist(true)}
        className="w-full py-4 rounded-2xl font-extrabold text-lg text-deep mb-4"
        style={{ background: "linear-gradient(135deg, hsl(136, 59%, 49%), hsl(136, 59%, 39%))" }}
        whileTap={{ scale: 0.97 }} transition={transition}>
        {t.readyToPray}
      </motion.button>

      <PrayerChecklist isOpen={showChecklist} onClose={() => setShowChecklist(false)} />
      </div>
    </div>
  );
};

export default HomePage;

import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Check, ChevronDown, ChevronUp, Crown, LogIn, Moon, Sun, Monitor, X, Lock, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { wallpaperCategories, appIcons } from "@/data/wallpapers";

const languages = [
  { name: "English", flag: "🇬🇧" },
  { name: "العربية", flag: "🇸🇦" },
  { name: "Türkçe", flag: "🇹🇷" },
  { name: "Русский", flag: "🇷🇺" },
  { name: "Bahasa Indonesia", flag: "🇮🇩" },
  { name: "Bahasa Melayu", flag: "🇲🇾" },
  { name: "Қазақша", flag: "🇰🇿" },
  { name: "Oʻzbekcha", flag: "🇺🇿" },
  { name: "Кыргызча", flag: "🇰🇬" },
  { name: "हिन्दी", flag: "🇮🇳" },
  { name: "Français", flag: "🇫🇷" },
];

const calcMethods = [
  "Muslim World League", "ISNA", "Egyptian Authority", "Umm Al-Qura",
  "Dubai", "Karachi", "Tehran", "Jafari"
];

const asrMethods = ["Standard (Shafi'i)", "Hanafi"];

const proFeatures = [
  "🔓 Unlimited apps to lock",
  "🎨 All premium wallpapers",
  "📱 Exclusive app icons",
  "🌙 Advanced widgets",
  "📊 Detailed prayer analytics",
  "🔔 Custom notification sounds",
  "🌍 Offline prayer times",
  "✨ No ads ever",
];

const SettingsPage = () => {
  const { travelMode, setTravelMode, wallpaper, setWallpaper, language, setLanguage, appIcon, setAppIcon, appearance, setAppearance, fontSize, setFontSize } = useAppContext();
  const { t, rtl } = useTranslation();
  const [showCalcMethods, setShowCalcMethods] = useState(false);
  const [selectedCalc, setSelectedCalc] = useState("Muslim World League");
  const [showAsrMethods, setShowAsrMethods] = useState(false);
  const [selectedAsr, setSelectedAsr] = useState("Standard (Shafi'i)");
  const [showProModal, setShowProModal] = useState(false);
  const [showProFeatures, setShowProFeatures] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "yearly">("weekly");
  const [showWallpapers, setShowWallpapers] = useState(false);

  const handleInvite = () => {
    const shareData = { title: "Namaz First", text: "Check out Namaz First - a prayer focus app!", url: window.location.origin };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6" dir={rtl ? "rtl" : "ltr"}>
      <div className="text-center mb-6">
        <h1 className="text-foreground text-xl font-extrabold">{t.settings}</h1>
        <p className="font-amiri text-gold text-lg">إعدادات</p>
      </div>

      {/* Sign In / Pro */}
      <div className="flex gap-2 mb-4">
        <button className="flex-1 glass-card py-3 px-4 flex items-center justify-center gap-2 text-foreground font-bold text-sm">
          <LogIn size={16} className="text-sajda" /> {t.signIn}
        </button>
        <button onClick={() => setShowProModal(true)}
          className="flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold text-sm text-deep rounded-[20px]"
          style={{ background: "linear-gradient(135deg, hsl(42, 63%, 55%), hsl(42, 63%, 45%))" }}>
          <Crown size={16} /> {t.upgradePro}
        </button>
      </div>

      {/* Appearance */}
      <div className="glass-card p-4 mb-4">
        <h3 className="text-foreground font-bold text-sm mb-3">{t.appearance}</h3>
        <div className="flex gap-2">
          {([
            { id: "dark", label: t.dark, icon: Moon },
            { id: "light", label: t.light, icon: Sun },
            { id: "system", label: t.system, icon: Monitor },
          ] as const).map(opt => (
            <button key={opt.id} onClick={() => setAppearance(opt.id)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                appearance === opt.id ? "bg-primary/20 border border-sajda/30" : "glass-card-light"
              }`}>
              <opt.icon size={18} className={appearance === opt.id ? "text-sajda" : "text-dim"} />
              <span className={`text-xs font-bold ${appearance === opt.id ? "text-sajda" : "text-dim"}`}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="glass-card p-4 mb-4">
        <h3 className="text-foreground font-bold text-sm mb-3">{t.fontSize}</h3>
        <div className="flex gap-2">
          {([
            { key: "small" as const, label: t.small, size: 11 },
            { key: "medium" as const, label: t.medium, size: 13 },
            { key: "large" as const, label: t.large, size: 15 },
          ]).map(s => (
            <button key={s.key} onClick={() => setFontSize(s.key)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all capitalize ${
                fontSize === s.key ? "bg-primary/20 text-sajda border border-sajda/30" : "glass-card-light text-dim"
              }`}>
              <span style={{ fontSize: s.size }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Wallpaper */}
      <div className="glass-card p-4 mb-4">
        <button onClick={() => setShowWallpapers(!showWallpapers)} className="w-full flex items-center justify-between">
          <h3 className="text-foreground font-bold text-sm">{t.wallpaper}</h3>
          {showWallpapers ? <ChevronUp size={16} className="text-dim" /> : <ChevronDown size={16} className="text-dim" />}
        </button>
        <AnimatePresence>
          {showWallpapers && (
            <motion.div className="mt-3 space-y-4" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              {wallpaperCategories.map(cat => (
                <div key={cat.id}>
                  <p className="text-dim text-xs font-bold mb-2 flex items-center gap-1.5">
                    <span>{cat.icon}</span> {cat.label}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {cat.wallpapers.map(w => (
                      <button key={w.id}
                        onClick={() => w.pro ? setShowProModal(true) : setWallpaper(w.id)}
                        className={`h-20 rounded-xl relative transition-all overflow-hidden ${wallpaper === w.id ? "ring-2 ring-sajda" : ""}`}>
                        {w.type === "image" ? (
                          <img src={w.image} alt={w.name} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0" style={{ background: w.gradient }} />
                        )}
                        {wallpaper === w.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-deep/40">
                            <Check size={16} className="text-sajda" />
                          </div>
                        )}
                        {w.pro && (
                          <div className="absolute top-1 right-1 bg-deep/70 rounded-full p-0.5">
                            <Crown size={10} className="text-gold" />
                          </div>
                        )}
                        <span className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] font-bold text-white drop-shadow-lg">{w.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* App Icon */}
      <div className="glass-card p-4 mb-4">
        <h3 className="text-foreground font-bold text-sm mb-3">{t.appIcon}</h3>
        <div className="flex flex-wrap gap-3 justify-center">
          {appIcons.map((ic, i) => {
            const isPro = i >= 2;
            return (
              <button key={ic.id}
                onClick={() => isPro ? setShowProModal(true) : setAppIcon(ic.id)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all glass-card relative ${appIcon === ic.id ? "ring-2 ring-sajda" : ""}`}>
                {ic.emoji}
                {isPro && (
                  <div className="absolute -top-1 -right-1 bg-deep/70 rounded-full p-0.5">
                    <Crown size={9} className="text-gold" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <div className="glass-card p-4 mb-4">
        <h3 className="text-foreground font-bold text-sm mb-3">{t.language}</h3>
        <div className="flex flex-wrap gap-2">
          {languages.map(lang => (
            <button key={lang.name} onClick={() => setLanguage(lang.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                language === lang.name ? "bg-primary/20 text-sajda border border-sajda/30" : "glass-card-light text-dim"
              }`}>
              <span className="text-sm">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-4 mb-4 space-y-4">
        <h3 className="text-foreground font-bold text-sm">{t.notifications}</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground text-sm font-bold">{t.prayerNotifications}</p>
            <p className="text-dim text-xs">{t.getNotified}</p>
          </div>
          <button className="w-12 h-7 rounded-full transition-all relative bg-sajda">
            <div className="w-5 h-5 rounded-full bg-foreground absolute top-1 transition-all left-6" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground text-sm font-bold">{t.adhanSound}</p>
            <p className="text-dim text-xs">{t.playAdhan}</p>
          </div>
          <button className="w-12 h-7 rounded-full transition-all relative bg-secondary">
            <div className="w-5 h-5 rounded-full bg-foreground absolute top-1 transition-all left-1" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground text-sm font-bold">{t.dhikrReminders}</p>
            <p className="text-dim text-xs">{t.morningEvening}</p>
          </div>
          <button className="w-12 h-7 rounded-full transition-all relative bg-secondary">
            <div className="w-5 h-5 rounded-full bg-foreground absolute top-1 transition-all left-1" />
          </button>
        </div>
      </div>

      {/* Travel Mode */}
      <div className="glass-card p-4 mb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground text-sm font-bold">{t.travelMode}</p>
            <p className="text-dim text-xs">{t.travelModeDesc}</p>
          </div>
          <button onClick={() => setTravelMode(!travelMode)}
            className={`w-12 h-7 rounded-full transition-all relative ${travelMode ? "bg-sajda" : "bg-secondary"}`}>
            <div className={`w-5 h-5 rounded-full bg-foreground absolute top-1 transition-all ${travelMode ? "left-6" : "left-1"}`} />
          </button>
        </div>
      </div>

      {/* Calculation Method */}
      <div className="glass-card p-4 mb-4">
        <button onClick={() => setShowCalcMethods(!showCalcMethods)} className="w-full flex items-center justify-between">
          <div>
            <h3 className="text-foreground font-bold text-sm">{t.calculationMethod}</h3>
            <p className="text-dim text-xs">{selectedCalc}</p>
          </div>
          {showCalcMethods ? <ChevronUp size={16} className="text-dim" /> : <ChevronDown size={16} className="text-dim" />}
        </button>
        <AnimatePresence>
          {showCalcMethods && (
            <motion.div className="mt-3 space-y-1" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              {calcMethods.map(m => (
                <button key={m} onClick={() => { setSelectedCalc(m); setShowCalcMethods(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedCalc === m ? "bg-primary/20 text-sajda" : "text-dim"}`}>
                  {m}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Asr Calculation */}
      <div className="glass-card p-4 mb-4">
        <button onClick={() => setShowAsrMethods(!showAsrMethods)} className="w-full flex items-center justify-between">
          <div>
            <h3 className="text-foreground font-bold text-sm">{t.asrCalculation}</h3>
            <p className="text-dim text-xs">{selectedAsr}</p>
          </div>
          {showAsrMethods ? <ChevronUp size={16} className="text-dim" /> : <ChevronDown size={16} className="text-dim" />}
        </button>
        <AnimatePresence>
          {showAsrMethods && (
            <motion.div className="mt-3 space-y-1" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              {asrMethods.map(m => (
                <button key={m} onClick={() => { setSelectedAsr(m); setShowAsrMethods(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedAsr === m ? "bg-primary/20 text-sajda" : "text-dim"}`}>
                  {m}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Widgets */}
      <div className="glass-card p-4 mb-4">
        <h3 className="text-foreground font-bold text-sm mb-3">{t.widgets}</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: t.general, icon: "⚙️", desc: "Overview", color: "bg-secondary/40" },
            { label: t.prayerTimes, icon: "🕌", desc: "5 daily", color: "bg-primary/10" },
            { label: t.namesOfAllah, icon: "📿", desc: "99 names", color: "bg-accent/10" },
            { label: t.dhikr, icon: "🤲", desc: "Counter", color: "bg-primary/10" },
            { label: t.alarm, icon: "🔔", desc: "Adhan", color: "bg-accent/10" },
            { label: t.timer, icon: "⏱️", desc: "00:00", color: "bg-secondary/40" },
          ].map(w => (
            <button key={w.label} className={`${w.color} py-3 px-2 rounded-xl text-center border border-border/20 hover:border-sajda/30 transition-all`}>
              <span className="text-2xl block mb-1">{w.icon}</span>
              <span className="text-foreground text-[11px] font-bold block">{w.label}</span>
              <span className="text-dim text-[9px]">{w.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Invite Friend */}
      <button onClick={handleInvite}
        className="w-full glass-card p-4 mb-4 flex items-center justify-center gap-2 text-sajda font-bold text-sm">
        <Share2 size={18} /> Invite a Friend
      </button>

      <AnimatePresence>
        {showProModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-deep/90" onClick={() => setShowProModal(false)} />
            <motion.div className="relative w-full max-w-sm glass-card p-6"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <button onClick={() => setShowProModal(false)} className="absolute top-3 right-3 text-dim"><X size={20} /></button>
              <div className="text-center mb-4">
                <Crown size={32} className="text-gold mx-auto mb-2" />
                <h2 className="text-foreground font-extrabold text-lg">{t.proTitle}</h2>
                <p className="text-dim text-xs mt-1">{t.unlockExperience}</p>
              </div>

              <div className="flex gap-2 mb-4">
                <button onClick={() => setSelectedPlan("weekly")}
                  className={`flex-1 py-3 rounded-xl text-center transition-all ${selectedPlan === "weekly" ? "bg-primary/20 border border-sajda/30" : "glass-card-light"}`}>
                  <p className={`font-extrabold text-2xl ${selectedPlan === "weekly" ? "text-sajda" : "text-foreground"}`}>$3.99</p>
                  <p className="text-dim text-[10px] font-semibold">per week</p>
                </button>
                <button onClick={() => setSelectedPlan("yearly")}
                  className={`flex-1 py-3 rounded-xl text-center transition-all relative ${selectedPlan === "yearly" ? "bg-primary/20 border border-sajda/30" : "glass-card-light"}`}>
                  <div className="absolute -top-2 right-2 bg-sajda text-deep text-[9px] font-bold px-2 py-0.5 rounded-full">BEST VALUE</div>
                  <p className={`font-extrabold text-2xl ${selectedPlan === "yearly" ? "text-sajda" : "text-foreground"}`}>$0.96</p>
                  <p className="text-dim text-[10px] font-semibold">per week</p>
                  <p className={`text-[9px] font-semibold mt-0.5 text-dim`}>$49.99/year</p>
                </button>
              </div>

              <button onClick={() => setShowProFeatures(!showProFeatures)} className="w-full text-center text-sajda text-xs font-bold mb-3">
                {showProFeatures ? t.hideProFeatures : t.seeProFeatures} {showProFeatures ? "▲" : "▼"}
              </button>
              <AnimatePresence>
                {showProFeatures && (
                  <motion.div className="space-y-2 mb-4" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    {proFeatures.map(f => (
                      <div key={f} className="text-foreground text-sm font-semibold">{f}</div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <button className="w-full py-3.5 rounded-2xl font-extrabold text-deep text-sm"
                style={{ background: "linear-gradient(135deg, hsl(42, 63%, 55%), hsl(42, 63%, 45%))" }}>
                {t.subscribe} — {selectedPlan === "weekly" ? "$3.99/wk" : "$49.99/yr"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;

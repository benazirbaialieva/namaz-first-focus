import { useAppContext } from "@/contexts/AppContext";
import { Check } from "lucide-react";

const wallpapers = [
  { id: "mosque-night", name: "Mosque Night", color: "#0C2116" },
  { id: "navy", name: "Navy", color: "#0A1628" },
  { id: "mystic", name: "Mystic", color: "#1A0A2E" },
  { id: "forest", name: "Forest", color: "#0C2116" },
  { id: "ember", name: "Ember", color: "#2A1008" },
  { id: "rose", name: "Rose", color: "#2A0A1A" },
  { id: "light", name: "Light", color: "#F5F2EA" },
];

const appIcons = [
  { id: "main", name: "Main", color: "#34C759" },
  { id: "gold", name: "Gold", color: "#D4A843" },
  { id: "dark", name: "Dark", color: "#1A1A2E" },
  { id: "fajr", name: "Fajr", color: "#3B82F6" },
  { id: "dhuhr", name: "Dhuhr", color: "#14B8A6" },
  { id: "asr", name: "Asr", color: "#22C55E" },
  { id: "maghrib", name: "Maghrib", color: "#F97316" },
  { id: "isha", name: "Isha", color: "#8B5CF6" },
  { id: "kaaba", name: "Kaaba", color: "#1F2937" },
  { id: "rose", name: "Rose", color: "#EC4899" },
  { id: "ramadan", name: "Ramadan", color: "#EAB308" },
  { id: "minimal", name: "Minimal", color: "#6B7280" },
];

const languages = [
  "English", "العربية", "Türkçe", "Русский", "Bahasa Indonesia",
  "Bahasa Melayu", "Қазақша", "Oʻzbekcha", "Кыргызча", "हिन्दी", "Français"
];

const calcMethods = [
  "Muslim World League", "ISNA", "Egyptian Authority", "Umm Al-Qura",
  "Dubai", "Karachi", "Tehran", "Jafari"
];

const SettingsPage = () => {
  const { travelMode, setTravelMode, wallpaper, setWallpaper, language, setLanguage, appIcon, setAppIcon } = useAppContext();

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6">
      <div className="text-center mb-6">
        <h1 className="text-foreground text-xl font-extrabold">Settings</h1>
        <p className="font-amiri text-gold text-lg">إعدادات</p>
      </div>

      {/* Wallpaper */}
      <div className="glass-card p-4 mb-4">
        <h3 className="text-foreground font-bold text-sm mb-3">Wallpaper</h3>
        <div className="grid grid-cols-4 gap-2">
          {wallpapers.map(w => (
            <button
              key={w.id}
              onClick={() => setWallpaper(w.id)}
              className={`h-16 rounded-xl relative transition-all ${wallpaper === w.id ? "ring-2 ring-sajda" : ""}`}
              style={{ backgroundColor: w.color }}
            >
              {wallpaper === w.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check size={16} className="text-sajda" />
                </div>
              )}
              <span className={`absolute bottom-1 left-0 right-0 text-center text-[8px] font-bold ${w.id === "light" ? "text-deep" : "text-dim"}`}>{w.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* App Icon */}
      <div className="glass-card p-4 mb-4">
        <h3 className="text-foreground font-bold text-sm mb-3">App Icon</h3>
        <div className="grid grid-cols-6 gap-2">
          {appIcons.map(ic => (
            <button
              key={ic.id}
              onClick={() => setAppIcon(ic.id)}
              className={`w-12 h-12 rounded-xl mx-auto transition-all ${appIcon === ic.id ? "ring-2 ring-sajda" : ""}`}
              style={{ backgroundColor: ic.color }}
            >
              {appIcon === ic.id && <Check size={12} className="text-foreground mx-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="glass-card p-4 mb-4">
        <h3 className="text-foreground font-bold text-sm mb-3">Language</h3>
        <div className="flex flex-wrap gap-2">
          {languages.map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                language === lang ? "bg-primary/20 text-sajda border border-sajda/30" : "glass-card-light text-dim"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="glass-card p-4 mb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground text-sm font-bold">Prayer Notifications</p>
            <p className="text-dim text-xs">Get notified at prayer times</p>
          </div>
          <button
            className="w-12 h-7 rounded-full transition-all relative bg-sajda"
          >
            <div className="w-5 h-5 rounded-full bg-foreground absolute top-1 transition-all left-6" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground text-sm font-bold">Travel Mode</p>
            <p className="text-dim text-xs">Qasr & Jam rules (Quran 4:101)</p>
          </div>
          <button
            onClick={() => setTravelMode(!travelMode)}
            className={`w-12 h-7 rounded-full transition-all relative ${travelMode ? "bg-sajda" : "bg-secondary"}`}
          >
            <div className={`w-5 h-5 rounded-full bg-foreground absolute top-1 transition-all ${travelMode ? "left-6" : "left-1"}`} />
          </button>
        </div>
      </div>

      {/* Calculation Method */}
      <div className="glass-card p-4 mb-4">
        <h3 className="text-foreground font-bold text-sm mb-3">Calculation Method</h3>
        <div className="space-y-1">
          {calcMethods.map(m => (
            <button
              key={m}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-dim"
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

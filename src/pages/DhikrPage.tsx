import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { duas, duaCategories } from "@/data/duas";
import { names99, getNameMeaning, type Name99 } from "@/data/names99";
import { Search, X, Circle, LayoutList } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import TasbihCounter from "@/components/TasbihCounter";

const transition = { type: "spring" as const, damping: 25, stiffness: 200 };

const dhikrOptions = [
  { label: "سُبْحَانَ ٱللَّٰهِ", transliteration: "Subhanallah", goal: 33 },
  { label: "ٱلْحَمْدُ لِلَّٰهِ", transliteration: "Alhamdulillah", goal: 33 },
  { label: "ٱللَّٰهُ أَكْبَرُ", transliteration: "Allahu Akbar", goal: 34 },
  { label: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ", transliteration: "La ilaha illallah", goal: 100 },
];

const languageNameToCode: Record<string, string> = {
  "English": "en", "العربية": "ar", "Türkçe": "tr", "Русский": "ru",
  "Bahasa Indonesia": "id", "Bahasa Melayu": "ms", "Қазақша": "kk",
  "Oʻzbekcha": "uz", "Кыргызча": "ky", "हिन्दी": "hi", "Français": "fr",
};

const DhikrPage = () => {
  const { t, rtl, language } = useTranslation();
  const langCode = languageNameToCode[language] || "en";
  const [tab, setTab] = useState<"counter" | "duas" | "names">("counter");
  const [selectedDhikr, setSelectedDhikr] = useState(0);
  const [count, setCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("Morning");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedName, setSelectedName] = useState<Name99 | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [counterView, setCounterView] = useState<"circle" | "tasbih">("tasbih");

  const currentDhikr = dhikrOptions[selectedDhikr];
  const progress = Math.min(count / currentDhikr.goal, 1);

  const filteredDuas = duas.filter(d => d.category === selectedCategory);
  const filteredNames = names99.filter(n =>
    !searchQuery ||
    n.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.arabic.includes(searchQuery) ||
    getNameMeaning(n, langCode).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCount = () => {
    if (count < currentDhikr.goal) {
      const newCount = count + 1;
      setCount(newCount);

      // Vibrate on completion of goal
      if (newCount === currentDhikr.goal) {
        navigator.vibrate?.([100, 50, 100, 50, 200]);
        setShowCompletion(true);
        setTimeout(() => setShowCompletion(false), 2000);
      } else if (newCount % 33 === 0 || newCount % 34 === 0) {
        navigator.vibrate?.(50);
      }
    }
  };

  return (
    <div className="min-h-screen bg-deep pb-24 px-4 pt-6" dir={rtl ? "rtl" : "ltr"}>
      <div className="text-center mb-6">
        <h1 className="text-foreground text-xl font-extrabold">{t.dhikrAndDua}</h1>
        <p className="font-amiri text-gold text-lg">ذِكْرٌ وَدُعَاء</p>
      </div>

      <div className="flex gap-1 mb-6 glass-card p-1">
        {([
          { key: "counter" as const, label: t.counter },
          { key: "duas" as const, label: t.duas },
          { key: "names" as const, label: t.names99 },
        ]).map(item => (
          <button key={item.key} onClick={() => setTab(item.key)}
            className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${tab === item.key ? "bg-primary/20 text-sajda" : "text-dim"}`}>
            {item.label}
          </button>
        ))}
      </div>

      {tab === "counter" && (
        <div className="flex flex-col items-center">
          {/* View toggle */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => setCounterView("tasbih")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                counterView === "tasbih" ? "bg-primary/20 text-sajda border border-sajda/30" : "glass-card-light text-dim"
              }`}>
              <LayoutList size={14} /> Tasbih
            </button>
            <button onClick={() => setCounterView("circle")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                counterView === "circle" ? "bg-primary/20 text-sajda border border-sajda/30" : "glass-card-light text-dim"
              }`}>
              <Circle size={14} /> Circle
            </button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {dhikrOptions.map((d, i) => (
              <button key={i} onClick={() => { setSelectedDhikr(i); setCount(0); setShowCompletion(false); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDhikr === i ? "bg-primary/20 text-sajda border border-sajda/30" : "glass-card-light text-dim"
                }`}>
                {d.transliteration}
              </button>
            ))}
          </div>

          {counterView === "tasbih" ? (
            <TasbihCounter
              count={count}
              goal={currentDhikr.goal}
              label={currentDhikr.label}
              transliteration={currentDhikr.transliteration}
              onCount={handleCount}
              onReset={() => { setCount(0); setShowCompletion(false); }}
            />
          ) : (
            <>
              <div className="relative mb-6">
                <svg width="240" height="240" viewBox="0 0 240 240">
                  <circle cx="120" cy="120" r="108" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <circle cx="120" cy="120" r="108" fill="none"
                    stroke={count === currentDhikr.goal ? "hsl(42, 63%, 55%)" : "hsl(136, 59%, 49%)"}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${progress * 678.6} 678.6`} transform="rotate(-90 120 120)"
                    className="transition-all duration-200" />
                </svg>
                <motion.button onClick={handleCount} className="absolute inset-0 flex flex-col items-center justify-center"
                  whileTap={{ scale: 0.95 }}
                  animate={count === currentDhikr.goal ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.3 }}>
                  <p className="font-amiri text-gold text-2xl mb-1">{currentDhikr.label}</p>
                  <p className={`text-4xl font-extrabold ${count === currentDhikr.goal ? "text-gold" : "text-foreground"}`}>{count}</p>
                  <p className="text-dim text-sm">/ {currentDhikr.goal}</p>
                </motion.button>

                <AnimatePresence>
                  {showCompletion && (
                    <motion.div className="absolute inset-0 flex items-center justify-center rounded-full"
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      style={{ background: "radial-gradient(circle, hsla(136, 59%, 49%, 0.15), transparent)" }}>
                      <div className="text-center">
                        <p className="text-gold text-3xl font-extrabold">✓</p>
                        <p className="font-amiri text-gold text-lg">ما شاء الله</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button onClick={() => { setCount(0); setShowCompletion(false); }} className="text-dim text-xs font-semibold underline">{t.reset}</button>
            </>
          )}
        </div>
      )}

      {tab === "duas" && (
        <div>
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            {duaCategories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat ? "bg-primary/20 text-sajda border border-sajda/30" : "glass-card-light text-dim"
                }`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {filteredDuas.map(dua => (
              <div key={dua.id} className="glass-card p-4">
                <p className="font-amiri text-gold text-xl text-right leading-[2] mb-3">{dua.arabic}</p>
                <p className="text-foreground/70 text-sm italic mb-1">{dua.transliteration}</p>
                <p className="text-foreground text-sm mb-2">{dua.translation}</p>
                <p className="text-dim text-[10px]">{dua.source}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "names" && (
        <div>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.searchNames}
              className="w-full bg-secondary/30 text-foreground placeholder:text-dim text-sm pl-9 pr-4 py-2.5 rounded-xl border border-border/30 outline-none focus:border-sajda/30" />
          </div>
          <div className="space-y-2">
            {filteredNames.map(name => {
              const translatedMeaning = getNameMeaning(name, langCode);
              return (
                <motion.button key={name.id} onClick={() => setSelectedName(name)}
                  className="glass-card-light p-4 w-full flex items-center gap-3 text-left" whileTap={{ scale: 0.98 }}>
                  <span className="text-dim text-xs font-bold w-6 shrink-0 text-center">{name.id}</span>
                  <p className="font-amiri text-gold text-3xl leading-tight w-24 shrink-0 text-center">{name.arabic}</p>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-bold">{name.transliteration}</p>
                    <p className="text-dim text-xs">{name.meaning}</p>
                    {langCode !== "en" && translatedMeaning !== name.meaning && (
                      <p className="text-sajda text-xs font-semibold">{translatedMeaning}</p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedName && (
              <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="absolute inset-0 bg-deep/80 backdrop-blur-sm" onClick={() => setSelectedName(null)} />
                <motion.div className="relative glass-card p-8 mx-6 text-center max-w-sm w-full"
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} transition={transition}>
                  <button onClick={() => setSelectedName(null)} className="absolute top-4 right-4 text-dim"><X size={20} /></button>
                  <p className="text-dim text-sm mb-2">#{selectedName.id}</p>
                  <p className="font-amiri text-gold text-5xl mb-4">{selectedName.arabic}</p>
                  <p className="text-foreground text-xl font-bold mb-1">{selectedName.transliteration}</p>
                  <p className="text-dim text-sm mb-1">{selectedName.meaning}</p>
                  {langCode !== "en" && getNameMeaning(selectedName, langCode) !== selectedName.meaning && (
                    <p className="text-sajda text-sm font-semibold">{getNameMeaning(selectedName, langCode)}</p>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default DhikrPage;

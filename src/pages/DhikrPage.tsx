import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { duas, duaCategories } from "@/data/duas";
import { names99, type Name99 } from "@/data/names99";
import { Search, X } from "lucide-react";

const transition = { type: "spring", damping: 25, stiffness: 200 };

const dhikrOptions = [
  { label: "سُبْحَانَ ٱللَّٰهِ", transliteration: "Subhanallah", goal: 33 },
  { label: "ٱلْحَمْدُ لِلَّٰهِ", transliteration: "Alhamdulillah", goal: 33 },
  { label: "ٱللَّٰهُ أَكْبَرُ", transliteration: "Allahu Akbar", goal: 34 },
  { label: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ", transliteration: "La ilaha illallah", goal: 100 },
];

const DhikrPage = () => {
  const [tab, setTab] = useState<"counter" | "duas" | "names">("counter");
  const [selectedDhikr, setSelectedDhikr] = useState(0);
  const [count, setCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("Morning");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedName, setSelectedName] = useState<Name99 | null>(null);

  const currentDhikr = dhikrOptions[selectedDhikr];
  const progress = Math.min(count / currentDhikr.goal, 1);

  const filteredDuas = duas.filter(d => d.category === selectedCategory);
  const filteredNames = names99.filter(n =>
    !searchQuery ||
    n.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.arabic.includes(searchQuery)
  );

  const handleCount = () => {
    if (count < currentDhikr.goal) {
      setCount(count + 1);
      // Haptic on 33rd/34th
      if ((count + 1) % 33 === 0 || (count + 1) % 34 === 0) {
        navigator.vibrate?.(100);
      }
    }
  };

  const resetCounter = () => setCount(0);

  return (
    <div className="min-h-screen bg-deep pb-24 px-4 pt-6">
      <div className="text-center mb-6">
        <h1 className="text-foreground text-xl font-extrabold">Dhikr & Dua</h1>
        <p className="font-amiri text-gold text-lg">ذِكْرٌ وَدُعَاء</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 glass-card p-1">
        {(["counter", "duas", "names"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              tab === t ? "bg-primary/20 text-sajda" : "text-dim"
            }`}
          >
            {t === "counter" ? "Counter" : t === "duas" ? "Duas" : "99 Names"}
          </button>
        ))}
      </div>

      {/* Counter Tab */}
      {tab === "counter" && (
        <div className="flex flex-col items-center">
          {/* Dhikr selector */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {dhikrOptions.map((d, i) => (
              <button
                key={i}
                onClick={() => { setSelectedDhikr(i); setCount(0); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDhikr === i ? "bg-primary/20 text-sajda border border-sajda/30" : "glass-card-light text-dim"
                }`}
              >
                {d.transliteration}
              </button>
            ))}
          </div>

          {/* Circular counter */}
          <div className="relative mb-6">
            <svg width="240" height="240" viewBox="0 0 240 240">
              <circle cx="120" cy="120" r="108" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle
                cx="120" cy="120" r="108" fill="none"
                stroke="hsl(136, 59%, 49%)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${progress * 678.6} 678.6`}
                transform="rotate(-90 120 120)"
                className="transition-all duration-200"
              />
            </svg>
            <motion.button
              onClick={handleCount}
              className="absolute inset-0 flex flex-col items-center justify-center"
              whileTap={{ scale: 0.95 }}
            >
              <p className="font-amiri text-gold text-2xl mb-1">{currentDhikr.label}</p>
              <p className="text-foreground text-4xl font-extrabold">{count}</p>
              <p className="text-dim text-sm">/ {currentDhikr.goal}</p>
            </motion.button>
          </div>

          <button onClick={resetCounter} className="text-dim text-xs font-semibold underline">Reset</button>
        </div>
      )}

      {/* Duas Tab */}
      {tab === "duas" && (
        <div>
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            {duaCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat ? "bg-primary/20 text-sajda border border-sajda/30" : "glass-card-light text-dim"
                }`}
              >
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

      {/* 99 Names Tab */}
      {tab === "names" && (
        <div>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search names..."
              className="w-full bg-secondary/30 text-foreground placeholder:text-dim text-sm pl-9 pr-4 py-2.5 rounded-xl border border-border/30 outline-none focus:border-sajda/30"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {filteredNames.map(name => (
              <motion.button
                key={name.id}
                onClick={() => setSelectedName(name)}
                className="glass-card-light p-3 text-center"
                whileTap={{ scale: 0.95 }}
              >
                <p className="font-amiri text-gold text-lg">{name.arabic}</p>
                <p className="text-foreground text-[10px] font-bold truncate">{name.transliteration}</p>
                <p className="text-dim text-[9px] truncate">{name.meaning}</p>
              </motion.button>
            ))}
          </div>

          {/* Name Detail Modal */}
          <AnimatePresence>
            {selectedName && (
              <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="absolute inset-0 bg-deep/80 backdrop-blur-sm" onClick={() => setSelectedName(null)} />
                <motion.div
                  className="relative glass-card p-8 mx-6 text-center max-w-sm w-full"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  transition={transition}
                >
                  <button onClick={() => setSelectedName(null)} className="absolute top-4 right-4 text-dim"><X size={20} /></button>
                  <p className="text-dim text-sm mb-2">#{selectedName.id}</p>
                  <p className="font-amiri text-gold text-5xl mb-4">{selectedName.arabic}</p>
                  <p className="text-foreground text-xl font-bold mb-1">{selectedName.transliteration}</p>
                  <p className="text-dim text-sm">{selectedName.meaning}</p>
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

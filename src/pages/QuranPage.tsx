import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, BookOpen, Loader2 } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/hooks/useTranslation";

const LANG_MAP: Record<string, string> = {
  English: "en.asad",
  Arabic: "ar.alafasy",
  Turkish: "tr.ates",
  Russian: "ru.kuliev",
  Indonesian: "id.indonesian",
  Malay: "ms.basmeih",
  French: "fr.hamidullah",
  Hindi: "hi.hindi",
  Kazakh: "en.asad",
  Uzbek: "en.asad",
  Kyrgyz: "en.asad",
};

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
}

const QuranPage = () => {
  const { language } = useAppContext();
  const { t, rtl } = useTranslation();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [arabicAyahs, setArabicAyahs] = useState<Ayah[]>([]);
  const [translationAyahs, setTranslationAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [surahsLoading, setSurahsLoading] = useState(true);

  // Fetch surah list
  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then(r => r.json())
      .then(d => { setSurahs(d.data); setSurahsLoading(false); })
      .catch(() => setSurahsLoading(false));
  }, []);

  const translationEdition = LANG_MAP[language] || "en.asad";

  const openSurah = useCallback(async (num: number) => {
    setSelectedSurah(num);
    setLoading(true);
    try {
      const [arRes, trRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${num}/ar.alafasy`).then(r => r.json()),
        fetch(`https://api.alquran.cloud/v1/surah/${num}/${translationEdition}`).then(r => r.json()),
      ]);
      setArabicAyahs(arRes.data.ayahs);
      setTranslationAyahs(trRes.data.ayahs);
    } catch {
      setArabicAyahs([]);
      setTranslationAyahs([]);
    }
    setLoading(false);
  }, [translationEdition]);

  const currentSurah = surahs.find(s => s.number === selectedSurah);
  const filteredSurahs = surahs.filter(s =>
    s.englishName.toLowerCase().includes(search.toLowerCase()) ||
    s.name.includes(search) ||
    s.number.toString() === search
  );

  const goToSurah = (delta: number) => {
    if (!selectedSurah) return;
    const next = selectedSurah + delta;
    if (next >= 1 && next <= 114) openSurah(next);
  };

  // Surah reading view
  if (selectedSurah && currentSurah) {
    return (
      <div className="min-h-screen bg-background pb-24 px-4 pt-4" dir={rtl ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setSelectedSurah(null)} className="text-dim p-2">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 text-center">
            <p className="font-amiri text-gold text-xl">{currentSurah.name}</p>
            <p className="text-foreground font-bold text-sm">{currentSurah.englishName}</p>
            <p className="text-dim text-[10px]">{currentSurah.englishNameTranslation} · {currentSurah.numberOfAyahs} Ayahs · {currentSurah.revelationType}</p>
          </div>
          <div className="w-8" />
        </div>

        {/* Bismillah */}
        {selectedSurah !== 9 && (
          <div className="text-center mb-6">
            <p className="font-amiri text-gold text-2xl">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-sajda animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {arabicAyahs.map((ayah, i) => (
              <motion.div
                key={ayah.number}
                className="glass-card p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-8 h-8 rounded-lg bg-primary/20 text-sajda flex items-center justify-center text-xs font-bold shrink-0">
                    {ayah.numberInSurah}
                  </span>
                  <p className="font-amiri text-gold text-xl leading-loose text-right flex-1" dir="rtl">
                    {ayah.text}
                  </p>
                </div>
                {translationAyahs[i] && (
                  <p className="text-foreground text-sm leading-relaxed pl-11">
                    {translationAyahs[i].text}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Surah navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => goToSurah(-1)}
            disabled={selectedSurah <= 1}
            className="glass-card px-4 py-2 text-dim text-sm font-semibold disabled:opacity-30 flex items-center gap-1"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-dim text-xs">{selectedSurah} / 114</span>
          <button
            onClick={() => goToSurah(1)}
            disabled={selectedSurah >= 114}
            className="glass-card px-4 py-2 text-dim text-sm font-semibold disabled:opacity-30 flex items-center gap-1"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Surah list view
  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6" dir={rtl ? "rtl" : "ltr"}>
      <div className="text-center mb-4">
        <h1 className="text-foreground text-xl font-extrabold">القرآن الكريم</h1>
        <p className="text-dim text-sm">The Noble Quran</p>
      </div>

      {/* Search */}
      <div className="glass-card flex items-center gap-2 px-3 py-2.5 mb-4">
        <Search size={16} className="text-dim" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search surah..."
          className="bg-transparent text-foreground text-sm flex-1 outline-none placeholder:text-dim/50"
        />
      </div>

      {surahsLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-sajda animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSurahs.map(surah => (
            <motion.button
              key={surah.number}
              onClick={() => openSurah(surah.number)}
              className="w-full glass-card p-3 flex items-center gap-3 text-left"
              whileTap={{ scale: 0.98 }}
            >
              <span className="w-9 h-9 rounded-xl bg-primary/15 text-sajda flex items-center justify-center text-xs font-bold shrink-0">
                {surah.number}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-bold text-sm">{surah.englishName}</span>
                  <span className="font-amiri text-gold text-lg">{surah.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-dim text-[10px]">{surah.englishNameTranslation}</span>
                  <span className="text-dim text-[10px]">·</span>
                  <span className="text-dim text-[10px]">{surah.numberOfAyahs} ayahs</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    surah.revelationType === "Meccan" ? "bg-accent/20 text-gold" : "bg-primary/20 text-sajda"
                  }`}>
                    {surah.revelationType}
                  </span>
                </div>
              </div>
              <ChevronRight size={14} className="text-dim shrink-0" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuranPage;

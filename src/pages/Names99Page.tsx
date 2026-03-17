import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { names99, getNameMeaning, type Name99 } from "@/data/names99";
import { Search, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import NativeHeader from "@/components/NativeHeader";

const transition = { type: "spring" as const, damping: 25, stiffness: 200 };

const languageNameToCode: Record<string, string> = {
  "English": "en", "العربية": "ar", "Türkçe": "tr", "Русский": "ru",
  "Bahasa Indonesia": "id", "Bahasa Melayu": "ms", "Қазақша": "kk",
  "Oʻzbekcha": "uz", "Кыргызча": "ky", "हिन्दी": "hi", "Français": "fr",
};

const Names99Page = () => {
  const { t, rtl, language } = useTranslation();
  const langCode = languageNameToCode[language] || "en";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedName, setSelectedName] = useState<Name99 | null>(null);

  const filteredNames = names99.filter(n =>
    !searchQuery ||
    n.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.arabic.includes(searchQuery) ||
    getNameMeaning(n, langCode).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24 px-4" dir={rtl ? "rtl" : "ltr"}>
      <NativeHeader title={t.names99} subtitle="أَسْمَاءُ ٱللَّٰهِ ٱلْحُسْنَىٰ" />

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
  );
};

export default Names99Page;

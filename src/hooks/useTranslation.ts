import { useAppContext } from "@/contexts/AppContext";
import { getTranslations, isRTL, type TranslationKey } from "@/i18n/translations";
import { useMemo } from "react";

export function useTranslation() {
  const { language } = useAppContext();
  
  const t = useMemo(() => getTranslations(language), [language]);
  const rtl = useMemo(() => isRTL(language), [language]);
  
  return { t, rtl, language };
}

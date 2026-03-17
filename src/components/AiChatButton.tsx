import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Moon, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppContext } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

const faqsByLang: Record<string, string[]> = {
  English: ["How many rakats in Maghrib?", "What breaks your Wudu?", "How to pray Salatul Witr?", "What is Sunnah of Fajr?", "When is Laylatul Qadr?"],
  "العربية": ["كم عدد ركعات المغرب؟", "ما الذي ينقض الوضوء؟", "كيف تصلي صلاة الوتر؟", "ما هي سنة الفجر؟", "متى ليلة القدر؟"],
  "Türkçe": ["Akşam namazı kaç rekat?", "Abdesti ne bozar?", "Vitr namazı nasıl kılınır?", "Fecir sünneti nedir?", "Kadir Gecesi ne zaman?"],
  "Русский": ["Сколько ракатов в Магрибе?", "Что нарушает Вуду?", "Как совершать Витр намаз?", "Что такое Сунна Фаджра?", "Когда Ляйлятуль-Кадр?"],
  "Bahasa Indonesia": ["Berapa rakaat Maghrib?", "Apa yang membatalkan Wudhu?", "Bagaimana cara sholat Witir?", "Apa Sunnah Subuh?", "Kapan Lailatul Qadr?"],
  "Bahasa Melayu": ["Berapa rakaat Maghrib?", "Apa yang membatalkan Wudhu?", "Bagaimana solat Witir?", "Apa Sunnah Subuh?", "Bila Lailatul Qadr?"],
  "Қазақша": ["Ақшам намазы неше рәкат?", "Дәретті не бұзады?", "Уітір намазын қалай оқиды?", "Таң намазының сүннеті қандай?", "Қадыр түні қашан?"],
  "Oʻzbekcha": ["Shom namozi necha rakat?", "Tahoratni nima buzadi?", "Vitr namozini qanday o'qiladi?", "Bomdod sunnati nima?", "Qadri kecha qachon?"],
  "Кыргызча": ["Ак шам намазы канча рекаат?", "Даратты эмне бузат?", "Витир намазын кантип окуйт?", "Фажр сүннөтү кандай?", "Кадыр түнү качан?"],
  "हिन्दी": ["मग़रिब में कितनी रकात हैं?", "वुज़ू क्या तोड़ता है?", "सलातुल वित्र कैसे पढ़ें?", "फज्र की सुन्नत क्या है?", "लैलतुल क़दर कब है?"],
  "Français": ["Combien de rakats à Maghrib ?", "Qu'est-ce qui annule le Wudhu ?", "Comment prier Salat al-Witr ?", "Quelle est la Sunna du Fajr ?", "Quand est Laylat al-Qadr ?"],
};

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({
  messages,
  language,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  language: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, language }),
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      onError(data.error || "AI service unavailable. Please try again.");
      return;
    }

    if (!resp.body) {
      onError("No response stream");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {}
      }
    }

    onDone();
  } catch (e) {
    onError(e instanceof Error ? e.message : "Connection failed");
  }
}

const AiChatButton = () => {
  const { t } = useTranslation();
  const { language } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const faqs = faqsByLang[language] || faqsByLang.English;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    await streamChat({
      messages: allMessages,
      language,
      onDelta: (chunk) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      },
      onDone: () => setIsLoading(false),
      onError: (err) => {
        setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${err}` }]);
        setIsLoading(false);
      },
    });
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-1.5 px-4 py-2.5 rounded-full shadow-lg"
        style={{
          background: "linear-gradient(135deg, hsl(136, 59%, 49%), hsl(160, 60%, 35%))",
          boxShadow: "0 4px 20px hsla(136, 59%, 49%, 0.4)",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.93 }}
      >
        <Moon size={16} className="text-deep -scale-x-100" fill="currentColor" strokeWidth={1.5} />
        <span className="text-deep text-xs font-extrabold tracking-wide">AI</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed inset-0 z-50 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-background/95 backdrop-blur-md" onClick={() => setIsOpen(false)} />
            <motion.div className="relative flex flex-col w-full max-w-md mx-auto h-full"
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
              
              {/* Header */}
              <div className="flex items-center justify-between p-4 pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sajda flex items-center justify-center">
                    <Moon size={14} className="text-deep -scale-x-100" fill="currentColor" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-foreground font-bold text-sm">{t.aiTitle}</h3>
                    <p className="text-dim text-[10px]">{t.aiDesc}</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-dim p-2"><X size={20} /></button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 space-y-3">
                {messages.length === 0 && (
                  <div className="mt-4">
                    <p className="text-foreground font-bold text-base mb-3">{t.faqTitle}</p>
                    <div className="space-y-2">
                      {faqs.map(faq => (
                        <button key={faq} onClick={() => handleSend(faq)}
                          className="w-full text-left glass-card-light px-4 py-3 text-foreground text-sm font-semibold">
                          {faq}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-sajda text-deep font-semibold"
                        : "glass-card text-foreground"
                    }`}>
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start">
                    <div className="glass-card px-4 py-3 rounded-2xl">
                      <Loader2 size={16} className="text-sajda animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 pb-8">
                <div className="glass-card flex items-center gap-2 px-4 py-2">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend(input)}
                    placeholder={t.askPlaceholder}
                    className="flex-1 bg-transparent text-foreground text-sm placeholder:text-dim outline-none"
                    disabled={isLoading} />
                  <button onClick={() => handleSend(input)} className="text-sajda p-1" disabled={isLoading}>
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiChatButton;

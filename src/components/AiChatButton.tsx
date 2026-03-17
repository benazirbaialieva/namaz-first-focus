import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";

const faqs = [
  "How many rakats in Maghrib?",
  "What breaks your Wudu?",
  "How to pray Salatul Witr?",
  "What is Sunnah of Fajr?",
  "When is Laylatul Qadr?",
];

const answers: Record<string, string> = {
  "How many rakats in Maghrib?": "Maghrib prayer has 3 Fard (obligatory) rakats, followed by 2 Sunnah rakats. The Fard prayer is unique as it has an odd number of rakats — 2 rakats then sitting for Tashahhud, then 1 more rakat.",
  "What breaks your Wudu?": "Wudu is broken by: 1) Using the restroom, 2) Passing gas, 3) Deep sleep while lying down, 4) Loss of consciousness, 5) Bleeding from wounds (Hanafi view), 6) Vomiting, 7) Touching private parts directly (Shafi'i view).",
  "How to pray Salatul Witr?": "Witr is prayed after Isha. You can pray 1, 3, 5, 7, or 9 rakats. The most common is 3 rakats — either prayed as 3 continuous rakats with one Tashahhud at the end, or 2 rakats + salam + 1 rakat. In the last rakat, recite Dua Qunut after Ruku.",
  "What is Sunnah of Fajr?": "The Sunnah of Fajr consists of 2 rakats prayed before the Fard prayer. The Prophet ﷺ said: 'The two rakats of Fajr are better than the world and what it contains.' (Sahih Muslim). They should be prayed lightly with short surahs.",
  "When is Laylatul Qadr?": "Laylatul Qadr (Night of Power) occurs in the last 10 nights of Ramadan, most likely on odd nights (21st, 23rd, 25th, 27th, 29th). The Prophet ﷺ said to seek it in the odd nights of the last ten. It is better than 1000 months (Quran 97:3).",
};

const AiChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");

    setTimeout(() => {
      const answer = answers[userMsg] || "MashaAllah, great question! This is a complex topic. I recommend consulting a local scholar or trusted Islamic source like IslamQA.info for a detailed answer on this matter. May Allah guide us all. 🤲";
      setMessages(prev => [...prev, { role: "ai", text: answer }]);
    }, 600);
  };

  return (
    <>
      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: "linear-gradient(135deg, hsl(136, 59%, 49%), hsl(160, 60%, 35%))",
          boxShadow: "0 4px 20px hsla(136, 59%, 49%, 0.4)",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Sparkles size={24} className="text-deep" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-background/95 backdrop-blur-md" onClick={() => setIsOpen(false)} />
            <motion.div
              className="relative flex flex-col w-full max-w-md mx-auto h-full"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sajda flex items-center justify-center">
                    <Sparkles size={16} className="text-deep" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-bold text-sm">Namaz First AI</h3>
                    <p className="text-dim text-[10px]">Ask anything about Islam</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-dim p-2">
                  <X size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 space-y-3">
                {messages.length === 0 && (
                  <div className="mt-4">
                    <p className="text-foreground font-bold text-base mb-3">Frequently Asked ☪</p>
                    <div className="space-y-2">
                      {faqs.map(faq => (
                        <button
                          key={faq}
                          onClick={() => handleSend(faq)}
                          className="w-full text-left glass-card-light px-4 py-3 text-foreground text-sm font-semibold"
                        >
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
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 pb-8">
                <div className="glass-card flex items-center gap-2 px-4 py-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend(input)}
                    placeholder="Ask about Islam..."
                    className="flex-1 bg-transparent text-foreground text-sm placeholder:text-dim outline-none"
                  />
                  <button onClick={() => handleSend(input)} className="text-sajda p-1">
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

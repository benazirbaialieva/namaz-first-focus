import { useAppContext } from "@/contexts/AppContext";
import { prayers } from "@/data/prayers";
import { useTranslation } from "@/hooks/useTranslation";

const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

const StatsPage = () => {
  const { streak, prayerState } = useAppContext();
  const { t, rtl } = useTranslation();

  const completedToday = Object.values(prayerState.completed).filter(Boolean).length;
  const monthPct = streak.monthTotal > 0 ? Math.round((streak.monthPrayers / streak.monthTotal) * 100) : 0;

  const today = new Date();
  const calendarDays = weekDays.map((d, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    const key = date.toISOString().split("T")[0];
    return { day: d, date: date.getDate(), count: streak.days[key] || 0, isToday: i === 6 };
  });

  return (
    <div className="min-h-screen bg-deep pb-24 px-4 pt-6" dir={rtl ? "rtl" : "ltr"}>
      <div className="text-center mb-6">
        <h1 className="text-foreground text-xl font-extrabold">{t.statistics}</h1>
        <p className="font-amiri text-gold text-lg">إِحْصَائِيَّات</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: t.currentStreak, value: `${streak.current}`, icon: "🔥" },
          { label: t.bestStreak, value: `${streak.best}`, icon: "⭐" },
          { label: t.thisMonth, value: `${monthPct}%`, icon: "📊" },
          { label: t.totalPrayers, value: `${streak.totalPrayers}`, icon: "🤲" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-foreground text-2xl font-extrabold">{s.value}</div>
            <div className="text-dim text-xs font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 mb-4">
        <h3 className="text-foreground font-bold text-sm mb-4">{t.last7Days}</h3>
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-dim text-[10px] font-semibold">{d.day}</span>
              <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center ${
                d.count >= 5 ? "bg-sajda text-deep" : d.count > 0 ? "bg-primary/20 text-sajda" : "bg-secondary/30 text-dim"
              } ${d.isToday ? "ring-2 ring-sajda/40" : ""}`}>
                <span className="text-xs font-extrabold">{d.count}</span>
                <span className="text-[7px]">/5</span>
              </div>
              <span className="text-dim text-[9px]">{d.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-foreground font-bold text-sm mb-3">{t.todaysPrayers}</h3>
        <div className="space-y-2">
          {prayers.map(p => {
            const done = prayerState.completed[p.id];
            return (
              <div key={p.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${done ? "bg-sajda" : "border border-dim/30"}`}>
                    {done && <span className="text-deep text-[10px] font-bold">✓</span>}
                  </div>
                  <span className="text-foreground text-sm font-semibold">{p.name}</span>
                </div>
                <span className="text-dim text-sm">{p.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;

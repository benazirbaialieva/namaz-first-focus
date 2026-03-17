import { NavLink, useLocation } from "react-router-dom";
import { Home, Compass, BookOpen, BarChart3, Settings } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const BottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const tabs = [
    { to: "/", icon: Home, label: t.home },
    { to: "/qibla", icon: Compass, label: t.qibla },
    { to: "/dhikr", icon: BookOpen, label: t.dhikr },
    { to: "/stats", icon: BarChart3, label: t.stats },
    { to: "/settings", icon: Settings, label: t.settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-none border-t border-x-0 border-b-0" style={{ borderRadius: "20px 20px 0 0" }}>
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink key={to} to={to} className="flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all duration-200">
              <Icon size={22} className={isActive ? "text-sajda" : "text-dim"} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[10px] font-semibold ${isActive ? "text-sajda" : "text-dim"}`}>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

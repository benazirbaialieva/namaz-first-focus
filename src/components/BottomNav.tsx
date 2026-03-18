import { NavLink, useLocation } from "react-router-dom";
import { Home, Timer, CalendarDays, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { to: "/", icon: Home, label: "Today" },
  { to: "/focus", icon: Timer, label: "Focus" },
  { to: "/log", icon: CalendarDays, label: "Log" },
  { to: "/me", icon: User, label: "Me" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "hsl(42 20% 97%)",
        borderTop: "1px solid hsl(192 73% 21% / 0.08)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around py-1.5">
        {tabs.map(({ to, icon: Icon, label }) => {
          const isActive =
            to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

          return (
            <NavLink key={to} to={to} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.92 }}
                className="flex flex-col items-center justify-center gap-0.5"
                style={{ minHeight: 44, minWidth: 44 }}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.5}
                  style={{ color: isActive ? "#0F4F5C" : "#B4B2A9" }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: isActive ? "#0F4F5C" : "#B4B2A9",
                    lineHeight: 1,
                  }}
                >
                  {label}
                </span>
                {isActive && (
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#0F4F5C",
                      marginTop: 2,
                    }}
                  />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

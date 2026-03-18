import { ReactNode } from "react";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NativeHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
  showSettings?: boolean;
}

const NativeHeader = ({ title, subtitle, rightAction, showSettings }: NativeHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="px-4"
      style={{ paddingTop: "env(safe-area-inset-top, 44px)" }}
    >
      <div className="flex items-center justify-between mb-1">
        <h1
          style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2, color: "hsl(192 73% 21%)" }}
        >
          {title}
        </h1>
        {showSettings && (
          <button
            onClick={() => navigate("/me")}
            className="p-2"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            <Settings size={20} strokeWidth={1.5} />
          </button>
        )}
        {rightAction}
      </div>
      {subtitle && (
        <p className="font-amiri text-accent text-lg mb-2">{subtitle}</p>
      )}
    </div>
  );
};

export default NativeHeader;

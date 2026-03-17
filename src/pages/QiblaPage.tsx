import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const MAKKAH_LAT = 21.4225;
const MAKKAH_LNG = 39.8262;

function calculateQibla(lat: number, lng: number): number {
  const phiK = (MAKKAH_LAT * Math.PI) / 180;
  const lambdaK = (MAKKAH_LNG * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const lambda = (lng * Math.PI) / 180;
  const qibla = (180 / Math.PI) * Math.atan2(
    Math.sin(lambdaK - lambda),
    Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda)
  );
  return (qibla + 360) % 360;
}

const QiblaPage = () => {
  const { t, rtl } = useTranslation();
  const [heading, setHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [permissionNeeded, setPermissionNeeded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => { setQiblaAngle(calculateQibla(pos.coords.latitude, pos.coords.longitude)); },
      () => setError(t.locationNeeded)
    );
  }, []);

  const requestPermission = async () => {
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        const perm = await (DeviceOrientationEvent as any).requestPermission();
        if (perm === "granted") setPermissionNeeded(false);
      } else {
        setPermissionNeeded(false);
      }
      window.addEventListener("deviceorientationabsolute", handleOrientation as any);
      window.addEventListener("deviceorientation", handleOrientation as any);
    } catch {
      setError(t.compassDenied);
    }
  };

  const handleOrientation = (e: DeviceOrientationEvent) => {
    const alpha = (e as any).webkitCompassHeading || e.alpha || 0;
    setHeading(alpha);
    setPermissionNeeded(false);
  };

  const needleRotation = qiblaAngle - heading;
  const isAligned = Math.abs(((needleRotation % 360) + 360) % 360) < 4 || Math.abs(((needleRotation % 360) + 360) % 360 - 360) < 4;

  return (
    <div className="min-h-screen bg-deep pb-24 px-4 pt-6 relative overflow-hidden" dir={rtl ? "rtl" : "ltr"}>
      {/* Islamic geometric background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23D4A843' stroke-width='0.5'%3E%3Cpath d='M40 0L80 40L40 80L0 40Z'/%3E%3Cpath d='M40 10L70 40L40 70L10 40Z'/%3E%3Cpath d='M40 20L60 40L40 60L20 40Z'/%3E%3Ccircle cx='40' cy='40' r='15'/%3E%3Ccircle cx='40' cy='40' r='8'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: "80px 80px",
      }} />

      {/* Subtle radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, hsla(42, 63%, 55%, 0.15), transparent 70%)" }} />

      <div className="relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-foreground text-xl font-extrabold">{t.qiblaDirection}</h1>
          <p className="font-amiri text-gold text-lg">ٱلْقِبْلَة</p>
        </div>

        <div className="flex flex-col items-center">
          {/* Compass */}
          <div className={`relative w-72 h-72 rounded-full flex items-center justify-center transition-all duration-500 ${isAligned ? "ring-4 ring-sajda/30" : ""}`}
            style={{
              background: "radial-gradient(circle at center, hsla(154, 46%, 10%, 0.9), hsla(154, 46%, 6%, 0.95))",
              boxShadow: isAligned
                ? "0 0 60px hsla(136, 59%, 49%, 0.3), inset 0 0 40px hsla(136, 59%, 49%, 0.05)"
                : "0 0 40px hsla(0, 0%, 0%, 0.3), inset 0 0 30px hsla(42, 63%, 55%, 0.03)",
              border: "1px solid hsla(42, 63%, 55%, 0.15)",
            }}>

            {/* Decorative rings */}
            <div className="absolute inset-2 rounded-full border border-gold/10" />
            <div className="absolute inset-6 rounded-full border border-foreground/5" />
            <div className="absolute inset-10 rounded-full border border-gold/5" />

            {/* Tick marks */}
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${i * 10}deg)` }}>
                <div className={`absolute left-1/2 -translate-x-1/2 ${i % 9 === 0 ? "top-2 h-3 w-0.5 bg-gold/40" : "top-3 h-1.5 w-px bg-foreground/10"}`} />
              </div>
            ))}

            {/* Cardinal directions */}
            <span className="absolute top-6 text-gold font-bold text-xs">N</span>
            <span className="absolute bottom-6 text-dim text-xs">S</span>
            <span className="absolute left-6 text-dim text-xs">W</span>
            <span className="absolute right-6 text-dim text-xs">E</span>

            {/* Needle */}
            <motion.div className="absolute w-full h-full"
              animate={{ rotate: needleRotation }}
              transition={{ type: "spring", damping: 30, stiffness: 100 }}>
              <div className="absolute left-1/2 top-8 -translate-x-1/2 w-0.5 h-[42%] rounded-full"
                style={{ background: "linear-gradient(to bottom, hsl(42, 63%, 55%), hsla(42, 63%, 55%, 0.1))" }} />
              {/* Kaaba icon at the tip */}
              <div className="absolute left-1/2 top-4 -translate-x-1/2 flex flex-col items-center">
                <span className="text-lg" style={{ filter: "drop-shadow(0 0 6px hsla(42, 63%, 55%, 0.5))" }}>🕋</span>
              </div>
            </motion.div>

            {/* Center dot */}
            <div className="w-4 h-4 rounded-full z-10" style={{
              background: "radial-gradient(circle, hsl(42, 63%, 55%), hsl(42, 63%, 40%))",
              boxShadow: "0 0 10px hsla(42, 63%, 55%, 0.4)",
            }} />
          </div>

          {/* Degree reading */}
          <div className="mt-6 text-center">
            <p className="text-foreground text-3xl font-extrabold">{Math.round(qiblaAngle)}°</p>
            <p className="text-dim text-sm">{t.fromNorth}</p>
          </div>

          {/* Makkah indicator */}
          <div className="mt-4 flex items-center gap-2 glass-card px-4 py-2">
            <span className="text-lg">🕋</span>
            <span className="text-dim text-xs font-semibold">{t.makkah}</span>
          </div>

          {isAligned && (
            <motion.div className="mt-4 px-6 py-2 rounded-full bg-primary/20 border border-sajda/30"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <span className="text-sajda font-bold text-sm">{t.alignedQibla}</span>
            </motion.div>
          )}

          {permissionNeeded && (
            <button onClick={requestPermission} className="mt-8 px-8 py-3 rounded-2xl font-bold text-deep text-sm"
              style={{ background: "linear-gradient(135deg, hsl(136, 59%, 49%), hsl(136, 59%, 39%))" }}>
              <Compass size={16} className="inline mr-2" />{t.enableCompass}
            </button>
          )}

          {error && <p className="mt-4 text-destructive text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default QiblaPage;

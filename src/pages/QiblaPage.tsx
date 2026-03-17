import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

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
  const [heading, setHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [permissionNeeded, setPermissionNeeded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const q = calculateQibla(pos.coords.latitude, pos.coords.longitude);
        setQiblaAngle(q);
      },
      () => setError("Location access needed for Qibla direction")
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
      setError("Compass permission denied");
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
    <div className="min-h-screen bg-deep pb-24 px-4 pt-6">
      <div className="text-center mb-8">
        <h1 className="text-foreground text-xl font-extrabold">Qibla Direction</h1>
        <p className="font-amiri text-gold text-lg">ٱلْقِبْلَة</p>
      </div>

      <div className="flex flex-col items-center">
        {/* Compass */}
        <div className={`relative w-72 h-72 rounded-full glass-card flex items-center justify-center transition-all duration-500 ${isAligned ? "ring-4 ring-sajda/30" : ""}`}
          style={isAligned ? { boxShadow: "0 0 60px hsla(136, 59%, 49%, 0.3)" } : {}}>
          
          {/* Cardinal directions */}
          <div className="absolute inset-4 rounded-full border border-foreground/10" />
          <span className="absolute top-4 text-foreground font-bold text-xs">N</span>
          <span className="absolute bottom-4 text-dim text-xs">S</span>
          <span className="absolute left-4 text-dim text-xs">W</span>
          <span className="absolute right-4 text-dim text-xs">E</span>

          {/* Needle */}
          <motion.div
            className="absolute w-full h-full"
            animate={{ rotate: needleRotation }}
            transition={{ type: "spring", damping: 30, stiffness: 100 }}
          >
            <div className="absolute left-1/2 top-6 -translate-x-1/2 w-0.5 h-[45%] rounded-full" style={{ background: "linear-gradient(to bottom, hsl(42, 63%, 55%), transparent)" }} />
            <div className="absolute left-1/2 top-4 -translate-x-1/2">
              <div className="w-3 h-3 rotate-45 bg-gold" />
            </div>
          </motion.div>

          {/* Center dot */}
          <div className="w-3 h-3 rounded-full bg-gold z-10" />
        </div>

        {/* Degree reading */}
        <div className="mt-6 text-center">
          <p className="text-foreground text-3xl font-extrabold">{Math.round(qiblaAngle)}°</p>
          <p className="text-dim text-sm">from North</p>
        </div>

        {isAligned && (
          <motion.div
            className="mt-4 px-6 py-2 rounded-full bg-primary/20 border border-sajda/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="text-sajda font-bold text-sm">✓ Aligned with Qibla</span>
          </motion.div>
        )}

        {permissionNeeded && (
          <button
            onClick={requestPermission}
            className="mt-8 px-8 py-3 rounded-2xl font-bold text-deep text-sm"
            style={{ background: "linear-gradient(135deg, hsl(136, 59%, 49%), hsl(136, 59%, 39%))" }}
          >
            <Compass size={16} className="inline mr-2" />
            Enable Compass
          </button>
        )}

        {error && <p className="mt-4 text-destructive text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default QiblaPage;

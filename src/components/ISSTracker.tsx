"use client";
import { useEffect, useState } from "react";
import * as satellite from "satellite.js";
import { Satellite, Navigation, Clock, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TLE_URL = "https://celestrak.org/GPPD/gp.php?CATNR=25544&FORMAT=TLE";

// Fun facts array
const ISS_FACTS = [
  "The ISS travels at a speed of five miles per second.",
  "It completes an orbit around Earth every 90 minutes.",
  "The station has been continuously occupied since Nov 2000.",
  "Six spaceships can be connected to the ISS at once.",
  "The ISS weighs about 420,000 kilograms (925,000 lbs).",
];

export default function ISSTracker({ userLat = 17.385, userLng = 78.4867 }: { userLat?: number; userLng?: number }) {
  const [tleData, setTleData] = useState<{ line1: string; line2: string } | null>(null);
  const [telemetry, setTelemetry] = useState<{ lat: string; lng: string; alt: string; speed: string } | null>(null);
  const [nextPass, setNextPass] = useState<string | null>(null);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((i) => (i + 1) % ISS_FACTS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch(TLE_URL)
      .then((res) => res.text())
      .then((text) => {
        const lines = text.trim().split("\n");
        if (lines.length >= 3) {
          setTleData({ line1: lines[1], line2: lines[2] });
        } else if (lines.length >= 2) {
          setTleData({ line1: lines[0], line2: lines[1] });
        }
      })
      .catch((err) => console.error("Failed to fetch TLE for ISS Tracker", err));
  }, []);

  useEffect(() => {
    if (!tleData) return;
    const satrec = satellite.twoline2satrec(tleData.line1, tleData.line2);

    const updateTelemetry = () => {
      const date = new Date();
      const pv = satellite.propagate(satrec, date);
      if (typeof pv.position === "object" && typeof pv.velocity === "object") {
        const gmst = satellite.gstime(date);
        const gd = satellite.eciToGeodetic(pv.position as satellite.EciVec3<number>, gmst);
        
        const vx = (pv.velocity as satellite.EciVec3<number>).x;
        const vy = (pv.velocity as satellite.EciVec3<number>).y;
        const vz = (pv.velocity as satellite.EciVec3<number>).z;
        const vel = Math.sqrt(vx * vx + vy * vy + vz * vz) * 3600; // km/h

        setTelemetry({
          lat: satellite.degreesLat(gd.latitude).toFixed(4),
          lng: satellite.degreesLong(gd.longitude).toFixed(4),
          alt: gd.height.toFixed(1),
          speed: vel.toLocaleString(undefined, { maximumFractionDigits: 0 })
        });
      }
    };

    updateTelemetry();
    const iv = setInterval(updateTelemetry, 1000);

    // Simplified pass prediction
    let foundPass: Date | null = null;
    const observerGd = {
      latitude: satellite.degreesToRadians(userLat),
      longitude: satellite.degreesToRadians(userLng),
      height: 0.3 // roughly 300m elevation
    };
    
    // Check next 24 hours, minute by minute
    for (let i = 0; i < 24 * 60; i++) {
      const t = new Date(Date.now() + i * 60000);
      const p = satellite.propagate(satrec, t);
      if (typeof p.position === "object") {
        const gmst = satellite.gstime(t);
        const positionEcf = satellite.eciToEcf(p.position as satellite.EciVec3<number>, gmst);
        const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);
        const elevDeg = satellite.radiansToDegrees(lookAngles.elevation);
        if (elevDeg > 15) { // Threshold for good visibility
          foundPass = t;
          break;
        }
      }
    }
    
    if (foundPass) {
      setNextPass(foundPass.toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" }));
    } else {
      setNextPass("No visible pass in 24h");
    }

    return () => clearInterval(iv);
  }, [tleData, userLat, userLng]);

  return (
    <div className="bg-[#0f111a]/80 flex flex-col h-full relative group">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Satellite className="w-5 h-5 text-blue-400" />
            ISS Live Telemetry
          </h3>
          <p className="text-sm text-slate-400 mt-1">Real-time calculations from orbital data</p>
        </div>
        <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-green-400 uppercase tracking-wider hidden sm:inline">Tracking</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-grow">
        {/* Lat/Lng Block */}
        <div className="bg-black/30 rounded-2xl p-4 border border-white/[0.03] flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-400 mb-3">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">Coordinates</span>
          </div>
          {telemetry ? (
            <div className="space-y-1.5">
              <p className="text-white font-mono text-sm sm:text-base">{telemetry.lat}° <span className="text-slate-500 text-xs">N</span></p>
              <p className="text-white font-mono text-sm sm:text-base">{telemetry.lng}° <span className="text-slate-500 text-xs">E</span></p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-5 w-24 rounded skeleton bg-white/5" />
              <div className="h-5 w-24 rounded skeleton bg-white/5" />
            </div>
          )}
        </div>

        {/* Speed / Alt Block */}
        <div className="bg-black/30 rounded-2xl p-4 border border-white/[0.03] flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-400 mb-3">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">Orbital Stats</span>
          </div>
          {telemetry ? (
            <div className="space-y-1.5">
              <p className="text-white font-mono text-sm sm:text-base">{telemetry.speed} <span className="text-xs text-slate-500 font-sans tracking-tight">km/h</span></p>
              <p className="text-white font-mono text-sm sm:text-base">{telemetry.alt} <span className="text-xs text-slate-500 font-sans tracking-tight">km</span></p>
            </div>
          ) : (
             <div className="space-y-2">
               <div className="h-5 w-24 rounded skeleton bg-white/5" />
               <div className="h-5 w-24 rounded skeleton bg-white/5" />
             </div>
          )}
        </div>
      </div>

      {/* Next Pass & Facts Row */}
      <div className="mt-5 pt-5 border-t border-white/5 flex flex-col gap-4">
        {nextPass ? (
          <div className="flex flex-wrap items-center justify-between text-sm gap-2">
            <span className="flex items-center gap-2 text-slate-400 font-medium">
              <Clock className="w-4 h-4" /> Next Visible Pass
            </span>
            <span className="text-blue-300 font-semibold bg-blue-500/10 px-3 py-1 rounded-full">{nextPass}</span>
          </div>
        ) : (
           <div className="h-6 w-full rounded skeleton bg-white/5" />
        )}
        
        {/* Animated Fun Fact */}
        <div className="bg-blue-500/5 rounded-xl text-xs w-full overflow-hidden relative min-h-[44px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-blue-100/80 absolute inset-0 px-4 py-3 flex items-center leading-snug"
            >
              <span><span className="text-blue-400 font-bold mr-1.5">Fact:</span>{ISS_FACTS[factIndex]}</span>
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import * as satellite from "satellite.js";
import { Satellite, Navigation, Clock, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TLE_URL = "/api/tle";

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
  const [telemetry, setTelemetry] = useState<{ lat: string; lng: string; alt: string; speed: string; source: string } | null>(null);
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
      .then((res) => res.json())
      .then((data) => {
        if (data.line1 && data.line2) {
          setTleData({ line1: data.line1, line2: data.line2 });
        } else {
          console.error("Invalid TLE format received");
        }
      })
      .catch((err) => console.error("Failed to fetch TLE for ISS Tracker", err));
  }, []);

  useEffect(() => {
    const fetchTelemetry = () => {
      fetch("/api/iss-position")
        .then(res => res.json())
        .then(data => {
          if (data && data.lat !== undefined && data.lng !== undefined) {
             setTelemetry({
               lat: parseFloat(data.lat).toFixed(4),
               lng: parseFloat(data.lng).toFixed(4),
               alt: parseFloat(data.altitude).toFixed(1),
               speed: parseFloat(data.velocity).toLocaleString(undefined, { maximumFractionDigits: 0 }),
               source: data.source || "unknown"
             });
          }
        })
        .catch(err => console.error("Failed to fetch position", err));
    };

    fetchTelemetry();
    const iv = setInterval(fetchTelemetry, 10000); // exactly every 10s
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!tleData) return;
    const satrec = satellite.twoline2satrec(tleData.line1, tleData.line2);

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
        // Only calculate look angle if coordinates are valid numbers
        if (!isNaN(positionEcf.x)) {
          const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);
          const elevDeg = satellite.radiansToDegrees(lookAngles.elevation);
          if (elevDeg > 15) { // Threshold for good visibility
            foundPass = t;
            break;
          }
        }
      }
    }
    
    if (foundPass) {
      setNextPass(foundPass.toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" }));
    } else {
      setNextPass("No visible pass in 24h");
    }
  }, [tleData, userLat, userLng]);

  return (
    <div className="glass-card flex flex-col h-full relative group overflow-hidden border-blue-500/10 hover:border-blue-500/30 transition-all duration-500">
      {/* Internal dashboard scanline */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,#fff_1px,#fff_2px)] bg-[length:100%_4px]" />
      </div>

      {/* Hero Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-600/20 transition-all duration-700" />
      
      <div className="flex justify-between items-start mb-6 p-6 pb-0 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
              <Satellite className="w-5 h-5 text-blue-400" />
            </div>
            Live Orbital Feed
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-[0.2em] font-bold">Real-time Satellite Telemetry</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="px-3 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded-full flex items-center gap-2 group/status">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
             <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Linked</span>
          </div>
          {telemetry && telemetry.source && (
            <div className="text-[8px] font-mono text-slate-500 uppercase">
               SRC: {telemetry.source}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-grow px-6 relative z-10">
        {/* Lat/Lng Block */}
        <div className="bg-[#050508]/60 backdrop-blur-md rounded-2xl p-4 border border-white/[0.04] flex flex-col justify-center relative overflow-hidden group/card shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover/card:opacity-40 transition-opacity">
            <Navigation className="w-3 h-3 text-emerald-400 rotate-45" />
          </div>
          <div className="flex items-center gap-2 text-slate-400 mb-3">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Coordinates</span>
          </div>
          {telemetry ? (
            <div className="space-y-1">
              <motion.p key={telemetry.lat} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="text-white font-mono text-base tracking-tight">{telemetry.lat}° <span className="text-slate-500 text-[10px] font-sans">N</span></motion.p>
              <motion.p key={telemetry.lng} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="text-white font-mono text-base tracking-tight">{telemetry.lng}° <span className="text-slate-500 text-[10px] font-sans">E</span></motion.p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-5 w-24 rounded skeleton bg-white/5" />
              <div className="h-5 w-24 rounded skeleton bg-white/5" />
            </div>
          )}
        </div>

        {/* Speed / Alt Block */}
        <div className="bg-[#050508]/60 backdrop-blur-md rounded-2xl p-4 border border-white/[0.04] flex flex-col justify-center relative overflow-hidden group/card shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover/card:opacity-40 transition-opacity">
            <Activity className="w-3 h-3 text-amber-400" />
          </div>
          <div className="flex items-center gap-2 text-slate-400 mb-3">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Orbital Data</span>
          </div>
          {telemetry ? (
            <div className="space-y-1">
              <motion.p key={telemetry.speed} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="text-white font-mono text-base tracking-tight">{telemetry.speed} <span className="text-[10px] text-slate-500 font-sans tracking-tight">KM/H</span></motion.p>
              <motion.p key={telemetry.alt} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="text-white font-mono text-base tracking-tight">{telemetry.alt} <span className="text-[10px] text-slate-500 font-sans tracking-tight">KM</span></motion.p>
            </div>
          ) : (
             <div className="space-y-2">
               <div className="h-5 w-24 rounded skeleton bg-white/5" />
               <div className="h-5 w-24 rounded skeleton bg-white/5" />
             </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-6 pt-5 border-t border-white/5 flex flex-col gap-5 relative z-10">
        {nextPass ? (
          <div className="flex flex-wrap items-center justify-between text-xs gap-3">
            <span className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Next Visibility
            </span>
            <span className="text-blue-300 font-mono font-bold bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/10">{nextPass}</span>
          </div>
        ) : (
           <div className="h-6 w-full rounded skeleton bg-white/5" />
        )}
        
        {/* Animated Fun Fact */}
        <div className="bg-blue-600/5 rounded-2xl text-[11px] w-full overflow-hidden relative min-h-[48px] border border-blue-500/10">
          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="text-slate-300 absolute inset-0 px-4 py-3 flex items-center leading-[1.6]"
            >
              <span><span className="text-blue-400 font-bold mr-2 uppercase tracking-tighter">Information:</span>{ISS_FACTS[factIndex]}</span>
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

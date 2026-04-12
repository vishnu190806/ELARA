"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Crosshair, Activity, Info } from "lucide-react";

// Curated bright stars with RA/Dec, magnitude, and metadata
export type Star = { name: string; ra: number; dec: number; mag: number; color: string; desc?: string; const?: string; };
const STARS: Star[] = [
  { name: "Sirius", ra: 6.75, dec: -16.72, mag: -1.46, color: "#b3d4ff", desc: "The brightest star in the night sky, also known as the Dog Star.", const: "Canis Major" },
  { name: "Canopus", ra: 6.40, dec: -52.70, mag: -0.72, color: "#ffffd0", desc: "A supergiant star and the second-brightest in the sky.", const: "Carina" },
  { name: "Arcturus", ra: 14.26, dec: 19.18, mag: -0.05, color: "#ffaa44", desc: "A red giant star and the brightest in the northern celestial hemisphere.", const: "Boötes" },
  { name: "Vega", ra: 18.62, dec: 38.78, mag: 0.03, color: "#cce0ff", desc: "A bluish-white star and part of the Summer Triangle.", const: "Lyra" },
  { name: "Capella", ra: 5.28, dec: 46.00, mag: 0.08, color: "#ffee88", desc: "A quadruple star system consisting of two binary pairs.", const: "Auriga" },
  { name: "Rigel", ra: 5.24, dec: -8.20, mag: 0.12, color: "#b3d4ff", desc: "A blue supergiant, and the brightest star in Orion.", const: "Orion" },
  { name: "Procyon", ra: 7.66, dec: 5.22, mag: 0.38, color: "#ffe8cc", desc: "A binary star system and the brightest star in its constellation.", const: "Canis Minor" },
  { name: "Betelgeuse", ra: 5.92, dec: 7.41, mag: 0.42, color: "#ff7744", desc: "A red supergiant nearing the end of its life.", const: "Orion" },
  { name: "Altair", ra: 19.85, dec: 8.87, mag: 0.76, color: "#ffffff", desc: "An A-type main sequence star rotating very rapidly.", const: "Aquila" },
  { name: "Aldebaran", ra: 4.60, dec: 16.51, mag: 0.87, color: "#ff6633", desc: "A red giant known as the 'Eye of the Bull'.", const: "Taurus" },
  { name: "Antares", ra: 16.49, dec: -26.43, mag: 1.06, color: "#ff4422", desc: "A slow irregular variable red supergiant.", const: "Scorpius" },
  { name: "Spica", ra: 13.42, dec: -11.16, mag: 1.04, color: "#cce8ff", desc: "A spectroscopic binary and rotating ellipsoidal variable.", const: "Virgo" },
  { name: "Pollux", ra: 7.75, dec: 28.03, mag: 1.15, color: "#ffbb77", desc: "An orange-hued giant star.", const: "Gemini" },
  { name: "Fomalhaut", ra: 22.96, dec: -29.62, mag: 1.16, color: "#ddeeff", desc: "An A-type main-sequence star surrounded by a debris disk.", const: "Piscis Austrinus" },
  { name: "Deneb", ra: 20.69, dec: 45.28, mag: 1.25, color: "#e8f4ff", desc: "At least 54,000 times more luminous than the Sun.", const: "Cygnus" },
  { name: "Regulus", ra: 10.14, dec: 11.97, mag: 1.36, color: "#cce0ff", desc: "A multiple star system composed of four stars.", const: "Leo" },
  { name: "Adhara", ra: 6.98, dec: -28.97, mag: 1.50, color: "#b8d0ff", desc: "A bright extreme ultraviolet source.", const: "Canis Major" },
  { name: "Castor", ra: 7.58, dec: 31.88, mag: 1.58, color: "#ffffff", desc: "A sextuple star system.", const: "Gemini" },
  { name: "Algol", ra: 3.14, dec: 40.96, mag: 2.12, color: "#eef4ff", desc: "The Demon Star, an eclipsing binary.", const: "Perseus" },
  { name: "Mizar", ra: 13.40, dec: 54.93, mag: 2.04, color: "#ddeeff", desc: "Forms a famous naked-eye double with Alcor.", const: "Ursa Major" },
  // Supportive outline stars
  { name: "Alnitak", ra: 5.68, dec: -1.94, mag: 1.77, color: "#cce8ff" },
  { name: "Alnilam", ra: 5.61, dec: -1.20, mag: 1.70, color: "#cce8ff" },
  { name: "Mintaka", ra: 5.53, dec: -0.30, mag: 2.23, color: "#ddeeff" },
  { name: "Bellatrix", ra: 5.42, dec: 6.35, mag: 1.64, color: "#9bbcff" },
  { name: "Saiph", ra: 5.80, dec: -9.67, mag: 2.06, color: "#aac8ff" },
];

const CONSTELLATION_LINES: [string, string][] = [
  ["Betelgeuse", "Alnitak"], ["Betelgeuse", "Bellatrix"], ["Rigel", "Saiph"],
  ["Rigel", "Alnitak"], ["Alnitak", "Alnilam"], ["Alnilam", "Mintaka"],
  ["Vega", "Altair"], ["Vega", "Deneb"], ["Deneb", "Altair"],
];

function raDecToXY(ra: number, dec: number, lst: number, lat: number, width: number, height: number) {
  const ha = ((lst - ra) % 24 + 24) % 24;
  const haRad = (ha / 24) * 2 * Math.PI;
  const decRad = (dec * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;

  const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
  const alt = Math.asin(Math.min(1, Math.max(-1, sinAlt)));

  const cosAlt = Math.cos(alt);
  const azBase = Math.abs(cosAlt) < 1e-12 
    ? 0 
    : Math.acos(Math.min(1, Math.max(-1, (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * cosAlt))));
  let az = azBase;
  if (Math.sin(haRad) > 0) az = 2 * Math.PI - az;

  if (alt < 0) return null; 

  const r = Math.cos(alt) / (1 + Math.sin(alt));
  const scale = Math.min(width, height) * 0.46;
  const x = width / 2 + scale * r * Math.sin(az);
  const y = height / 2 - scale * r * Math.cos(az);
  return { x, y, alt };
}

function getLST(date: Date, lng: number): number {
  const J2000 = 2451545.0;
  const JD = date.getTime() / 86400000 + 2440587.5;
  const T = (JD - J2000) / 36525;
  const GMST = 6.697375 + 2400.0513369 * T + 0.0000258622 * T * T;
  return (GMST + lng / 15 + 24) % 24;
}

interface SkyMapProps { lat?: number; lng?: number; }

export default function SkyMap({ lat = 17.385, lng = 78.487 }: SkyMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Interactions
  const positionsRef = useRef<Array<{ x: number; y: number; alt: number; star: Star }>>([]);
  const [hoveredStar, setHoveredStar] = useState<Star | null>(null);
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [timeOffsetHours, setTimeOffsetHours] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    const startTime = Date.now();

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;

      const elapsed = (Date.now() - startTime) / 1000;
      const now = new Date(Date.now() + elapsed * 60000 + timeOffsetHours * 3600000);
      const lst = getLST(now, lng);

      ctx.clearRect(0, 0, W, H);

      // Gradient Background
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) / 2);
      bg.addColorStop(0, "#080812");
      bg.addColorStop(0.6, "#04040a");
      bg.addColorStop(1, "#020205");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // GRID & HUD LINES
      ctx.strokeStyle = "rgba(59, 130, 246, 0.05)";
      ctx.lineWidth = 1;
      // Circular Grids
      for(let r=0.1; r<=0.5; r+=0.1) {
         ctx.beginPath();
         ctx.arc(W/2, H/2, Math.min(W,H)*r, 0, Math.PI*2);
         ctx.stroke();
      }
      // Radial Grids
      for(let a=0; a<360; a+=30) {
         const aRad = (a * Math.PI) / 180;
         ctx.beginPath();
         ctx.moveTo(W/2, H/2);
         ctx.lineTo(W/2 + Math.min(W,H)*0.47 * Math.cos(aRad), H/2 + Math.min(W,H)*0.47 * Math.sin(aRad));
         ctx.stroke();
      }

      // MAIN HORIZON
      ctx.strokeStyle = "rgba(59, 130, 246, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.47, 0, Math.PI * 2);
      ctx.stroke();

      // Compass labels (Tactical)
      const compassRadius = Math.min(W, H) * 0.49;
      const labels = [{ label: "NORTH [000]", a: 270 }, { label: "EAST [090]", a: 0 }, { label: "SOUTH [180]", a: 90 }, { label: "WEST [270]", a: 180 }];
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(59, 130, 246, 0.5)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      labels.forEach(({ label, a }) => {
        const aRad = (a * Math.PI) / 180;
        ctx.fillText(label, W / 2 + compassRadius * Math.sin(aRad), H / 2 - compassRadius * Math.cos(aRad));
      });

      // Compute star positions
      const positions: Array<{ x: number; y: number; alt: number; star: (typeof STARS)[0] }> = [];
      STARS.forEach((star) => {
        const pos = raDecToXY(star.ra, star.dec, lst, lat, W, H);
        if (pos) positions.push({ ...pos, star });
      });
      positionsRef.current = positions;

      // Draw Constellation lines (Animated Glow)
      CONSTELLATION_LINES.forEach(([n1, n2]) => {
        const p1 = positions.find(p => p.star.name === n1);
        const p2 = positions.find(p => p.star.name === n2);
        if (!p1 || !p2) return;
        ctx.strokeStyle = "rgba(59, 130, 246, 0.15)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw Stars (Premium rendering)
      const t = Date.now() / 1000;
      positions.forEach(({ x, y, alt, star }, idx) => {
        const magScale = Math.max(0.6, 4 - star.mag);
        const r = magScale * 1.1;
        const twinkle = 0.8 + 0.2 * Math.sin(t * (3 + idx * 0.5) + idx);
        const opacity = Math.min(1, (alt / (Math.PI / 4)) * twinkle);

        const isHovered = hoveredStar?.name === star.name;
        const isSelected = selectedStar?.name === star.name;

        // Visual Glow
        if (star.mag < 1.0 || isHovered || isSelected) {
          const glowSize = isSelected || isHovered ? r * 12 : r * 6;
          const grd = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
          grd.addColorStop(0, `${star.color}${isSelected ? '55' : '33'}`);
          grd.addColorStop(1, "transparent");
          ctx.fillStyle = grd;
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.arc(x, y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star Core
        ctx.globalAlpha = opacity;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? r * 1.5 : r, 0, Math.PI * 2);
        ctx.fill();

        // Crosshair for selected
        if (isSelected) {
            ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - 15, y); ctx.lineTo(x + 15, y);
            ctx.moveTo(x, y - 15); ctx.lineTo(x, y + 15);
            ctx.stroke();
            ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI*2); ctx.stroke();
        }

        // Labels
        if (star.mag < 0.8 || isHovered || isSelected) {
          ctx.globalAlpha = isHovered || isSelected ? 1 : opacity * 0.7;
          ctx.fillStyle = isSelected ? "#fff" : "rgba(180, 210, 255, 0.9)";
          ctx.font = isSelected ? "bold 10px 'JetBrains Mono', monospace" : "bold 8px 'Inter', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(star.name.toUpperCase(), x, y + r + 6);
        }
      });

      ctx.globalAlpha = 1;
      animFrame = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(() => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    resizeObserver.observe(canvas);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      resizeObserver.disconnect();
    };
  }, [lat, lng, hoveredStar, selectedStar, timeOffsetHours]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let minDist = 25;
    let closest: Star | null = null;
    for (const pos of positionsRef.current) {
      const d = Math.max(Math.abs(pos.x - x), Math.abs(pos.y - y));
      if (d < minDist) {
        minDist = d;
        closest = pos.star;
      }
    }
    
    if (closest) {
      setHoveredStar(closest);
      canvas.style.cursor = "crosshair";
    } else {
      setHoveredStar(null);
      canvas.style.cursor = "default";
    }
  };

  const handleClick = () => {
    if (hoveredStar) setSelectedStar(hoveredStar);
    else setSelectedStar(null);
  };

  return (
    <div className="bg-[#05050a] rounded-[2.5rem] border border-white/[0.05] p-2 flex flex-col h-full relative group overflow-hidden shadow-2xl">
      
      {/* HUD Frame */}
      <div className="absolute inset-4 border border-blue-500/10 rounded-[2rem] pointer-events-none" />
      <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
         <span className="text-[9px] font-black text-blue-500/60 uppercase tracking-[0.4em]">Celestial Array: Online</span>
      </div>

      <div className="flex justify-between items-start px-8 pt-8 pb-4 relative z-10">
        <div>
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-500" />
            Stellar Scope
          </h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
             Optical Reference Frame: <span className="text-blue-400">Zenith</span>
          </p>
        </div>
        <div className="flex gap-2">
           <div className="px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-mono text-slate-400">UTC: {new Date().toISOString().slice(11,19)}</span>
           </div>
        </div>
      </div>

      <div className="relative flex-grow min-h-[400px] w-full border-y border-white/[0.03] overflow-hidden bg-[#020205]">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block" 
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredStar(null)}
          onClick={handleClick}
        />
        
        {/* Interactive Overlay Elements */}
        {/* Time Controller */}
        <div className="absolute bottom-10 left-10 right-10 flex flex-col items-center gap-3">
            <div className="w-full max-w-sm flex items-center gap-4 bg-black/60 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/10 shadow-3xl">
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">-12H</span>
               <input 
                 type="range" min="-12" max="12" step="0.1" value={timeOffsetHours}
                 onChange={(e) => setTimeOffsetHours(parseFloat(e.target.value))}
                 className="flex-grow h-1.5 bg-white/10 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(59,130,246,0.5)] cursor-pointer"
               />
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">+12H</span>
            </div>
            {timeOffsetHours !== 0 && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  TEMPORAL SHIFT: {timeOffsetHours > 0 ? '+' : ''}{timeOffsetHours.toFixed(1)}H
               </motion.div>
            )}
        </div>

        {/* Selected Star Details Card */}
        <AnimatePresence>
          {selectedStar && (
            <motion.div
              initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 50, opacity: 0 }}
              className="absolute top-8 right-8 w-72 bg-[#0a0a0f]/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-4xl z-30"
            >
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                       <Crosshair className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selected Unit</h4>
                        <div className="text-xl font-black text-white italic uppercase tracking-tighter">{selectedStar.name}</div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedStar(null)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-slate-500 hover:text-white">
                    <X className="w-4 h-4" />
                 </button>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(56,189,248,1)]" />
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">{selectedStar.const || "Void"}</span>
                 </div>
                 <p className="text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-blue-500/20 pl-4">
                    &quot;{selectedStar.desc}&quot;
                 </p>
                 <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                       <span className="text-[8px] text-slate-500 uppercase block mb-1">Magnitude</span>
                       <span className="text-xs font-bold text-white mono tracking-widest">{selectedStar.mag}</span>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                       <span className="text-[8px] text-slate-500 uppercase block mb-1">RA Vector</span>
                       <span className="text-xs font-bold text-white mono tracking-widest">{selectedStar.ra.toFixed(2)}H</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-8 flex items-center justify-between bg-white/[0.01]">
         <div className="flex gap-6">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full border border-blue-500/40" />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Reference Grid</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-4 h-[1px] bg-blue-500/30" />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Link Vectors</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-slate-600" />
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Press Star to Lock-In</span>
         </div>
      </div>
    </div>
  );
}

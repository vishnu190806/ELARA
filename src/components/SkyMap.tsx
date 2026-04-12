"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X, MapPin } from "lucide-react";

// Curated bright stars with RA/Dec, magnitude, and metadata
const STARS = [
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
  const positionsRef = useRef<Array<{ x: number; y: number; alt: number; star: (typeof STARS)[0] }>>([]);
  const [hoveredStar, setHoveredStar] = useState<(typeof STARS)[0] | null>(null);
  const [selectedStar, setSelectedStar] = useState<(typeof STARS)[0] | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    const startTime = Date.now();
    const starIndex = Object.fromEntries(STARS.map((s, i) => [s.name, i]));

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;

      const elapsed = (Date.now() - startTime) / 1000;
      const now = new Date(Date.now() + elapsed * 60000); // 1s real = 1m simulation
      const lst = getLST(now, lng);

      ctx.clearRect(0, 0, W, H);

      // Deep space background
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) / 2);
      bg.addColorStop(0, "#0c0c1a");
      bg.addColorStop(0.5, "#080812");
      bg.addColorStop(1, "#020208");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Zenith and Horizon
      ctx.strokeStyle = "rgba(100,120,180,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.47, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "rgba(150,160,255,0.2)";
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 2, 0, Math.PI * 2);
      ctx.fill();

      // Compass labels
      const compassRadius = Math.min(W, H) * 0.49;
      const labels = [{ label: "N", a: 270 }, { label: "E", a: 0 }, { label: "S", a: 90 }, { label: "W", a: 180 }];
      ctx.font = "12px monospace";
      ctx.fillStyle = "rgba(140,160,220,0.6)";
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

      // Draw Constellation lines
      CONSTELLATION_LINES.forEach(([n1, n2]) => {
        const p1 = positions.find(p => p.star.name === n1);
        const p2 = positions.find(p => p.star.name === n2);
        if (!p1 || !p2) return;
        ctx.strokeStyle = "rgba(100,140,255,0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Draw Stars
      const t = Date.now() / 1000;
      positions.forEach(({ x, y, alt, star }, idx) => {
        const magScale = Math.max(0.5, 3.5 - star.mag);
        const r = magScale * 0.9;
        const twinkle = 0.7 + 0.3 * Math.sin(t * (2 + idx * 0.3) + idx);
        const opacity = Math.min(1, (alt / (Math.PI / 4)) * twinkle);

        // Highlight if hovered/selected
        const isHovered = hoveredStar?.name === star.name;
        const isSelected = selectedStar?.name === star.name;

        if (star.mag < 1.5 || isHovered || isSelected) {
          const glowSize = isSelected || isHovered ? r * 8 : r * 4;
          const grd = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
          grd.addColorStop(0, `${star.color}${isSelected ? '88' : '44'}`);
          grd.addColorStop(1, "transparent");
          ctx.fillStyle = grd;
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.arc(x, y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = opacity;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? r * 1.5 : r, 0, Math.PI * 2);
        ctx.fill();

        if (star.mag < 1.0 || isHovered || isSelected) {
          ctx.globalAlpha = isHovered || isSelected ? 1 : opacity * 0.6;
          ctx.fillStyle = isSelected ? "#fff" : "rgba(180,200,255,0.8)";
          ctx.font = isSelected ? "bold 11px sans-serif" : "9px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(star.name, x, y + r + 4);
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
  }, [lat, lng, hoveredStar, selectedStar]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    let minDist = 20;
    let closest = null;
    positionsRef.current.forEach(({ x: px, y: py, star }) => {
      const d = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
      if (d < minDist) {
        minDist = d;
        closest = star;
      }
    });
    
    // Only hover stars with a description
    if (closest && (closest as any).desc) {
      setHoveredStar(closest);
      canvas.style.cursor = "pointer";
    } else {
      setHoveredStar(null);
      canvas.style.cursor = "crosshair";
    }
  };

  const handleClick = () => {
    if (hoveredStar) setSelectedStar(hoveredStar);
    else setSelectedStar(null);
  };

  return (
    <div className="bg-[#0f111a]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col h-full relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-400" />
            Live Celestial Sphere
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Star projections optimized for your location
          </p>
        </div>
        <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider hidden sm:inline">Real-time</span>
        </div>
      </div>

      <div className="relative flex-grow min-h-[300px] w-full border border-white/5 rounded-2xl overflow-hidden bg-black/40 cursor-crosshair">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block" 
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredStar(null)}
          onClick={handleClick}
        />
        
        {/* Dynamic Canvas Hover Tooltip */}
        {hoveredStar && !selectedStar && (
          <div 
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-[120%] bg-white/10 backdrop-blur-md px-2 py-1 rounded text-xs text-white border border-white/20 whitespace-nowrap shadow-xl z-20"
            style={{ left: mousePos.x, top: mousePos.y }}
          >
            {hoveredStar.name} <span className="opacity-50 ml-1">Mag {hoveredStar.mag}</span>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 pointer-events-none bg-black/40 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400/50 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
            <span className="text-slate-300 text-[10px] uppercase font-semibold tracking-wider">Zenith</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-px bg-indigo-400/30" />
            <span className="text-slate-300 text-[10px] uppercase font-semibold tracking-wider">Constellations</span>
          </div>
        </div>

        {/* Selected Star Info Panel */}
        <AnimatePresence>
          {selectedStar && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="absolute top-3 right-3 w-48 sm:w-64 bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl z-30"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedStar(null); }}
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white transition-colors rounded-lg bg-white/5 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-3 mb-3 pr-6">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white/20"
                  style={{ background: `radial-gradient(circle, ${selectedStar.color}20 0%, transparent 100%)` }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedStar.color, boxShadow: `0 0 15px ${selectedStar.color}` }} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg leading-none">{selectedStar.name}</h4>
                  {"const" in selectedStar && (
                    <p className="text-xs text-indigo-300 mt-1 uppercase tracking-wider font-semibold">{(selectedStar as any).const}</p>
                  )}
                </div>
              </div>

              {("desc" in selectedStar) && (
                <p className="text-xs text-slate-300 leading-relaxed mb-4 pb-4 border-b border-white/10">
                  {(selectedStar as any).desc}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-500 block mb-0.5 font-medium uppercase text-[10px]">Apparent Mag</span>
                  <span className="text-white font-mono">{selectedStar.mag}</span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-500 block mb-0.5 font-medium uppercase text-[10px]">RA</span>
                  <span className="text-white font-mono">{selectedStar.ra.toFixed(2)}h</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

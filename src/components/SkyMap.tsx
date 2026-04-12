"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Curated bright stars with RA/Dec and magnitude for Indian night sky
const STARS = [
  // Name, RA (hours), Dec (degrees), magnitude, const
  { name: "Sirius", ra: 6.75, dec: -16.72, mag: -1.46, color: "#b3d4ff" },
  { name: "Canopus", ra: 6.40, dec: -52.70, mag: -0.72, color: "#ffffd0" },
  { name: "Arcturus", ra: 14.26, dec: 19.18, mag: -0.05, color: "#ffaa44" },
  { name: "Vega", ra: 18.62, dec: 38.78, mag: 0.03, color: "#cce0ff" },
  { name: "Capella", ra: 5.28, dec: 46.00, mag: 0.08, color: "#ffee88" },
  { name: "Rigel", ra: 5.24, dec: -8.20, mag: 0.12, color: "#b3d4ff" },
  { name: "Procyon", ra: 7.66, dec: 5.22, mag: 0.38, color: "#ffe8cc" },
  { name: "Betelgeuse", ra: 5.92, dec: 7.41, mag: 0.42, color: "#ff7744" },
  { name: "Altair", ra: 19.85, dec: 8.87, mag: 0.76, color: "#ffffff" },
  { name: "Aldebaran", ra: 4.60, dec: 16.51, mag: 0.87, color: "#ff6633" },
  { name: "Antares", ra: 16.49, dec: -26.43, mag: 1.06, color: "#ff4422" },
  { name: "Spica", ra: 13.42, dec: -11.16, mag: 1.04, color: "#cce8ff" },
  { name: "Pollux", ra: 7.75, dec: 28.03, mag: 1.15, color: "#ffbb77" },
  { name: "Fomalhaut", ra: 22.96, dec: -29.62, mag: 1.16, color: "#ddeeff" },
  { name: "Deneb", ra: 20.69, dec: 45.28, mag: 1.25, color: "#e8f4ff" },
  { name: "Regulus", ra: 10.14, dec: 11.97, mag: 1.36, color: "#cce0ff" },
  { name: "Adhara", ra: 6.98, dec: -28.97, mag: 1.50, color: "#b8d0ff" },
  { name: "Castor", ra: 7.58, dec: 31.88, mag: 1.58, color: "#ffffff" },
  { name: "Algol", ra: 3.14, dec: 40.96, mag: 2.12, color: "#eef4ff" },
  { name: "Mizar", ra: 13.40, dec: 54.93, mag: 2.04, color: "#ddeeff" },
  // Extra faint ones for density
  { name: "Alnitak", ra: 5.68, dec: -1.94, mag: 1.77, color: "#cce8ff" },
  { name: "Alnilam", ra: 5.61, dec: -1.20, mag: 1.70, color: "#cce8ff" },
  { name: "Mintaka", ra: 5.53, dec: -0.30, mag: 2.23, color: "#ddeeff" },
  { name: "Bellatrix", ra: 5.42, dec: 6.35, mag: 1.64, color: "#9bbcff" },
  { name: "Saiph", ra: 5.80, dec: -9.67, mag: 2.06, color: "#aac8ff" },
  { name: "Castor B", ra: 7.58, dec: 31.89, mag: 1.93, color: "#eef7ff" },
  { name: "Mimosa", ra: 12.80, dec: -59.69, mag: 1.25, color: "#aad4ff" },
  { name: "Acrux", ra: 12.44, dec: -63.10, mag: 0.77, color: "#b3d4ff" },
  { name: "Hadar", ra: 14.06, dec: -60.37, mag: 0.61, color: "#c0d8ff" },
  { name: "Alnair", ra: 22.14, dec: -46.96, mag: 1.74, color: "#cce0ff" },
];

// Constellation lines [star1Name, star2Name]
const CONSTELLATION_LINES: [string, string][] = [
  // Orion
  ["Betelgeuse", "Alnitak"],
  ["Betelgeuse", "Bellatrix"],
  ["Rigel", "Saiph"],
  ["Rigel", "Alnitak"],
  ["Alnitak", "Alnilam"],
  ["Alnilam", "Mintaka"],
  // Summer triangle
  ["Vega", "Altair"],
  ["Vega", "Deneb"],
  ["Deneb", "Altair"],
];

function raDecToXY(ra: number, dec: number, lst: number, lat: number, width: number, height: number) {
  // Hour angle
  const ha = ((lst - ra) % 24 + 24) % 24;
  const haRad = (ha / 24) * 2 * Math.PI;
  const decRad = (dec * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;

  // Altitude & azimuth
  const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
  const alt = Math.asin(Math.min(1, Math.max(-1, sinAlt)));

  const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * Math.cos(alt));
  let az = Math.acos(Math.min(1, Math.max(-1, cosAz)));
  if (Math.sin(haRad) > 0) az = 2 * Math.PI - az;

  if (alt < 0) return null; // below horizon

  // Stereographic projection centered on zenith
  const r = Math.cos(alt) / (1 + Math.sin(alt));
  const scale = Math.min(width, height) * 0.46;
  const x = width / 2 + scale * r * Math.sin(az);
  const y = height / 2 - scale * r * Math.cos(az);
  return { x, y, alt };
}

function getLST(date: Date, lng: number): number {
  // Approximate Local Sidereal Time in hours
  const J2000 = 2451545.0;
  const JD = date.getTime() / 86400000 + 2440587.5;
  const T = (JD - J2000) / 36525;
  const GMST = 6.697375 + 2400.0513369 * T + 0.0000258622 * T * T;
  const LST = (GMST + lng / 15 + 24) % 24;
  return LST;
}

interface SkyMapProps {
  lat?: number;
  lng?: number;
}

export default function SkyMap({ lat = 17.385, lng = 78.487 }: SkyMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    const startTime = Date.now();

    // Build name -> index map for constellation lines
    const starIndex = Object.fromEntries(STARS.map((s, i) => [s.name, i]));

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;

      // Simulate time passing (1 minute per second for demo effect)
      const elapsed = (Date.now() - startTime) / 1000;
      const now = new Date(Date.now() + elapsed * 60000);
      const lst = getLST(now, lng);

      // Clear
      ctx.clearRect(0, 0, W, H);

      // Background
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) / 2);
      bg.addColorStop(0, "#0c0c1a");
      bg.addColorStop(0.7, "#06060f");
      bg.addColorStop(1, "#020208");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, Math.min(W, H) / 2, 0, Math.PI * 2);
      ctx.fill();

      // Horizon circle
      ctx.strokeStyle = "rgba(100,120,180,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.47, 0, Math.PI * 2);
      ctx.stroke();

      // Zenith dot
      ctx.fillStyle = "rgba(150,160,255,0.3)";
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Compass labels
      const compassRadius = Math.min(W, H) * 0.49;
      const labels = [{ label: "N", a: 270 }, { label: "E", a: 0 }, { label: "S", a: 90 }, { label: "W", a: 180 }];
      ctx.font = "11px monospace";
      ctx.fillStyle = "rgba(140,160,220,0.6)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      labels.forEach(({ label, a }) => {
        const aRad = (a * Math.PI) / 180;
        const x = W / 2 + compassRadius * Math.sin(aRad);
        const y = H / 2 - compassRadius * Math.cos(aRad);
        ctx.fillText(label, x, y);
      });

      // Compute all star positions
      const positions: Array<{ x: number; y: number; alt: number; star: (typeof STARS)[0] } | null> = STARS.map((star) => {
        const pos = raDecToXY(star.ra, star.dec, lst, lat, W, H);
        if (!pos) return null;
        return { ...pos, star };
      });

      // Constellation lines
      CONSTELLATION_LINES.forEach(([n1, n2]) => {
        const i1 = starIndex[n1];
        const i2 = starIndex[n2];
        const p1 = positions[i1];
        const p2 = positions[i2];
        if (!p1 || !p2) return;
        ctx.strokeStyle = "rgba(100,140,255,0.2)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Draw stars
      const t = Date.now() / 1000;
      positions.forEach((pos, idx) => {
        if (!pos) return;
        const { x, y, alt, star } = pos;
        const magScale = Math.max(0.5, 3.5 - star.mag);
        const r = magScale * 0.9;

        // Twinkle
        const twinkle = 0.7 + 0.3 * Math.sin(t * (2 + idx * 0.3) + idx);
        const opacity = Math.min(1, (alt / (Math.PI / 4)) * twinkle);

        // Glow
        if (star.mag < 1.5) {
          const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
          grd.addColorStop(0, `${star.color}44`);
          grd.addColorStop(1, "transparent");
          ctx.fillStyle = grd;
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.arc(x, y, r * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star dot
        ctx.globalAlpha = opacity;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // Label for bright stars
        if (star.mag < 1.0) {
          ctx.globalAlpha = opacity * 0.7;
          ctx.fillStyle = "rgba(180,200,255,0.8)";
          ctx.font = "9px sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "bottom";
          ctx.fillText(star.name, x + r + 2, y - 2);
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
  }, [lat, lng]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Live Sky Map</h2>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Real-time star positions
        </div>
      </div>
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.06]" style={{ aspectRatio: "1.5 / 1" }}>
        <canvas ref={canvasRef} className="w-full h-full block" />
        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400/40" />
            <span className="text-slate-500 text-xs">Zenith</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-px bg-blue-400/30" />
            <span className="text-slate-500 text-xs">Constellations</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

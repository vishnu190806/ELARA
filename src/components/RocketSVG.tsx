"use client";

import { motion } from "framer-motion";


// Falcon 9 — sleek white rocket
function Falcon9SVG() {
  return (
    <svg viewBox="0 0 48 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="f9body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d4d8e0" />
          <stop offset="100%" stopColor="#f0f2f5" />
        </linearGradient>
        <linearGradient id="f9flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6b00" />
          <stop offset="100%" stopColor="#ffcc00" />
        </linearGradient>
      </defs>
      {/* Body */}
      <rect x="16" y="18" width="16" height="44" rx="4" fill="url(#f9body)" />
      {/* Nose */}
      <path d="M16 18 Q24 2 32 18" fill="#f0f2f5" />
      {/* Black stripe */}
      <rect x="16" y="40" width="16" height="5" fill="#1a1a2e" />
      {/* Fins */}
      <path d="M16 54 L8 68 L16 62" fill="#c0c4cc" />
      <path d="M32 54 L40 68 L32 62" fill="#c0c4cc" />
      {/* Engine */}
      <ellipse cx="24" cy="62" rx="5" ry="3" fill="#555" />
      {/* Flame */}
      <ellipse cx="24" cy="67" rx="3" ry="7" fill="url(#f9flame)" opacity="0.85" />
      {/* SpaceX text area */}
      <rect x="19" y="30" width="10" height="3" rx="1" fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}

// PSLV — orange/red Indian rocket
function PSLVSVG() {
  return (
    <svg viewBox="0 0 48 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="pslvbody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c84b00" />
          <stop offset="100%" stopColor="#ff6b2b" />
        </linearGradient>
        <linearGradient id="pslvflame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff4400" />
          <stop offset="100%" stopColor="#ffaa00" />
        </linearGradient>
      </defs>
      {/* Core body */}
      <rect x="17" y="16" width="14" height="46" rx="3" fill="url(#pslvbody)" />
      {/* Nose */}
      <path d="M17 16 Q24 0 31 16" fill="#ff7744" />
      {/* Strap-on boosters */}
      <rect x="10" y="28" width="7" height="22" rx="2" fill="#c84b00" />
      <rect x="31" y="28" width="7" height="22" rx="2" fill="#c84b00" />
      {/* Booster nozzles */}
      <ellipse cx="13.5" cy="50" rx="3" ry="2" fill="#555" />
      <ellipse cx="34.5" cy="50" rx="3" ry="2" fill="#555" />
      {/* White bands */}
      <rect x="17" y="36" width="14" height="3" fill="rgba(255,255,255,0.3)" />
      <rect x="17" y="48" width="14" height="2" fill="rgba(255,255,255,0.2)" />
      {/* Main engine */}
      <ellipse cx="24" cy="62" rx="5" ry="3" fill="#444" />
      {/* Flame */}
      <ellipse cx="24" cy="67" rx="4" ry="8" fill="url(#pslvflame)" opacity="0.9" />
    </svg>
  );
}

// LVM3/GSLV — stocky heavier rocket
function LVM3SVG() {
  return (
    <svg viewBox="0 0 56 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="lvm3body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a3a6a" />
          <stop offset="100%" stopColor="#2a5a9a" />
        </linearGradient>
        <linearGradient id="lvm3fl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff4400" />
          <stop offset="100%" stopColor="#ffcc00" />
        </linearGradient>
      </defs>
      {/* Wide core */}
      <rect x="15" y="16" width="26" height="46" rx="4" fill="url(#lvm3body)" />
      {/* Payload fairing (white) */}
      <rect x="17" y="20" width="22" height="18" rx="3" fill="#e8ecf0" />
      {/* Nose cap */}
      <path d="M17 20 Q28 4 39 20" fill="#d4d8df" />
      {/* Liquid strap-ons */}
      <rect x="4" y="30" width="11" height="24" rx="3" fill="#1a3a6a" />
      <rect x="41" y="30" width="11" height="24" rx="3" fill="#1a3a6a" />
      {/* Booster flames */}
      <ellipse cx="9.5" cy="56" rx="4" ry="2.5" fill="#333" />
      <ellipse cx="46.5" cy="56" rx="4" ry="2.5" fill="#333" />
      <ellipse cx="9.5" cy="61" rx="2.5" ry="6" fill="url(#lvm3fl)" opacity="0.85" />
      <ellipse cx="46.5" cy="61" rx="2.5" ry="6" fill="url(#lvm3fl)" opacity="0.85" />
      {/* Core nozzles */}
      <ellipse cx="22" cy="62" rx="4" ry="2.5" fill="#333" />
      <ellipse cx="34" cy="62" rx="4" ry="2.5" fill="#333" />
      <ellipse cx="22" cy="68" rx="3" ry="7" fill="url(#lvm3fl)" opacity="0.8" />
      <ellipse cx="34" cy="68" rx="3" ry="7" fill="url(#lvm3fl)" opacity="0.8" />
      {/* ISRO orange stripe */}
      <rect x="15" y="44" width="26" height="4" fill="#ff6600" opacity="0.6" />
    </svg>
  );
}

// Soyuz — classic Soviet green/grey rocket
function SoyuzSVG() {
  return (
    <svg viewBox="0 0 56 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="szbody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a4a3a" />
          <stop offset="100%" stopColor="#5a6a5a" />
        </linearGradient>
        <linearGradient id="szfl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff3300" />
          <stop offset="100%" stopColor="#ffaa00" />
        </linearGradient>
      </defs>
      {/* Main body */}
      <rect x="18" y="14" width="20" height="48" rx="3" fill="url(#szbody)" />
      {/* Escape tower */}
      <rect x="26" y="2" width="4" height="14" rx="1" fill="#888" />
      <rect x="24" y="2" width="8" height="3" rx="1" fill="#aaa" />
      {/* Payload section */}
      <rect x="20" y="18" width="16" height="12" rx="2" fill="#4a7a4a" />
      {/* 4 strap-on boosters */}
      <rect x="6" y="28" width="12" height="20" rx="3" fill="#4a5a4a" />
      <rect x="38" y="28" width="12" height="20" rx="3" fill="#4a5a4a" />
      {/* Booster fins + engines */}
      <path d="M6 44 L2 52 L10 48" fill="#3a4a3a" />
      <path d="M50 44 L54 52 L46 48" fill="#3a4a3a" />
      <ellipse cx="12" cy="50" rx="4" ry="2.5" fill="#333" />
      <ellipse cx="44" cy="50" rx="4" ry="2.5" fill="#333" />
      <ellipse cx="12" cy="56" rx="3" ry="6" fill="url(#szfl)" opacity="0.85" />
      <ellipse cx="44" cy="56" rx="3" ry="6" fill="url(#szfl)" opacity="0.85" />
      {/* Core engine */}
      <ellipse cx="28" cy="62" rx="6" ry="3" fill="#333" />
      <ellipse cx="28" cy="68" rx="4" ry="8" fill="url(#szfl)" opacity="0.9" />
      {/* Ladder stripe */}
      <rect x="18" y="36" width="20" height="2" fill="rgba(255,255,255,0.15)" />
    </svg>
  );
}

// Generic — default rocket
function GenericRocketSVG() {
  return (
    <svg viewBox="0 0 40 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="genbody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#334466" />
          <stop offset="100%" stopColor="#4466aa" />
        </linearGradient>
        <linearGradient id="genfl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff5500" />
          <stop offset="100%" stopColor="#ffdd00" />
        </linearGradient>
      </defs>
      <rect x="13" y="20" width="14" height="42" rx="3" fill="url(#genbody)" />
      <path d="M13 20 Q20 4 27 20" fill="#5577cc" />
      <path d="M13 50 L6 64 L13 58" fill="#223355" />
      <path d="M27 50 L34 64 L27 58" fill="#223355" />
      <ellipse cx="20" cy="62" rx="4" ry="2.5" fill="#222" />
      <ellipse cx="20" cy="68" rx="3" ry="7" fill="url(#genfl)" opacity="0.85" />
      <rect x="16" y="32" width="8" height="2" fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}

function getRocketFamily(name: string): string {
  const n = name.toUpperCase();
  if (n.includes("FALCON") || n.includes("F9") || n.includes("STARSHIP") || n.includes("SPACEX")) return "falcon9";
  if (n.includes("PSLV")) return "pslv";
  if (n.includes("LVM") || n.includes("GSLV") || n.includes("MARK III") || n.includes("MK III")) return "lvm3";
  if (n.includes("SOYUZ")) return "soyuz";
  return "generic";
}

interface RocketSVGProps {
  rocketName?: string;
  className?: string;
}

export default function RocketSVG({ rocketName = "", className = "" }: RocketSVGProps) {
  const family = getRocketFamily(rocketName);

  const rocketMap: Record<string, React.ReactNode> = {
    falcon9: <Falcon9SVG />,
    pslv: <PSLVSVG />,
    lvm3: <LVM3SVG />,
    soyuz: <SoyuzSVG />,
    generic: <GenericRocketSVG />,
  };

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className={`flex items-center justify-center ${className}`}
      aria-label={rocketName || "Rocket"}
    >
      {rocketMap[family] || <GenericRocketSVG />}
    </motion.div>
  );
}

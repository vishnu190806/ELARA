"use client";

import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useMemo } from "react";

interface SkyScoreRingProps {
  score: number;
  size?: number;
}

function getScoreLabel(score: number): { label: string; color: string; gradient: string } {
  if (score >= 8) return { label: "Excellent Condition", color: "#3b82f6", gradient: "from-blue-400 to-cyan-400" };
  if (score >= 6) return { label: "Good Condition", color: "#8b5cf6", gradient: "from-purple-400 to-blue-400" };
  if (score >= 4) return { label: "Fair Condition", color: "#f59e0b", gradient: "from-amber-400 to-orange-400" };
  return { label: "Poor Condition", color: "#ef4444", gradient: "from-red-400 to-rose-400" };
}

export default function SkyScoreRing({ score, size = 220 }: SkyScoreRingProps) {
  const { label, color } = getScoreLabel(score);

  const strokeWidth = 8;
  const radius = (size - 40) / 2;
  const circumference = 2 * Math.PI * radius;

  // Score goes 1-10, fill the ring proportionally
  const fillFraction = (score - 1) / 9;
  const strokeDashoffset = circumference * (1 - fillFraction);

  const motionVal = useMotionValue(circumference);

  useEffect(() => {
    const controls = animate(motionVal, strokeDashoffset, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [strokeDashoffset, motionVal]);

  const center = size / 2;

  // Generate tick marks
  const ticks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 * Math.PI) / 180;
      const x1 = center + (radius + 15) * Math.cos(angle);
      const y1 = center + (radius + 15) * Math.sin(angle);
      const x2 = center + (radius + 20) * Math.cos(angle);
      const y2 = center + (radius + 20) * Math.sin(angle);
      arr.push({ x1, y1, x2, y2, i });
    }
    return arr;
  }, [center, radius]);

  return (
    <div className="relative flex items-center justify-center p-4" style={{ width: size, height: size }}>
      {/* Outer Rotating Scanning Ring */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border border-dashed border-blue-500/10 rounded-full"
      />

      {/* Decorative Glow Background */}
      <div
        className="absolute inset-10 rounded-full opacity-40 blur-3xl"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`
        }}
      />

      <svg width={size} height={size} className="absolute z-0 overflow-visible">
        <defs>
          <linearGradient id={`score-gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#fff" />
          </linearGradient>
          <filter id="score-bloom">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Tactical Ticks */}
        {ticks.map(({ x1, y1, x2, y2, i }) => (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={i % 5 === 0 ? `rgba(59, 130, 246, 0.4)` : `rgba(59, 130, 246, 0.1)`}
            strokeWidth={i % 5 === 0 ? 2 : 1}
          />
        ))}

        {/* Ambient Track */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth}
        />

        {/* Progress Ring (Outer Glow) */}
        <motion.circle
          cx={center} cy={center} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth + 2}
          strokeLinecap="round" strokeDasharray={circumference}
          style={{ strokeDashoffset: motionVal }}
          transform={`rotate(-90 ${center} ${center})`}
          opacity={0.2}
          filter="url(#score-bloom)"
        />

        {/* Progress Ring (Main) */}
        <motion.circle
          cx={center} cy={center} r={radius}
          fill="none" stroke={`url(#score-gradient-${score})`}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: motionVal }}
          transform={`rotate(-90 ${center} ${center})`}
        />

        {/* Small Data Point at end of ring */}
        <motion.circle
          cx={center}
          cy={center - radius}
          r={4}
          fill="#fff"
          style={{
             transformOrigin: `${center}px ${center}px`,
             rotate: useMemo(() => {
                // Approximate rotation based on score
                return (fillFraction * 360);
             }, [fillFraction])
          }}
          filter="drop-shadow(0 0 5px #fff)"
        />
      </svg>

      {/* Center Digital Display */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-baseline gap-1 mb-[-8px]">
           <motion.span
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8, delay: 0.3 }}
             className="text-7xl font-black text-white italic tracking-tighter"
             style={{ 
                fontFamily: "'JetBrains Mono', monospace", 
                textShadow: `0 0 30px ${color}44` 
             }}
           >
             {score.toFixed(0)}
           </motion.span>
           <span className="text-xl font-black text-slate-500 italic">.{(score % 1).toFixed(1).slice(2)}</span>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex flex-col items-center mt-4 ml-6"
        >
           <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1.5">Atmospheric Index</div>
           <div 
             className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 backdrop-blur-md whitespace-nowrap"
             style={{ 
                backgroundColor: `${color}11`, 
                color: color,
                boxShadow: `inset 0 0 10px ${color}11`
             }}
           >
             {label}
           </div>
        </motion.div>
      </div>

      {/* Mini Radar Points */}
      <div className="absolute inset-2 pointer-events-none">
         <div className="absolute top-1/2 left-0 w-full h-px bg-white/[0.02]" />
         <div className="absolute top-0 left-1/2 w-px h-full bg-white/[0.02]" />
      </div>
    </div>
  );
}

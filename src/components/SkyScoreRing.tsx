import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect } from "react";

interface SkyScoreRingProps {
  score: number;
  size?: number;
}

function getScoreLabel(score: number): { label: string; color: string; gradient: string } {
  if (score >= 8) return { label: "Excellent", color: "#3b82f6", gradient: "from-blue-400 to-cyan-400" };
  if (score >= 6) return { label: "Good", color: "#8b5cf6", gradient: "from-purple-400 to-blue-400" };
  if (score >= 4) return { label: "Fair", color: "#f59e0b", gradient: "from-amber-400 to-orange-400" };
  return { label: "Poor", color: "#ef4444", gradient: "from-red-400 to-rose-400" };
}

export default function SkyScoreRing({ score, size = 220 }: SkyScoreRingProps) {
  const { label, color, gradient } = getScoreLabel(score);

  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Score goes 1-10, fill the ring proportionally
  const fillFraction = (score - 1) / 9;
  const strokeDashoffset = circumference * (1 - fillFraction);

  const motionVal = useMotionValue(circumference);

  useEffect(() => {
    const controls = animate(motionVal, strokeDashoffset, {
      duration: 1.6,
      ease: [0.34, 1.56, 0.64, 1],
    });
    return controls.stop;
  }, [strokeDashoffset, motionVal]);

  const center = size / 2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
          animation: "glow-pulse 3s ease-in-out infinite",
        }}
      />

      <svg width={size} height={size} className="absolute">
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <filter id="ring-blur">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />

        {/* Glow ring (blurred) */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: motionVal }}
          transform={`rotate(-90 ${center} ${center})`}
          opacity={0.3}
          filter="url(#ring-blur)"
        />

        {/* Main ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: motionVal }}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className={`text-6xl font-bold bg-gradient-to-br ${gradient} bg-clip-text text-transparent leading-none`}
        >
          {score.toFixed(1)}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs font-medium text-slate-400 uppercase tracking-widest"
        >
          / 10
        </motion.span>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className={`mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r ${gradient} bg-opacity-10`}
          style={{
            background: `${color}22`,
            color: color,
            border: `1px solid ${color}44`,
          }}
        >
          {label}
        </motion.div>
      </div>
    </div>
  );
}

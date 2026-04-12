"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CountdownProps {
  targetDate: string | Date;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown({ targetDate, compact = false }: CountdownProps) {
  const target = useMemo(() => (typeof targetDate === "string" ? new Date(targetDate) : targetDate), [targetDate]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(target));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target));
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  const isPast = target.getTime() < Date.now();
  const isUrgent = !isPast && (target.getTime() - Date.now()) < 24 * 60 * 60 * 1000;
  if (isPast) {
    return <span className="text-slate-500 text-sm">Launched</span>;
  }

  if (compact) {
    const parts = [];
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
    parts.push(`${String(timeLeft.hours).padStart(2, "0")}h`);
    parts.push(`${String(timeLeft.minutes).padStart(2, "0")}m`);
    parts.push(`${String(timeLeft.seconds).padStart(2, "0")}s`);

    return (
      <span className="font-mono text-sm text-blue-400">
        {parts.join(" ")}
      </span>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className="flex" style={{ maxWidth: '100%', overflow: 'hidden', gap: 'clamp(4px, 1vw, 12px)' }}>
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center" style={{ minWidth: 0, flex: 1 }}>
          <div
            className={`w-full aspect-square max-w-[3.5rem] rounded-xl relative [perspective:1000px] overflow-hidden ${
              isUrgent
                ? "bg-amber-500/10 border border-amber-500/30"
                : "bg-white/[0.04] border border-white/[0.06]"
            }`}
            style={{ padding: 'clamp(8px, 1.5vw, 16px)' }}
          >
            {isUrgent && (
              <span className="absolute inset-0 rounded-xl animate-ping bg-amber-500/10 pointer-events-none" />
            )}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={value}
                initial={{ rotateX: 90, y: -10, opacity: 0 }}
                animate={{ rotateX: 0, y: 0, opacity: 1 }}
                exit={{ rotateX: -90, y: 10, opacity: 0 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                className={`absolute inset-0 flex items-center justify-center font-bold font-mono ${
                  isUrgent ? "text-amber-400" : "text-white"
                }`}
                style={{ fontSize: 'clamp(0.875rem, 2.5vw, 2rem)', transformOrigin: 'center center' }}
              >
                {String(value).padStart(2, "0")}
              </motion.div>
            </AnimatePresence>
            {/* Split line for flip clock effect */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-black/50 z-10 -translate-y-1/2" />
          </div>
          <span className="text-[10px] sm:text-xs text-slate-500 mt-1 uppercase tracking-wider truncate w-full text-center">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

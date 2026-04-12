"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

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
    <div className="flex gap-3">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <motion.div
            key={value}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`w-14 h-14 rounded-xl flex items-center justify-center relative ${
              isUrgent
                ? "bg-amber-500/10 border border-amber-500/30"
                : "bg-white/[0.04] border border-white/[0.06]"
            }`}
          >
            {isUrgent && (
              <span className="absolute inset-0 rounded-xl animate-ping bg-amber-500/10 pointer-events-none" />
            )}
            <span className={`text-2xl font-bold font-mono ${
              isUrgent ? "text-amber-400" : "text-white"
            }`}>
              {String(value).padStart(2, "0")}
            </span>
          </motion.div>
          <span className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

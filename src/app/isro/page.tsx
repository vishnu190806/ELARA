"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import EventCard, { EventCardSkeleton } from "@/components/EventCard";
import { RefreshCw, Rocket, MapPin, Globe } from "lucide-react";

// ISRO-specific events pulled from the events API (Space Devs includes ISRO)
const ISRO_KEYWORDS = ["ISRO", "GSLV", "PSLV", "LVM", "Chandrayaan", "India", "SDSC", "Satish Dhawan"];

const ISRO_FACTS = [
  "ISRO is the world's 6th most active space agency by launches.",
  "Chandrayaan-3 made India the 4th country to land on the Moon.",
  "ISRO operates 50+ operational satellites serving India's economy.",
  "The Mars Orbiter Mission cost just ₹450 crore — cheaper than most sci-fi films.",
  "ISRO's PSLV has a success rate of over 95% across 60+ flights.",
];

interface ISROStats {
  totalLaunches: number;
  successRate: string;
  activeSatellites: number;
}

export default function ISROPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((i) => (i + 1) % ISRO_FACTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchISROEvents() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const all: any[] = data.results || [];
      const isro = all.filter((e) => {
        const text = `${e.name || ""} ${e.launch_service_provider?.name || ""} ${e.location?.name || ""}`.toUpperCase();
        return ISRO_KEYWORDS.some((kw) => text.includes(kw.toUpperCase()));
      });
      setEvents(isro);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchISROEvents(); }, []);

  const stats: ISROStats = { totalLaunches: 96, successRate: "95.8%", activeSatellites: 54 };

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Rocket className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">ISRO Missions</h1>
              <p className="text-slate-500 text-sm mt-0.5">Indian Space Research Organisation — Upcoming Launches</p>
            </div>
          </div>

          {/* ISRO Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: Rocket, label: "PSLV/GSLV Launches", value: stats.totalLaunches.toString(), color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
              { icon: Globe, label: "Success Rate", value: stats.successRate, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
              { icon: MapPin, label: "Active Satellites", value: stats.activeSatellites.toString(), color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className={`glass-card p-5 border ${bg}`}>
                <Icon className={`w-5 h-5 ${color} mb-2`} />
                <div className={`text-2xl font-bold ${color} mb-0.5`}>{value}</div>
                <div className="text-slate-500 text-xs">{label}</div>
              </div>
            ))}
          </div>

          {/* Rotating fact */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-purple-500 to-blue-500 shrink-0" />
            <motion.p
              key={factIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-slate-400 text-sm"
            >
              {ISRO_FACTS[factIndex]}
            </motion.p>
          </div>
        </motion.div>

        {/* Upcoming ISRO Events */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Upcoming Launches</h2>
            {!loading && (
              <button
                onClick={fetchISROEvents}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-purple-400 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(3).fill(null).map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="glass-card p-8 text-center">
              <p className="text-slate-500 mb-3">Failed to load ISRO missions</p>
              <button onClick={fetchISROEvents} className="text-purple-400 text-sm hover:underline">Retry</button>
            </div>
          ) : events.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Rocket className="w-10 h-10 text-slate-700 mb-4 mx-auto" />
              <p className="text-slate-400 font-medium mb-1">No upcoming ISRO launches right now</p>
              <p className="text-slate-600 text-sm">Check back soon — ISRO missions are updated when announced.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

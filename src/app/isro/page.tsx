"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import EventCard, { EventCardSkeleton } from "@/components/EventCard";
import { RefreshCw, Rocket, MapPin, Globe, ChevronRight, Star } from "lucide-react";
import { SpaceEvent } from "@/types";

const ISRO_KEYWORDS = ["ISRO", "GSLV", "PSLV", "LVM", "Chandrayaan", "India", "SDSC", "Satish Dhawan"];

const ISRO_FACTS = [
  "ISRO is the world's 6th most active space agency by launches.",
  "Chandrayaan-3 made India the 4th country to land on the Moon.",
  "ISRO operates 50+ operational satellites serving India's economy.",
  "The Mars Orbiter Mission cost just ₹450 crore — cheaper than most sci-fi films.",
  "ISRO's PSLV has a success rate of over 95% across 60+ flights.",
];

// Key historic ISRO milestones for the staggered timeline
const ISRO_TIMELINE = [
  { year: "1975", title: "Aryabhata", desc: "India's first satellite launched aboard a Soviet rocket.", color: "blue" },
  { year: "2008", title: "Chandrayaan-1", desc: "Discovered water molecules on the Moon's surface.", color: "purple" },
  { year: "2014", title: "Mangalyaan", desc: "India became the first Asian nation to reach Martian orbit.", color: "red" },
  { year: "2017", title: "PSLV-C37 Record", desc: "104 satellites launched in a single mission — world record.", color: "green" },
  { year: "2019", title: "Chandrayaan-2", desc: "Orbiter continues to return lunar data to this day.", color: "amber" },
  { year: "2023", title: "Chandrayaan-3", desc: "Soft-landed near the lunar south pole — historic first.", color: "cyan" },
];

const timelineColors: Record<string, string> = {
  blue: "bg-blue-500 text-blue-400 border-blue-500/30 ring-blue-500/50",
  purple: "bg-purple-500 text-purple-400 border-purple-500/30 ring-purple-500/50",
  red: "bg-red-500 text-red-400 border-red-500/30 ring-red-500/50",
  green: "bg-green-500 text-green-400 border-green-500/30 ring-green-500/50",
  amber: "bg-amber-500 text-amber-400 border-amber-500/30 ring-amber-500/50",
  cyan: "bg-cyan-500 text-cyan-400 border-cyan-500/30 ring-cyan-500/50",
};

interface ISROStats {
  totalLaunches: number;
  successRate: string;
  activeSatellites: number;
}

export default function ISROPage() {
  const [events, setEvents] = useState<SpaceEvent[]>([]);
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
      const all: SpaceEvent[] = data.results || [];
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

        {/* ── Header ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Rocket className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">ISRO Missions</h1>
              <p className="text-slate-500 text-sm mt-0.5">Indian Space Research Organisation — Upcoming Launches</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: Rocket, label: "PSLV/GSLV Launches", value: stats.totalLaunches.toString(), color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
              { icon: Globe, label: "Success Rate", value: stats.successRate, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
              { icon: MapPin, label: "Active Satellites", value: stats.activeSatellites.toString(), color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
            ].map(({ icon: Icon, label, value, color, bg }, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className={`glass-card p-5 border ${bg}`}
              >
                <Icon className={`w-5 h-5 ${color} mb-2`} />
                <div className={`text-2xl font-bold ${color} mb-0.5`}>{value}</div>
                <div className="text-slate-500 text-xs">{label}</div>
              </motion.div>
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

        {/* ── Mission Timeline ─────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-14"
        >
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-4 h-4 text-amber-400" />
            <h2 className="text-xl font-semibold text-white">Historic Milestones</h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[5.5rem] top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/60 via-blue-500/30 to-transparent pointer-events-none" />

            <div className="flex flex-col gap-0">
              {ISRO_TIMELINE.map((item, i) => {
                const colors = timelineColors[item.color] || timelineColors.blue;
                const [dotBg, textColor, borderColor, ringColor] = colors.split(" ");
                return (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-start gap-4 group pb-6"
                  >
                    {/* Year label */}
                    <div className="w-20 text-right shrink-0 pt-1">
                      <span className={`text-xs font-bold font-mono ${textColor}`}>{item.year}</span>
                    </div>

                    {/* Dot */}
                    <div className="relative mt-1">
                      <div className={`w-3 h-3 rounded-full ${dotBg} ring-2 ring-offset-2 ring-offset-[#0a0a0f] ${borderColor} ${ringColor} group-hover:scale-125 transition-transform`} />
                    </div>

                    {/* Content */}
                    <div className={`flex-1 glass-card p-4 border ${borderColor} group-hover:border-opacity-60 transition-colors`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold text-sm ${textColor}`}>{item.title}</h3>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500 transition-colors" />
                      </div>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* ── Upcoming ISRO Events ─────────────────────────── */}
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

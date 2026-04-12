"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EventCard, { EventCardSkeleton } from "@/components/EventCard";
import { RefreshCw, Rocket, Globe, Star, Cpu, Zap, Radio } from "lucide-react";
import { SpaceEvent } from "@/types";
import { cn } from "@/lib/utils";

const ISRO_KEYWORDS = ["ISRO", "GSLV", "PSLV", "LVM", "Chandrayaan", "India", "SDSC", "Satish Dhawan"];

const ISRO_FACTS = [
  "ISRO is the world's 6th most active space agency by launches.",
  "Chandrayaan-3 made India the 4th country to land on the Moon.",
  "ISRO operates 50+ operational satellites serving India's economy.",
  "The Mars Orbiter Mission cost just ₹450 crore — cheaper than most sci-fi films.",
  "ISRO's PSLV has a success rate of over 95% across 60+ flights.",
];

const ISRO_TIMELINE = [
  { year: "1975", title: "Aryabhata", desc: "First satellite uplink established.", color: "blue", status: "DECOMMISSIONED" },
  { year: "2008", title: "Chandrayaan-1", desc: "Found lunar H2O molecules.", color: "purple", status: "SUCCESS" },
  { year: "2014", title: "Mangalyaan", desc: "First Asian Mars insertion.", color: "red", status: "SUCCESS" },
  { year: "2017", title: "PSLV-C37", desc: "Single flight: 104 satellites.", color: "green", status: "SUCCESS" },
  { year: "2019", title: "Chandrayaan-2", desc: "Orbital telemetry ongoing.", color: "amber", status: "PARTIAL" },
  { year: "2023", title: "Chandrayaan-3", desc: "Lunar South Pole touchdown.", color: "cyan", status: "ACTIVE" },
];

const timelineColors: Record<string, { main: string; glow: string; text: string }> = {
  blue: { main: "bg-blue-500", glow: "shadow-blue-500/50", text: "text-blue-400" },
  purple: { main: "bg-purple-500", glow: "shadow-purple-500/50", text: "text-purple-400" },
  red: { main: "bg-red-500", glow: "shadow-red-500/50", text: "text-red-400" },
  green: { main: "bg-emerald-500", glow: "shadow-emerald-500/50", text: "text-emerald-400" },
  amber: { main: "bg-amber-500", glow: "shadow-amber-500/50", text: "text-amber-400" },
  cyan: { main: "bg-cyan-500", glow: "shadow-cyan-500/50", text: "text-cyan-400" },
};

export default function ISROPage() {
  const [events, setEvents] = useState<SpaceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((i) => (i + 1) % ISRO_FACTS.length);
    }, 6000);
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

  return (
    <main className="min-h-screen bg-[#050508] relative selection:bg-purple-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-isro-gradient bg-[length:300%_300%] animate-gradient-shift opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05),transparent_70%)] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-24">
        
        {/* ── Page Header ───────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-600/10 border border-purple-500/20 rounded-2xl relative">
                <Rocket className="w-8 h-8 text-purple-400" />
                <div className="absolute inset-0 bg-purple-500/20 blur-xl animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight uppercase italic underline decoration-purple-500/50 decoration-4 underline-offset-8">
                  ISRO <span className="text-slate-500 font-normal">Command</span>
                </h1>
              </div>
            </div>

            {/* Sub-header info HUD */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-full">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Status: Nominal</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-full">
                <Radio className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Uplink: HYD-STN-99</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 lg:max-w-md bg-[#0a0a0f] border border-white/[0.05] rounded-3xl p-6 relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Cpu className="w-20 h-20 text-blue-400" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Knowledge Base</h3>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={factIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="text-slate-300 text-sm font-medium leading-relaxed italic"
              >
                &quot;{ISRO_FACTS[factIndex]}&quot;
              </motion.p>
            </AnimatePresence>
            <div className="mt-6 h-1 w-full bg-white/[0.05] rounded-full overflow-hidden">
               <motion.div 
                 key={factIndex}
                 initial={{ width: 0 }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 6, ease: "linear" }}
                 className="h-full bg-blue-600"
               />
            </div>
          </motion.div>
        </div>

        {/* ── Visual Stats ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            { label: "Launch Trajectory", value: "96+", sub: "Total Missions", icon: Rocket, color: "text-blue-400", bg: "from-blue-500/10 to-transparent" },
            { label: "Operation Success", value: "95.8%", sub: "Global Leader", icon: Globe, color: "text-emerald-400", bg: "from-emerald-500/10 to-transparent" },
            { label: "Space Assets", value: "54", sub: "Operational In-Orbit", icon: Radio, color: "text-purple-400", bg: "from-purple-500/10 to-transparent" },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative p-8 rounded-[2.5rem] bg-[#0a0a0f] border border-white/[0.04] overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              <stat.icon className={`w-8 h-8 ${stat.color} mb-6 transition-transform group-hover:scale-110 duration-500`} />
              <div className="relative z-10">
                <div className={`text-4xl font-black text-white mb-2 tracking-tighter`}>{stat.value}</div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</div>
                <div className="mt-4 text-[10px] text-slate-600 font-mono italic">{stat.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* ── Mission Timeline (Left) ───────────────────────── */}
          <div className="lg:col-span-4 sticky top-32">
            <div className="flex items-center gap-3 mb-8 px-2">
              <Star className="w-5 h-5 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              <h2 className="text-2xl font-bold text-white tracking-tight">Milestones</h2>
            </div>

            <div className="space-y-4">
              {ISRO_TIMELINE.map((item, i) => {
                const colors = timelineColors[item.color];
                return (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="group relative"
                  >
                    <div className="flex items-stretch gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-default overflow-hidden">
                      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r", item.color === 'blue' ? 'from-blue-500' : 'from-purple-500')} />
                      
                      <div className="flex flex-col items-center gap-2 pr-4 border-r border-white/5">
                        <span className={cn("text-xs font-black font-mono tracking-tighter", colors.text)}>{item.year}</span>
                        <div className={cn("w-2 h-2 rounded-full", colors.main, colors.glow, "animate-pulse")} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-white text-sm">{item.title}</h3>
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-white/5 text-slate-500 tracking-tighter">{item.status}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── Upcoming Missions (Right) ─────────────────────── */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-10 px-4">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-white tracking-tight">Live Trajectories</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Scanning</span>
                </div>
              </div>
              <button
                onClick={fetchISROEvents}
                disabled={loading}
                className="p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(4).fill(null).map((_, i) => <EventCardSkeleton key={i} />)}
              </div>
            ) : error ? (
              <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                <p className="text-slate-500 mb-6 font-mono text-sm uppercase tracking-widest leading-loose">Data Stream Corruption Observed</p>
                <button 
                  onClick={fetchISROEvents} 
                  className="px-8 py-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest transition-all"
                >
                  Recalibrate
                </button>
              </div>
            ) : events.length === 0 ? (
              <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                <Rocket className="w-16 h-16 text-slate-800 mb-8 mx-auto" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">Shadow Period</h3>
                <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed uppercase tracking-tighter">
                  No impending mission countdowns detected. Satellite clusters are in formation.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event, i) => (
                  <EventCard key={event.id} event={event} index={i} />
                ))}
              </div>
            )}
            
            {/* Mission Log Accent */}
            <div className="mt-12 p-8 rounded-[3rem] bg-[#0a0a0f] border border-white/[0.02] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 blur-[100px]" />
               <div className="flex items-start gap-6">
                  <div className="p-4 bg-white/5 rounded-3xl">
                     <Radio className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-widest">Ground Control Log</h4>
                    <p className="text-xs text-slate-500 leading-loose font-mono italic">
                      SYSTEM_VERSION: 3.8.4<br />
                      LOC_PRIMARY: SRIHARIKOTA_RANGE<br />
                      TELEMETRY: ESTABLISHED<br />
                      READY_FOR_UPSTREAM: TRUE
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* Extreme Bottom Corner Accents */}
      <div className="fixed top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-white/5 pointer-events-none rounded-br-[100px]" />
      <div className="fixed bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-white/5 pointer-events-none rounded-tl-[100px]" />
    </main>
  );
}

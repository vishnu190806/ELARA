"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EventCard, { EventCardSkeleton } from "@/components/EventCard";
import LocationPicker from "@/components/LocationPicker";
import { SpaceEvent } from "@/types";
import { Cloud, Eye, Moon, RefreshCw, LayoutGrid, List, Rocket, Sparkles, Navigation, Map } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const SkyMap = dynamic(() => import("@/components/SkyMap"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[400px] rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse" />,
});

function ISSLiveStatsBar() {
  const [telemetry, setTelemetry] = useState<{ lat: string; lng: string; alt: string; speed: string; source: string } | null>(null);
  
  useEffect(() => {
    const fetchTelemetry = () => {
      fetch("/api/iss-position")
        .then(res => res.json())
        .then(data => {
          if (data && data.lat !== undefined && data.lng !== undefined) {
             setTelemetry({
               lat: parseFloat(data.lat).toFixed(4),
               lng: parseFloat(data.lng).toFixed(4),
               alt: parseFloat(data.altitude).toFixed(1),
               speed: parseFloat(data.velocity).toLocaleString(undefined, { maximumFractionDigits: 0 }),
               source: data.source || "unknown"
             });
          }
        })
        .catch(err => console.error("Failed to fetch position", err));
    };

    fetchTelemetry();
    const iv = setInterval(fetchTelemetry, 10000); 
    return () => clearInterval(iv);
  }, []);

  if (!telemetry) return (
     <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full w-fit backdrop-blur-md">
       <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
       <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">CONNECTING ISS...</span>
     </div>
  );

  return (
     <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-2xl p-4 backdrop-blur-md pointer-events-auto">
        <div className="flex flex-col">
           <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">LIVE ISS TELEMETRY</span>
           </div>
           <div className="flex items-center gap-6 mt-1">
              <div>
                 <span className="text-[10px] text-slate-400 mr-2 uppercase">LAT</span>
                 <span className="text-sm text-white font-mono">{telemetry.lat}°</span>
              </div>
              <div>
                 <span className="text-[10px] text-slate-400 mr-2 uppercase">LNG</span>
                 <span className="text-sm text-white font-mono">{telemetry.lng}°</span>
              </div>
              <div className="hidden sm:block">
                 <span className="text-[10px] text-slate-400 mr-2 uppercase">ALT</span>
                 <span className="text-sm text-white font-mono">{telemetry.alt} KM</span>
              </div>
              <div className="hidden md:block">
                 <span className="text-[10px] text-slate-400 mr-2 uppercase">SPD</span>
                 <span className="text-sm text-emerald-400 font-mono">{telemetry.speed} KM/H</span>
              </div>
           </div>
        </div>
     </div>
  );
}

const EarthGlobe = dynamic(() => import("@/components/EarthGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
    </div>
  ),
});

const ISSTracker = dynamic(() => import("@/components/ISSTracker"), { ssr: false });

interface SkyScore {
  score: number;
  metrics: { cloudCover: number; lightPollution: number; moonBrightness: number };
  meta: { nearestZone: string };
}

const DEFAULT_LAT = 17.385;
const DEFAULT_LNG = 78.4867;
const DEFAULT_CITY = "Hyderabad";

export default function HomePage() {
  const [location, setLocation] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG, city: DEFAULT_CITY });
  const [skyScore, setSkyScore] = useState<SkyScore | null>(null);
  const [skyLoading, setSkyLoading] = useState(true);
  const [skyError, setSkyError] = useState(false);
  const [events, setEvents] = useState<SpaceEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const [systemReady, setSystemReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSystemReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const fetchSkyScore = useCallback(async (lat: number, lng: number) => {
    setSkyLoading(true);
    setSkyError(false);
    try {
      const res = await fetch(`/api/sky-score?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error();
      setSkyScore(await res.json());
    } catch {
      setSkyError(true);
    } finally {
      setSkyLoading(false);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(false);
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEvents(data.results || []);
    } catch {
      setEventsError(true);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkyScore(location.lat, location.lng);
  }, [location.lat, location.lng, fetchSkyScore]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <main className="min-h-screen bg-[#050508] text-slate-300 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Cinematic Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.08)_0%,transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Animated Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-32">
        
        {/* ─── Hero Section ─────────────────────────────────────────── */}
        <section id="sky-score" className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Main Observer Terminal (Globe) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-8 relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
              <div className="relative h-[600px] rounded-[3rem] bg-[#0a0a0f] border border-white/5 overflow-hidden shadow-2xl">
                 <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-20 pointer-events-none">
                    <ISSLiveStatsBar />
                    <div className="text-right font-mono text-[10px] text-slate-600 uppercase tracking-widest hidden sm:block">
                       lat: {location.lat.toFixed(4)}<br />
                       lng: {location.lng.toFixed(4)}
                    </div>
                 </div>
                 <EarthGlobe
                    skyScore={skyScore}
                    skyLoading={skyLoading}
                    skyError={skyError}
                    cityName={location.city}
                    onRetry={() => fetchSkyScore(location.lat, location.lng)}
                    events={events}
                    userLat={location.lat}
                    userLng={location.lng}
                 />
                 {/* Bottom Gradient Fade */}
                 <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
              </div>
            </motion.div>
            
            {/* Information Control Center */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-4 flex flex-col gap-8"
            >
              <div className="flex-1 bg-[#0a0a0f] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden flex flex-col items-center text-center group">
                 <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Sparkles className="w-12 h-12 text-blue-400" />
                 </div>
                 
                 <div className="w-24 h-24 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-8 relative">
                    <Navigation className="w-10 h-10 text-blue-500" />
                    <div className="absolute inset-0 border border-blue-500/20 rounded-3xl animate-[ping_3s_ease-in-out_infinite]" />
                 </div>

                 <h1 className="text-4xl font-black text-white mb-3 tracking-tight italic uppercase">
                    Sky <span className="text-blue-500">Score</span>
                 </h1>
                 <p className="text-slate-500 text-sm font-medium mb-10 max-w-[200px] leading-relaxed uppercase tracking-widest">
                    Observational quality metrics for {location.city}
                 </p>

                 <div className="w-full mb-10">
                    <LocationPicker
                      onLocationChange={(lat, lng, city) => setLocation({ lat, lng, city })}
                      currentCity={location.city}
                      loading={skyLoading}
                    />
                 </div>

                 <div className="w-full space-y-3 mt-auto">
                    {[
                      { icon: Cloud, label: "Cloud Cover", value: skyScore?.metrics.cloudCover + "%", color: "text-blue-400" },
                      { icon: Eye, label: "Light Pollution", value: skyScore?.metrics.lightPollution + "%", color: "text-amber-400" },
                      { icon: Moon, label: "Moon Luminescence", value: skyScore?.metrics.moonBrightness + "%", color: "text-purple-400" },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] group/item hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                           <m.icon className={cn("w-4 h-4", m.color)} />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{m.label}</span>
                        </div>
                        <span className="text-sm font-bold text-white font-mono">{skyLoading ? "..." : m.value}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ─── Real-time Trackers Section ────────────────────────────── */}
        <section id="trackers" className="mb-32">
           <div className="flex items-center justify-between mb-12 px-2">
              <div className="flex flex-col">
                 <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Atmospheric <span className="text-blue-500">Overlay</span></h2>
                 <div className="flex items-center gap-2 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Synchronized with {location.city} Ground STN</span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-5 relative"
              >
                 <ISSTracker userLat={location.lat} userLng={location.lng} />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-7 h-[550px]"
              >
                 <SkyMap lat={location.lat} lng={location.lng} />
              </motion.div>
           </div>
        </section>

        {/* ─── Tactical Event List ────────────────────────────────────── */}
        <section id="events">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 px-4">
              <div className="flex flex-col">
                 <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Mission <span className="text-pink-500">Queue</span></h2>
                 <p className="text-slate-500 text-sm mt-3 font-medium max-w-sm uppercase tracking-widest leading-relaxed">
                    Global orbital launch schedule and deep-space milestones.
                 </p>
              </div>

              <div className="flex items-center gap-6">
                 <div className="flex bg-[#0a0a0f] border border-white/5 rounded-2xl p-1.5">
                    <button 
                       onClick={() => setViewMode("grid")}
                       className={cn("p-3 rounded-xl transition-all", viewMode === "grid" ? "bg-white/10 text-white" : "text-slate-600 hover:text-slate-400")}
                    >
                       <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button 
                       onClick={() => setViewMode("timeline")}
                       className={cn("p-3 rounded-xl transition-all", viewMode === "timeline" ? "bg-white/10 text-white" : "text-slate-600 hover:text-slate-400")}
                    >
                       <List className="w-5 h-5" />
                    </button>
                 </div>
                 <button 
                   onClick={fetchEvents}
                   className="p-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all group active:scale-95"
                 >
                    <RefreshCw className={cn("w-5 h-5", eventsLoading && "animate-spin")} />
                 </button>
              </div>
           </div>

           <div className="relative p-10 rounded-[4rem] bg-[#0a0a0f] border border-white/[0.02] shadow-3xl">
              {/* Decorative Corner Accents */}
              <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-white/5 rounded-tl-2xl" />
              <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-white/5 rounded-br-2xl" />

              {eventsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {Array(6).fill(null).map((_, i) => <EventCardSkeleton key={i} />)}
                </div>
              ) : events.length === 0 ? (
                <div className="py-32 text-center text-slate-700 font-mono italic uppercase tracking-widest text-sm">
                   End of current signal stream. Waiting for planetary rotation.
                </div>
              ) : (
                <div className={cn(
                  viewMode === "grid" 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
                    : "flex flex-col gap-10 pl-12 relative before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-white/5"
                )}>
                   {events.map((event, i) => (
                     <div key={event.id} className="relative">
                        {viewMode === "timeline" && (
                          <div className="absolute top-1/2 -left-[44px] -translate-y-1/2 w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)] z-10" />
                        )}
                        <EventCard event={event} index={i} />
                     </div>
                   ))}
                </div>
              )}
           </div>
        </section>

      </div>

      {/* Extreme Bottom Page Info */}
      <div className="fixed bottom-8 left-8 flex items-center gap-4 text-slate-700 font-mono text-[9px] tracking-[0.3em] uppercase pointer-events-none z-10">
         <span className="opacity-40">ELARA-GRID-v4.0</span>
         <div className="w-1 h-1 bg-white/20 rounded-full" />
         <span className="opacity-40">SIGNAL_STR: 98%</span>
      </div>
    </main>
  );
}

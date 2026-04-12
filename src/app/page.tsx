"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import EventCard, { EventCardSkeleton } from "@/components/EventCard";
import LocationPicker from "@/components/LocationPicker";
import { SpaceEvent } from "@/types";
import { Cloud, Eye, Moon, RefreshCw, LayoutGrid, List, Rocket } from "lucide-react";
import dynamic from "next/dynamic";

const SkyMap = dynamic(() => import("@/components/SkyMap"), {
  ssr: false,
  loading: () => <div className="h-64 rounded-[2rem] skeleton" />,
});

const EarthGlobe = dynamic(() => import("@/components/EarthGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-[200px] h-[200px] rounded-full skeleton" />
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

  function handleLocationChange(lat: number, lng: number, city: string) {
    setLocation({ lat, lng, city });
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-slate-300 font-sans scroll-smooth">
      {/* Background gradients */}
      <div className="absolute inset-x-0 top-0 h-[800px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-x-0 top-[600px] h-[800px] bg-[radial-gradient(ellipse_at_left,rgba(236,72,153,0.05)_0%,transparent_40%)] pointer-events-none" />

      {/* Sticky Top Nav */}
      <nav className="sticky top-6 z-50 mx-auto max-w-fit px-5 py-2.5 bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-full flex gap-8 items-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <a href="#" className="font-bold text-white tracking-widest text-sm flex items-center gap-2 pr-2 border-r border-white/10 hover:text-blue-400 transition-colors">
          <Rocket className="w-5 h-5 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          ELARA
        </a>
        <div className="hidden sm:flex gap-6">
          <a href="#sky-score" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors relative group">
            Sky Score
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-500 transition-all group-hover:w-full" />
          </a>
          <a href="#trackers" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors relative group">
            Trackers
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-purple-500 transition-all group-hover:w-full" />
          </a>
          <a href="#events" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors relative group">
            Events
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-pink-500 transition-all group-hover:w-full" />
          </a>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-24 space-y-6">

        {/* ─── Hero Section (Bento Grid) ──────────────────────────────────────── */}
        <section id="sky-score" className="scroll-mt-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* BIG HERO CARD (Earth Globe) */}
            <div className="lg:col-span-8 bg-black/40 backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-[2rem] overflow-hidden relative h-[500px] lg:h-[550px] group">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
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
            </div>
            
            {/* METRICS SIDEBAR */}
            <div className="lg:col-span-4 flex flex-col gap-6 min-h-0">
              <div className="glass-card rounded-[2rem] p-8 flex flex-col h-full bg-[#0d1017]/80 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="relative z-10 w-full text-center mb-8">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold mb-6 uppercase tracking-widest"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    Tonight's Forecast
                  </motion.div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-md">
                    Sky Score
                  </h1>
                  <p className="text-slate-400 text-sm font-medium">
                    {location.city} — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  </p>
                </div>

                <div className="w-full relative z-10 mb-8">
                  <LocationPicker
                    onLocationChange={handleLocationChange}
                    currentCity={location.city}
                    loading={skyLoading}
                  />
                </div>

                {skyScore && !skyLoading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col gap-3 mt-auto"
                  >
                    {[
                      { icon: Cloud, label: "Cloud Cover", value: `${skyScore.metrics.cloudCover}%`, color: "#94a3b8" },
                      { icon: Eye, label: "Light Pollution", value: `${skyScore.metrics.lightPollution}%`, color: "#fbbf24" },
                      { icon: Moon, label: "Moon Brightness", value: `${skyScore.metrics.moonBrightness}%`, color: "#a78bfa" },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-black/40 rounded-lg">
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          <span className="text-slate-300 text-sm font-medium">{label}</span>
                        </div>
                        <span className="text-white font-mono font-bold">{value}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* ─── Trackers (Bento Grid) ──────────────────────────────────── */}
        <section id="trackers" className="scroll-mt-28">
          <div className="flex items-center gap-3 mb-6 px-2">
            <h2 className="text-2xl font-bold text-white">Live Trackers</h2>
            <div className="h-px bg-white/10 flex-grow" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-5 h-[450px]">
              <ISSTracker userLat={location.lat} userLng={location.lng} />
            </section>

            <section className="lg:col-span-7 h-[450px]">
              <SkyMap lat={location.lat} lng={location.lng} />
            </section>
          </div>
        </section>

        {/* ─── Events Section ────────────────────────────────────── */}
        <section id="events" className="scroll-mt-28">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              Upcoming Events
              <span className="text-sm px-2.5 py-1 bg-white/10 rounded-full text-slate-300 font-medium">
                {eventsLoading ? "..." : events.length}
              </span>
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-[#0a0a0f]/50 backdrop-blur-md rounded-xl p-1.5 border border-white/10">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "timeline" ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
                  title="Timeline View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              {!eventsLoading && (
                <button
                  onClick={fetchEvents}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-xl transition-colors font-medium text-sm border border-blue-500/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#0c0d12]/50 border border-white/[0.05] rounded-[2rem] p-6 sm:p-8 backdrop-blur-sm">
            {eventsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(null).map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            ) : eventsError ? (
              <div className="py-20 text-center">
                <p className="text-slate-500 mb-4 text-lg">Failed to load launch events</p>
                <button
                  onClick={fetchEvents}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Try Again
                </button>
              </div>
            ) : events.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-lg">
                No upcoming events found.
              </div>
            ) : (
              <div className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "relative flex flex-col gap-8 pl-10 before:absolute before:inset-y-0 before:left-3 before:w-[2px] before:bg-gradient-to-b before:from-blue-500/50 before:via-purple-500/50 before:to-transparent"
              }>
                {events.map((event, i) => (
                  <div key={event.id} className={viewMode === "timeline" ? "relative" : ""}>
                    {viewMode === "timeline" && (
                      <div className="absolute top-10 -left-[39px] w-5 h-5 rounded-full bg-black border-4 border-purple-500 z-10 shadow-[0_0_15px_rgba(168,85,247,0.6)]" />
                    )}
                    <EventCard event={event} index={i} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import EventCard, { EventCardSkeleton } from "@/components/EventCard";
import LocationPicker from "@/components/LocationPicker";
import { SpaceEvent } from "@/types";
import { Cloud, Eye, Moon, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";

const SkyMap = dynamic(() => import("@/components/SkyMap"), {
  ssr: false,
  loading: () => <div className="h-64 rounded-2xl skeleton" />,
});

const EarthGlobe = dynamic(() => import("@/components/EarthGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] flex items-center justify-center">
      <div className="w-[160px] h-[160px] rounded-full skeleton" />
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
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* Hero background gradient */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">

        {/* ─── Hero Section ──────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-medium mb-4 uppercase tracking-widest"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Tonight&apos;s Forecast
          </motion.div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-1 tracking-tight">
            Tonight&apos;s Sky Score
          </h1>
          <p className="text-slate-500 text-base mb-6">
            {location.city} — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>

          {/* 3D Earth Globe with Sky Score overlay */}
          <div className="relative mb-6">
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

          {/* Metrics row */}
          {skyScore && !skyLoading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4 mb-8"
            >
              {[
                { icon: Cloud, label: "Cloud Cover", value: `${skyScore.metrics.cloudCover}%`, color: "#64748b" },
                { icon: Eye, label: "Light Pollution", value: `${skyScore.metrics.lightPollution}%`, color: "#f59e0b" },
                { icon: Moon, label: "Moon Brightness", value: `${skyScore.metrics.moonBrightness}%`, color: "#8b5cf6" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                  <span className="text-slate-400">{label}:</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Location Picker */}
          <div className="max-w-md mx-auto">
            <LocationPicker
              onLocationChange={handleLocationChange}
              currentCity={location.city}
              loading={skyLoading}
            />
          </div>
        </motion.section>

        {/* ─── Sky Map & ISS Section ──────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* ─── ISS Tracker Section ──────────────────────────────── */}
            <section className="lg:col-span-1 h-[400px]">
              <ISSTracker userLat={location.lat} userLng={location.lng} />
            </section>

            {/* ─── Sky Map Section ──────────────────────────────────── */}
            <section className="lg:col-span-2 h-[400px]">
              <SkyMap lat={location.lat} lng={location.lng} />
            </section>
          </div>

        {/* ─── Events Section ────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Upcoming Events</h2>
            {!eventsLoading && (
              <button
                onClick={fetchEvents}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            )}
          </div>

          {eventsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(null).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : eventsError ? (
            <div className="glass-card p-8 text-center">
              <p className="text-slate-500 mb-3">Failed to load events</p>
              <button
                onClick={fetchEvents}
                className="text-blue-400 text-sm hover:text-blue-300 transition-colors flex items-center gap-1 mx-auto"
              >
                <RefreshCw className="w-4 h-4" /> Try again
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-500">
              No upcoming events found.
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

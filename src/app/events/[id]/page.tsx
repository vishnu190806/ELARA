"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Countdown from "@/components/Countdown";
import RocketSVG from "@/components/RocketSVG";
import {
  ArrowLeft, Calendar, Globe, Telescope, Sparkles,
  MapPin, Clock, ExternalLink, Loader2, Bell, Share2,
  Rocket, RefreshCw, Satellite, Target, Weight
} from "lucide-react";
import { SpaceEvent } from "@/types";
import Link from "next/link";
import Image from "next/image";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [event, setEvent] = useState<SpaceEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchEvent() {
      try {
        const res = await fetch("/api/events");
        if (!res.ok) throw new Error();
        const data = await res.json();
        const found = (data.results || []).find((e: SpaceEvent) => e.id === id);
        if (found) {
          setEvent(found);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] pt-24 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-blue-400" />
        </motion.div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] pt-24 flex flex-col items-center justify-center gap-4">
        <Rocket className="w-12 h-12 text-slate-700" />
        <p className="text-slate-400">Event not found</p>
        <Link href="/" className="text-blue-400 text-sm hover:underline">
          ← Back to Home
        </Link>
      </main>
    );
  }

  const name = event.name || event.title || "Unknown Event";
  const date = event.net || event.window_start;
  const agency = event.launch_service_provider;
  const location = event.pad?.location?.name || event.location?.name;
  const rocketConfig = event.rocket?.configuration;
  const rocketName = rocketConfig?.full_name || rocketConfig?.name || name;
  const patch = event.mission?.patches?.[0]?.image_url || event.image;
  const orbit = event.mission?.orbit;
  const missionType = event.mission?.type;
  const spacecraft = event.spacecraft_flight?.spacecraft;
  const launcherStage = event.rocket?.launcher_stage?.[0];
  const isReused = launcherStage?.reused;
  const flightNumber = launcherStage?.flight_number;
  const launchMass = rocketConfig?.launch_mass;
  const padName = event.pad?.name;
  const totalSiteLaunches = event.pad?.total_launch_count;
  const statusName = event.status?.name;

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </motion.button>

        {/* ── HERO SECTION ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-start gap-6 mb-6">
            {/* Mission patch or Rocket SVG */}
            <div className="shrink-0">
              {patch ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/20">
                  <Image src={patch} alt={name} fill style={{ objectFit: "cover" }} unoptimized />
                </div>
              ) : (
                <div className="w-20 h-32">
                  <RocketSVG rocketName={rocketName} className="w-20 h-32" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Status pill */}
              {statusName && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3 ${
                  statusName.toLowerCase().includes("go")
                    ? "bg-green-500/15 text-green-400 border border-green-500/30"
                    : statusName.toLowerCase().includes("tbd") || statusName.toLowerCase().includes("tbc")
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {statusName}
                </span>
              )}

              {agency && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full badge-nasa text-xs font-semibold mb-3 ml-2">
                  <Telescope className="w-3 h-3" />
                  {agency.abbrev || agency.name}
                </span>
              )}

              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">{name}</h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {missionType && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    {missionType}
                  </span>
                )}
                {orbit && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {orbit.name}
                  </span>
                )}
                {isReused && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    Reused Stage {flightNumber ? `(F${flightNumber})` : ""}
                  </span>
                )}
                {spacecraft?.name && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center gap-1">
                    <Satellite className="w-3 h-3" />
                    {spacecraft.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Metadata strip */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            {date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                {new Date(date).toLocaleDateString("en-IN", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                  hour: "2-digit", minute: "2-digit", hour12: true,
                })}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-400" />
                {location}
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main content ─────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* AI Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
                <h2 className="font-semibold text-white text-sm">AI Explanation</h2>
                <span className="text-xs text-slate-600 ml-auto">Powered by Gemini</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">
                {event.explanation || "Explanation is being generated. Check back shortly."}
              </p>
            </motion.div>

            {/* Rocket configuration panel */}
            {rocketConfig && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass-card p-6"
              >
                <h2 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-blue-400" />
                  Launch Vehicle
                </h2>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-24 shrink-0">
                    <RocketSVG rocketName={rocketName} className="w-16 h-24" />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Vehicle</span>
                      <span className="text-white font-medium">{rocketConfig.full_name || rocketConfig.name}</span>
                    </div>
                    {rocketConfig.family && (
                      <div>
                        <span className="text-slate-500 block mb-0.5">Family</span>
                        <span className="text-white font-medium">{rocketConfig.family}</span>
                      </div>
                    )}
                    {rocketConfig.reusable !== undefined && (
                      <div>
                        <span className="text-slate-500 block mb-0.5">Reusable</span>
                        <span className={`font-medium ${rocketConfig.reusable ? "text-green-400" : "text-slate-400"}`}>
                          {rocketConfig.reusable ? "Yes" : "No"}
                        </span>
                      </div>
                    )}
                    {launchMass && (
                      <div>
                        <span className="text-slate-500 block mb-0.5 flex items-center gap-1">
                          <Weight className="w-3 h-3" /> Launch Mass
                        </span>
                        <span className="text-white font-medium">{launchMass.toLocaleString()} kg</span>
                      </div>
                    )}
                    {flightNumber != null && (
                      <div>
                        <span className="text-slate-500 block mb-0.5">Booster Flight</span>
                        <span className="text-white font-medium">#{flightNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Mission description */}
            {event.mission?.description && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <h2 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  Mission Details
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">{event.mission.description}</p>
              </motion.div>
            )}

            {/* Viewing tips */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <h2 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                <Telescope className="w-4 h-4 text-slate-400" />
                Viewing Tips
              </h2>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">›</span>
                  Find a location away from city light pollution for best visibility.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">›</span>
                  Allow your eyes 15–20 minutes to adjust to darkness.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">›</span>
                  Check tonight&apos;s sky score on the home page before heading out.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">›</span>
                  Watch live streams if the event happens in a different time zone.
                </li>
              </ul>
            </motion.div>

            {/* Watch live streams */}
            {event.vidURLs && event.vidURLs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6"
              >
                <h2 className="font-semibold text-white text-sm mb-3">Watch Live</h2>
                <div className="flex flex-col gap-2">
                  {event.vidURLs.map((vid, i) => (
                    <a
                      key={i}
                      href={vid.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {vid.title || "Watch Stream"}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Sidebar ────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Action Bar */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-4 flex flex-col gap-3"
            >
              <button
                onClick={() => alert("Notification permissions would be requested here.")}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-blue-600/20"
              >
                <Bell className="w-4 h-4" />
                Set Alert
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: name, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-white py-3 rounded-xl font-medium transition-all border border-white/[0.1] active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                Share Event
              </button>
            </motion.div>

            {/* Countdown */}
            {date && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <h3 className="font-semibold text-white text-sm">Countdown</h3>
                </div>
                <Countdown targetDate={date} />
              </motion.div>
            )}

            {/* Launch site details */}
            {(location || padName) && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-5"
              >
                <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  Launch Site
                </h3>
                {padName && <p className="text-white text-sm font-medium mb-1">{padName}</p>}
                {location && <p className="text-slate-400 text-xs mb-2">{location}</p>}
                {totalSiteLaunches != null && (
                  <p className="text-slate-600 text-xs">{totalSiteLaunches} total launches from this site</p>
                )}
                {event.pad?.location?.map_url && (
                  <a
                    href={event.pad.location.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-purple-400 text-xs mt-3 hover:text-purple-300 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on map
                  </a>
                )}
              </motion.div>
            )}

            {/* Agency info */}
            {agency && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="glass-card p-5"
              >
                <h3 className="font-semibold text-white text-sm mb-3">Launch Provider</h3>
                <p className="text-slate-300 font-medium text-sm mb-2">{agency.name}</p>
                {agency.description && (
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-4">{agency.description}</p>
                )}
                {agency.info_url && (
                  <a
                    href={agency.info_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 text-xs mt-3 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    More info
                  </a>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

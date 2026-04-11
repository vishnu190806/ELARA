"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Countdown from "@/components/Countdown";
import {
  ArrowLeft, Calendar, Globe, Telescope, SparklesIcon,
  MapPin, Clock, ExternalLink, Loader2, Bell, Share2
} from "lucide-react";
import { SpaceEvent } from "@/types";
import Link from "next/link";

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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {agency && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full badge-nasa text-xs font-semibold mb-4">
              <Telescope className="w-3 h-3" />
              {agency.abbrev || agency.name}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
            {name}
          </h1>

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
          {/* Main content */}
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
                  <SparklesIcon className="w-4 h-4 text-blue-400" />
                </div>
                <h2 className="font-semibold text-white text-sm">AI Explanation</h2>
                <span className="text-xs text-slate-600 ml-auto">Powered by Gemini</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">
                {event.explanation || "Explanation is being generated. Check back shortly."}
              </p>
            </motion.div>

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
                <p className="text-slate-400 text-sm leading-relaxed">
                  {event.mission.description}
                </p>
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

            {/* Watch live */}
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

          {/* Sidebar */}
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

            {/* Agency info */}
            {agency && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="glass-card p-6"
              >
                <h3 className="font-semibold text-white text-sm mb-3">Launch Provider</h3>
                <p className="text-slate-300 font-medium text-sm mb-2">
                  {agency.name}
                </p>
                {agency.description && (
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-4">
                    {agency.description}
                  </p>
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

            {/* Map link */}
            {event.pad?.location?.map_url && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
                className="glass-card p-6"
              >
                <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  Launch Site
                </h3>
                <p className="text-slate-400 text-xs mb-3">{event.pad?.location?.name}</p>
                <a
                  href={event.pad.location.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-purple-400 text-xs hover:text-purple-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View on map
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

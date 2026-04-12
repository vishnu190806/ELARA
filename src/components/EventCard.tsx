"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Countdown from "./Countdown";
import RocketSVG from "./RocketSVG";
import { Calendar, Rocket, Telescope, Zap, MapPin, ChevronDown, ChevronUp, Bell, Share2, ExternalLink, SparklesIcon, Info } from "lucide-react";
import { SpaceEvent } from "@/types";
import Image from "next/image";

interface EventCardProps {
  event: SpaceEvent;
  index?: number;
}

function getEventAgency(event: SpaceEvent): string {
  const lsp = event.launch_service_provider?.abbrev || event.launch_service_provider?.name;
  const agency = event.agency?.abbrev || event.agency?.name;
  return lsp || agency || "Unknown";
}

function getAgencyBadge(agencyName: string): { cls: string; icon: React.ReactNode } {
  const name = agencyName.toUpperCase();
  if (name.includes("ISRO") || name.includes("INDIA"))
    return { cls: "badge-isro", icon: <Rocket className="w-3 h-3" /> };
  if (name.includes("NASA"))
    return { cls: "badge-nasa", icon: <Telescope className="w-3 h-3" /> };
  const types: Record<string, { cls: string; icon: React.ReactNode }> = {
    METEOR: { cls: "badge-meteor", icon: <Zap className="w-3 h-3" /> },
    ECLIPSE: { cls: "badge-eclipse", icon: <Calendar className="w-3 h-3" /> },
  };
  for (const [key, val] of Object.entries(types)) {
    if (name.includes(key)) return val;
  }
  return { cls: "badge-nasa", icon: <Rocket className="w-3 h-3" /> };
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);

  const name = event.name || event.title || "Untitled Event";
  const date = event.net || event.window_start;
  const agency = getEventAgency(event);
  const { cls, icon } = getAgencyBadge(agency);

  const rocketName = event.rocket?.configuration?.full_name || event.rocket?.configuration?.name || name;
  const rocketFamily = event.rocket?.configuration?.family;
  const isReusable = event.rocket?.configuration?.reusable;
  const flightNo = event.rocket?.launcher_stage?.[0]?.flight_number;
  const location = event.pad?.location?.name || event.location?.name;
  const mapUrl = event.pad?.location?.map_url;
  const missionType = event.mission?.type;
  const orbit = event.mission?.orbit?.name;
  const patch = event.mission?.patches?.[0]?.image_url || event.image;
  const spacecraft = event.spacecraft_flight?.spacecraft?.name;
  const padName = event.pad?.name;
  const totalLaunches = event.pad?.total_launch_count;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="group"
    >
      <div className="glass-card overflow-hidden">
        {/* ── Card header with rocket visual ─────────────── */}
        <div className="flex items-start gap-3 p-4 pb-3">
          {/* Rocket illustration */}
          <div className="shrink-0 w-14 h-20">
            {patch ? (
              <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/10">
                <Image src={patch} alt={name} fill style={{ objectFit: "cover" }} unoptimized />
              </div>
            ) : (
              <RocketSVG rocketName={rocketName} className="w-14 h-20" />
            )}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls} mb-1.5`}>
              {icon}
              {agency}
            </span>
            {missionType && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-slate-400">
                {missionType}
              </span>
            )}
            <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 group-hover:text-blue-300 transition-colors">
              {name}
            </h3>
            {(rocketFamily || rocketName !== name) && (
              <p className="text-slate-500 text-xs mt-0.5">
                {event.rocket?.configuration?.full_name || rocketName}
                {isReusable && <span className="ml-1.5 text-green-500/70">↺ Reusable</span>}
                {flightNo != null && <span className="ml-1.5 text-slate-600">F{flightNo}</span>}
              </p>
            )}
          </div>
        </div>

        {/* ── AI Explanation ─────────────────────────────── */}
        {event.explanation && !expanded && (
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 px-4 pb-3">
            {event.explanation}
          </p>
        )}

        {/* ── Location + Countdown row ───────────────────── */}
        <div className="px-4 pb-3 flex items-center justify-between gap-2">
          {location ? (
            <span className="flex items-center gap-1 text-slate-500 text-xs">
              <MapPin className="w-3 h-3 text-purple-400/70 shrink-0" />
              <span className="truncate">{location}</span>
            </span>
          ) : <span />}
          {date ? (
            <Countdown targetDate={date} compact />
          ) : (
            <span className="text-slate-600 text-xs">Date TBD</span>
          )}
        </div>

        {/* ── Expand toggle ──────────────────────────────── */}
        <div className="border-t border-white/[0.04] flex">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-slate-500 hover:text-blue-400 transition-colors"
          >
            <Info className="w-3 h-3" />
            {expanded ? "Less" : "More details"}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <div className="w-px bg-white/[0.04]" />
          <Link href={`/events/${event.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-slate-500 hover:text-blue-400 transition-colors">
            Full page →
          </Link>
        </div>

        {/* ── Expanded details ───────────────────────────── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-4 border-t border-white/[0.04]">

                {/* Full AI explanation */}
                {event.explanation && (
                  <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
                    <div className="flex items-center gap-1.5 mb-1.5 text-blue-400 text-xs font-medium">
                      <SparklesIcon className="w-3 h-3" />
                      AI Explanation
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{event.explanation}</p>
                  </div>
                )}

                {/* Launch countdown */}
                {date && (
                  <div className="flex justify-center">
                    <Countdown targetDate={date} />
                  </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {padName && (
                    <div className="col-span-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                      <span className="text-slate-500 block mb-0.5">Launch Pad</span>
                      <span className="text-white font-medium">{padName}</span>
                      {totalLaunches != null && (
                        <span className="text-slate-600 block">{totalLaunches} total launches</span>
                      )}
                    </div>
                  )}
                  {orbit && (
                    <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                      <span className="text-slate-500 block mb-0.5">Target Orbit</span>
                      <span className="text-white font-medium">{orbit}</span>
                    </div>
                  )}
                  {spacecraft && (
                    <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                      <span className="text-slate-500 block mb-0.5">Spacecraft</span>
                      <span className="text-white font-medium truncate">{spacecraft}</span>
                    </div>
                  )}
                  {event.mission?.description && (
                    <div className="col-span-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                      <span className="text-slate-500 block mb-0.5">Mission</span>
                      <p className="text-slate-300 line-clamp-3">{event.mission.description}</p>
                    </div>
                  )}
                </div>

                {/* Map link */}
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-purple-400 text-xs hover:text-purple-300 transition-colors"
                  >
                    <MapPin className="w-3 h-3" />
                    View launch site on map
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => alert("Notification feature works from the full event page.")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-medium transition-all active:scale-95"
                  >
                    <Bell className="w-3 h-3" />
                    Set Alert
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/events/${event.id}`;
                      if (navigator.share) {
                        navigator.share({ title: name, url });
                      } else {
                        navigator.clipboard.writeText(url)
                          .then(() => alert("Link copied!"))
                          .catch(() => alert("Could not copy link"));
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-white text-xs font-medium border border-white/[0.08] transition-all active:scale-95"
                  >
                    <Share2 className="w-3 h-3" />
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Skeleton loader
export function EventCardSkeleton() {
  return (
    <div className="glass-card p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="skeleton w-14 h-20 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-16 rounded-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      </div>
      <div className="skeleton h-3 w-full mb-1" />
      <div className="skeleton h-3 w-5/6 mb-4" />
      <div className="flex justify-between items-center">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-3 w-12" />
      </div>
    </div>
  );
}

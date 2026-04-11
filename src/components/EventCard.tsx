"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Countdown from "./Countdown";
import { Calendar, Rocket, Telescope, Zap } from "lucide-react";

import { SpaceEvent } from "@/types";

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
  const name = event.name || event.title || "Untitled Event";
  const date = event.net || event.window_start;
  const agency = getEventAgency(event);
  const { cls, icon } = getAgencyBadge(agency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Link href={`/events/${event.id}`}>
        <div className="glass-card p-5 cursor-pointer">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls} mb-2`}
              >
                {icon}
                {agency}
              </span>
              <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 group-hover:text-blue-300 transition-colors">
                {name}
              </h3>
            </div>
          </div>

          {event.explanation && (
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">
              {event.explanation}
            </p>
          )}

          <div className="flex items-center justify-between">
            {date ? (
              <Countdown targetDate={date} compact />
            ) : (
              <span className="text-slate-500 text-xs">Date TBD</span>
            )}

            <span className="text-slate-600 text-xs group-hover:text-blue-400 transition-colors">
              Details →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Skeleton loader
export function EventCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="skeleton h-4 w-16 mb-2 rounded-full" />
      <div className="skeleton h-4 w-full mb-1" />
      <div className="skeleton h-4 w-3/4 mb-4" />
      <div className="skeleton h-3 w-full mb-1" />
      <div className="skeleton h-3 w-5/6 mb-4" />
      <div className="flex justify-between items-center">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-3 w-12" />
      </div>
    </div>
  );
}

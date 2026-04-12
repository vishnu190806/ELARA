"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Countdown from "./Countdown";
import RocketSVG from "./RocketSVG";
import { Calendar, Rocket, Telescope, Zap, MapPin, Share2, ExternalLink, Info, Activity } from "lucide-react";
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

function getAgencyBadge(agencyName: string): { cls: string; icon: React.ReactNode; glow: string } {
  const name = agencyName.toUpperCase();
  if (name.includes("ISRO") || name.includes("INDIA"))
    return { cls: "bg-orange-500/10 text-orange-400 border-orange-500/20", icon: <Rocket className="w-3 h-3" />, glow: "shadow-orange-500/10" };
  if (name.includes("NASA"))
    return { cls: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <Telescope className="w-3 h-3" />, glow: "shadow-blue-500/10" };
  if (name.includes("METEOR"))
    return { cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: <Zap className="w-3 h-3" />, glow: "shadow-emerald-500/10" };
  if (name.includes("ECLIPSE"))
    return { cls: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: <Calendar className="w-3 h-3" />, glow: "shadow-amber-500/10" };
  
  return { cls: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: <Rocket className="w-3 h-3" />, glow: "shadow-slate-500/10" };
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);

  const name = event.name || event.title || "Untitled Event";
  const date = event.net || event.window_start;
  const agency = getEventAgency(event);
  const { cls, icon, glow } = getAgencyBadge(agency);

  const rocketName = event.rocket?.configuration?.full_name || event.rocket?.configuration?.name || name;
  const isReusable = event.rocket?.configuration?.reusable;
  const location = event.pad?.location?.name || event.location?.name;
  const patch = event.mission?.patches?.[0]?.image_url || event.image;
  const lat = event.pad?.latitude;
  const lng = event.pad?.longitude;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="group relative h-full"
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none ${glow}`} />
      
      <div className="relative flex flex-col h-full bg-[#0a0a0f] border border-white/[0.05] rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:bg-[#0c0c14] hover:shadow-2xl">
        
        {/* Top Activity Bar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
           <div className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${cls}`}>
              {icon}
              {agency}
           </div>
           <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
              <Activity className="w-3 h-3 text-slate-500" />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">Stream Alpha</span>
           </div>
        </div>

        <div className="p-6">
           <div className="flex gap-4 mb-6">
              <div className="shrink-0">
                 {patch ? (
                   <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/5 shadow-2xl skew-x-1 group-hover:skew-x-0 transition-transform">
                      <Image src={patch} alt={name} fill style={{ objectFit: "cover" }} unoptimized className="scale-110 group-hover:scale-100 transition-transform duration-700" />
                   </div>
                 ) : (
                   <div className="w-16 h-24 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center">
                      <RocketSVG rocketName={rocketName} className="w-10 h-16 opacity-40" />
                   </div>
                 )}
              </div>
              <div className="flex-1">
                 <h3 className="text-lg font-black text-white leading-tight tracking-tight mb-2 group-hover:text-blue-400 transition-colors uppercase italic italic">
                    {name}
                 </h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 truncate">
                    {rocketName}
                 </p>
                 {isReusable && (
                    <span className="text-[9px] font-black text-emerald-500/70 uppercase tracking-tighter">↺ Reusable Class</span>
                 )}
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-slate-400">
                 <MapPin className="w-3.5 h-3.5 text-blue-500" />
                 <span className="text-[11px] font-medium leading-none truncate">{location || "Undefined Range"}</span>
              </div>

              <div className="relative p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5 group-hover:bg-blue-500/[0.02] group-hover:border-blue-500/10 transition-colors">
                 {date ? (
                   <Countdown targetDate={date} />
                 ) : (
                   <div className="h-10 flex items-center justify-center text-[10px] font-black uppercase text-slate-600 tracking-widest italic">Temporal Lock Pending</div>
                 )}
              </div>
           </div>
        </div>

        <AnimatePresence>
           {expanded && (
             <motion.div 
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: "auto", opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               className="overflow-hidden bg-black/40 border-t border-white/5"
             >
                <div className="p-6 space-y-6">
                   <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                         <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1">Elevation</span>
                         <span className="text-xs font-bold text-slate-200">Orbital Insertion</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                         <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1">Payload</span>
                         <span className="text-xs font-bold text-slate-200 truncate">Multi-Satellite</span>
                      </div>
                   </div>
                   
                   {event.explanation && (
                      <p className="text-[11px] text-slate-500 leading-relaxed italic border-l-2 border-blue-500/20 pl-4 py-1">
                         &quot;{event.explanation}&quot;
                      </p>
                   )}

                   <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                         <span className="text-[9px] font-bold text-slate-600 uppercase">System Nominal</span>
                      </div>
                      {lat && lng && (
                        <span className="text-[9px] font-mono text-slate-700">
                          {parseFloat(lat).toFixed(2)}, {parseFloat(lng).toFixed(2)}
                        </span>
                      )}
                   </div>
                </div>
             </motion.div>
           )}
        </AnimatePresence>

        <div className="mt-auto border-t border-white/[0.04] flex divide-x divide-white/[0.04] bg-white/[0.01]">
           <button 
             onClick={() => setExpanded(!expanded)}
             className="flex-1 px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-white/[0.03] hover:text-white transition-all flex items-center justify-center gap-2"
           >
              <Info className="w-3.5 h-3.5" />
              {expanded ? "Collapse" : "Payload"}
           </button>
           <Link 
             href={`/events/${event.id}`} 
             className="flex-1 px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all flex items-center justify-center gap-2"
           >
              Manifest
              <ExternalLink className="w-3.5 h-3.5" />
           </Link>
           <button 
             className="w-14 flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/[0.03] transition-all"
           >
              <Share2 className="w-4 h-4" />
           </button>
        </div>

      </div>
    </motion.div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="bg-[#0a0a0f] border border-white/5 rounded-[2.5rem] p-8 h-[400px] flex flex-col">
       <div className="flex justify-between mb-8">
          <div className="w-24 h-5 skeleton rounded-full" />
          <div className="w-16 h-3 skeleton rounded-full" />
       </div>
       <div className="flex gap-6 mb-8">
          <div className="w-20 h-20 skeleton rounded-2xl shrink-0" />
          <div className="flex-1 space-y-4">
             <div className="w-full h-8 skeleton rounded-xl" />
             <div className="w-2/3 h-4 skeleton rounded-lg" />
          </div>
       </div>
       <div className="w-full h-20 skeleton rounded-[1.5rem] mb-8" />
       <div className="mt-auto flex gap-4">
          <div className="flex-1 h-12 skeleton rounded-2xl" />
          <div className="flex-1 h-12 skeleton rounded-2xl" />
       </div>
    </div>
  );
}


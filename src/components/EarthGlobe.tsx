"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { SpaceEvent } from "@/types";
import * as satellite from "satellite.js";
import SkyScoreRing from "./SkyScoreRing";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Radio, Target, Info, Rocket } from "lucide-react";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface EarthGlobeProps {
  skyScore: { score: number } | null;
  cityName: string;
  events?: SpaceEvent[];
  userLat?: number;
  userLng?: number;
}

const TLE_URL = "/api/tle";

const agencyColors: Record<string, string> = {
  ISRO: "#FF9933",
  NASA: "#3b82f6",
  SpaceX: "#ffffff",
  Others: "#8b5cf6"
};

export default function EarthGlobe({
  skyScore,
  cityName,
  events = [],
  userLat = 17.385,
  userLng = 78.4867
}: EarthGlobeProps) {
  const [issData, setIssData] = useState<{ lat: number; lng: number; alt: number } | null>(null);
  const [issPath, setIssPath] = useState<Array<{ points: Array<{ lat: number; lng: number; alt: number }> }>>([]);
  const [tleData, setTleData] = useState<{ line1: string; line2: string } | null>(null);
  const [globeReady, setGlobeReady] = useState(false);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null); // react-globe.gl type is external, any is required for the ref object itself
  const [hoveredIss, setHoveredIss] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [hoveredSite, setHoveredSite] = useState<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (globeRef.current && width > 0 && height > 0) {
          globeRef.current.width(width);
          globeRef.current.height(height);
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch(TLE_URL)
      .then(res => res.json())
      .then(data => {
        if (data.line1 && data.line2) {
          setTleData({ line1: data.line1, line2: data.line2 });
        }
      })
      .catch((err) => console.error("Failed to fetch TLE", err));
  }, []);

  useEffect(() => {
    if (!tleData) return;
    const satrec = satellite.twoline2satrec(tleData.line1, tleData.line2);

    const updateISS = () => {
      const date = new Date();
      const positionAndVelocity = satellite.propagate(satrec, date);
      const positionEci = positionAndVelocity.position;
      
      if (typeof positionEci === "object") {
        const gmst = satellite.gstime(date);
        const positionGd = satellite.eciToGeodetic(positionEci as satellite.EciVec3<number>, gmst);
        
        if (!isNaN(positionGd.latitude) && !isNaN(positionGd.longitude)) {
          const lat = satellite.degreesLat(positionGd.latitude);
          const lng = satellite.degreesLong(positionGd.longitude);
          const alt = positionGd.height;
          setIssData({ lat, lng, alt });
        }

        const path = [];
        for (let i = 0; i < 45; i++) { // 45 points
          const t = new Date(date.getTime() + i * 120000); // every 2 mins
          const p = satellite.propagate(satrec, t);
          if (typeof p.position === "object") {
            const g = satellite.gstime(t);
            const gd = satellite.eciToGeodetic(p.position as satellite.EciVec3<number>, g);
            if (!isNaN(gd.latitude) && !isNaN(gd.longitude) && !isNaN(gd.height)) {
              path.push({
                lat: satellite.degreesLat(gd.latitude),
                lng: satellite.degreesLong(gd.longitude),
                alt: gd.height / 6371 * 1.5
              });
            }
          }
        }
        setIssPath([{ points: path }]);
      }
    };

    updateISS();
    const interval = setInterval(updateISS, 1000);
    return () => clearInterval(interval);
  }, [tleData]);

  const launchSites = useMemo(() => {
    return events.filter(e => e.pad?.latitude && e.pad?.longitude).map(event => {
      const agencyName = event.agency?.name || event.launch_service_provider?.name || "Unknown";
      let color = agencyColors.Others;
      if (agencyName.includes("ISRO") || agencyName.includes("Indian")) color = agencyColors.ISRO;
      else if (agencyName.includes("NASA")) color = agencyColors.NASA;
      else if (agencyName.includes("SpaceX")) color = agencyColors.SpaceX;

      return {
        id: event.id,
        lat: parseFloat(event.pad!.latitude!),
        lng: parseFloat(event.pad!.longitude!),
        color,
        name: event.mission?.name || event.name,
        agency: agencyName,
        date: event.net
      };
    });
  }, [events]);

  const ringData = useMemo(() => {
    if (!userLat || !userLng) return [];
    return [{ lat: userLat, lng: userLng, color: '#3b82f6', maxR: 5, propagationSpeed: 2, repeatAfter: 1500 }];
  }, [userLat, userLng]);

  const htmlElements = useMemo(() => {
    const elements = [];
    if (userLat && userLng) elements.push({ id: "user", lat: userLat, lng: userLng, type: "user" });
    if (issData) elements.push({ id: "iss", lat: issData.lat, lng: issData.lng, type: "iss" });
    return elements;
  }, [userLat, userLng, issData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderHtmlElement = (d: any) => {
    const el = document.createElement("div");
    if (d.type === "user") {
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)] z-10"></div>
          <div class="absolute w-8 h-8 border border-blue-500/50 rounded-full animate-ping"></div>
          <div class="absolute -top-10 px-3 py-1 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-lg text-[9px] font-black text-blue-400 uppercase tracking-widest whitespace-nowrap shadow-2xl">
            Ground Terminal: Locked
          </div>
        </div>
      `;
    } else if (d.type === "iss") {
      el.innerHTML = `
        <div class="flex flex-col items-center cursor-pointer group" id="iss-marker">
          <div class="relative w-12 h-6 flex items-center justify-center">
             <div class="absolute inset-0 bg-blue-400/20 blur-lg rounded-full animate-pulse"></div>
             <svg width="40" height="20" viewBox="0 0 40 20" class="relative z-10 filter drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))">
                <rect x="14" y="8" width="12" height="4" fill="#fff" rx="1"/>
                <rect x="0" y="4" width="10" height="12" fill="#0ea5e9" stroke="#38bdf8" stroke-width="0.5"/>
                <rect x="30" y="4" width="10" height="12" fill="#0ea5e9" stroke="#38bdf8" stroke-width="0.5"/>
                <rect x="10" y="9.5" width="20" height="1" fill="#fff" opacity="0.5"/>
             </svg>
          </div>
          <div class="mt-2 flex flex-col items-center">
             <span class="text-[8px] font-black text-blue-400 uppercase tracking-[0.3em] bg-black/40 px-2 py-0.5 rounded-full border border-blue-500/20 backdrop-blur-sm">ISS-SIG: 94%</span>
          </div>
        </div>
      `;
      el.onmouseenter = () => setHoveredIss(true);
      el.onmouseleave = () => setHoveredIss(false);
    }
    return el;
  };

  useEffect(() => {
    if (globeRef.current && globeReady) {
      const controls = globeRef.current.controls();
      controls.autoRotate = !hoveredIss && !hoveredSite;
      controls.autoRotateSpeed = 0.3;
      controls.enableZoom = true;
      controls.enablePan = false;
      
      // Focus on user location on start
      if (userLat && userLng) {
        globeRef.current.pointOfView({ lat: userLat, lng: userLng, altitude: 2.2 }, 1000);
      }
    }
  }, [globeReady, hoveredIss, hoveredSite, userLat, userLng]);

  return (
    <div ref={containerRef} className="relative w-full h-full group/globe">
      {/* 3D Globe */}
      <Globe
        ref={globeRef}
        width={containerRef.current?.clientWidth || 600}
        height={containerRef.current?.clientHeight || 600}
        backgroundColor="#00000000"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        showAtmosphere={true}
        atmosphereColor="#1d4ed8"
        atmosphereAltitude={0.25}
        
        // Rings around user
        ringsData={ringData}
        ringColor={() => (t: number) => `rgba(59, 130, 246, ${1 - t})`}
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatAfter"

        // ISS and User Elements
        htmlElementsData={htmlElements}
        htmlElement={renderHtmlElement}
        htmlAltitude={0.15}
        
        // Orbit Path
        pathsData={issPath}
        pathPoints="points"
        pathPointLat="lat"
        pathPointLng="lng"
        pathPointAlt="alt"
        pathColor={() => 'rgba(96, 165, 250, 0.4)'}
        pathDashLength={0.8}
        pathDashGap={0.3}
        pathDashAnimateTime={3000}
        pathStroke={2}

        // Launch Sites
        pointsData={launchSites}
        pointColor="color"
        pointAltitude={0.02}
        pointRadius={0.6}
        onPointHover={(point: unknown) => setHoveredSite(point)}
        onPointClick={(point: unknown) => {
          if (point) window.location.href = `/events/${(point as { id: string }).id}`;
        }}
        
        onGlobeReady={() => setGlobeReady(true)}
      />

      {/* Loading State or Cinematic HUD */}
      {!tleData ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
           <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-black text-blue-400 uppercase tracking-widest animate-pulse">Connecting to ISS...</span>
           </div>
        </div>
      ) : (
      <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between">
         <div className="flex justify-between items-start">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-500" />
                  <div className="h-[1px] w-12 bg-gradient-to-r from-blue-500 to-transparent" />
                  <span className="text-[10px] font-mono text-blue-400 tracking-[0.4em] uppercase">Target Locked: {cityName}</span>
               </div>
               <div className="space-y-1 pl-8">
                  <div className="flex items-center gap-3">
                     <span className="text-[9px] font-mono text-slate-600 uppercase">Sector 7-G</span>
                     <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                  </div>
               </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 pointer-events-auto"
            >
               <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-400" />
               </div>
               <div>
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Signal Stream</div>
                  <div className="text-xl font-black text-white italic uppercase tracking-tighter">Encrypted</div>
               </div>
            </motion.div>
         </div>

         <div className="flex justify-between items-end">
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-3 group/info pointer-events-auto cursor-help">
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 transition-colors group-hover/info:text-blue-400 group-hover/info:border-blue-400/30">
                     <Info className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest opacity-0 group-hover/info:opacity-100 transition-opacity">Orbital Dynamics Visualization v4.2</span>
               </div>
            </div>

            {/* Sky Score overlay — bottom center of globe (re-implemented integrated style) */}
            <div className="flex flex-col items-center gap-4 pointer-events-auto mb-[-20px] ml-[-150px]">
               {skyScore && (
                 <div className="relative group/score">
                    <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-150 opacity-0 group-hover/score:opacity-100 transition-opacity" />
                    <SkyScoreRing score={skyScore.score} size={180} />
                 </div>
               )}
            </div>
         </div>
      </div>
      )}

      {/* Floating Tooltips */}
      <AnimatePresence>
        {hoveredIss && issData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute top-32 left-10 z-50 p-6 rounded-[2rem] border border-blue-500/30 bg-[#0a0a0f]/80 backdrop-blur-2xl text-white pointer-events-auto shadow-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Rocket className="w-5 h-5 text-blue-400" />
               </div>
               <div>
                  <h4 className="font-black text-sm uppercase italic tracking-tight">ISS Station</h4>
                  <div className="flex items-center gap-1.5">
                     <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Active Link</span>
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
               <div className="space-y-1">
                  <div className="text-slate-500 uppercase">Altitude</div>
                  <div className="text-blue-400">{issData.alt.toFixed(0)} KM</div>
               </div>
               <div className="space-y-1">
                  <div className="text-slate-500 uppercase">Velocity</div>
                  <div className="text-blue-400">7.66 KM/S</div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Site Tooltip */}
      <AnimatePresence>
        {hoveredSite && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-32 right-10 z-50 p-6 rounded-[2rem] border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-2xl text-white pointer-events-none shadow-3xl max-w-xs"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredSite.color }} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{hoveredSite.agency}</span>
            </div>
            <h5 className="text-lg font-black italic uppercase tracking-tighter leading-tight mb-2">{hoveredSite.name}</h5>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-white/5 pt-3">
               <span>DATE_RECV</span>
               <span className="text-blue-400">{new Date(hoveredSite.date).toLocaleDateString()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

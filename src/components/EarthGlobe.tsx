"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { SpaceEvent } from "@/types";
import * as satellite from "satellite.js";
import SkyScoreRing from "./SkyScoreRing";
import { motion, AnimatePresence } from "framer-motion";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface EarthGlobeProps {
  skyScore: { score: number } | null;
  skyLoading: boolean;
  skyError: boolean;
  cityName: string;
  onRetry: () => void;
  events?: SpaceEvent[];
  userLat?: number;
  userLng?: number;
}

const TLE_URL = "https://celestrak.org/GPPD/gp.php?CATNR=25544&FORMAT=TLE";

const agencyColors: Record<string, string> = {
  ISRO: "#FF9933",
  NASA: "#3b82f6",
  SpaceX: "#ffffff",
  Others: "#8b5cf6"
};

export default function EarthGlobe({
  skyScore,
  skyLoading,
  skyError,
  cityName,
  onRetry,
  events = [],
  userLat = 17.385,
  userLng = 78.4867
}: EarthGlobeProps) {
  const [issData, setIssData] = useState<{ lat: number; lng: number; alt: number } | null>(null);
  const [issPath, setIssPath] = useState<any[]>([]);
  const [tleData, setTleData] = useState<{ line1: string; line2: string } | null>(null);
  const [globeReady, setGlobeReady] = useState(false);
  
  const globeRef = useRef<any>(null);
  const [hoveredIss, setHoveredIss] = useState(false);
  const [hoveredSite, setHoveredSite] = useState<any>(null);
  const [globeHeight, setGlobeHeight] = useState(420);

  useEffect(() => {
    const handleResize = () => {
      setGlobeHeight(window.innerWidth < 768 ? 350 : 420);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch TLE
  useEffect(() => {
    fetch(TLE_URL)
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split("\n");
        if (lines.length >= 3) {
          setTleData({ line1: lines[1], line2: lines[2] });
        } else if (lines.length >= 2) {
          setTleData({ line1: lines[0], line2: lines[1] });
        }
      })
      .catch((err) => console.error("Failed to fetch TLE", err));
  }, []);

  // Propagate ISS position
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
        
        const lat = satellite.degreesLat(positionGd.latitude);
        const lng = satellite.degreesLong(positionGd.longitude);
        const alt = positionGd.height;
        
        setIssData({ lat, lng, alt });

        // Calculate orbit path (next 100 points, 1 point per min)
        const path = [];
        for (let i = 0; i < 100; i++) {
          const t = new Date(date.getTime() + i * 60000);
          const p = satellite.propagate(satrec, t);
          if (typeof p.position === "object") {
            const g = satellite.gstime(t);
            const gd = satellite.eciToGeodetic(p.position as satellite.EciVec3<number>, g);
            path.push({
              lat: satellite.degreesLat(gd.latitude),
              lng: satellite.degreesLong(gd.longitude),
              alt: gd.height / 6371 * 1.5 // scale alt for globe visualization relative to earth radius
            });
          }
        }
        setIssPath([{ points: path }]);
      }
    };

    updateISS();
    const interval = setInterval(updateISS, 1000);
    return () => clearInterval(interval);
  }, [tleData]);

  // Launch Sites
  const launchSites = useMemo(() => {
    const sites: any[] = [];
    events.forEach(event => {
      if (event.pad && event.pad.latitude && event.pad.longitude) {
        const agencyName = event.agency?.name || event.launch_service_provider?.name || "Unknown";
        let color = agencyColors.Others;
        if (agencyName.includes("ISRO") || agencyName.includes("Indian")) color = agencyColors.ISRO;
        else if (agencyName.includes("NASA")) color = agencyColors.NASA;
        else if (agencyName.includes("SpaceX")) color = agencyColors.SpaceX;

        sites.push({
          id: event.id,
          lat: parseFloat(event.pad.latitude as string),
          lng: parseFloat(event.pad.longitude as string),
          color,
          name: event.mission?.name || event.name,
          agency: agencyName,
          date: event.net
        });
      }
    });
    return sites;
  }, [events]);

  const htmlElements = useMemo(() => {
    const elements = [];
    if (userLat && userLng) {
      elements.push({ id: "user", lat: userLat, lng: userLng, type: "user" });
    }
    if (issData) {
      elements.push({ id: "iss", lat: issData.lat, lng: issData.lng, type: "iss" });
    }
    return elements;
  }, [userLat, userLng, issData]);

  const renderHtmlElement = (d: any) => {
    const el = document.createElement("div");
    if (d.type === "user") {
      el.innerHTML = `
        <div style="position:relative; width:12px; height:12px;">
          <div style="position:absolute; width:12px; height:12px; background:#22c55e; border-radius:50%;"></div>
          <div style="position:absolute; width:12px; height:12px; background:#22c55e; border-radius:50%; animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;"></div>
          <div style="position:absolute; top:14px; left:-12px; color:white; font-size:11px; font-weight:bold; text-shadow: 0px 1px 4px rgba(0,0,0,0.8); width: 40px; text-align:center;">📍 You</div>
        </div>
      `;
    } else if (d.type === "iss") {
      const svg = `
        <svg width="32" height="16" viewBox="0 0 32 16">
          <rect x="10" y="6" width="12" height="4" fill="#E2E8F0" rx="1"/>
          <rect x="0" y="7" width="10" height="2" fill="#38BDF8"/>
          <rect x="22" y="7" width="10" height="2" fill="#38BDF8"/>
          <circle cx="16" cy="8" r="2" fill="#FBBF24"/>
        </svg>
      `;
      el.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;" id="iss-marker">
          ${svg}
          <div style="color:white; font-size:11px; font-weight:bold; text-align:center; text-shadow:0 1px 4px rgba(0,0,0,0.8); margin-top:2px;">ISS</div>
        </div>
      `;
      el.onmouseenter = () => setHoveredIss(true);
      el.onmouseleave = () => setHoveredIss(false);
      el.onclick = () => setHoveredIss(prev => !prev);
    }
    return el;
  };

  useEffect(() => {
    if (globeRef.current && globeReady) {
      globeRef.current.controls().autoRotate = !hoveredIss && !hoveredSite;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.controls().enableZoom = true;
    }
  }, [globeReady, hoveredIss, hoveredSite]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: `${globeHeight}px` }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}} />
      
      {/* 3D Globe */}
      <Globe
        ref={globeRef}
        height={globeHeight}
        backgroundColor="#00000000"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        showAtmosphere={true}
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.15}
        
        // Day/Night and Clouds
        globeConfig={{
           showGraticules: false,
        }}
        
        // ISS and User Elements
        htmlElementsData={htmlElements}
        htmlElement={renderHtmlElement}
        htmlAltitude={0.05}
        
        // Orbit Path
        pathsData={issPath}
        pathPoints="points"
        pathPointLat="lat"
        pathPointLng="lng"
        pathPointAlt="alt"
        pathColor={() => 'rgba(59, 130, 246, 0.7)'}
        pathDashLength={0.1}
        pathDashGap={0.02}
        pathDashAnimateTime={4000}

        // Launch Sites
        pointsData={launchSites}
        pointColor="color"
        pointAltitude={0.01}
        pointRadius={0.4}
        onPointHover={(point: any) => setHoveredSite(point)}
        onPointClick={(point: any) => {
          if (point) window.location.href = `/events/${point.id}`;
        }}
        
        onGlobeReady={() => setGlobeReady(true)}
      />

      {/* ISS Info Overlay */}
      <AnimatePresence>
        {hoveredIss && issData && (
          <motion.div
            initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            className="absolute top-4 left-4 z-20 p-4 rounded-xl border border-white/10 bg-black/50 backdrop-blur-md text-white pointer-events-auto"
          >
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-xl">🛸</span> International Space Station
            </h4>
            <div className="text-sm space-y-1.5 opacity-90 font-mono">
              <p>
                <span className="text-slate-400 inline-block w-20">LAT/LNG</span>
                {issData.lat.toFixed(4)}°, {issData.lng.toFixed(4)}°
              </p>
              <p>
                <span className="text-slate-400 inline-block w-20">ALTITUDE</span>
                ~408 km
              </p>
              <p>
                <span className="text-slate-400 inline-block w-20">SPEED</span>
                ~27,600 km/h
              </p>
            </div>
            <a 
              href="https://www.nasa.gov/multimedia/nasatv/iss_ustream.html" 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 transition-colors text-sm font-medium"
            >
              Watch Live <span aria-hidden="true">→</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launch Point Tooltip Overlay */}
      <AnimatePresence>
        {hoveredSite && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-4 right-4 z-20 p-3 rounded-xl border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md text-white pointer-events-none max-w-xs"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredSite.color }} />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{hoveredSite.agency}</span>
            </div>
            <h5 className="font-bold text-sm leading-tight">{hoveredSite.name}</h5>
            {hoveredSite.date && (
              <p className="text-xs text-blue-400 mt-1">
                {new Date(hoveredSite.date).toLocaleDateString()}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sky Score overlay — bottom center of globe */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center pb-2 pointer-events-none">
        {skyLoading ? (
          <div className="w-[160px] h-[160px] rounded-full skeleton" />
        ) : skyError ? (
          <div className="flex flex-col items-center gap-2 text-slate-500 pointer-events-auto">
            <div className="w-[160px] h-[160px] rounded-full border border-white/[0.05] flex items-center justify-center">
              <span className="text-xs text-center px-4">Score unavailable</span>
            </div>
            <button onClick={onRetry} className="text-xs text-blue-400 hover:text-blue-300">
              Retry
            </button>
          </div>
        ) : skyScore ? (
          <div className="pointer-events-auto">
            <SkyScoreRing score={skyScore.score} size={160} />
          </div>
        ) : null}
        <p className="text-slate-400 text-sm mt-2 font-medium bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">{cityName}</p>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Loader2, Navigation } from "lucide-react";

const MAJOR_CITIES = [
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Delhi", lat: 28.7041, lng: 77.1025 },
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
];

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number, city: string) => void;
  currentCity?: string | null;
  loading?: boolean;
}

export default function LocationPicker({ onLocationChange, currentCity, loading }: LocationPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = MAJOR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  function handleGPS() {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
          );
          const data = await res.json();
          const city = data.city || data.locality || "Your Location";
          onLocationChange(lat, lng, city);
        } catch {
          onLocationChange(lat, lng, "Your Location");
        }
        setGpsLoading(false);
      },
      () => setGpsLoading(false)
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={currentCity || "Search city..."}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.07] transition-all"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 animate-spin" />
          )}
        </div>

        {/* GPS button */}
        <button
          onClick={handleGPS}
          disabled={gpsLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-xl text-blue-400 text-sm font-medium transition-all disabled:opacity-60"
        >
          {gpsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">GPS</span>
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a2e] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl z-50"
          >
            {filtered.map((city) => (
              <button
                key={city.name}
                onClick={() => {
                  onLocationChange(city.lat, city.lng, city.name);
                  setQuery("");
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-blue-500/10 hover:text-white transition-colors text-left"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                {city.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

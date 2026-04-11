"use client";

import { useState, useEffect } from "react";

export type LocationState = {
  lat: number | null;
  lng: number | null;
  city: string | null;
  loading: boolean;
  error: string | null;
};

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    city: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation not supported by your browser.",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let city = "Unknown Location";

        try {
          // Free reverse geocoding API, suitable for client-side without a key
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (res.ok) {
            const data = await res.json();
            city = data.city || data.locality || city;
          }
        } catch (e) {
          console.error("Failed to reverse geocode:", e);
        }

        setLocation({
          lat: latitude,
          lng: longitude,
          city,
          loading: false,
          error: null,
        });
      },
      (error) => {
        setLocation({
          lat: null,
          lng: null,
          city: null,
          loading: false,
          error: error.message,
        });
      }
    );
  }, []);

  return location;
}

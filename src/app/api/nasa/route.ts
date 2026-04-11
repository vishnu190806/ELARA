import { NextResponse } from "next/server";
import { apiCache } from "@/lib/api-cache";

// EONET (Earth Observatory Natural Event Tracker) API
const NASA_EONET_URL = "https://eonet.gsfc.nasa.gov/api/v3/events?limit=5";
const CACHE_KEY = "nasa_eonet_events";
const CACHE_TTL = 3600;

export async function GET() {
  try {
    const cachedData = apiCache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=59`,
          "X-Cache": "HIT"
        }
      });
    }

    const res = await fetch(NASA_EONET_URL, {
      next: { revalidate: CACHE_TTL },
      headers: { Accept: "application/json" }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch NASA API: ${res.status}`);
    }

    const data = await res.json();
    apiCache.set(CACHE_KEY, data, CACHE_TTL);

    return NextResponse.json(data, {
      headers: {
         "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=59`,
         "X-Cache": "MISS"
      }
    });
  } catch (error: any) {
    console.error("NASA API Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while fetching natural events" },
      { status: 500 }
    );
  }
}

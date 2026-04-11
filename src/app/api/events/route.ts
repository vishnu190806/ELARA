import { NextResponse } from "next/server";
import { apiCache } from "@/lib/api-cache";

const SPACE_DEVS_URL = "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=10";
const CACHE_KEY = "space_devs_upcoming";
const CACHE_TTL = 3600; // 1 hour

export async function GET() {
  try {
    // 1. Check local memory cache
    const cachedData = apiCache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=59`,
          "X-Cache": "HIT"
        }
      });
    }

    // 2. Fetch using Next.js caching logic
    const res = await fetch(SPACE_DEVS_URL, {
      next: { revalidate: CACHE_TTL },
      headers: {
        Accept: "application/json"
      }
    });

    if (!res.ok) {
      if (res.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded for external API." },
          { status: 429 }
        );
      }
      throw new Error(`Failed to fetch Space Devs API: ${res.status}`);
    }

    const data = await res.json();
    
    // 3. Store in memory cache
    apiCache.set(CACHE_KEY, data, CACHE_TTL);

    return NextResponse.json(data, {
      headers: {
         "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=59`,
         "X-Cache": "MISS"
      }
    });
  } catch (error: any) {
    console.error("Space Devs Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while fetching events" },
      { status: 500 }
    );
  }
}

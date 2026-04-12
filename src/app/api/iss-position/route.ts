import { NextResponse } from "next/server";
import { getTleData } from "@/lib/tleFetcher";
import * as satellite from "satellite.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Attempt to get live position directly from wheretheiss.at for standard JSON
    const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544", {
      next: { revalidate: 10 } // 10 seconds cache
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        lat: data.latitude,
        lng: data.longitude,
        altitude: data.altitude,
        velocity: data.velocity,
        visibility: data.visibility,
        source: "wheretheiss.at"
      }, {
        headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=5" }
      });
    }
  } catch (error) {
    console.warn("Wheretheiss.at direct position fetch failed, falling back to TLE propagation", error);
  }

  // Fallback: Use TLE to calculate position
  try {
    const tle = await getTleData();
    const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
    const date = new Date();
    const positionAndVelocity = satellite.propagate(satrec, date);
    
    if (positionAndVelocity.position && typeof positionAndVelocity.position !== 'boolean') {
      const gmst = satellite.gstime(date);
      const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
      
      const longitude = satellite.degreesLong(positionGd.longitude);
      const latitude = satellite.degreesLat(positionGd.latitude);
      const altitude = positionGd.height;
      
      // Calculate velocity (magnitude of velocity vector)
      let velocity = 27600; // default approx km/h
      if (positionAndVelocity.velocity && typeof positionAndVelocity.velocity !== 'boolean') {
         const vEci = positionAndVelocity.velocity;
         // velocity in km/s, convert to km/h
         velocity = Math.sqrt(vEci.x * vEci.x + vEci.y * vEci.y + vEci.z * vEci.z) * 3600;
      }

      return NextResponse.json({
        lat: latitude,
        lng: longitude,
        altitude: altitude,
        velocity: velocity,
        visibility: "daylight", // Cannot easily determine eclipse state from basic satrec
        source: "satellite.js-calculated"
      }, {
        headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=5" }
      });
    }
  } catch (error) {
    console.error("TLE propagation fallback failed:", error);
  }

  return NextResponse.json({ error: "Failed to determine ISS position" }, { status: 500 });
}

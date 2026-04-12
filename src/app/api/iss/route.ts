import { NextResponse } from "next/server";

// Proxy ISS position from HTTP API to avoid mixed-content browser errors
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const res = await fetch("http://api.open-notify.org/iss-now.json", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("ISS API error");
    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    // Return last known position if API fails
    return NextResponse.json({
      iss_position: { latitude: "28.6139", longitude: "77.2090" },
      timestamp: Math.floor(Date.now() / 1000),
      message: "success (fallback)",
    });
  }
}

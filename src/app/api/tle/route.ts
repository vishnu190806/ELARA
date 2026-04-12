import { NextResponse } from "next/server";
import { getTleData } from "@/lib/tleFetcher";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTleData();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    console.error("TLE API Error:", error);
    // Should never reach here due to fallback in getTleData, but just in case
    return NextResponse.json({ error: "Failed to fetch TLE" }, { status: 500 });
  }
}

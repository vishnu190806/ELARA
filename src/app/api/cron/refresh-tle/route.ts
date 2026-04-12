import { NextResponse } from "next/server";
import { fetchTleFromSources, FALLBACK_TLE } from "@/lib/tleFetcher";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Only allow cron requests in production, but allow testing locally
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    const newData = await fetchTleFromSources();

    let saved = false;
    // Only save if it's actual live data, not the fallback
    if (newData.source !== 'cached-fallback' && adminDb) {
      await adminDb.collection('system_cache').doc('iss_tle').set({
        line0: newData.line0,
        line1: newData.line1,
        line2: newData.line2,
        source: newData.source,
        updatedAt: newData.timestamp
      });
      saved = true;
    }

    return NextResponse.json({ 
      success: true, 
      source: newData.source,
      savedToCache: saved
    });
  } catch (error) {
    console.error("Cron Error Refresh TLE:", error);
    return NextResponse.json({ error: "Failed to refresh TLE" }, { status: 500 });
  }
}

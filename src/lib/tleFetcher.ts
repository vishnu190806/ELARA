import { adminDb } from '@/lib/firebase/admin';

export const FALLBACK_TLE = {
  line0: "ISS (ZARYA)",
  line1: "1 25544U 98067A   26101.50000000  .00008000  00000-0  14000-3 0  9999",
  line2: "2 25544  51.6400  45.0000  0003000  90.0000 270.0000  15.50000000  1234",
  source: "cached-fallback",
  cached: true,
  timestamp: Date.now()
};

const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

export async function fetchTleFromSources() {
  const signal = AbortSignal.timeout(5000); // 5 sec timeout per request

  // SOURCE 1 - wheretheiss.at
  try {
    const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544/tles?format=text", { signal });
    if (res.ok) {
      const text = await res.text();
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length >= 3) {
        console.log("TLE fetched successfully from wheretheiss.at");
        return {
          line0: lines[0],
          line1: lines[1],
          line2: lines[2],
          source: "wheretheiss.at",
          cached: false,
          timestamp: Date.now()
        };
      }
    }
  } catch (e) { console.warn("wheretheiss.at failed:", e); }

  // SOURCE 2 - ivanstanojevic
  try {
    const res = await fetch("https://tle.ivanstanojevic.me/api/tle/25544", { signal });
    if (res.ok) {
      const data = await res.json();
      if (data && data.line1 && data.line2) {
        console.log("TLE fetched successfully from ivanstanojevic.me");
        return {
          line0: data.name || "ISS (ZARYA)",
          line1: data.line1,
          line2: data.line2,
          source: "ivanstanojevic",
          cached: false,
          timestamp: Date.now()
        };
      }
    }
  } catch (e) { console.warn("ivanstanojevic failed:", e); }

  // SOURCE 3 - celestrak-gp
  const celestrakHeaders = {
    'User-Agent': 'ELARA-SpaceApp/1.0',
    'Accept': 'text/plain'
  };
  try {
    const res = await fetch("https://celestrak.org/GPPD/gp.php?CATNR=25544&FORMAT=TLE", { headers: celestrakHeaders, signal });
    if (res.ok) {
      const text = await res.text();
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length >= 3) {
        console.log("TLE fetched successfully from celestrak-gp");
        return {
          line0: lines[0],
          line1: lines[1],
          line2: lines[2],
          source: "celestrak-gp",
          cached: false,
          timestamp: Date.now()
        };
      }
    }
  } catch (e) { console.warn("celestrak-gp failed:", e); }

  // SOURCE 4 - celestrak-satcat
  try {
    const res = await fetch("https://celestrak.org/satcat/tle.php?CATNR=25544", { headers: celestrakHeaders, signal });
    if (res.ok) {
      const text = await res.text();
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length >= 3) {
        console.log("TLE fetched successfully from celestrak-satcat");
        return {
          line0: lines[0],
          line1: lines[1],
          line2: lines[2],
          source: "celestrak-satcat",
          cached: false,
          timestamp: Date.now()
        };
      }
    }
  } catch (e) { console.warn("celestrak-satcat failed:", e); }

  console.error("All live TLE sources failed! Using emergency fallback.");
  return FALLBACK_TLE;
}

export async function getTleData() {
  try {
    // 1. Check Firestore Cache
    if (adminDb) {
      const docRef = adminDb.collection('system_cache').doc('iss_tle');
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const data = docSnap.data();
        if (data && data.updatedAt && (Date.now() - data.updatedAt < CACHE_TTL)) {
          return {
            line0: data.line0,
            line1: data.line1,
            line2: data.line2,
            source: data.source,
            cached: true,
            timestamp: data.updatedAt
          };
        }
      }
    }
  } catch (err) {
    console.error("Failed to read TLE from Firestore:", err);
  }

  // 2. Fetch fresh from sources
  const newData = await fetchTleFromSources();

  // 3. Update Firestore if not fallback
  if (newData.source !== 'cached-fallback' && adminDb) {
    try {
      await adminDb.collection('system_cache').doc('iss_tle').set({
        line0: newData.line0,
        line1: newData.line1,
        line2: newData.line2,
        source: newData.source,
        updatedAt: newData.timestamp
      });
    } catch (err) {
      console.error("Failed to cache TLE in Firestore:", err);
    }
  }

  return newData;
}

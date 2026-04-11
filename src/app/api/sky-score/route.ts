import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getCloudCover } from '@/lib/weather';
import { getMoonIlluminationPercentage } from '@/lib/astronomy';
import { calculateSkyScore } from '@/lib/skyScore';

// Haversine formula to find distance between two lat/lngs
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');

    if (!lat && !lng) {
      return NextResponse.json({ error: "Missing lat/lng parameters" }, { status: 400 });
    }

    // 1. Get Cloud Cover (0-100)
    const cloudCover = await getCloudCover(lat, lng);

    // 2. Get Moon Brightness (0-100)
    const moonBrightness = getMoonIlluminationPercentage(new Date());

    // 3. Get Light Pollution (0-100)
    let lightPollution = 50; // Fallback average
    let nearestZoneName = "Unknown";
    
    try {
      const snapshot = await adminDb.collection('light_pollution_zones').get();
      let minDistance = Infinity;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.lat && data.lng) {
          const dist = getDistanceFromLatLonInKm(lat, lng, data.lat, data.lng);
          if (dist < minDistance) {
            minDistance = dist;
            lightPollution = data.pollution;
            nearestZoneName = data.city;
          }
        }
      });
      
      // If we are over 500km away from any known zone, we might just use the fallback
      if (minDistance > 500) {
        lightPollution = 50;
        nearestZoneName = "Generic Regional Estimate";
      }
    } catch (e) {
      console.error("Firestore light pollution error:", e);
    }

    const score = calculateSkyScore(cloudCover, lightPollution, moonBrightness);

    return NextResponse.json({
      score,
      metrics: {
        cloudCover,
        lightPollution,
        moonBrightness,
      },
      meta: {
        nearestZone: nearestZoneName,
      }
    });
  } catch (error) {
    console.error("Sky Score Error:", error);
    return NextResponse.json({ error: "Failed to calculate sky score" }, { status: 500 });
  }
}

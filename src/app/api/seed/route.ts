import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

const STATIC_ZONES = [
  { city: "New York", lat: 40.7128, lng: -74.0060, pollution: 95 },
  { city: "Los Angeles", lat: 34.0522, lng: -118.2437, pollution: 90 },
  { city: "Death Valley", lat: 36.5323, lng: -116.9325, pollution: 5 },
  { city: "Yellowstone", lat: 44.4280, lng: -110.5885, pollution: 10 },
  { city: "London", lat: 51.5074, lng: -0.1278, pollution: 85 },
  { city: "Mauna Kea", lat: 19.8206, lng: -155.4681, pollution: 2 },
  { city: "Atacama Desert", lat: -23.8634, lng: -69.1328, pollution: 1 },
];

export async function GET() {
  try {
    const batch = adminDb.batch();
    const collection = adminDb.collection("light_pollution_zones");

    STATIC_ZONES.forEach(zone => {
      const docRef = collection.doc(zone.city.replace(/\s+/g, '_').toLowerCase());
      batch.set(docRef, zone);
    });

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      count: STATIC_ZONES.length, 
      message: "Light pollution zones successfully seeded to Firestore." 
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Seeding error:", errorMsg);
    return NextResponse.json({ error: "Failed to seed data.", details: errorMsg }, { status: 500 });
  }
}

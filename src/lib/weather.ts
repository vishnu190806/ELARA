/**
 * Fetches the current cloud cover percentage for a given latitude and longitude.
 * Uses the Open-Meteo free API (no key required, 10,000 req/day limit).
 */
export async function getCloudCover(lat: number, lng: number): Promise<number> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=cloud_cover`
    );
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API returned ${response.status}`);
    }
    
    const data = await response.json();
    return data?.current?.cloud_cover || 0;
  } catch (error) {
    console.error("Failed to fetch cloud cover:", error);
    return 0; // Fallback to 0 if the API fails
  }
}

/**
 * Calculates the ELARA Sky Score from 1.0 (Worst) to 10.0 (Best).
 * 
 * Weights:
 * - 40% Cloud Cover (0-100)
 * - 35% Light Pollution (0-100)
 * - 25% Moon Brightness (0-100)
 */
export function calculateSkyScore(
  cloudCover: number,
  lightPollution: number, 
  moonBrightness: number
): number {
  // A value of 100 in any of these metrics reduces visibility.
  const penalty = (cloudCover * 0.40) + (lightPollution * 0.35) + (moonBrightness * 0.25);
  
  // Convert 0-100 penalty scale to a 10-0 goodness scale
  const rawScore = 10 - (penalty / 10);
  
  // Return clamped between 1 and 10, rounded to 1 decimal place
  return Math.max(1, Math.min(10, Math.round(rawScore * 10) / 10));
}

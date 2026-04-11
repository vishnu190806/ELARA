/**
 * Calculates the current moon illumination percentage (0-100)
 * Uses astronomia for accurate Julian Date conversion and applies
 * the standard synodic month calculation.
 */
export function getMoonIlluminationPercentage(date: Date = new Date()): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  
  // Known new moon JD (approx)
  const KNOWN_NEW_MOON = 2451550.1;
  const SYNODIC_MONTH = 29.53058868;
  
  const daysSinceNew = jd - KNOWN_NEW_MOON;
  const newMoons = daysSinceNew / SYNODIC_MONTH;
  
  // Get the fractional part of the current cycle (0.0 to 1.0)
  const cycleFraction = newMoons - Math.floor(newMoons);
  
  // Calculate illuminated fraction: (1 - cos(phase_angle)) / 2
  // where phase angle goes from 0 to 2PI over the cycle
  const phaseAngle = cycleFraction * 2 * Math.PI;
  const illuminatedFraction = (1 - Math.cos(phaseAngle)) / 2;
  
  // Return as percentage rounded to 1 decimal
  return Math.round(illuminatedFraction * 1000) / 10;
}

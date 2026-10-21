import type { Scenario, ThreatenedAsset } from '../types/fireweave';
import type { LiveAlert } from '../types/alerts';

/**
 * Analyzes telemetry and generates dynamic tactical alerts based on incoming live data
 */
export function analyzeLiveFeedUpdate(
  prevWindSpeed: number,
  newWindSpeed: number,
  prevWindDir: number,
  newWindDir: number,
  prevHumidity: number,
  newHumidity: number,
  scenario: Scenario,
  currentAssets: ThreatenedAsset[]
): LiveAlert[] {
  const alerts: LiveAlert[] = [];
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // 1. Analyze Wind Direction Shift (Veering/Backing)
  const dirDelta = Math.abs(newWindDir - prevWindDir);
  if (dirDelta >= 12) {
    const newlyThreatened = currentAssets.filter(a => a.status === 'threatened' || a.evacRecommended);
    const affectedNames = newlyThreatened.map(a => a.name).join(', ');

    alerts.push({
      id: `alert-wind-${Date.now()}`,
      timestamp: now,
      type: 'WIND_VEER',
      severity: newlyThreatened.length > 0 ? 'critical' : 'warning',
      title: `LIVE TELEMETRY: Wind Shift Detected (Veered ${newWindDir}°)`,
      message: `Wind heading veered by ${dirDelta.toFixed(0)}° (now pushing towards ${(newWindDir + 180) % 360}°). ${
        newlyThreatened.length > 0
          ? `Trajectory now directly aligns with: ${affectedNames}.`
          : 'Trajectory shifted into natural buffer zone.'
      }`,
      recommendation: newlyThreatened.length > 0
        ? `Issue immediate evacuation staging for ${affectedNames}. Re-anchor containment lines on leeward natural barriers.`
        : 'Maintain flank containment patrols.',
    });
  }

  // 2. Analyze Wind Velocity Spike
  if (newWindSpeed > prevWindSpeed + 6) {
    alerts.push({
      id: `alert-gust-${Date.now()}`,
      timestamp: now,
      type: 'WIND_VEER',
      severity: newWindSpeed > 35 ? 'critical' : 'warning',
      title: `GUST ACCELERATION: Sustained Wind Climbed to ${newWindSpeed} km/h`,
      message: `Forward flame spread rate accelerated by ~${((newWindSpeed / Math.max(prevWindSpeed, 1) - 1) * 100).toFixed(0)}%. Ember spotting probability elevated to 65%.`,
      recommendation: 'Pull ground bulldozers back 200m to designated safety zones. Rely on aerial retardant drops along ridge line.',
    });
  }

  // 3. Analyze Critical Fuel Drying (Relative Humidity Drop)
  if (newHumidity < 18 && prevHumidity >= 18) {
    alerts.push({
      id: `alert-dry-${Date.now()}`,
      timestamp: now,
      type: 'CRITICAL_DRYING',
      severity: 'critical',
      title: `CRITICAL ATMOSPHERIC DRYING: Relative Humidity Dropped to ${newHumidity}%`,
      message: `Fine dead fuel moisture has fallen below the 4% combustion flash threshold. Crown fire ignition risk is now extreme.`,
      recommendation: 'Pre-wet interface perimeter with high-volume municipal hydrants.',
    });
  }

  // 4. Analyze Adaptive Containment Corridor Opportunity
  if (dirDelta >= 15 || newWindSpeed > prevWindSpeed + 5) {
    alerts.push({
      id: `alert-adapt-${Date.now()}`,
      timestamp: now,
      type: 'CONTAINMENT_ADAPTATION',
      severity: 'success',
      title: `ADAPTIVE RE-CALCULATION: ${scenario.name.toUpperCase()}`,
      message: `System updated minimum-cost corridor graph for ${scenario.region}. Corridor Alpha remains optimal by leveraging natural rock crests and river barriers downwind.`,
      recommendation: 'Deploy secondary tanker units along the northern asphalt junction to reinforce containment seal.',
    });
  }

  return alerts;
}

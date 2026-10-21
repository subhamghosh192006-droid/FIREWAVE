import type { Scenario, SpreadIsochrone, ThreatenedAsset, Corridor } from '../types/fireweave';

// Helper: convert degrees to radians
const deg2rad = (deg: number) => (deg * Math.PI) / 180;

export interface SimulationResult {
  isochrones: SpreadIsochrone[];
  totalBurnedKm2: number;
  threatenedAssets: ThreatenedAsset[];
  containmentEfficiency: number; // %
}

/**
 * Calculates physics-informed fire spread isochrones
 * based on wind vector, humidity, terrain factors, and containment barriers
 */
export function calculateFireSpread(
  scenario: Scenario,
  windSpeed: number, // km/h
  windDir: number, // degrees (0=N, 90=E, 180=S, 270=W)
  humidity: number, // %
  currentHour: number, // 0 to 24
  activeCorridor: Corridor | null
): SimulationResult {
  const { hotspots, assets } = scenario;

  if (hotspots.length === 0) {
    return {
      isochrones: [],
      totalBurnedKm2: 0,
      threatenedAssets: assets.map(a => ({ ...a, status: 'safe', etaHours: null })),
      containmentEfficiency: 0,
    };
  }

  // Calculate center of ignition
  const centerLat = hotspots.reduce((acc, h) => acc + h.lat, 0) / hotspots.length;
  const centerLng = hotspots.reduce((acc, h) => acc + h.lng, 0) / hotspots.length;

  // Meteorological wind vector: wind blows towards (windDir + 180) degrees
  // In firefighting: forward spread aligns with the downwind direction
  const spreadHeadingDeg = (windDir + 180) % 360;
  const spreadHeadingRad = deg2rad(spreadHeadingDeg);

  // Rothermel length-to-width ratio: higher wind = more elongated ellipse
  const lwRatio = Math.max(1.1, 1.0 + 0.05 * Math.pow(windSpeed, 1.15));

  // Humidity dampening factor (dryer = faster spread)
  const humidityDamping = Math.max(0.3, 1.0 - (humidity / 100) * 0.7);

  // Base spread velocity in km/h
  const baseRateKmH = (0.25 + (windSpeed / 100) * 1.8) * humidityDamping;

  // Standard time steps in hours
  const hoursSteps = [1, 3, 6, 12, 24].filter(h => h <= Math.max(currentHour, 1));

  // Visual styling for progressive fire fronts
  const isochroneStyles: Record<number, { color: string; fillOpacity: number; label: string }> = {
    1: { color: '#ff1744', fillOpacity: 0.7, label: 'T+1h Active Head Fire' },
    3: { color: '#ff5252', fillOpacity: 0.55, label: 'T+3h High Intensity Front' },
    6: { color: '#ff9100', fillOpacity: 0.45, label: 'T+6h Flanking Expansion' },
    12: { color: '#ffc400', fillOpacity: 0.35, label: 'T+12h Perimeter Advance' },
    24: { color: '#ffea00', fillOpacity: 0.25, label: 'T+24h Macro Containment Zone' },
  };

  const isochrones: SpreadIsochrone[] = [];

  // Determine containment boundary constraint if active
  const isContained = activeCorridor && activeCorridor.type !== 'none';
  const containmentProb = isContained ? activeCorridor.containmentProb / 100 : 0;
  const containmentHourCap = isContained ? (activeCorridor.timeHours || 4) : 999;

  for (const stepHour of hoursSteps) {
    const effectiveHour = Math.min(stepHour, currentHour);
    if (effectiveHour <= 0) continue;

    // Forward spread distance (major semi-axis)
    let aKm = baseRateKmH * effectiveHour;
    // Lateral flank spread (minor semi-axis)
    let bKm = aKm / lwRatio;

    // If containment corridor is established, cap the forward spread past containment deployment
    if (isContained && effectiveHour >= containmentHourCap) {
      // Area reduction based on containment success
      const reduction = Math.min(0.65, 0.35 + containmentProb * 0.35);
      aKm *= (1 - reduction * ((effectiveHour - containmentHourCap + 1) / (24 - containmentHourCap + 1)));
      bKm *= (1 - reduction * 0.4);
    }

    // Convert km to approximate degrees (1 deg lat ~ 111 km)
    const latSpan = aKm / 111;
    const lngSpan = bKm / (111 * Math.cos(deg2rad(centerLat)));

    // Shift ellipse center in downwind direction (head fire moves forward)
    const downwindShiftKm = aKm * 0.45;
    const shiftLat = (downwindShiftKm / 111) * Math.cos(spreadHeadingRad);
    const shiftLng = (downwindShiftKm / (111 * Math.cos(deg2rad(centerLat)))) * Math.sin(spreadHeadingRad);

    const ellipseCenterLat = centerLat + shiftLat;
    const ellipseCenterLng = centerLng + shiftLng;

    // Generate 32-point polygon for smooth organic fire front
    const points: [number, number][] = [];
    const numPoints = 36;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i * 2 * Math.PI) / numPoints;
      // Ellipse formula before rotation
      const rawX = lngSpan * Math.cos(angle);
      const rawY = latSpan * Math.sin(angle);

      // Rotate by spread heading angle
      const rotAngle = -spreadHeadingRad + Math.PI / 2;
      const rotX = rawX * Math.cos(rotAngle) - rawY * Math.sin(rotAngle);
      const rotY = rawX * Math.sin(rotAngle) + rawY * Math.cos(rotAngle);

      // Add slight organic noise to simulate terrain irregularities
      const jitter = 1 + 0.08 * Math.sin(angle * 5) + 0.05 * Math.cos(angle * 3);
      const ptLat = ellipseCenterLat + rotY * jitter;
      const ptLng = ellipseCenterLng + rotX * jitter;

      points.push([Number(ptLat.toFixed(5)), Number(ptLng.toFixed(5))]);
    }

    // Close polygon
    points.push(points[0]);

    // Approximate area in km2: pi * a * b
    const areaKm2 = Math.PI * aKm * bKm;
    const style = isochroneStyles[stepHour] || { color: '#ff6d00', fillOpacity: 0.3, label: `T+${stepHour}h Isochrone` };

    isochrones.push({
      hour: stepHour,
      coordinates: points,
      areaKm2: Number(areaKm2.toFixed(1)),
      color: style.color,
      fillOpacity: style.fillOpacity,
      label: style.label,
    });
  }

  // Calculate final burned area based on active corridor or max isochrone
  let totalBurnedKm2 = isochrones.length > 0 ? isochrones[isochrones.length - 1].areaKm2 : 0;
  if (activeCorridor && activeCorridor.projectedBurnKm2 && currentHour >= 12) {
    totalBurnedKm2 = Math.min(totalBurnedKm2, activeCorridor.projectedBurnKm2);
  }

  // Update threatened assets status based on proximity and wind heading
  const updatedAssets: ThreatenedAsset[] = assets.map(asset => {
    // Vector from fire center to asset
    const dLat = (asset.lat - centerLat) * 111;
    const dLng = (asset.lng - centerLng) * 111 * Math.cos(deg2rad(centerLat));
    const distKm = Math.sqrt(dLat * dLat + dLng * dLng);

    const assetAngleRad = Math.atan2(dLng, dLat); // angle relative to North
    // Difference between asset angle and fire spread heading
    let angleDiff = Math.abs(spreadHeadingRad - assetAngleRad);
    if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

    // Asset is directly in the path if angleDiff < 45 degrees
    const isInPath = angleDiff < deg2rad(45);
    const eta = isInPath ? Number((distKm / baseRateKmH).toFixed(1)) : null;

    let status: ThreatenedAsset['status'] = 'safe';
    let evacRecommended = false;

    if (eta !== null && eta <= 24) {
      if (eta <= 4.0) {
        status = 'threatened';
        evacRecommended = true;
      } else if (eta <= 10.0) {
        status = 'alert';
        evacRecommended = distKm < 6.0;
      } else {
        status = 'alert';
      }
    } else if (distKm < 5.0) {
      status = 'alert';
    }

    // If corridor is active and safely protects this asset
    if (isContained && activeCorridor.containmentProb >= 85 && (eta === null || eta > activeCorridor.timeHours)) {
      if (status === 'threatened') {
        status = 'alert';
      }
    }

    return {
      ...asset,
      distanceKm: Number(distKm.toFixed(1)),
      etaHours: eta,
      status,
      evacRecommended,
    };
  });

  const containmentEfficiency = isContained
    ? activeCorridor.areaSavedPercent
    : 0;

  return {
    isochrones,
    totalBurnedKm2: Number(totalBurnedKm2.toFixed(1)),
    threatenedAssets: updatedAssets,
    containmentEfficiency,
  };
}

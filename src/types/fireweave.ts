export type AssetType = 'community' | 'hospital' | 'infrastructure' | 'wildlife' | 'historic';
export type AssetStatus = 'safe' | 'alert' | 'threatened' | 'evacuate';
export type BarrierType = 'river' | 'ridge' | 'road' | 'lake' | 'firebreak';
export type CorridorType = 'hybrid-natural' | 'mechanical-break' | 'topographic-barrier' | 'none';

export interface Hotspot {
  id: string;
  lat: number;
  lng: number;
  frp: number; // Fire Radiative Power in MW
  confidence: number; // %
  acquired: string;
  satellite: 'MODIS' | 'VIIRS' | 'SUOMI-NPP' | 'SIMULATED';
  brightness: number; // Kelvin
}

export interface ThreatenedAsset {
  id: string;
  name: string;
  type: AssetType;
  lat: number;
  lng: number;
  details: string;
  distanceKm: number;
  etaHours: number | null; // estimated time to impact, null if safe
  status: AssetStatus;
  evacRecommended: boolean;
}

export interface NaturalBarrier {
  id: string;
  name: string;
  type: BarrierType;
  coordinates: [number, number][]; // lat, lng points
  effectiveness: number; // 0 to 1
  description: string;
}

export interface Corridor {
  id: string;
  name: string;
  shortName: string;
  type: CorridorType;
  path: [number, number][]; // polyline coordinates
  containmentProb: number; // percentage (e.g. 88%)
  projectedBurnKm2: number;
  areaSavedKm2: number;
  areaSavedPercent: number;
  ecoScore: number; // 0 to 100 (lower score = lower ecological destruction)
  crewAccess: 'High' | 'Moderate' | 'Hazardous';
  timeHours: number; // hours required to establish line
  habitatSavedHa: number;
  costEstimate: string;
  tacticalDescription: string;
  isRecommended?: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  region: string;
  country: string;
  flag: string;
  coordinates: [number, number];
  zoom: number;
  biome: string;
  elevationRange: string;
  fuelType: string;
  defaultWindSpeed: number; // km/h
  defaultWindDir: number; // degrees 0-360
  defaultTemp: number; // °C
  defaultHumidity: number; // %
  description: string;
  hotspots: Hotspot[];
  assets: ThreatenedAsset[];
  barriers: NaturalBarrier[];
  corridors: Corridor[];
}

export interface SimulationConfig {
  windSpeed: number; // km/h
  windDir: number; // degrees (0 = North, 90 = East, 180 = South, 270 = West)
  humidity: number; // %
  temp: number; // °C
  fuelMoisture: number; // 1-100
  hour: number; // current time step 0 - 24
  isPlaying: boolean;
  playSpeed: number; // 1x, 2x, 5x
  activeCorridorId: string | null;
  liveWeatherActive: boolean;
}

export interface SpreadIsochrone {
  hour: number;
  coordinates: [number, number][]; // polygon lat, lng
  areaKm2: number;
  color: string;
  fillOpacity: number;
  label: string;
}

export interface StrategyComparison {
  name: string;
  type: string;
  burnedAreaKm2: number;
  containmentProb: number;
  ecologicalImpact: number; // 0 - 100
  crewSafety: string;
  timeHours: number;
  recommended: boolean;
}

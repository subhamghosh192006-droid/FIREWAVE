import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Scenario, SpreadIsochrone, Corridor } from '../types/fireweave';
import { sound } from '../services/soundService';
import { Flame } from 'lucide-react';

interface TacticalMapProps {
  scenario: Scenario;
  isochrones: SpreadIsochrone[];
  activeCorridor: Corridor | null;
  onSelectCorridor: (corridor: Corridor) => void;
  windSpeed: number;
  windDir: number;
  onAddHotspot: (lat: number, lng: number) => void;
}

type BaseMapType = 'dark' | 'satellite' | 'topo';

export const TacticalMap: React.FC<TacticalMapProps> = ({
  scenario,
  isochrones,
  activeCorridor,
  onSelectCorridor,
  windSpeed,
  windDir,
  onAddHotspot,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups to manage dynamic updates
  const isochroneLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const hotspotLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const barrierLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const corridorLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const assetLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [baseMap, setBaseMap] = useState<BaseMapType>('dark');
  const [isAddHotspotMode, setIsAddHotspotMode] = useState<boolean>(false);

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: scenario.coordinates,
      zoom: scenario.zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom tactical zoom control on top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial base tile layer (ArcGIS Dark Gray Base - 100% Free, No API Key Required)
    const darkTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Esri, HERE, Garmin',
    }).addTo(map);
    tileLayerRef.current = darkTiles;

    // Add layer groups to map
    isochroneLayerGroupRef.current.addTo(map);
    barrierLayerGroupRef.current.addTo(map);
    corridorLayerGroupRef.current.addTo(map);
    assetLayerGroupRef.current.addTo(map);
    hotspotLayerGroupRef.current.addTo(map);

    // Map click handler for custom hotspot ignition
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (isAddHotspotMode) {
        sound.playDeploy();
        onAddHotspot(e.latlng.lat, e.latlng.lng);
        setIsAddHotspotMode(false);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update base map tile layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;

    map.removeLayer(tileLayerRef.current);

    let newUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

    if (baseMap === 'satellite') {
      newUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (baseMap === 'topo') {
      newUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
    }

    const newTiles = L.tileLayer(newUrl, {
      maxZoom: 18,
    }).addTo(map);

    tileLayerRef.current = newTiles;
  }, [baseMap]);

  // Recenter map on scenario change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(scenario.coordinates, scenario.zoom, { duration: 1.2 });
  }, [scenario.id]);

  // Update Isochrones
  useEffect(() => {
    const lg = isochroneLayerGroupRef.current;
    lg.clearLayers();

    // Render from outermost (24h) down to innermost (1h)
    const sorted = [...isochrones].sort((a, b) => b.hour - a.hour);

    sorted.forEach((iso) => {
      if (iso.coordinates.length < 3) return;

      const polygon = L.polygon(iso.coordinates, {
        color: iso.color,
        weight: 2,
        opacity: 0.85,
        fillColor: iso.color,
        fillOpacity: iso.fillOpacity,
        dashArray: iso.hour === 24 ? '4, 4' : undefined,
      });

      polygon.bindPopup(`
        <div style="font-family: var(--font-sans); padding: 4px;">
          <div style="font-size: 11px; color: ${iso.color}; font-weight: 700; text-transform: uppercase;">${iso.label}</div>
          <div style="font-size: 14px; font-weight: 700; color: #fff; margin: 4px 0;">Estimated Burn: ${iso.areaKm2} km²</div>
          <div style="font-size: 11px; color: #889bb5;">Simulation Step: T+${iso.hour}h advance</div>
        </div>
      `);

      lg.addLayer(polygon);
    });
  }, [isochrones]);

  // Update Hotspots
  useEffect(() => {
    const lg = hotspotLayerGroupRef.current;
    lg.clearLayers();

    scenario.hotspots.forEach((hs) => {
      const icon = L.divIcon({
        className: 'custom-hotspot-container',
        html: `<div class="hotspot-pulse-marker" title="Satellite FRP: ${hs.frp} MW"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([hs.lat, hs.lng], { icon });
      marker.bindPopup(`
        <div style="font-family: var(--font-sans); padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ff3d00;"></span>
            <span style="font-size: 12px; font-weight: 700; color: #ff5252; text-transform: uppercase;">
              ${hs.satellite} THERMAL HOTSPOT
            </span>
          </div>
          <div style="font-size: 13px; color: #fff; font-weight: 600;">Radiative Power: <span style="color:#00e5ff;">${hs.frp} MW</span></div>
          <div style="font-size: 12px; color: #889bb5; margin-top: 2px;">Brightness Temp: ${hs.brightness} K</div>
          <div style="font-size: 12px; color: #889bb5;">Detection Confidence: ${hs.confidence}%</div>
          <div style="font-size: 11px; color: #00e676; margin-top: 4px;">Timestamp: ${hs.acquired}</div>
        </div>
      `);

      lg.addLayer(marker);
    });
  }, [scenario.hotspots]);

  // Update Natural Barriers
  useEffect(() => {
    const lg = barrierLayerGroupRef.current;
    lg.clearLayers();

    scenario.barriers.forEach((barrier) => {
      let color = '#00e5ff';
      let dash: string | undefined = '6, 6';
      let weight = 3.5;

      if (barrier.type === 'ridge') {
        color = '#ff9100';
        dash = '2, 6';
        weight = 3;
      } else if (barrier.type === 'road') {
        color = '#cfd8dc';
        dash = undefined;
        weight = 2.5;
      }

      const polyline = L.polyline(barrier.coordinates, {
        color,
        weight,
        ...(dash ? { dashArray: dash } : {}),
        opacity: 0.8,
      });

      polyline.bindPopup(`
        <div style="font-family: var(--font-sans); padding: 4px;">
          <div style="font-size: 11px; color: ${color}; font-weight: 700; text-transform: uppercase;">NATURAL BARRIER</div>
          <div style="font-size: 13px; font-weight: 700; color: #fff; margin: 2px 0;">${barrier.name}</div>
          <div style="font-size: 12px; color: #00e676; margin-bottom: 4px;">Thermal Retardance: ${(barrier.effectiveness * 100).toFixed(0)}%</div>
          <div style="font-size: 11px; color: #889bb5;">${barrier.description}</div>
        </div>
      `);

      lg.addLayer(polyline);
    });
  }, [scenario.barriers]);

  // Update Candidate Corridors
  useEffect(() => {
    const lg = corridorLayerGroupRef.current;
    lg.clearLayers();

    scenario.corridors.forEach((corr) => {
      if (!corr.path || corr.path.length === 0) return;

      const isActive = activeCorridor?.id === corr.id;
      const isOptimal = corr.isRecommended;

      const color = isActive
        ? (isOptimal ? '#00e676' : '#ff9100')
        : 'rgba(120, 160, 200, 0.45)';

      const polyline = L.polyline(corr.path, {
        color,
        weight: isActive ? 5 : 2.5,
        opacity: isActive ? 1.0 : 0.6,
        dashArray: isActive ? undefined : '5, 8',
      });

      polyline.on('click', () => {
        sound.playClick();
        onSelectCorridor(corr);
      });

      polyline.bindTooltip(`
        <div style="font-family: var(--font-sans); font-size: 11px; font-weight: 600;">
          ${corr.shortName} ${isActive ? '· ACTIVE' : '· Click to Inspect'}
        </div>
      `, { sticky: true });

      lg.addLayer(polyline);
    });
  }, [scenario.corridors, activeCorridor]);

  // Update Threatened Assets
  useEffect(() => {
    const lg = assetLayerGroupRef.current;
    lg.clearLayers();

    scenario.assets.forEach((asset) => {
      const statusColor = asset.status === 'threatened'
        ? '#ff1744'
        : asset.status === 'alert'
          ? '#ff9100'
          : '#00e676';

      const icon = L.divIcon({
        className: 'asset-marker',
        html: `
          <div style="
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: rgba(14, 23, 38, 0.9);
            border: 2px solid ${statusColor};
            box-shadow: 0 0 10px ${statusColor};
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 11px;
            font-weight: 700;
          ">
            ${asset.type === 'community' ? '🏘️' : asset.type === 'hospital' ? '🏥' : asset.type === 'wildlife' ? '🦌' : '⚡'}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([asset.lat, asset.lng], { icon });

      marker.bindPopup(`
        <div style="font-family: var(--font-sans); padding: 4px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:11px; font-weight:700; color:${statusColor}; text-transform:uppercase;">
              ${asset.status.toUpperCase()} ZONE
            </span>
            ${asset.evacRecommended ? '<span style="background:#ff1744; color:#fff; font-size:10px; font-weight:700; padding:2px 6px; border-radius:3px;">EVACUATE</span>' : ''}
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #fff;">${asset.name}</div>
          <div style="font-size: 11px; color: #889bb5; margin: 2px 0 6px;">${asset.details}</div>
          <div style="font-size: 12px; color: #fff;">Distance to Fire: <strong>${asset.distanceKm} km</strong></div>
          <div style="font-size: 12px; color: #00e5ff;">Estimated ETA: <strong>${asset.etaHours !== null ? `${asset.etaHours} hrs` : 'Trajectory Diverted / Safe'}</strong></div>
        </div>
      `);

      lg.addLayer(marker);
    });
  }, [scenario.assets]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }} />

      {/* Floating Tactical Overlay Controls */}
      <div style={{ position: 'absolute', top: '14px', left: '16px', zIndex: 10, display: 'flex', gap: '8px' }}>
        {/* Base Map Switcher */}
        <div className="glass-panel" style={{ display: 'flex', padding: '4px', gap: '4px' }}>
          {(['dark', 'satellite', 'topo'] as BaseMapType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                sound.playClick();
                setBaseMap(type);
              }}
              style={{
                background: baseMap === type ? 'var(--primary-cyan)' : 'transparent',
                color: baseMap === type ? '#06101e' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                textTransform: 'uppercase',
                transition: 'all 0.15s ease',
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Ignition Hotspot Injection Tool */}
        <button
          className="glass-panel"
          onClick={() => {
            sound.playClick();
            setIsAddHotspotMode(!isAddHotspotMode);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: isAddHotspotMode ? 'rgba(255, 61, 0, 0.35)' : 'var(--bg-card)',
            borderColor: isAddHotspotMode ? '#ff3d00' : 'var(--border-subtle)',
            color: isAddHotspotMode ? '#ff5252' : '#fff',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '6px',
          }}
          title="Click to enable custom ignition tool, then click anywhere on map"
        >
          <Flame size={15} color={isAddHotspotMode ? '#ff3d00' : '#ff9100'} />
          <span>{isAddHotspotMode ? 'Click Map to Ignite' : '+ Add Hotspot'}</span>
        </button>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="glass-panel" style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 10,
        padding: '10px 14px',
        fontSize: '11px',
        maxWidth: '280px',
      }}>
        <div className="font-display" style={{ color: 'var(--primary-cyan)', fontSize: '11px', marginBottom: '6px', fontWeight: 700 }}>
          TACTICAL MAP OVERLAYS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff3d00' }}></span>
            <span>NASA Hotspot</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '3px', background: '#ff1744' }}></span>
            <span>T+1h Head Fire</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '3px', background: '#ff9100' }}></span>
            <span>T+6h Spread</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '3px', background: '#00e5ff', borderBottom: '2px dashed #00e5ff' }}></span>
            <span>River Gorge</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '3px', background: '#00e676' }}></span>
            <span>Optimal Line</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #ff1744' }}></span>
            <span>Threat Zone</span>
          </div>
        </div>
      </div>

      {/* Wind Compass HUD Indicator (Bottom Right) */}
      <div className="glass-panel" style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        zIndex: 10,
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
      }}>
        <div className="font-display" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>WIND TRAJECTORY</div>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(6, 12, 22, 0.7)',
        }}>
          <span style={{ position: 'absolute', top: '2px', fontSize: '9px', color: '#889bb5', fontWeight: 700 }}>N</span>
          <span style={{ position: 'absolute', bottom: '2px', fontSize: '9px', color: '#889bb5', fontWeight: 700 }}>S</span>
          <span style={{ position: 'absolute', left: '3px', fontSize: '9px', color: '#889bb5', fontWeight: 700 }}>W</span>
          <span style={{ position: 'absolute', right: '3px', fontSize: '9px', color: '#889bb5', fontWeight: 700 }}>E</span>

          {/* Animated Wind Needle pointing in wind spread direction */}
          <div style={{
            transform: `rotate(${windDir + 180}deg)`,
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '2px',
            height: '38px',
            background: 'linear-gradient(to bottom, #00e5ff 50%, rgba(255,61,0,0.8) 50%)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: '-3px',
              left: '-3px',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderBottom: '7px solid #00e5ff',
            }} />
          </div>
        </div>
        <span className="font-mono" style={{ fontSize: '11px', color: '#00e5ff', fontWeight: 600 }}>
          {windSpeed} km/h
        </span>
      </div>
    </div>
  );
};

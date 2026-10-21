import { Wind, Droplets, Play, Pause, RotateCcw, RefreshCw, Mountain, Thermometer } from 'lucide-react';
import type { Scenario } from '../types/fireweave';
import { sound } from '../services/soundService';

interface ControlPanelProps {
  scenario: Scenario;
  windSpeed: number;
  setWindSpeed: (val: number) => void;
  windDir: number;
  setWindDir: (val: number) => void;
  humidity: number;
  setHumidity: (val: number) => void;
  temp: number;
  currentHour: number;
  setCurrentHour: (hour: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playSpeed: number;
  setPlaySpeed: (speed: number) => void;
  isSyncingWeather: boolean;
  onSyncLiveWeather: () => void;
  liveWeatherStatus: string | null;
  onResetSimulation: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  scenario,
  windSpeed,
  setWindSpeed,
  windDir,
  setWindDir,
  humidity,
  setHumidity,
  temp,
  currentHour,
  setCurrentHour,
  isPlaying,
  setIsPlaying,
  playSpeed,
  setPlaySpeed,
  isSyncingWeather,
  onSyncLiveWeather,
  liveWeatherStatus,
  onResetSimulation,
}) => {
  // Fire danger rating computation
  const getDangerRating = () => {
    if (windSpeed > 40 && humidity < 18) return { label: 'CATASTROPHIC', color: '#ff1744' };
    if (windSpeed > 28 || humidity < 22) return { label: 'EXTREME', color: '#ff5252' };
    if (windSpeed > 18 || humidity < 35) return { label: 'HIGH RISK', color: '#ff9100' };
    return { label: 'MODERATE', color: '#00e676' };
  };

  const danger = getDangerRating();

  const cardinalPresets = [
    { label: 'N', deg: 0 },
    { label: 'NE', deg: 45 },
    { label: 'E', deg: 90 },
    { label: 'SE', deg: 135 },
    { label: 'S', deg: 180 },
    { label: 'SW', deg: 225 },
    { label: 'W', deg: 270 },
    { label: 'NW', deg: 315 },
  ];

  return (
    <div className="glass-panel" style={{
      width: '320px',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      zIndex: 10,
    }}>
      {/* Zone Overview Profile */}
      <div style={{
        background: 'rgba(9, 16, 28, 0.75)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '10px 12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span className="font-display" style={{ fontSize: '11px', color: 'var(--primary-cyan)', fontWeight: 700 }}>
            TERRAIN & FUEL PROFILE
          </span>
          <span className="badge-tactical" style={{ background: `${danger.color}20`, color: danger.color, border: `1px solid ${danger.color}50` }}>
            {danger.label}
          </span>
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
          {scenario.name}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
          {scenario.biome}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '11px', color: '#b0bec5' }}>
          <Mountain size={13} color="#00e5ff" />
          <span>{scenario.elevationRange}</span>
        </div>
      </div>

      {/* Environmental 'What-If' Sandbox */}
      <div style={{
        background: 'rgba(9, 16, 28, 0.75)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-display" style={{ fontSize: '12px', color: '#fff', fontWeight: 700 }}>
            WHAT-IF SIMULATION CONTROLS
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onSyncLiveWeather();
            }}
            disabled={isSyncingWeather}
            style={{
              background: 'transparent',
              border: 'none',
              color: isSyncingWeather ? '#889bb5' : 'var(--primary-cyan)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}
            title="Fetch real meteorological data from Open-Meteo API"
          >
            <RefreshCw size={12} className={isSyncingWeather ? 'spin-anim' : ''} />
            <span>{isSyncingWeather ? 'Syncing...' : 'Live Sync'}</span>
          </button>
        </div>

        {liveWeatherStatus && (
          <div style={{ fontSize: '10px', color: '#00e676', fontFamily: 'var(--font-mono)' }}>
            ✓ {liveWeatherStatus}
          </div>
        )}

        {/* Ambient Temperature Display */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Thermometer size={13} color="#ffab40" /> Surface Temperature
          </span>
          <span className="font-mono" style={{ fontSize: '12px', color: '#ffab40', fontWeight: 600 }}>
            {temp}°C
          </span>
        </div>

        {/* Wind Speed Control */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Wind size={13} color="#00e5ff" /> Wind Velocity
            </span>
            <span className="font-mono" style={{ fontSize: '12px', color: '#00e5ff', fontWeight: 600 }}>
              {windSpeed} km/h
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            step="2"
            value={windSpeed}
            onChange={(e) => {
              setWindSpeed(Number(e.target.value));
            }}
          />
        </div>

        {/* Wind Direction Control & Cardinal Presets */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Wind Bearing Origin
            </span>
            <span className="font-mono" style={{ fontSize: '12px', color: '#ffab40', fontWeight: 600 }}>
              {windDir}° (Heading {(windDir + 180) % 360}°)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="359"
            step="5"
            value={windDir}
            onChange={(e) => {
              setWindDir(Number(e.target.value));
            }}
          />
          {/* Quick 8 Cardinal Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '3px', marginTop: '6px' }}>
            {cardinalPresets.map((card) => (
              <button
                key={card.label}
                onClick={() => {
                  sound.playClick();
                  setWindDir(card.deg);
                }}
                style={{
                  background: Math.abs(windDir - card.deg) < 22 ? 'rgba(0, 229, 255, 0.25)' : 'rgba(20, 32, 50, 0.6)',
                  borderColor: Math.abs(windDir - card.deg) < 22 ? 'var(--primary-cyan)' : 'var(--border-subtle)',
                  border: '1px solid',
                  borderRadius: '3px',
                  color: Math.abs(windDir - card.deg) < 22 ? '#fff' : 'var(--text-muted)',
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  padding: '3px 0',
                  cursor: 'pointer',
                }}
              >
                {card.label}
              </button>
            ))}
          </div>
        </div>

        {/* Humidity Control */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Droplets size={13} color="#69f0ae" /> Fuel Humidity
            </span>
            <span className="font-mono" style={{ fontSize: '12px', color: '#69f0ae', fontWeight: 600 }}>
              {humidity}% RH
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="70"
            step="1"
            value={humidity}
            onChange={(e) => {
              setHumidity(Number(e.target.value));
            }}
          />
        </div>
      </div>

      {/* Simulation Timeline & Scrubbing */}
      <div style={{
        background: 'rgba(9, 16, 28, 0.75)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-display" style={{ fontSize: '12px', color: '#fff', fontWeight: 700 }}>
            PROPAGATION TIMELINE
          </span>
          <span className="font-mono" style={{ fontSize: '13px', color: '#ff3d00', fontWeight: 700 }}>
            T+{currentHour < 10 ? `0${currentHour}` : currentHour}:00 HRS
          </span>
        </div>

        {/* Scrub Slider */}
        <input
          type="range"
          min="1"
          max="24"
          step="1"
          value={currentHour}
          onChange={(e) => {
            setCurrentHour(Number(e.target.value));
          }}
        />

        {/* Timeline Playback Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginTop: '4px' }}>
          <button
            className="btn-tactical"
            onClick={() => {
              sound.playClick();
              setIsPlaying(!isPlaying);
            }}
            style={{ flex: 1, padding: '7px' }}
          >
            {isPlaying ? <Pause size={14} color="#ffab40" /> : <Play size={14} color="#00e5ff" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <button
            className="btn-tactical"
            onClick={() => {
              sound.playClick();
              onResetSimulation();
            }}
            title="Reset simulation to T+1h"
            style={{ padding: '7px 10px' }}
          >
            <RotateCcw size={14} color="#889bb5" />
          </button>

          {/* Speed Toggles */}
          <div style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  sound.playClick();
                  setPlaySpeed(speed);
                }}
                style={{
                  background: playSpeed === speed ? 'var(--primary-cyan)' : 'rgba(20, 32, 50, 0.6)',
                  color: playSpeed === speed ? '#06101e' : 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '3px',
                  padding: '4px 6px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

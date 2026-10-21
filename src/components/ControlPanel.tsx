import { Play, Pause, RotateCcw, Mountain, Radio, Sliders } from 'lucide-react';
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
  isLiveStreaming: boolean;
  onToggleLiveStream: () => void;
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
  isLiveStreaming,
  onToggleLiveStream,
  liveWeatherStatus,
  onResetSimulation,
}) => {
  // Fire danger rating computation
  const getDangerRating = () => {
    if (windSpeed > 40 && humidity < 18) return { label: 'CRITICAL', color: '#ff3d00' };
    if (windSpeed > 28 || humidity < 22) return { label: 'EXTREME', color: '#ff5252' };
    if (windSpeed > 18 || humidity < 35) return { label: 'ELEVATED', color: '#ffab40' };
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
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 10,
      border: '1px solid rgba(40, 70, 110, 0.4)',
    }}>
      {/* Zone Overview Profile */}
      <div style={{
        background: 'rgba(8, 14, 24, 0.85)',
        border: '1px solid rgba(40, 70, 110, 0.35)',
        borderRadius: '4px',
        padding: '10px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span className="font-mono" style={{ fontSize: '10px', color: '#00e5ff', fontWeight: 600, letterSpacing: '0.06em' }}>
            SECTOR TELEMETRY // 01
          </span>
          <span style={{
            background: `${danger.color}18`,
            color: danger.color,
            border: `1px solid ${danger.color}60`,
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
            padding: '1px 6px',
            borderRadius: '2px',
            fontWeight: 700,
          }}>
            RATING: {danger.label}
          </span>
        </div>
        <div className="font-display" style={{ fontSize: '15px', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
          {scenario.name.toUpperCase()}
        </div>
        <div style={{ fontSize: '11px', color: '#889bb5', marginTop: '2px', lineHeight: 1.35 }}>
          {scenario.biome}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '10px', color: '#90a4ae', fontFamily: 'var(--font-mono)' }}>
          <Mountain size={12} color="#00e5ff" />
          <span>ELEV: {scenario.elevationRange}</span>
        </div>
      </div>

      {/* Industrial Sensor Instrument Cluster */}
      <div style={{
        background: 'rgba(8, 14, 24, 0.85)',
        border: '1px solid rgba(40, 70, 110, 0.35)',
        borderRadius: '4px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        {/* Telemetry Switch Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={13} color={isLiveStreaming ? '#00e5ff' : '#889bb5'} />
            <span className="font-mono" style={{ fontSize: '10px', color: '#e0e6ed', fontWeight: 700, letterSpacing: '0.05em' }}>
              ATMOSPHERIC SENSOR INGEST
            </span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onToggleLiveStream();
            }}
            style={{
              background: isLiveStreaming ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 171, 64, 0.15)',
              border: '1px solid',
              borderColor: isLiveStreaming ? 'rgba(0, 229, 255, 0.4)' : '#ffab40',
              color: isLiveStreaming ? '#00e5ff' : '#ffab40',
              borderRadius: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 7px',
              fontSize: '9px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
            }}
          >
            {isLiveStreaming ? <Radio size={10} /> : <Sliders size={10} />}
            <span>{isLiveStreaming ? 'LIVE INGEST' : 'MANUAL'}</span>
          </button>
        </div>

        {/* Telemetry Status Line */}
        <div style={{
          background: 'rgba(4, 8, 14, 0.95)',
          borderLeft: `2px solid ${isLiveStreaming ? '#00e676' : '#ffab40'}`,
          padding: '4px 8px',
          fontSize: '9px',
          fontFamily: 'var(--font-mono)',
          color: isLiveStreaming ? '#00e676' : '#ffab40',
        }}>
          {isLiveStreaming
            ? (liveWeatherStatus || 'LIVE STREAM: OPEN-METEO GFS + NASA VIIRS')
            : 'SIMULATION OVERRIDE: SLIDERS UNLOCKED'}
        </div>

        {/* Digital Readout Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {/* Surface Temperature */}
          <div style={{ background: 'rgba(12, 18, 30, 0.65)', border: '1px solid rgba(255,255,255,0.05)', padding: '6px', borderRadius: '3px' }}>
            <div style={{ fontSize: '9px', color: '#78909c', fontFamily: 'var(--font-mono)' }}>TEMPERATURE</div>
            <div className="font-mono" style={{ fontSize: '14px', fontWeight: 700, color: '#ffab40', marginTop: '2px' }}>
              {temp.toFixed(1)}°C
            </div>
          </div>

          {/* Fuel Moisture */}
          <div style={{ background: 'rgba(12, 18, 30, 0.65)', border: '1px solid rgba(255,255,255,0.05)', padding: '6px', borderRadius: '3px' }}>
            <div style={{ fontSize: '9px', color: '#78909c', fontFamily: 'var(--font-mono)' }}>HUMIDITY (RH)</div>
            <div className="font-mono" style={{ fontSize: '14px', fontWeight: 700, color: '#00e676', marginTop: '2px' }}>
              {humidity}% RH
            </div>
          </div>
        </div>

        {/* Wind Speed Control */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: '#90a4ae', fontFamily: 'var(--font-mono)' }}>
              WIND VELOCITY {isLiveStreaming ? '[AUTO]' : '[MANUAL]'}
            </span>
            <span className="font-mono" style={{ fontSize: '12px', color: '#00e5ff', fontWeight: 700 }}>
              {windSpeed} KM/H
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            step="2"
            value={windSpeed}
            disabled={isLiveStreaming}
            onChange={(e) => {
              if (!isLiveStreaming) setWindSpeed(Number(e.target.value));
            }}
            style={{
              opacity: isLiveStreaming ? 0.35 : 1,
              cursor: isLiveStreaming ? 'not-allowed' : 'pointer',
            }}
          />
        </div>

        {/* Wind Bearing Origin */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: '#90a4ae', fontFamily: 'var(--font-mono)' }}>
              WIND BEARING {isLiveStreaming ? '[AUTO]' : '[MANUAL]'}
            </span>
            <span className="font-mono" style={{ fontSize: '12px', color: '#ffab40', fontWeight: 700 }}>
              {windDir}° (HDG {(windDir + 180) % 360}°)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="359"
            step="5"
            value={windDir}
            disabled={isLiveStreaming}
            onChange={(e) => {
              if (!isLiveStreaming) setWindDir(Number(e.target.value));
            }}
            style={{
              opacity: isLiveStreaming ? 0.35 : 1,
              cursor: isLiveStreaming ? 'not-allowed' : 'pointer',
            }}
          />
          {/* Quick Cardinal Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '2px', marginTop: '4px' }}>
            {cardinalPresets.map((card) => (
              <button
                key={card.label}
                disabled={isLiveStreaming}
                onClick={() => {
                  if (!isLiveStreaming) {
                    sound.playClick();
                    setWindDir(card.deg);
                  }
                }}
                style={{
                  background: Math.abs(windDir - card.deg) < 22 ? 'rgba(0, 229, 255, 0.25)' : 'rgba(16, 24, 38, 0.6)',
                  borderColor: Math.abs(windDir - card.deg) < 22 ? '#00e5ff' : 'rgba(40, 70, 110, 0.3)',
                  border: '1px solid',
                  borderRadius: '2px',
                  color: Math.abs(windDir - card.deg) < 22 ? '#fff' : '#607d8b',
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 0',
                  cursor: isLiveStreaming ? 'not-allowed' : 'pointer',
                  opacity: isLiveStreaming ? 0.35 : 1,
                }}
              >
                {card.label}
              </button>
            ))}
          </div>
        </div>

        {/* Humidity Control */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: '#90a4ae', fontFamily: 'var(--font-mono)' }}>
              FUEL MOISTURE INDEX
            </span>
            <span className="font-mono" style={{ fontSize: '12px', color: '#00e676', fontWeight: 700 }}>
              {humidity}% RH
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="70"
            step="1"
            value={humidity}
            disabled={isLiveStreaming}
            onChange={(e) => {
              if (!isLiveStreaming) setHumidity(Number(e.target.value));
            }}
            style={{
              opacity: isLiveStreaming ? 0.35 : 1,
              cursor: isLiveStreaming ? 'not-allowed' : 'pointer',
            }}
          />
        </div>
      </div>

      {/* Simulation Timeline & Scrubbing */}
      <div style={{
        background: 'rgba(8, 14, 24, 0.85)',
        border: '1px solid rgba(40, 70, 110, 0.35)',
        borderRadius: '4px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-mono" style={{ fontSize: '10px', color: '#00e5ff', fontWeight: 700 }}>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginTop: '2px' }}>
          <button
            className="btn-tactical"
            onClick={() => {
              sound.playClick();
              setIsPlaying(!isPlaying);
            }}
            style={{ flex: 1, padding: '5px', fontSize: '11px' }}
          >
            {isPlaying ? <Pause size={13} color="#ffab40" /> : <Play size={13} color="#00e5ff" />}
            <span style={{ fontFamily: 'var(--font-mono)' }}>{isPlaying ? 'PAUSE' : 'RUN'}</span>
          </button>

          <button
            className="btn-tactical"
            onClick={() => {
              sound.playClick();
              onResetSimulation();
            }}
            title="Reset simulation to T+1h"
            style={{ padding: '5px 8px' }}
          >
            <RotateCcw size={13} color="#889bb5" />
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
                  background: playSpeed === speed ? 'rgba(0, 229, 255, 0.25)' : 'rgba(16, 24, 38, 0.6)',
                  color: playSpeed === speed ? '#00e5ff' : '#607d8b',
                  border: '1px solid rgba(40, 70, 110, 0.4)',
                  borderRadius: '2px',
                  padding: '3px 5px',
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {speed}X
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Play, Pause, RotateCcw, Mountain, Radio } from 'lucide-react';
import type { Scenario } from '../types/fireweave';
import { sound } from '../services/soundService';

interface ControlPanelProps {
  scenario: Scenario;
  windSpeed: number;
  windDir: number;
  humidity: number;
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
  windDir,
  humidity,
  temp,
  currentHour,
  setCurrentHour,
  isPlaying,
  setIsPlaying,
  playSpeed,
  setPlaySpeed,
  isLiveStreaming,
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

  // Cardinal direction helper
  const getCardinal = (deg: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(deg / 22.5) % 16;
    return directions[idx];
  };

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
      {/* Sector Profile Header */}
      <div style={{
        background: 'rgba(8, 14, 24, 0.85)',
        border: '1px solid rgba(40, 70, 110, 0.35)',
        borderRadius: '4px',
        padding: '10px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span className="font-mono" style={{ fontSize: '10px', color: '#00e5ff', fontWeight: 600, letterSpacing: '0.06em' }}>
            INCIDENT ZONE // 01
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
            {danger.label}
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
          <span>ELEVATION: {scenario.elevationRange}</span>
        </div>
      </div>

      {/* Pure Telemetry Values (No Scales / No Sliders / No Lock Icons) */}
      <div style={{
        background: 'rgba(8, 14, 24, 0.85)',
        border: '1px solid rgba(40, 70, 110, 0.35)',
        borderRadius: '4px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={13} color={isLiveStreaming ? '#00e5ff' : '#889bb5'} />
            <span className="font-mono" style={{ fontSize: '10px', color: '#e0e6ed', fontWeight: 700, letterSpacing: '0.06em' }}>
              ATMOSPHERIC SENSOR TELEMETRY
            </span>
          </div>
          <span style={{ fontSize: '9px', color: '#00e676', fontFamily: 'var(--font-mono)' }}>
            LIVE FEED
          </span>
        </div>

        {/* Live Status Description */}
        <div style={{
          background: 'rgba(4, 8, 14, 0.95)',
          borderLeft: '2px solid #00e5ff',
          padding: '4px 8px',
          fontSize: '9px',
          fontFamily: 'var(--font-mono)',
          color: '#889bb5',
        }}>
          {liveWeatherStatus || 'LIVE STREAM: OPEN-METEO GFS + NASA VIIRS'}
        </div>

        {/* 2x2 Telemetry Grid Display */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
          {/* Wind Speed */}
          <div style={{ background: 'rgba(12, 18, 30, 0.8)', border: '1px solid rgba(255,255,255,0.06)', padding: '8px', borderRadius: '3px' }}>
            <div style={{ fontSize: '9px', color: '#78909c', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              WIND VELOCITY
            </div>
            <div className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: '#00e5ff', marginTop: '2px' }}>
              {windSpeed} <span style={{ fontSize: '11px', fontWeight: 500 }}>KM/H</span>
            </div>
            <div style={{ fontSize: '9px', color: '#607d8b', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              Gusts: ~{(windSpeed * 1.35).toFixed(0)} km/h
            </div>
          </div>

          {/* Wind Direction */}
          <div style={{ background: 'rgba(12, 18, 30, 0.8)', border: '1px solid rgba(255,255,255,0.06)', padding: '8px', borderRadius: '3px' }}>
            <div style={{ fontSize: '9px', color: '#78909c', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              WIND BEARING
            </div>
            <div className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: '#ffab40', marginTop: '2px' }}>
              {windDir}° <span style={{ fontSize: '11px', fontWeight: 500 }}>{getCardinal(windDir)}</span>
            </div>
            <div style={{ fontSize: '9px', color: '#607d8b', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              Heading: {(windDir + 180) % 360}°
            </div>
          </div>

          {/* Surface Temperature */}
          <div style={{ background: 'rgba(12, 18, 30, 0.8)', border: '1px solid rgba(255,255,255,0.06)', padding: '8px', borderRadius: '3px' }}>
            <div style={{ fontSize: '9px', color: '#78909c', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              SURFACE TEMP
            </div>
            <div className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: '#ff5252', marginTop: '2px' }}>
              {temp.toFixed(1)}° <span style={{ fontSize: '11px', fontWeight: 500 }}>C</span>
            </div>
            <div style={{ fontSize: '9px', color: '#607d8b', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              Ambient Ground
            </div>
          </div>

          {/* Fuel Moisture */}
          <div style={{ background: 'rgba(12, 18, 30, 0.8)', border: '1px solid rgba(255,255,255,0.06)', padding: '8px', borderRadius: '3px' }}>
            <div style={{ fontSize: '9px', color: '#78909c', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              FUEL HUMIDITY
            </div>
            <div className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: '#00e676', marginTop: '2px' }}>
              {humidity}% <span style={{ fontSize: '11px', fontWeight: 500 }}>RH</span>
            </div>
            <div style={{ fontSize: '9px', color: '#607d8b', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              {humidity < 20 ? 'Critical Flash' : 'Standard Moisture'}
            </div>
          </div>
        </div>

        {/* Additional Real-World Telemetry Ingest Rows */}
        <div style={{
          marginTop: '4px',
          padding: '6px 8px',
          background: 'rgba(12, 18, 30, 0.5)',
          borderRadius: '3px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '9px',
          fontFamily: 'var(--font-mono)',
          color: '#90a4ae',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>FUEL COMBUSTION MODEL:</span>
            <span style={{ color: '#fff' }}>{scenario.fuelType.slice(0, 24)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>THERMAL DETECTIONS:</span>
            <span style={{ color: '#ff3d00' }}>{scenario.hotspots.length} ACTIVE (VIIRS / MODIS)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>TELEMETRY DOWNLINK:</span>
            <span style={{ color: '#00e5ff' }}>137.91 MHz (STATION LOCK)</span>
          </div>
        </div>
      </div>

      {/* Simulation Timeline Scrubbing */}
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

        {/* Quick Hour Step Buttons (Clean and precise) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '3px', marginTop: '2px' }}>
          {[1, 3, 6, 12, 24].map((hr) => (
            <button
              key={hr}
              onClick={() => {
                sound.playClick();
                setCurrentHour(hr);
              }}
              style={{
                background: currentHour === hr ? 'rgba(0, 229, 255, 0.25)' : 'rgba(16, 24, 38, 0.6)',
                border: '1px solid',
                borderColor: currentHour === hr ? '#00e5ff' : 'rgba(40, 70, 110, 0.3)',
                color: currentHour === hr ? '#00e5ff' : '#889bb5',
                borderRadius: '2px',
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                padding: '3px 0',
                cursor: 'pointer',
                fontWeight: currentHour === hr ? 700 : 400,
              }}
            >
              +{hr}H
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

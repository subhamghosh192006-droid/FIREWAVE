import { Flame, Wind, Droplets, Volume2, VolumeX, FileText } from 'lucide-react';
import type { Scenario } from '../types/fireweave';
import { sound } from '../services/soundService';

interface HeaderProps {
  scenarios: Scenario[];
  activeScenario: Scenario;
  onSelectScenario: (scenario: Scenario) => void;
  windSpeed: number;
  windDir: number;
  humidity: number;
  temp: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  scenarios,
  activeScenario,
  onSelectScenario,
  windSpeed,
  windDir,
  humidity,
  temp,
  isMuted,
  onToggleMute,
  onOpenReport,
}) => {
  // Convert wind degrees to cardinal direction
  const getWindCardinal = (deg: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  };

  return (
    <header className="glass-panel" style={{ margin: '8px 12px 6px', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', zIndex: 1000, position: 'relative' }}>
      {/* Brand & Mission Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #ff3d00 0%, #ff9100 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(255, 61, 0, 0.5)'
        }}>
          <Flame size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="font-display" style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.08em', color: '#fff', margin: 0 }}>
              FIRE<span style={{ color: '#00e5ff' }}>WEAVE</span>
            </h1>
            <span className="badge-tactical badge-cyan">AI CONTAINMENT v2.4</span>
            <span style={{ display: 'inline-flex', width: '8px', height: '8px', borderRadius: '50%', background: '#00e676', boxShadow: '0 0 8px #00e676' }} title="System Operational" />
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
            Adaptive Forest Fire Containment & Ecological Decision-Support System
          </p>
        </div>
      </div>

      {/* Scenario Selector Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="font-display" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>INCIDENT ZONE:</span>
        <select
          value={activeScenario.id}
          onChange={(e) => {
            sound.playClick();
            const found = scenarios.find(s => s.id === e.target.value);
            if (found) onSelectScenario(found);
          }}
          style={{
            background: 'rgba(16, 28, 48, 0.9)',
            border: '1px solid var(--border-active)',
            borderRadius: '6px',
            color: '#fff',
            padding: '6px 12px',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {scenarios.map((sc) => (
            <option key={sc.id} value={sc.id} style={{ background: '#0c1626', color: '#fff' }}>
              {sc.flag} {sc.name} ({sc.country})
            </option>
          ))}
        </select>
      </div>

      {/* Live Telemetry Ticker / Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: 'rgba(8, 14, 24, 0.6)',
        padding: '6px 14px',
        borderRadius: '6px',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Wind Heading & Velocity">
          <Wind size={15} color="#00e5ff" />
          <span className="font-mono" style={{ fontSize: '12px', color: '#00e5ff' }}>
            {windSpeed} km/h ({getWindCardinal(windDir)} · {windDir}°)
          </span>
        </div>
        <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Ambient Temperature">
          <span className="font-mono" style={{ fontSize: '12px', color: '#ffab40' }}>
            {temp}°C
          </span>
        </div>
        <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Relative Humidity">
          <Droplets size={14} color="#69f0ae" />
          <span className="font-mono" style={{ fontSize: '12px', color: '#69f0ae' }}>
            {humidity}% RH
          </span>
        </div>
        <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Active Hotspots Radiating">
          <Flame size={14} color="#ff3d00" />
          <span className="font-mono" style={{ fontSize: '12px', color: '#ff5252' }}>
            {activeScenario.hotspots.length} SATELLITE DETECTIONS
          </span>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className="btn-tactical"
          onClick={() => {
            sound.playClick();
            onOpenReport();
          }}
          title="View Official Incident Action Plan Briefing"
        >
          <FileText size={15} color="#ffab40" />
          <span>INCIDENT BRIEF</span>
        </button>

        <button
          className="btn-tactical"
          onClick={() => {
            sound.playClick();
            onToggleMute();
          }}
          title={isMuted ? 'Unmute Tactical Audio' : 'Mute Tactical Audio'}
          style={{ padding: '8px 10px' }}
        >
          {isMuted ? <VolumeX size={16} color="#889bb5" /> : <Volume2 size={16} color="#00e5ff" />}
        </button>
      </div>
    </header>
  );
};

import { X, Printer, FileText } from 'lucide-react';
import type { Scenario, Corridor, ThreatenedAsset } from '../types/fireweave';
import { sound } from '../services/soundService';

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario;
  activeCorridor: Corridor | null;
  totalBurnedKm2: number;
  threatenedAssets: ThreatenedAsset[];
  windSpeed: number;
  windDir: number;
  humidity: number;
  temp: number;
  currentHour: number;
}

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({
  isOpen,
  onClose,
  scenario,
  activeCorridor,
  totalBurnedKm2,
  threatenedAssets,
  windSpeed,
  windDir,
  humidity,
  temp,
  currentHour,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const evacList = threatenedAssets.filter(a => a.evacRecommended);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(3, 7, 14, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '780px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
        overflow: 'hidden',
        background: '#0a111e',
        border: '1px solid var(--border-active)',
      }}>
        {/* Top Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          background: 'rgba(12, 22, 38, 0.95)',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#00e5ff" />
            <span className="font-display" style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
              INCIDENT ACTION PLAN (IAP) BRIEFING REPORT
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-tactical" onClick={handlePrint} style={{ padding: '6px 12px', fontSize: '12px' }}>
              <Printer size={14} />
              <span>Print Briefing</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div style={{ padding: '24px 30px', flex: 1, overflowY: 'auto', color: '#e0e6ed', fontSize: '13px', lineHeight: 1.6 }}>
          {/* Document Header */}
          <div style={{ borderBottom: '2px solid #00e5ff', paddingBottom: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 className="font-display" style={{ fontSize: '22px', color: '#fff', margin: 0 }}>
                  FIREWEAVE TACTICAL INCIDENT BRIEFING
                </h1>
                <div style={{ fontSize: '12px', color: '#00e5ff', fontWeight: 600 }}>
                  INCIDENT: {scenario.name.toUpperCase()} COMPLEX ({scenario.country})
                </div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#889bb5' }}>
                <div>STATUS: ACTIVE TACTICAL SUPPRESSION</div>
                <div>TIMESTEP: T+{currentHour}:00 HRS</div>
                <div>SECURITY LEVEL: UNCLASSIFIED / PUBLIC AGENCY</div>
              </div>
            </div>
          </div>

          {/* Section 1: Environmental & Meteorology */}
          <div style={{ marginBottom: '18px' }}>
            <h3 className="font-display" style={{ fontSize: '14px', color: '#00e5ff', marginBottom: '6px' }}>
              1. ENVIRONMENTAL OBSERVATIONS & SPREAD DRIVERS
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: 'rgba(16, 26, 42, 0.7)', padding: '10px', borderRadius: '6px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#889bb5' }}>WIND VECTOR</span>
                <div style={{ fontWeight: 700, color: '#fff' }}>{windSpeed} km/h @ {windDir}°</div>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#889bb5' }}>AMBIENT TEMP</span>
                <div style={{ fontWeight: 700, color: '#fff' }}>{temp}°C</div>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#889bb5' }}>RELATIVE HUMIDITY</span>
                <div style={{ fontWeight: 700, color: '#fff' }}>{humidity}% RH</div>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#889bb5' }}>SATELLITE HOTSPOTS</span>
                <div style={{ fontWeight: 700, color: '#ff5252' }}>{scenario.hotspots.length} Detected</div>
              </div>
            </div>
          </div>

          {/* Section 2: Containment Strategy Recommendation */}
          <div style={{ marginBottom: '18px' }}>
            <h3 className="font-display" style={{ fontSize: '14px', color: '#00e676', marginBottom: '6px' }}>
              2. AUTHORIZED CONTAINMENT CORRIDOR: {activeCorridor?.name || 'NO STRATEGY ACTIVE'}
            </h3>
            <div style={{ background: 'rgba(16, 26, 42, 0.7)', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #00e676' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#889bb5' }}>CONTAINMENT PROBABILITY</span>
                  <div style={{ fontWeight: 700, color: '#00e676', fontSize: '16px' }}>{activeCorridor?.containmentProb}%</div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#889bb5' }}>PROJECTED BURN FOOTPRINT</span>
                  <div style={{ fontWeight: 700, color: '#ffab40', fontSize: '16px' }}>{totalBurnedKm2} km²</div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#889bb5' }}>BURN REDUCTION VS BASELINE</span>
                  <div style={{ fontWeight: 700, color: '#00e5ff', fontSize: '16px' }}>-{activeCorridor?.areaSavedPercent}%</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#cfd8dc' }}>
                {activeCorridor?.tacticalDescription}
              </p>
            </div>
          </div>

          {/* Section 3: Priority Evacuation Orders */}
          <div style={{ marginBottom: '18px' }}>
            <h3 className="font-display" style={{ fontSize: '14px', color: '#ff3d00', marginBottom: '6px' }}>
              3. MANDATORY EVACUATION & THREAT ALERT CHECKLIST
            </h3>
            {evacList.length > 0 ? (
              <div style={{ background: 'rgba(255, 61, 0, 0.08)', border: '1px solid rgba(255, 61, 0, 0.3)', borderRadius: '6px', padding: '10px' }}>
                {evacList.map(asset => (
                  <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <strong>🚨 {asset.name}</strong>
                      <div style={{ fontSize: '11px', color: '#b0bec5' }}>{asset.details}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge-tactical badge-threatened">EVACUATE</span>
                      <div style={{ fontSize: '11px', color: '#ff5252', marginTop: '2px' }}>ETA: {asset.etaHours} hrs</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#00e676', padding: '8px' }}>
                ✓ No immediate mandatory residential evacuation orders at current trajectory.
              </div>
            )}
          </div>

          {/* Section 4: Incident Commander Sign-off */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#889bb5' }}>
            <div>
              AUTHORIZED BY: <strong>FIREWEAVE ADAPTIVE DSS</strong>
              <div>AGENCY: Incident Unified Command Support</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              DECISION TIMESTAMP: <strong>{new Date().toLocaleString()}</strong>
              <div>SYSTEM VERSION: FIREWEAVE v2.4-PRODUCTION</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

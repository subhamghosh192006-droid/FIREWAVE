import { useState } from 'react';
import confetti from 'canvas-confetti';
import { ShieldCheck, Trees, Clock, Sparkles } from 'lucide-react';
import type { Scenario, Corridor } from '../types/fireweave';
import { sound } from '../services/soundService';

interface ContainmentAdvisorProps {
  scenario: Scenario;
  activeCorridor: Corridor | null;
  onSelectCorridor: (corridor: Corridor) => void;
  totalBurnedKm2: number;
}

export const ContainmentAdvisor: React.FC<ContainmentAdvisorProps> = ({
  scenario,
  activeCorridor,
  onSelectCorridor,
  totalBurnedKm2,
}) => {
  const [isDeployed, setIsDeployed] = useState<boolean>(false);

  const handleDeploy = () => {
    sound.playDeploy();
    setIsDeployed(true);

    // Tactical celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00e5ff', '#00e676', '#ff9100'],
    });

    setTimeout(() => {
      setIsDeployed(false);
    }, 4000);
  };

  return (
    <div className="glass-panel" style={{
      width: '350px',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 10,
    }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-display" style={{ fontSize: '11px', color: 'var(--primary-cyan)', fontWeight: 700 }}>
            DECISION SUPPORT SYSTEM
          </span>
          <span className="badge-tactical badge-cyan">
            <Sparkles size={11} /> AI OPTIMIZER
          </span>
        </div>
        <h2 className="font-display" style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '4px 0 2px' }}>
          ADAPTIVE CONTAINMENT PLANNER
        </h2>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
          Evaluating multi-corridor natural barriers vs ecological destruction
        </p>
      </div>

      {/* Candidate Corridor Selection Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {scenario.corridors.map((corr) => {
          const isSelected = activeCorridor?.id === corr.id;
          const isOptimal = corr.isRecommended;

          return (
            <div
              key={corr.id}
              onClick={() => {
                sound.playClick();
                onSelectCorridor(corr);
              }}
              style={{
                background: isSelected
                  ? (isOptimal ? 'rgba(0, 230, 118, 0.12)' : 'rgba(0, 229, 255, 0.12)')
                  : 'rgba(9, 16, 28, 0.65)',
                border: '1px solid',
                borderColor: isSelected
                  ? (isOptimal ? '#00e676' : 'var(--primary-cyan)')
                  : 'var(--border-subtle)',
                borderRadius: '6px',
                padding: '8px 10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: isSelected ? '#fff' : 'var(--text-main)',
                }}>
                  {corr.shortName}
                </span>
                {isOptimal && (
                  <span className="badge-tactical badge-safe" style={{ fontSize: '9px', padding: '1px 5px' }}>
                    RECOMMENDED
                  </span>
                )}
                {corr.type === 'none' && (
                  <span className="badge-tactical badge-threatened" style={{ fontSize: '9px', padding: '1px 5px' }}>
                    NO ACTION
                  </span>
                )}
              </div>

              {corr.type !== 'none' && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '5px',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                }}>
                  <span>Containment: <strong style={{ color: '#00e676' }}>{corr.containmentProb}%</strong></span>
                  <span>Burned: <strong style={{ color: '#ff9100' }}>{corr.projectedBurnKm2} km²</strong></span>
                  <span>Eco Score: <strong style={{ color: corr.ecoScore < 30 ? '#00e676' : '#ff5252' }}>{corr.ecoScore}/100</strong></span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Corridor In-Depth KPI Matrix */}
      {activeCorridor && (
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
              STRATEGY PERFORMANCE METRICS
            </span>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--primary-cyan)' }}>
              {activeCorridor.type === 'none' ? 'UNMITIGATED' : 'EVALUATED'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {/* Containment Prob */}
            <div style={{ background: 'rgba(16, 26, 42, 0.6)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>PROBABILITY</div>
              <div className="font-mono" style={{ fontSize: '16px', fontWeight: 700, color: '#00e676' }}>
                {activeCorridor.containmentProb}%
              </div>
            </div>

            {/* Projected vs Current Burn */}
            <div style={{ background: 'rgba(16, 26, 42, 0.6)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>BURN FOOTPRINT</div>
              <div className="font-mono" style={{ fontSize: '16px', fontWeight: 700, color: '#ff9100' }}>
                {totalBurnedKm2} km²
              </div>
            </div>

            {/* Ecological Damage Score */}
            <div style={{ background: 'rgba(16, 26, 42, 0.6)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>ECO DESTRUCTION</div>
              <div className="font-mono" style={{
                fontSize: '15px',
                fontWeight: 700,
                color: activeCorridor.ecoScore < 25 ? '#00e676' : activeCorridor.ecoScore > 60 ? '#ff1744' : '#ff9100',
              }}>
                {activeCorridor.ecoScore} / 100
              </div>
            </div>

            {/* Crew Access & Safety */}
            <div style={{ background: 'rgba(16, 26, 42, 0.6)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>CREW SAFETY</div>
              <div className="font-mono" style={{
                fontSize: '14px',
                fontWeight: 700,
                color: activeCorridor.crewAccess === 'High' ? '#00e676' : activeCorridor.crewAccess === 'Hazardous' ? '#ff1744' : '#ff9100',
              }}>
                {activeCorridor.crewAccess}
              </div>
            </div>
          </div>

          {/* Time & Cost estimates */}
          {activeCorridor.type !== 'none' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#b0bec5', padding: '4px 2px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} color="#00e5ff" /> Est. Line Build: <strong>{activeCorridor.timeHours} hrs</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Trees size={12} color="#00e676" /> Habitat Saved: <strong>{activeCorridor.habitatSavedHa} ha</strong>
              </span>
            </div>
          )}

          {/* Tactical Reasoning & AI Justification */}
          <div style={{
            background: 'rgba(6, 12, 20, 0.9)',
            borderLeft: `3px solid ${activeCorridor.isRecommended ? '#00e676' : '#00e5ff'}`,
            padding: '8px 10px',
            borderRadius: '0 6px 6px 0',
            fontSize: '11px',
            color: '#cfd8dc',
            lineHeight: 1.5,
          }}>
            <div className="font-display" style={{ color: activeCorridor.isRecommended ? '#00e676' : '#00e5ff', fontSize: '10px', fontWeight: 700, marginBottom: '2px' }}>
              TACTICAL EXPLANATION & TRADE-OFFS
            </div>
            {activeCorridor.tacticalDescription}
          </div>

          {/* Deploy Action Button */}
          {activeCorridor.type !== 'none' && (
            <button
              className="btn-tactical btn-primary-tactical"
              onClick={handleDeploy}
              style={{ width: '100%', padding: '10px', marginTop: '4px' }}
            >
              <ShieldCheck size={16} />
              <span>{isDeployed ? '✓ DEPLOYMENT CONFIRMED' : 'AUTHORIZE & DEPLOY CORRIDOR'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

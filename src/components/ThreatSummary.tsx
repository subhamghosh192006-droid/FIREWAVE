import { AlertTriangle, ShieldCheck, ChevronUp, ChevronDown, BellRing } from 'lucide-react';
import type { ThreatenedAsset } from '../types/fireweave';
import { sound } from '../services/soundService';

interface ThreatSummaryProps {
  assets: ThreatenedAsset[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ThreatSummary: React.FC<ThreatSummaryProps> = ({
  assets,
  isExpanded,
  onToggleExpand,
}) => {
  const threatenedCount = assets.filter(a => a.status === 'threatened').length;
  const alertCount = assets.filter(a => a.status === 'alert').length;

  return (
    <div className="glass-panel" style={{
      margin: '6px 12px 10px',
      padding: isExpanded ? '12px 16px' : '8px 16px',
      zIndex: 1000,
      position: 'relative',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {/* Bar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: threatenedCount > 0 ? 'rgba(255, 23, 68, 0.2)' : 'rgba(0, 230, 118, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {threatenedCount > 0 ? <AlertTriangle size={14} color="#ff1744" /> : <ShieldCheck size={14} color="#00e676" />}
          </div>
          <span className="font-display" style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
            CRITICAL INFRASTRUCTURE & HABITAT STATUS
          </span>
          <span className="badge-tactical badge-threatened">
            {threatenedCount} IMMEDIATE THREAT
          </span>
          <span className="badge-tactical badge-alert">
            {alertCount} ON FLANK ALERT
          </span>
        </div>

        <button
          className="btn-tactical"
          onClick={() => {
            sound.playClick();
            onToggleExpand();
          }}
          style={{ padding: '4px 10px', fontSize: '11px' }}
        >
          <span>{isExpanded ? 'Collapse' : 'Expand Matrix'}</span>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* Expanded Table */}
      {isExpanded && (
        <div style={{ marginTop: '12px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left', fontFamily: 'var(--font-display)' }}>
                <th style={{ padding: '6px 8px' }}>ASSET NAME & TYPE</th>
                <th style={{ padding: '6px 8px' }}>DETAILS & DEMOGRAPHICS</th>
                <th style={{ padding: '6px 8px' }}>DISTANCE</th>
                <th style={{ padding: '6px 8px' }}>PROJECTED ETA</th>
                <th style={{ padding: '6px 8px' }}>STATUS</th>
                <th style={{ padding: '6px 8px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => {
                const badgeClass = asset.status === 'threatened'
                  ? 'badge-threatened'
                  : asset.status === 'alert'
                    ? 'badge-alert'
                    : 'badge-safe';

                return (
                  <tr key={asset.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px', fontWeight: 600, color: '#fff' }}>
                      <span style={{ marginRight: '6px' }}>
                        {asset.type === 'community' ? '🏘️' : asset.type === 'hospital' ? '🏥' : asset.type === 'wildlife' ? '🦌' : '⚡'}
                      </span>
                      {asset.name}
                    </td>
                    <td style={{ padding: '8px', color: 'var(--text-muted)' }}>
                      {asset.details}
                    </td>
                    <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', color: '#00e5ff' }}>
                      {asset.distanceKm} km
                    </td>
                    <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', color: asset.etaHours !== null && asset.etaHours <= 4 ? '#ff1744' : '#ffab40' }}>
                      {asset.etaHours !== null ? `${asset.etaHours} hrs` : 'Diverted'}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <span className={`badge-tactical ${badgeClass}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px' }}>
                      {asset.evacRecommended ? (
                        <span style={{
                          background: 'rgba(255, 23, 68, 0.25)',
                          color: '#ff5252',
                          border: '1px solid #ff1744',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <BellRing size={10} /> EVACUATE NOW
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Standby / Shielded</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

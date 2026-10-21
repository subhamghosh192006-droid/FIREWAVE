import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import type { LiveAlert } from '../types/alerts';
import { sound } from '../services/soundService';

interface LiveAlertConsoleProps {
  alerts: LiveAlert[];
  isLiveStreaming: boolean;
  onToggleLiveStream: () => void;
  onSimulateFeedBurst: () => void;
  onDismissAlert: (id: string) => void;
}

export const LiveAlertConsole = ({
  alerts,
  isLiveStreaming,
  onToggleLiveStream,
  onSimulateFeedBurst,
  onDismissAlert,
}: LiveAlertConsoleProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'telemetry'>('all');

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  const displayAlerts = alerts.filter(a => {
    if (activeTab === 'critical') return a.severity === 'critical';
    if (activeTab === 'telemetry') return a.type === 'WEATHER_SYNC' || a.type === 'CONTAINMENT_ADAPTATION';
    return true;
  });

  return (
    <div style={{
      position: 'fixed',
      bottom: '12px',
      right: '12px',
      width: isExpanded ? '460px' : '320px',
      background: 'rgba(8, 12, 20, 0.94)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(40, 70, 110, 0.45)',
      borderRadius: '4px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255,255,255,0.06)',
      zIndex: 1500,
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      overflow: 'hidden',
      transition: 'width 0.2s ease',
    }}>
      {/* Avionics Console Bar Header */}
      <div style={{
        padding: '6px 10px',
        background: 'linear-gradient(90deg, rgba(14, 22, 36, 0.95) 0%, rgba(10, 16, 26, 0.95) 100%)',
        borderBottom: '1px solid rgba(40, 70, 110, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none',
      }}>
        {/* Signal & Feed Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isLiveStreaming ? '#00e676' : '#ff9100',
              boxShadow: isLiveStreaming ? '0 0 6px #00e676' : '0 0 6px #ff9100',
              animation: isLiveStreaming ? 'pulse 2s infinite' : 'none',
            }} />
            <span style={{ color: '#00e5ff', fontWeight: 600, fontSize: '10px', letterSpacing: '0.08em' }}>
              SAT-DOWNLINK // {isLiveStreaming ? 'LIVE' : 'HOLD'}
            </span>
          </div>

          <span style={{ color: 'rgba(120, 150, 180, 0.4)' }}>|</span>

          <span style={{ fontSize: '9px', color: '#889bb5' }}>
            FREQ: 137.91 MHz
          </span>
        </div>

        {/* Console Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {criticalCount > 0 && (
            <span style={{
              background: 'rgba(255, 23, 68, 0.15)',
              border: '1px solid rgba(255, 23, 68, 0.4)',
              color: '#ff5252',
              padding: '1px 5px',
              borderRadius: '2px',
              fontSize: '9px',
              fontWeight: 700,
            }}>
              {criticalCount} CRIT
            </span>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onToggleLiveStream();
            }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              color: isLiveStreaming ? '#00e5ff' : '#ffab40',
              padding: '2px 6px',
              borderRadius: '2px',
              fontSize: '9px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
            }}
            title={isLiveStreaming ? 'Pause automated stream' : 'Resume live stream'}
          >
            {isLiveStreaming ? 'STREAMING' : 'MUTED'}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onSimulateFeedBurst();
            }}
            style={{
              background: 'rgba(0, 229, 255, 0.12)',
              border: '1px solid rgba(0, 229, 255, 0.4)',
              color: '#00e5ff',
              padding: '2px 6px',
              borderRadius: '2px',
              fontSize: '9px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
            }}
            title="Inject simulated satellite pass telemetry anomaly"
          >
            INJECT GUST
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setIsExpanded(!isExpanded);
            }}
            style={{ background: 'transparent', border: 'none', color: '#889bb5', cursor: 'pointer', padding: '2px' }}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Main Terminal Feed */}
      {isExpanded && (
        <div>
          {/* Subheader Metadata Ribbon */}
          <div style={{
            padding: '4px 10px',
            background: 'rgba(6, 10, 18, 0.8)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '9px',
            color: '#607d8b',
          }}>
            <div>FEED: NOAA-HRRR / NASA-VIIRS-375M</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span
                onClick={() => { sound.playClick(); setActiveTab('all'); }}
                style={{ cursor: 'pointer', color: activeTab === 'all' ? '#00e5ff' : '#607d8b', fontWeight: activeTab === 'all' ? 700 : 400 }}
              >
                [ALL]
              </span>
              <span
                onClick={() => { sound.playClick(); setActiveTab('critical'); }}
                style={{ cursor: 'pointer', color: activeTab === 'critical' ? '#ff5252' : '#607d8b', fontWeight: activeTab === 'critical' ? 700 : 400 }}
              >
                [THREATS]
              </span>
              <span
                onClick={() => { sound.playClick(); setActiveTab('telemetry'); }}
                style={{ cursor: 'pointer', color: activeTab === 'telemetry' ? '#00e676' : '#607d8b', fontWeight: activeTab === 'telemetry' ? 700 : 400 }}
              >
                [CONTAINMENT]
              </span>
            </div>
          </div>

          {/* Terminal Event Stream Log */}
          <div style={{
            padding: '8px 10px',
            maxHeight: '220px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            background: 'rgba(4, 8, 14, 0.95)',
          }}>
            {displayAlerts.length === 0 ? (
              <div style={{ color: '#455a64', textAlign: 'center', padding: '16px 0', fontSize: '10px' }}>
                // TELEMETRY BUFFER NOMINAL — NO ACTIVE DEVIATIONS DETECTED //
              </div>
            ) : (
              displayAlerts.map(alert => {
                const color = alert.severity === 'critical'
                  ? '#ff3d00'
                  : alert.severity === 'warning'
                    ? '#ffab40'
                    : alert.severity === 'success'
                      ? '#00e676'
                      : '#00e5ff';

                return (
                  <div
                    key={alert.id}
                    style={{
                      borderLeft: `2px solid ${color}`,
                      padding: '4px 6px 4px 8px',
                      background: 'rgba(12, 18, 30, 0.65)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color, fontWeight: 700, fontSize: '10px' }}>
                        [{alert.timestamp}] {alert.title}
                      </span>
                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        style={{ background: 'transparent', border: 'none', color: '#546e7a', cursor: 'pointer', padding: '0 2px' }}
                      >
                        <X size={11} />
                      </button>
                    </div>

                    <div style={{ color: '#b0bec5', fontSize: '10px', lineHeight: 1.35 }}>
                      {alert.message}
                    </div>

                    {alert.recommendation && (
                      <div style={{ color: '#00e5ff', fontSize: '9px', opacity: 0.85, marginTop: '2px' }}>
                        &gt; ACTION: {alert.recommendation}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

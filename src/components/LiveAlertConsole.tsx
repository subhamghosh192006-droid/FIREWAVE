import { useState } from 'react';
import { Bell, Radio, X, Zap } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'adaptation'>('all');

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'critical') return a.severity === 'critical';
    if (filter === 'adaptation') return a.type === 'CONTAINMENT_ADAPTATION';
    return true;
  });

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  return (
    <div className="glass-panel" style={{
      position: 'fixed',
      bottom: '18px',
      right: '18px',
      width: isOpen ? '420px' : 'auto',
      maxHeight: isOpen ? '480px' : 'auto',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 2000,
      borderRadius: '10px',
      overflow: 'hidden',
      border: '1px solid var(--border-active)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.75)',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {/* Console Top Header */}
      <div style={{
        padding: '10px 14px',
        background: 'rgba(10, 18, 32, 0.95)',
        borderBottom: isOpen ? '1px solid var(--border-subtle)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
      }}>
        <div
          onClick={() => {
            sound.playClick();
            setIsOpen(!isOpen);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}
        >
          <div style={{ position: 'relative' }}>
            <Radio size={16} color={isLiveStreaming ? '#00e5ff' : '#889bb5'} />
            {isLiveStreaming && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#00e676',
                boxShadow: '0 0 8px #00e676',
              }} />
            )}
          </div>
          <div>
            <div className="font-display" style={{ fontSize: '12px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              LIVE TELEMETRY & ALERTS
              {criticalCount > 0 && (
                <span className="badge-tactical badge-threatened" style={{ fontSize: '9px', padding: '1px 5px' }}>
                  {criticalCount} CRITICAL
                </span>
              )}
            </div>
            <div style={{ fontSize: '10px', color: isLiveStreaming ? '#00e676' : 'var(--text-muted)' }}>
              {isLiveStreaming ? '● AUTO-ANALYZING INCOMING STREAM' : 'FEED PAUSED'}
            </div>
          </div>
        </div>

        {/* Live Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="btn-tactical"
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onToggleLiveStream();
            }}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              background: isLiveStreaming ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255,255,255,0.06)',
              borderColor: isLiveStreaming ? '#00e676' : 'var(--border-subtle)',
              color: isLiveStreaming ? '#00e676' : 'var(--text-muted)',
            }}
            title={isLiveStreaming ? 'Pause live feed' : 'Resume live feed'}
          >
            {isLiveStreaming ? 'STREAMING' : 'RESUME'}
          </button>

          <button
            className="btn-tactical btn-primary-tactical"
            onClick={(e) => {
              e.stopPropagation();
              onSimulateFeedBurst();
            }}
            style={{ padding: '4px 8px', fontSize: '10px' }}
            title="Simulate sudden wind gust or new satellite detection to test live alerts"
          >
            <Zap size={12} />
            <span>TEST BURST</span>
          </button>
        </div>
      </div>

      {/* Expanded Alert Content */}
      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Quick Filter Tabs */}
          <div style={{
            display: 'flex',
            padding: '6px 10px',
            gap: '6px',
            background: 'rgba(8, 14, 24, 0.7)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            {(['all', 'critical', 'adaptation'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  sound.playClick();
                  setFilter(tab);
                }}
                style={{
                  background: filter === tab ? 'var(--primary-cyan)' : 'transparent',
                  color: filter === tab ? '#06101e' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Alert Stream List */}
          <div style={{
            padding: '10px',
            overflowY: 'auto',
            maxHeight: '340px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {filteredAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Bell size={24} style={{ opacity: 0.3, marginBottom: '6px' }} />
                <div>No telemetry alerts triggered under current threshold.</div>
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const borderCol = alert.severity === 'critical'
                  ? '#ff1744'
                  : alert.severity === 'warning'
                    ? '#ffab40'
                    : '#00e676';

                return (
                  <div
                    key={alert.id}
                    style={{
                      background: 'rgba(12, 20, 34, 0.9)',
                      borderLeft: `3px solid ${borderCol}`,
                      borderRadius: '0 6px 6px 0',
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      fontSize: '11px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-display" style={{ color: borderCol, fontWeight: 700, fontSize: '11px' }}>
                        {alert.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                          {alert.timestamp}
                        </span>
                        <button
                          onClick={() => onDismissAlert(alert.id)}
                          style={{ background: 'transparent', border: 'none', color: '#889bb5', cursor: 'pointer', padding: '1px' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>

                    <div style={{ color: '#e0e6ed', lineHeight: 1.4 }}>
                      {alert.message}
                    </div>

                    {alert.recommendation && (
                      <div style={{
                        marginTop: '2px',
                        padding: '4px 6px',
                        background: 'rgba(0, 229, 255, 0.08)',
                        borderRadius: '4px',
                        color: 'var(--primary-cyan)',
                        fontSize: '10px',
                      }}>
                        <strong>AI Recommendation:</strong> {alert.recommendation}
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

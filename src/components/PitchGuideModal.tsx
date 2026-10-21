import { useState } from 'react';
import { X, Presentation, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Target, Cpu, Flame } from 'lucide-react';
import { sound } from '../services/soundService';

interface PitchGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PitchGuideModal: React.FC<PitchGuideModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: '1. The Problem: Detection is Only Half the Battle',
      subtitle: 'Why traditional fire monitoring leaves authorities blind to containment opportunities',
      icon: <Flame size={24} color="#ff3d00" />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: 1.6 }}>
          <p>
            Existing monitoring platforms (like NASA FIRMS or state portals) tell firefighters <strong>where a fire is currently burning</strong>. But during a catastrophic wildfire, knowing where it was 30 minutes ago does not solve the critical question:
          </p>
          <div style={{ background: 'rgba(255, 61, 0, 0.1)', borderLeft: '3px solid #ff3d00', padding: '10px 14px', borderRadius: '0 6px 6px 0' }}>
            <strong style={{ color: '#ff5252' }}>The Core Firefighter Dilemma:</strong>
            <p style={{ margin: '4px 0 0', color: '#f0f4fc' }}>
              Where will the fire spread next, which communities are in imminent danger, and where can crews intervene with the greatest effect before resources run out?
            </p>
          </div>
          <ul style={{ paddingLeft: '20px', color: '#b0bec5' }}>
            <li><strong>Compound Factors:</strong> Wind vectors, steep canyon slopes, volatile fuel moisture, and limited firefighting crews.</li>
            <li><strong>Severe Ecological Cost:</strong> Traditional responses often resort to heavy bulldozer clear-cutting, causing catastrophic irreversible erosion and deforestation.</li>
          </ul>
        </div>
      ),
    },
    {
      title: '2. The Main Innovation: Adaptive, Ecology-Aware Containment',
      subtitle: 'Moving from reactive detection to proactive, terrain-intelligent planning',
      icon: <Sparkles size={24} color="#00e5ff" />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: 1.6 }}>
          <p>
            FIREWEAVE’s primary breakthrough is <strong>Adaptive Containment Planning</strong>. Instead of just displaying hazard polygons, the system asks:
          </p>
          <div style={{ background: 'rgba(0, 229, 255, 0.1)', borderLeft: '3px solid #00e5ff', padding: '10px 14px', borderRadius: '0 6px 6px 0' }}>
            <strong style={{ color: '#00e5ff' }}>“Where can intervention maximize containment while minimizing environmental destruction?”</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
            <div style={{ background: 'rgba(14, 23, 38, 0.8)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#00e676', fontWeight: 700, marginBottom: '4px' }}>✓ Natural Barrier Synergy</div>
              <p style={{ margin: 0, fontSize: '12px', color: '#b0bec5' }}>
                Automatically routes containment lines through perennial river gorges, rocky ridges, and paved roads that stop fire naturally.
              </p>
            </div>
            <div style={{ background: 'rgba(14, 23, 38, 0.8)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#00e5ff', fontWeight: 700, marginBottom: '4px' }}>✓ Real-Time Adaptive Feedback</div>
              <p style={{ margin: 0, fontSize: '12px', color: '#b0bec5' }}>
                When wind veers or shifts in speed, the model dynamically recalculates candidate corridors and updates evacuation alerts.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '3. Technical Architecture & Physics Model',
      subtitle: 'Real-world geospatial data meets physics-informed propagation simulation',
      icon: <Cpu size={24} color="#00e676" />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: 1.6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <div style={{ background: 'rgba(14, 23, 38, 0.9)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: '#ff3d00', fontWeight: 700, fontSize: '11px' }}>DATA FEEDS</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>NASA FIRMS (VIIRS/MODIS) thermal hotspots + Open-Meteo live API.</div>
            </div>
            <div style={{ background: 'rgba(14, 23, 38, 0.9)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: '#00e5ff', fontWeight: 700, fontSize: '11px' }}>PHYSICS ENGINE</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Rothermel elliptical spread model modulated by slope and fuel moisture.</div>
            </div>
            <div style={{ background: 'rgba(14, 23, 38, 0.9)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: '#00e676', fontWeight: 700, fontSize: '11px' }}>OPTIMIZER</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Multi-objective graph optimization balancing containment probability vs ecological disruption.</div>
            </div>
          </div>
          <p style={{ color: '#b0bec5', fontSize: '12px' }}>
            <strong>Quantitative Metrics Generated:</strong> Burned area reduction percentage (-76%), ecological damage index (0-100), crew accessibility rating, and carbon emissions averted.
          </p>
        </div>
      ),
    },
    {
      title: '4. The 60-Second Judge Pitch Script',
      subtitle: 'Exactly what to say when presenting to the hackathon judges',
      icon: <Target size={24} color="#ffab40" />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: 1.6 }}>
          <div style={{
            background: 'rgba(255, 171, 64, 0.08)',
            border: '1px solid rgba(255, 171, 64, 0.3)',
            borderRadius: '8px',
            padding: '14px',
            color: '#fff',
            fontStyle: 'italic',
          }}>
            “Our project, <strong>FIREWEAVE</strong>, is an AI-powered adaptive forest fire containment system designed to transform how wildfires are fought.
            <br /><br />
            Instead of only showing satellite fire detections, FIREWEAVE pairs live thermal hotspots and meteorological feeds with a physics-informed spread model to simulate possible fire trajectories.
            <br /><br />
            Our key innovation is <strong>adaptive, ecology-aware containment planning</strong>: FIREWEAVE automatically identifies promising intervention corridors by leveraging natural barriers like rivers, ridges, and roads. When the wind shifts, the system instantly recalculates its recommendations to protect human lives and preserve vital ecosystems.”
          </div>
          <p style={{ fontSize: '12px', color: '#00e676', margin: 0 }}>
            💡 <strong>Hackathon Tip:</strong> Walk the judges through Scenario 1 (Yosemite). Drag the wind slider from 28 to 45 km/h to show the live spread recalculation, then click <em>Corridor Alpha</em> to demonstrate the 76% burned area reduction!
          </p>
        </div>
      ),
    },
  ];

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
      <div className="glass-panel glass-panel-glow" style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(12, 20, 34, 0.8)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Presentation size={20} color="#00e5ff" />
            <div>
              <div className="font-display" style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                FIREWEAVE — HACKATHON PITCH & JUDGE WALKTHROUGH
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Slide {currentSlide + 1} of {slides.length}
              </div>
            </div>
          </div>
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

        {/* Modal Body */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            {slides[currentSlide].icon}
            <div>
              <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                {slides[currentSlide].title}
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--primary-cyan)' }}>
                {slides[currentSlide].subtitle}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            {slides[currentSlide].content}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(8, 14, 24, 0.9)',
        }}>
          <button
            className="btn-tactical"
            disabled={currentSlide === 0}
            onClick={() => {
              sound.playClick();
              setCurrentSlide(Math.max(0, currentSlide - 1));
            }}
            style={{ opacity: currentSlide === 0 ? 0.4 : 1 }}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {slides.map((_, idx) => (
              <span
                key={idx}
                onClick={() => {
                  sound.playClick();
                  setCurrentSlide(idx);
                }}
                style={{
                  width: idx === currentSlide ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: idx === currentSlide ? 'var(--primary-cyan)' : 'rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </div>

          {currentSlide < slides.length - 1 ? (
            <button
              className="btn-tactical btn-primary-tactical"
              onClick={() => {
                sound.playClick();
                setCurrentSlide(currentSlide + 1);
              }}
            >
              <span>Next Slide</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="btn-tactical btn-primary-tactical"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
            >
              <span>Launch Live Demo</span>
              <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

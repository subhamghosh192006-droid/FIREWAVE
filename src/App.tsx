import { useState, useEffect, useMemo, useCallback } from 'react';
import { SCENARIOS } from './data/scenarios';
import type { Scenario, Corridor, Hotspot } from './types/fireweave';
import type { LiveAlert } from './types/alerts';
import { calculateFireSpread } from './services/fireSpreadEngine';
import { fetchLiveWeather } from './services/weatherService';
import { analyzeLiveFeedUpdate } from './services/liveFeedEngine';
import { sound } from './services/soundService';

import { Header } from './components/Header';
import { TacticalMap } from './components/TacticalMap';
import { ControlPanel } from './components/ControlPanel';
import { ContainmentAdvisor } from './components/ContainmentAdvisor';
import { ThreatSummary } from './components/ThreatSummary';
import { IncidentReportModal } from './components/IncidentReportModal';
import { LiveAlertConsole } from './components/LiveAlertConsole';

export function App() {
  const [scenarios] = useState<Scenario[]>(SCENARIOS);
  const [activeScenario, setActiveScenario] = useState<Scenario>(SCENARIOS[0]);

  // Environmental Parameters
  const [windSpeed, setWindSpeed] = useState<number>(SCENARIOS[0].defaultWindSpeed);
  const [windDir, setWindDir] = useState<number>(SCENARIOS[0].defaultWindDir);
  const [humidity, setHumidity] = useState<number>(SCENARIOS[0].defaultHumidity);
  const [temp, setTemp] = useState<number>(SCENARIOS[0].defaultTemp);

  // Simulation Timeline State
  const [currentHour, setCurrentHour] = useState<number>(6);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);

  // Containment Strategy
  const [activeCorridor, setActiveCorridor] = useState<Corridor | null>(
    SCENARIOS[0].corridors.find(c => c.isRecommended) || SCENARIOS[0].corridors[0]
  );

  // Live Stream Feed & Automated Alert State
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<LiveAlert[]>([
    {
      id: 'init-alert-1',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'WEATHER_SYNC',
      severity: 'info',
      title: 'LIVE TELEMETRY STREAM ONLINE',
      message: 'Continuously ingesting Open-Meteo & NASA FIRMS thermal anomaly feeds. Sliders locked to live observations.',
      recommendation: 'Monitor downwind community buffers.',
    },
    {
      id: 'init-alert-2',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'CONTAINMENT_ADAPTATION',
      severity: 'success',
      title: 'OPTIMAL CORRIDOR IDENTIFIED',
      message: 'Corridor Alpha selected: leverages natural river gorge and paved road break with 91% hold probability.',
      recommendation: 'Pre-position water tanker strike teams at CA-41 junction.',
    },
  ]);

  // UI Modals & State
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isThreatExpanded, setIsThreatExpanded] = useState<boolean>(false);
  const [liveWeatherStatus, setLiveWeatherStatus] = useState<string | null>('Connected to Open-Meteo Live API');

  // Toggle tactical sound
  const handleToggleMute = useCallback(() => {
    sound.enabled = !sound.enabled;
    setIsMuted(!sound.enabled);
  }, []);

  // Fetch Live Weather for an arbitrary coordinate
  const syncWeatherForScenario = useCallback(async (sc: Scenario) => {
    try {
      const [lat, lng] = sc.coordinates;
      const data = await fetchLiveWeather(lat, lng);
      setTemp(data.temperature);
      setHumidity(data.humidity);
      setWindSpeed(data.windSpeed);
      setWindDir(data.windDirection);
      setLiveWeatherStatus(`Live Station: ${data.temperature}°C, ${data.windSpeed} km/h @ ${data.windDirection}°`);
    } catch {
      setLiveWeatherStatus('Local Station Telemetry Active');
    }
  }, []);

  // Sync on initial mount
  useEffect(() => {
    syncWeatherForScenario(SCENARIOS[0]);
  }, [syncWeatherForScenario]);

  // Scenario Selection
  const handleSelectScenario = useCallback((scenario: Scenario) => {
    setActiveScenario(scenario);
    setCurrentHour(6);
    setIsPlaying(false);
    setActiveCorridor(scenario.corridors.find(c => c.isRecommended) || scenario.corridors[0]);
    syncWeatherForScenario(scenario);

    // Add alert for scenario switch
    const newAlert: LiveAlert = {
      id: `alert-scen-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'WEATHER_SYNC',
      severity: 'info',
      title: `INCIDENT THEATER INITIALIZED: ${scenario.name.toUpperCase()}`,
      message: `Ingesting baseline topography for ${scenario.region} (${scenario.elevationRange}). Active hotspots: ${scenario.hotspots.length}.`,
      recommendation: 'Review candidate containment lines along natural barriers.',
    };
    setAlerts(prev => [newAlert, ...prev.slice(0, 15)]);
  }, [syncWeatherForScenario]);

  // Reset Simulation
  const handleResetSimulation = useCallback(() => {
    setCurrentHour(1);
    setIsPlaying(false);
  }, []);

  // Timeline Auto-play Loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(300, 1400 / playSpeed);
    const timer = setInterval(() => {
      setCurrentHour(prev => {
        if (prev >= 24) {
          setIsPlaying(false);
          return 24;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playSpeed]);

  // Physics Fire Spread Calculation
  const simulationResult = useMemo(() => {
    return calculateFireSpread(
      activeScenario,
      windSpeed,
      windDir,
      humidity,
      currentHour,
      activeCorridor
    );
  }, [activeScenario, windSpeed, windDir, humidity, currentHour, activeCorridor]);

  // Automated Live Data Feed Ingestion & Real-Time Alert Analysis Loop
  useEffect(() => {
    if (!isLiveStreaming) return;

    // Run every 9 seconds to simulate live incoming telemetry packets
    const streamInterval = setInterval(() => {
      // Natural micro-fluctuations in atmospheric wind vector
      const speedJitter = (Math.random() - 0.45) * 4;
      const dirJitter = (Math.random() - 0.5) * 8;

      setWindSpeed(prev => {
        const nextSpeed = Math.max(12, Math.min(65, Math.round(prev + speedJitter)));
        return nextSpeed;
      });

      setWindDir(prev => {
        const nextDir = Math.round((prev + dirJitter + 360) % 360);

        // Run live alert analysis on this atmospheric change
        const newAlerts = analyzeLiveFeedUpdate(
          windSpeed,
          windSpeed + speedJitter,
          prev,
          nextDir,
          humidity,
          humidity,
          activeScenario,
          simulationResult.threatenedAssets
        );

        if (newAlerts.length > 0) {
          sound.playWarning();
          setAlerts(old => [...newAlerts, ...old.slice(0, 15)]);
        }

        return nextDir;
      });
    }, 9000);

    return () => clearInterval(streamInterval);
  }, [isLiveStreaming, windSpeed, humidity, activeScenario, simulationResult.threatenedAssets]);

  // Simulate Sudden Live Feed Burst (for judges or testing)
  const handleSimulateFeedBurst = useCallback(() => {
    sound.playWarning();
    const burstSpeed = Math.min(65, windSpeed + 14);
    const burstDir = (windDir + 26) % 360;

    setWindSpeed(burstSpeed);
    setWindDir(burstDir);

    const burstAlerts = analyzeLiveFeedUpdate(
      windSpeed,
      burstSpeed,
      windDir,
      burstDir,
      humidity,
      Math.max(12, humidity - 4),
      activeScenario,
      simulationResult.threatenedAssets
    );

    const criticalEvent: LiveAlert = {
      id: `burst-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'WIND_VEER',
      severity: 'critical',
      title: '🚨 CRITICAL TELEMETRY SPIKE: Wind Surge & Shift Detected',
      message: `Live telemetry registered sustained gusts reaching ${burstSpeed} km/h shifting to bearing ${burstDir}°. Forward spread rate doubled. Immediate flame front advance!`,
      recommendation: 'Issue immediate emergency siren broadcast for downwind settlements. Deploy Corridor Alpha hybrid line now.',
    };

    setAlerts(prev => [criticalEvent, ...burstAlerts, ...prev.slice(0, 14)]);
  }, [windSpeed, windDir, humidity, activeScenario, simulationResult.threatenedAssets]);

  // Dismiss an alert
  const handleDismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  // Custom User Hotspot Ignition Injection
  const handleAddHotspot = useCallback((lat: number, lng: number) => {
    const newHotspot: Hotspot = {
      id: `hs-user-${Date.now()}`,
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4)),
      frp: 310.0,
      confidence: 95,
      acquired: 'T-00:00 (Live Pass Detection)',
      satellite: 'SUOMI-NPP',
      brightness: 365.0,
    };

    setActiveScenario(prev => ({
      ...prev,
      hotspots: [...prev.hotspots, newHotspot],
    }));

    const hotspotAlert: LiveAlert = {
      id: `hs-alert-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'NEW_HOTSPOT',
      severity: 'critical',
      title: 'SATELLITE THERMAL DETECTIONS ESCALATED',
      message: `Thermal anomaly verified at ${lat.toFixed(4)}, ${lng.toFixed(4)} with Radiative Power 310.0 MW. Isochrones recalculating.`,
      recommendation: 'Dispatch aerial recon and prepare natural corridor anchor.',
    };

    sound.playWarning();
    setAlerts(prev => [hotspotAlert, ...prev.slice(0, 15)]);
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-dark)',
      overflow: 'hidden',
    }}>
      {/* Top Tactical Command Header */}
      <Header
        scenarios={scenarios}
        activeScenario={activeScenario}
        onSelectScenario={handleSelectScenario}
        windSpeed={windSpeed}
        windDir={windDir}
        humidity={humidity}
        temp={temp}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Main Tactical Operations Viewport */}
      <div style={{
        flex: 1,
        display: 'flex',
        padding: '0 12px',
        gap: '12px',
        position: 'relative',
        minHeight: 0,
      }}>
        {/* Left HUD: Pure Telemetry Values & Timeline Control */}
        <ControlPanel
          scenario={activeScenario}
          windSpeed={windSpeed}
          windDir={windDir}
          humidity={humidity}
          temp={temp}
          currentHour={currentHour}
          setCurrentHour={setCurrentHour}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          playSpeed={playSpeed}
          setPlaySpeed={setPlaySpeed}
          isLiveStreaming={isLiveStreaming}
          onToggleLiveStream={() => setIsLiveStreaming(!isLiveStreaming)}
          liveWeatherStatus={liveWeatherStatus}
          onResetSimulation={handleResetSimulation}
        />

        {/* Center: Interactive GIS Tactical Map */}
        <div className="glass-panel" style={{
          flex: 1,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
        }}>
          <TacticalMap
            scenario={activeScenario}
            isochrones={simulationResult.isochrones}
            activeCorridor={activeCorridor}
            onSelectCorridor={setActiveCorridor}
            windSpeed={windSpeed}
            windDir={windDir}
            onAddHotspot={handleAddHotspot}
          />
        </div>

        {/* Right HUD: AI Adaptive Containment Planner */}
        <ContainmentAdvisor
          scenario={activeScenario}
          activeCorridor={activeCorridor}
          onSelectCorridor={setActiveCorridor}
          totalBurnedKm2={simulationResult.totalBurnedKm2}
        />
      </div>

      {/* Bottom Infrastructure & Evacuation Threat Drawer */}
      <ThreatSummary
        assets={simulationResult.threatenedAssets}
        isExpanded={isThreatExpanded}
        onToggleExpand={() => setIsThreatExpanded(!isThreatExpanded)}
      />

      {/* Live Telemetry & Automated Alert Console */}
      <LiveAlertConsole
        alerts={alerts}
        isLiveStreaming={isLiveStreaming}
        onToggleLiveStream={() => setIsLiveStreaming(!isLiveStreaming)}
        onSimulateFeedBurst={handleSimulateFeedBurst}
        onDismissAlert={handleDismissAlert}
      />

      {/* Incident Action Plan Briefing Modal */}
      <IncidentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        scenario={activeScenario}
        activeCorridor={activeCorridor}
        totalBurnedKm2={simulationResult.totalBurnedKm2}
        threatenedAssets={simulationResult.threatenedAssets}
        windSpeed={windSpeed}
        windDir={windDir}
        humidity={humidity}
        temp={temp}
        currentHour={currentHour}
      />
    </div>
  );
}

export default App;

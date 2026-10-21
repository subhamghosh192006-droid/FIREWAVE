import { useState, useEffect, useMemo, useCallback } from 'react';
import { SCENARIOS } from './data/scenarios';
import type { Scenario, Corridor, Hotspot } from './types/fireweave';
import { calculateFireSpread } from './services/fireSpreadEngine';
import { fetchLiveWeather } from './services/weatherService';
import { sound } from './services/soundService';

import { Header } from './components/Header';
import { TacticalMap } from './components/TacticalMap';
import { ControlPanel } from './components/ControlPanel';
import { ContainmentAdvisor } from './components/ContainmentAdvisor';
import { ThreatSummary } from './components/ThreatSummary';
import { PitchGuideModal } from './components/PitchGuideModal';
import { IncidentReportModal } from './components/IncidentReportModal';

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

  // UI Modals & State
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPitchGuideOpen, setIsPitchGuideOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isThreatExpanded, setIsThreatExpanded] = useState<boolean>(false);
  const [isSyncingWeather, setIsSyncingWeather] = useState<boolean>(false);
  const [liveWeatherStatus, setLiveWeatherStatus] = useState<string | null>(null);

  // Toggle tactical sound
  const handleToggleMute = useCallback(() => {
    sound.enabled = !sound.enabled;
    setIsMuted(!sound.enabled);
  }, []);

  // Scenario Selection
  const handleSelectScenario = useCallback((scenario: Scenario) => {
    setActiveScenario(scenario);
    setWindSpeed(scenario.defaultWindSpeed);
    setWindDir(scenario.defaultWindDir);
    setHumidity(scenario.defaultHumidity);
    setTemp(scenario.defaultTemp);
    setCurrentHour(6);
    setIsPlaying(false);
    setActiveCorridor(scenario.corridors.find(c => c.isRecommended) || scenario.corridors[0]);
    setLiveWeatherStatus(null);
  }, []);

  // Sync Live Weather from Open-Meteo
  const handleSyncLiveWeather = useCallback(async () => {
    setIsSyncingWeather(true);
    setLiveWeatherStatus(null);
    try {
      const [lat, lng] = activeScenario.coordinates;
      const data = await fetchLiveWeather(lat, lng);
      setTemp(data.temperature);
      setHumidity(data.humidity);
      setWindSpeed(data.windSpeed);
      setWindDir(data.windDirection);
      setLiveWeatherStatus(`Synced ${data.timestamp} (${data.source})`);
      sound.playDeploy();
    } catch {
      setLiveWeatherStatus('Fallback: meteorological station offline');
    } finally {
      setIsSyncingWeather(false);
    }
  }, [activeScenario.coordinates]);

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

  // Custom User Hotspot Ignition Injection
  const handleAddHotspot = useCallback((lat: number, lng: number) => {
    const newHotspot: Hotspot = {
      id: `hs-user-${Date.now()}`,
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4)),
      frp: 310.0,
      confidence: 95,
      acquired: 'T-00:00 (Manual Ignition)',
      satellite: 'SIMULATED',
      brightness: 365.0,
    };

    setActiveScenario(prev => ({
      ...prev,
      hotspots: [...prev.hotspots, newHotspot],
    }));
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
        onOpenPitchGuide={() => setIsPitchGuideOpen(true)}
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
        {/* Left HUD: Control Panel & Environmental Sandbox */}
        <ControlPanel
          scenario={activeScenario}
          windSpeed={windSpeed}
          setWindSpeed={setWindSpeed}
          windDir={windDir}
          setWindDir={setWindDir}
          humidity={humidity}
          setHumidity={setHumidity}
          temp={temp}
          currentHour={currentHour}
          setCurrentHour={setCurrentHour}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          playSpeed={playSpeed}
          setPlaySpeed={setPlaySpeed}
          isSyncingWeather={isSyncingWeather}
          onSyncLiveWeather={handleSyncLiveWeather}
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

      {/* Presentation & Pitch Guide Modal */}
      <PitchGuideModal
        isOpen={isPitchGuideOpen}
        onClose={() => setIsPitchGuideOpen(false)}
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

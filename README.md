# 🔥 FIREWEAVE — AI-Powered Adaptive Forest Fire Containment System

[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Predict where a forest fire may spread and identify promising, ecologically considerate intervention corridors using geospatial simulation and multi-objective optimization.**

---

## 🌟 1. Executive Summary & Problem Statement

Traditional wildfire monitoring systems (like satellite active fire maps) tell incident commanders **where a fire is currently burning**. However, in fast-moving wildfire emergencies, knowing where the fire was 30 minutes ago does not answer the most urgent questions:

- **Where will the fire head next** under shifting winds and steep topography?
- **Which communities and sensitive habitats** are under immediate threat?
- **Where can suppression crews establish containment lines** to maximize containment probability while minimizing irreversible environmental damage?

**FIREWEAVE** bridges the gap between passive fire detection and proactive tactical containment. By combining NASA FIRMS thermal anomaly feeds, live Open-Meteo weather observations, and a Rothermel-based physics spread engine, FIREWEAVE continuously calculates candidate containment corridors that leverage **natural barriers** (rivers, ridges, and roads) rather than brute-force mechanical clear-cutting.

---

## 🚀 2. Key Innovations

### 1. Adaptive, Ecology-Aware Containment Planning
Rather than defaulting to bulldozed clear-cut firebreaks that devastate old-growth forests and cause severe soil erosion, FIREWEAVE routes containment along:
- **Perennial River Gorges:** Natural 40–80m wide thermal breaks with 90%+ retardance efficiency.
- **Topographic Crests & Scree Lines:** Zero-fuel granitic ridges that naturally arrest flanking fires.
- **Existing Sealed Roadways:** Arterials (e.g. CA-41, Ruta 68) that allow rapid tanker positioning and crew safety.

### 2. Multi-Objective Decision Matrix
Every candidate corridor is quantitatively evaluated across 5 key dimensions:
| Metric | Description |
|---|---|
| **Containment Probability (%)** | Calculated barrier hold probability under simulated wind/slope velocity. |
| **Projected Burn Footprint (km²)** | Total surface area consumed prior to arrest at the barrier. |
| **Burn Area Reduction (%)** | Percentage of forest saved compared to the uncontained baseline trajectory. |
| **Ecological Damage Score (0–100)** | Quantitative penalty reflecting clear-cutting, soil disruption, and habitat fragmentation. |
| **Crew Accessibility & Safety** | Road access, escape route availability, and terrain hazard rating. |

### 3. Interactive "What-If" Environmental Sandbox
- **Dynamic Wind Vector:** 360° interactive compass dial and speed slider (0 to 80 km/h).
- **Live Open-Meteo Integration:** One-click live synchronization of real-time meteorological observations for any incident zone.
- **Propagation Timeline:** Interactive scrubber from `T+01:00` to `T+24:00` hours with animated isochrone wave expansion.
- **Live Hotspot Injection:** Click anywhere on the map to ignite a simulated fire and watch the containment model adapt in real-time.

---

## 🗺️ 3. Preset Global Crisis Scenarios

| Scenario | Location | Biome & Terrain | Key Assets Protected |
|---|---|---|---|
| **Yosemite National Park** 🇺🇸 | Sierra Nevada, California | Montane Conifer & Steep Granite Canyons | Yosemite Valley Communities, Mariposa Giant Sequoia Grove, El Portal Power Substation |
| **Valparaíso Coastal Hills** 🇨🇱 | Valparaíso Region, Chile | Mediterranean Sclerophyll & Eucalyptus | Cerro Cordillera Hillside Neighborhoods, Carlos Van Buren Regional Hospital |
| **Western Ghats Biosphere** 🇮🇳 | Nilgiris, India | Shola-Grassland & Tropical Deciduous | Mudumalai Tiger & Elephant Corridor, Indigenous Kallar Tribal Hamlets |
| **Blue Mountains** 🇦🇺 | New South Wales, Australia | Dry Sclerophyll Eucalyptus & Sandstone Cliffs | Katoomba Township, Scenic World Cableway, Regent Honeyeater Habitats |

---

## 🛠️ 4. Tech Stack

- **Frontend & UI:** React 19, TypeScript, Vite, Vanilla CSS (Tactical Glassmorphism Dark HUD).
- **GIS & Mapping:** Leaflet 1.9 with CartoDB Dark Matter, ESRI World Imagery, and OpenTopoMap layers.
- **Icons & Telemetry:** Lucide React icons.
- **Audio Feedback:** Browser Web Audio API synthesis (zero external audio dependencies).
- **External Data Feeds:**
  - **Open-Meteo REST API:** Real-time wind speed, heading, temperature, and relative humidity.
  - **NASA FIRMS Data Schema:** VIIRS & MODIS thermal anomaly format (Radiative Power in MW, Brightness in Kelvin).

---

## ⚡ 5. Quick Start (Run Locally)

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/fireweave.git

# Enter the project directory
cd fireweave

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173/
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🎤 6. Hackathon Presentation & Judge Pitch

> *“Our project, **FIREWEAVE**, is an AI-powered adaptive forest fire containment system designed to transform how wildfires are fought.*
>
> *Instead of only showing satellite fire detections, FIREWEAVE pairs live thermal hotspots and meteorological feeds with a physics-informed spread model to simulate possible fire trajectories.*
>
> *Our key innovation is **adaptive, ecology-aware containment planning**: FIREWEAVE automatically identifies promising intervention corridors by leveraging natural barriers like rivers, ridges, and roads. When the wind shifts, the system instantly recalculates its recommendations to protect human lives and preserve vital ecosystems.”*

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

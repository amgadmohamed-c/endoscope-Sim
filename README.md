# Endoscope Simulator (EndoSim)

EndoSim is a real-time educational simulator for endoscopic navigation and physiological monitoring.
It combines a Three.js viewport with a React dashboard to emulate scope movement, scenario-specific tissue behavior, sensor trends, and alarm handling.

## Overview

This project was built for coursework/lab demonstration of medical monitoring and decision support concepts during endoscopic procedures.

Main capabilities:

- Real-time 3D tunnel navigation in a colon-like environment.
- Scenario switching with different baseline patient states.
- Mode-dependent safety thresholds (diagnostic, therapeutic, emergency).
- Simulated sensor telemetry with trend charts and alarm notifications.
- Findings log with timestamped procedure events.

## Features

- 3D procedural viewport powered by Three.js.
- Continuous depth tracking with milestone logging every 5 cm.
- Live sensors:
  - Temperature (deg C)
  - Pressure (mmHg)
  - Flow (L/min)
  - Light level (%)
- Closed-loop illumination panel (setpoint vs measured value).
- Temperature and pressure history charts.
- Alarm states with visual and audio feedback.
- Therapeutic interaction flow for damaged tissue (mode-specific behavior).

## Tech Stack

- React 18
- Vite 5
- Three.js
- Chart.js

## Project Structure

```text
endoscope-Sim/
|- public/
|- src/
|  |- components/
|  |  |- CameraPanel.jsx
|  |  |- Dashboard.jsx
|  |  |- FindingsLog.jsx
|  |  |- HistoryTable.jsx
|  |  |- ImuReadout.jsx
|  |  |- MetricCard.jsx
|  |  |- ScenarioSelector.jsx
|  |  |- SensorChart.jsx
|  |  |- Viewport.jsx
|  |- engine/
|  |  |- EndoEngine.js
|  |- hooks/
|  |  |- useAlarmSound.js
|  |  |- useGameLoop.js
|  |  |- useNotifications.js
|  |  |- useSensors.js
|  |- App.jsx
|  |- App.module.css
|  |- constants.js
|  |- index.css
|  |- main.jsx
|- index.html
|- package.json
|- README.md
|- vite.config.js
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer

### Install Dependencies

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

Vite prints the local URL in terminal (commonly `http://localhost:5173`).

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Controls

- `W` / `S`: advance / retreat scope
- `A` / `D`: rotate view
- Mouse: look around (click viewport to lock pointer)

Mode behavior:

- Diagnostic: inspect and navigate.
- Therapeutic: hover/click target tissue to cauterize.
- Emergency: active hemorrhage presentation; switch to therapeutic to intervene.

## Scenarios

Defined in `src/constants.js`:

- `healthy`: baseline stable values.
- `polyp`: moderate risk elevation.
- `bleed`: high-acuity state with low flow and elevated pressure/temperature tendency.
- `stricture`: narrowed lumen with elevated pressure and reduced flow.

## Alarm Thresholds by Mode

An alarm triggers when any metric crosses its mode threshold.

- Diagnostic: temp > 38.5, pressure > 20, flow < 0.5
- Therapeutic: temp > 38.0, pressure > 17, flow < 0.8
- Emergency: temp > 37.8, pressure > 14, flow < 1.0

More urgent modes use stricter limits.

## Logging and Telemetry

Findings log includes:

- System initialization and scenario changes
- Depth milestones (5 cm intervals)
- Alarm events with measured values
- Alarm acknowledgement events

Runtime behavior:

- Sensor simulation updates on a fixed tick (~0.5 s).
- Rendering and scene updates run via `requestAnimationFrame`.

## Developer Notes

- Core state and orchestration: `src/App.jsx`
- Engine and scene logic: `src/engine/EndoEngine.js`
- Sensor generation and alert logic: `src/hooks/useSensors.js`
- UI and dashboard composition: `src/components/`

## License

This project is intended for educational/coursework use.

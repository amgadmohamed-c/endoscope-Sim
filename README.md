# Endoscope Simulator (EndoSim)

A real-time educational simulator for endoscopic navigation and patient-monitoring signals.
The project combines a Three.js 3D viewport with a React dashboard to emulate procedure depth, scenario changes, and live physiological sensor behavior.

## Overview

EndoSim is designed for course/lab demonstration of medical monitoring logic during endoscopic procedures.
It includes:

- A procedural 3D tunnel environment (colon-like anatomy) rendered with Three.js.
- Multiple clinical scenarios (healthy, polyp, bleeding, stricture).
- Mode-dependent alarm thresholds (diagnostic, therapeutic, emergency).
- Live sensor simulation with trends and warnings.
- A findings log for key events (scenario load, depth milestones, alarms).

## Features

- Real-time 3D navigation with keyboard + mouse input.
- Dynamic depth tracking with milestone logging every 5 cm.
- Sensor simulation:
	- Temperature (deg C)
	- Pressure (mmHg)
	- Flow rate (L/min)
	- Light level (%)
- Closed-loop illumination panel (setpoint vs actual).
- Two history charts (temperature + pressure).
- Alarm ring and danger/warn states based on selected mode thresholds.
- Therapeutic and emergency visual effects in the simulation engine.

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
|  |  |- Dashboard.jsx
|  |  |- FindingsLog.jsx
|  |  |- MetricCard.jsx
|  |  |- ScenarioSelector.jsx
|  |  |- SensorChart.jsx
|  |  |- Viewport.jsx
|  |- engine/
|  |  |- EndoEngine.js
|  |- hooks/
|  |  |- useGameLoop.js
|  |  |- useSensors.js
|  |- App.jsx
|  |- constants.js
|  |- index.css
|  |- main.jsx
|- index.html
|- package.json
|- vite.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm 9+

### Install

```bash
npm install
```

### Run (Development)

```bash
npm run dev
```

Vite will print a local URL (usually http://localhost:5173).

### Build (Production)

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Controls

- W / S: advance / retreat scope
- A / D: rotate view
- Mouse: look around (click viewport to lock pointer)

Mode-specific behavior:

- Diagnostic: navigate and observe.
- Therapeutic: interact with damaged tissue to apply treatment.
- Emergency: active hemorrhage behavior; switch to therapeutic to treat.

## Scenarios

Defined in src/constants.js:

- healthy: baseline stable values
- polyp: elevated risk and moderate abnormalities
- bleed: high acuity with low flow and high pressure/temperature tendency
- stricture: narrowed lumen with increased pressure and reduced flow

## Mode Thresholds (Alarm Logic)

Alarm conditions are mode-dependent and triggered when any metric crosses threshold:

- Diagnostic: temp > 38.5, pressure > 20, flow < 0.5
- Therapeutic: temp > 38.0, pressure > 17, flow < 0.8
- Emergency: temp > 37.8, pressure > 14, flow < 1.0

The more urgent the mode, the stricter the limits.

## Logging and Telemetry

The findings log records:

- initialization and scenario loading
- depth milestones (every 5 cm)
- periodic alarm events with metric values

Sensor updates occur on a fixed tick (~0.5 s), while rendering uses requestAnimationFrame.

## Notes for Developers

- Core app orchestration: src/App.jsx
- Simulation + visual effects: src/engine/EndoEngine.js
- Sensor generation + status classification: src/hooks/useSensors.js
- Dashboard/UI composition: src/components/

## Future Improvements

- Add configurable scenario editor from UI.
- Add session export for findings log and trends.
- Add automated tests for sensor threshold logic.
- Add internationalization and accessibility audit.

## License

This project is currently for educational/coursework use.


import { SCENARIOS } from '../constants'

export function simulateSensors(scenarioId, depth, t) {
  const sc = SCENARIOS.find(s => s.id === scenarioId)
  const depthFactor = Math.min(1, depth / 18)

  return {
    temp:     sc.base.temp     + depthFactor * 0.9  + Math.sin(t * 0.8)  * 0.18 + (Math.random() - 0.5) * 0.09,
    pressure: sc.base.pressure + depthFactor * 4.5  + Math.sin(t * 1.2)  * 1.3  + (Math.random() - 0.5) * 0.55,
    flow: Math.max(
      0.05,
      sc.base.flow - depthFactor * 0.3 + Math.sin(t * 0.95) * 0.14 + (Math.random() - 0.5) * 0.05
    ),
    light: 78 + Math.sin(t * 2.1) * 8 + (Math.random() - 0.5) * 5,
  }
}

export function getSensorStatus(sensors, thresholds) {
  return {
    temp:     sensors.temp     > thresholds.temp                  ? 'danger'
            : sensors.temp     > thresholds.temp - 0.5            ? 'warn' : '',
    pressure: sensors.pressure > thresholds.pressure              ? 'danger'
            : sensors.pressure > thresholds.pressure - 3          ? 'warn' : '',
    flow:     sensors.flow     < thresholds.flow                  ? 'danger'
            : sensors.flow     < thresholds.flow + 0.3            ? 'warn' : '',
  }
}

export function isAlarming(sensors, thresholds) {
  return (
    sensors.temp     > thresholds.temp     ||
    sensors.pressure > thresholds.pressure ||
    sensors.flow     < thresholds.flow
  )
}

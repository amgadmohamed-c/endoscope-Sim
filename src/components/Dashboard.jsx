import ScenarioSelector from './ScenarioSelector'
import MetricCard from './MetricCard'
import SensorChart from './SensorChart'
import FindingsLog from './FindingsLog'
import styles from './Dashboard.module.css'

export default function Dashboard({
  scenario, onScenarioChange,
  sensors, sensorStatus,
  tempHistory, pressHistory,
  illuminance, illuminanceActual, onIlluminanceChange,
  logEntries,
}) {
  return (
    <div className={styles.dashboard}>
      <div className={styles.section}>
        <div className={styles.label}>Scenarios</div>
        <ScenarioSelector current={scenario} onChange={onScenarioChange} />
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Live Sensors</div>
        <div className={styles.metrics}>
          <MetricCard
            name="TEMPERATURE"
            value={sensors.temp.toFixed(1)}
            unit="°C"
            pct={sensors.temp / 42 * 100}
            status={sensorStatus.temp}
          />
          <MetricCard
            name="PRESSURE"
            value={sensors.pressure.toFixed(1)}
            unit="mmHg"
            pct={sensors.pressure / 40 * 100}
            status={sensorStatus.pressure}
          />
          <MetricCard
            name="FLOW RATE"
            value={sensors.flow.toFixed(2)}
            unit="L/min"
            pct={sensors.flow / 3 * 100}
            status={sensorStatus.flow}
          />
          <MetricCard
            name="LIGHT"
            value={sensors.light.toFixed(0)}
            unit="%"
            pct={sensors.light}
            status=""
          />
        </div>
      </div>

      <div className={styles.section}>
        <SensorChart data={tempHistory}  color="#ff5555" label="TEMPERATURE HISTORY (°C)" />
        <SensorChart data={pressHistory} color="#0096ff" label="PRESSURE HISTORY (mmHg)" />
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Illumination — Closed Loop</div>
        <div className={styles.illumControl}>
          <div className={styles.illumRow}>
            <div className={styles.illumKey}>SETPOINT</div>
            <input
              type="range"
              min="0" max="100"
              value={illuminance}
              onChange={e => onIlluminanceChange(parseInt(e.target.value))}
            />
            <div className={styles.illumNum}>{illuminance}%</div>
          </div>
          <div className={styles.illumRow}>
            <div className={styles.illumKey}>ACTUAL</div>
            <div className={styles.actualTrack}>
              <div className={styles.actualFill} style={{ width: `${illuminanceActual}%` }} />
            </div>
            <div className={styles.illumNum}>{illuminanceActual}%</div>
          </div>
        </div>
      </div>

      <FindingsLog entries={logEntries} />
    </div>
  )
}

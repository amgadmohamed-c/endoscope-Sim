import { useState, useCallback, useRef } from 'react'
import Viewport from './components/Viewport'
import Dashboard from './components/Dashboard'
import { MODES, HISTORY_LEN } from './constants'
import { simulateSensors, getSensorStatus, isAlarming } from './hooks/useSensors'
import { useNotifications } from './hooks/useNotifications'
import styles from './App.module.css'

const INITIAL_SENSORS = { temp: 37.2, pressure: 12.0, flow: 1.80, light: 75 }

export default function App() {
  // Scenario & mode
  const [scenario, setScenario] = useState('healthy')
  const [mode,     setMode]     = useState('diagnostic')

  // Sensor state
  const [sensors,     setSensors]     = useState(INITIAL_SENSORS)
  const [tempHistory, setTempHistory] = useState(() => Array(HISTORY_LEN).fill(37.2))
  const [pressHistory,setPressHistory]= useState(() => Array(HISTORY_LEN).fill(12.0))

  // Navigation state
  const [depth,   setDepth]   = useState(0)
  const [alarming,setAlarming]= useState(false)

  // Illumination
  const [illuminance,       setIlluminance]       = useState(75)
  const [illuminanceActual, setIlluminanceActual] = useState(75)

  // Timer
  const [procTime, setProcTime] = useState('00:00')

  // Log
  const [logEntries, setLogEntries] = useState([
    { msg: 'System initialized',      type: 'info', time: '00:00' },
    { msg: 'Scenario: HEALTHY COLON', type: 'info', time: '00:00' },
  ])

  // ── Notifications ─────────────────────────────────────────────
  const notify = useNotifications()

  // Mutable refs
  const procTimeRef    = useRef(0)
  const sensorTickRef  = useRef(0)
  const lastAlarmRef   = useRef(0)
  const lastDepthRef   = useRef(0)
  const scenarioRef    = useRef(scenario)
  const modeRef        = useRef(mode)
  const illuminanceRef = useRef(illuminance)
  scenarioRef.current    = scenario
  modeRef.current        = mode
  illuminanceRef.current = illuminance

  const fmtTime = (s) => {
    const m = Math.floor(s / 60)
    return `${String(m).padStart(2,'0')}:${String(Math.floor(s % 60)).padStart(2,'0')}`
  }

  const addLog = useCallback((msg, type) => {
    const time = fmtTime(procTimeRef.current)
    setLogEntries(prev => [{ msg, type, time }, ...prev].slice(0, 40))
  }, [])

  const handleDepthChange = useCallback((d) => {
    setDepth(d)
    if (Math.floor(d / 5) > Math.floor(lastDepthRef.current / 5)) {
      addLog(`Depth reached: ${d.toFixed(0)} cm`)
      lastDepthRef.current = d
    }
  }, [addLog])

  const onSensorTick = useCallback((dt, t, depth) => {
    procTimeRef.current += dt
    sensorTickRef.current += dt
    setProcTime(fmtTime(procTimeRef.current))

    if (sensorTickRef.current < 0.5) return
    sensorTickRef.current = 0

    const s = simulateSensors(scenarioRef.current, depth, procTimeRef.current)
    const actual = Math.round(illuminanceRef.current * 0.93 + s.light * 0.07)
    setIlluminanceActual(actual)
    setSensors(s)
    setTempHistory(h  => [...h.slice(1),  parseFloat(s.temp.toFixed(2))])
    setPressHistory(h => [...h.slice(1), parseFloat(s.pressure.toFixed(2))])

    const thr = MODES.find(m => m.id === modeRef.current).thresholds
    const alarm = isAlarming(s, thr)
    setAlarming(alarm)

    if (alarm && procTimeRef.current - lastAlarmRef.current > 4) {
      lastAlarmRef.current = procTimeRef.current

      if (s.temp     > thr.temp) {
        const msg = `HIGH TEMP: ${s.temp.toFixed(1)}°C`
        addLog(msg, 'danger')
        notify(msg, { tag: 'alarm-temp' })
      }
      if (s.pressure > thr.pressure) {
        const msg = `HIGH PRESSURE: ${s.pressure.toFixed(1)} mmHg`
        addLog(msg, 'danger')
        notify(msg, { tag: 'alarm-pressure' })
      }
      if (s.flow < thr.flow) {
        const msg = `LOW FLOW: ${s.flow.toFixed(2)} L/min`
        addLog(msg, 'alert')
        notify(msg, { tag: 'alarm-flow' })
      }
    }
  }, [addLog, notify])

  const handleScenarioChange = (id) => {
    setScenario(id)
    lastDepthRef.current = 0
    const sc = id.toUpperCase().replace('_', ' ')
    addLog(`Scenario loaded: ${sc}`, 'info')
  }

  const handleModeChange = (id) => {
    setMode(id)
    addLog(`Mode changed: ${id.toUpperCase()}`, 'info')
  }

  const currentMode = MODES.find(m => m.id === mode)
  const sensorStatus = getSensorStatus(sensors, currentMode.thresholds)

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logo}>ENDO<span>SIM</span></div>
        <div className={styles.liveDot} />
        <div className={styles.liveLabel}>LIVE</div>
        <div className={styles.timer}>{procTime}</div>
        <div className={styles.modeGroup}>
          {MODES.map(m => (
            <button
              key={m.id}
              className={`${styles.modeBtn} ${styles[m.cls]} ${mode === m.id ? styles.on : ''}`}
              onClick={() => handleModeChange(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </header>

      <Viewport
        scenario={scenario}
        mode={mode}
        illuminance={illuminance}
        alarming={alarming}
        depth={depth}
        onDepthChange={handleDepthChange}
        onSensorTick={onSensorTick}
      />

      <Dashboard
        scenario={scenario}
        onScenarioChange={handleScenarioChange}
        sensors={sensors}
        sensorStatus={sensorStatus}
        tempHistory={tempHistory}
        pressHistory={pressHistory}
        illuminance={illuminance}
        illuminanceActual={illuminanceActual}
        onIlluminanceChange={setIlluminance}
        logEntries={logEntries}
      />
    </div>
  )
}
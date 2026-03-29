import { useEffect, useRef, useState } from 'react'
import { EndoEngine } from '../engine/EndoEngine'
import styles from './Viewport.module.css'

export default function Viewport({
  scenario, mode, illuminance, alarming, depth, onDepthChange, onSensorTick,
}) {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const rafRef    = useRef(null)
  const lastRef   = useRef(0)
  const [loading, setLoading] = useState(true)

  const onDepthRef  = useRef(onDepthChange)
  const onSensorRef = useRef(onSensorTick)
  const modeRef     = useRef(mode)
  onDepthRef.current  = onDepthChange
  onSensorRef.current = onSensorTick
  modeRef.current     = mode

  useEffect(() => {
    const eng = new EndoEngine(canvasRef.current)
    engineRef.current = eng
    eng.onLoadCallback = () => setLoading(false)

    function loop(ts) {
      rafRef.current = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (ts - lastRef.current) / 1000)
      lastRef.current = ts
      const d = engineRef.current?.tick(dt, modeRef.current) ?? 0
      onDepthRef.current(d)
      onSensorRef.current(dt, ts, d)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => { eng.destroy(); cancelAnimationFrame(rafRef.current) }
  }, [])

  useEffect(() => { engineRef.current?.buildTunnel(scenario) }, [scenario])
  useEffect(() => { engineRef.current?.setIlluminance(illuminance) }, [illuminance])
  useEffect(() => { engineRef.current?.setMode(mode) }, [mode])

  const scenarioLabel = {
    healthy: 'HEALTHY COLON', polyp: 'POLYP DETECTED',
    bleed: 'ACTIVE BLEEDING', stricture: 'STRICTURE — NARROWING',
  }[scenario]

  const tagClass = { polyp: styles.warn, bleed: styles.danger, stricture: styles.warn }[scenario] || ''

  // Mode-specific HUD content
  const modeHint = {
    diagnostic: (
      <div className={styles.modeHud} data-mode="diag">
        <span className={styles.modeIcon}>🔬</span> DIAGNOSTIC
        <div className={styles.modeDesc}>Navigate &amp; observe. W/S advance. Mouse look.</div>
      </div>
    ),
    therapeutic: (
      <div className={styles.modeHud} data-mode="ther">
        <span className={styles.modeIcon}>⚡</span> THERAPEUTIC
        <div className={styles.modeDesc}>Hover &amp; click damaged tissue to cauterize.</div>
      </div>
    ),
    emergency: (
      <div className={styles.modeHud} data-mode="emer">
        <span className={styles.modeIcon}>🚨</span> EMERGENCY
        <div className={styles.modeDesc}>Active haemorrhage. Switch to THERAPEUTIC to treat.</div>
      </div>
    ),
  }[mode]

  return (
    <div className={styles.viewport}>
      <canvas ref={canvasRef} className={styles.canvas} />

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          <div className={styles.loadingText}>INITIALIZING...</div>
        </div>
      )}

      <div className={styles.vignette} />
      <div className={styles.scanlines} />

      {/* Only show built-in crosshair in diagnostic mode */}
      {!loading && mode === 'diagnostic' && <div className={styles.crosshair} />}

      <div className={`${styles.alarmRing} ${alarming ? styles.on : ''}`} />
      <div className={`${styles.scenarioTag} ${tagClass}`}>{scenarioLabel}</div>
      <div className={styles.depthHud}>DEPTH: {depth.toFixed(1)} cm</div>

      {modeHint}

      <div className={styles.controlsHint}>
        W/S — ADVANCE / RETREAT<br />
        A/D — ROTATE VIEW<br />
        MOUSE — LOOK (click to lock)
      </div>
      <div className={styles.illumHud}>
        LED PWM<br />ACTUAL <span>{illuminance}%</span>
      </div>
    </div>
  )
}

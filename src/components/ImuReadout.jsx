import { useEffect, useRef, useState } from 'react'
import styles from './ImuReadout.module.css'

/**
 * ImuReadout — simulates MPU6050 tip orientation.
 * Reads mouse delta as pitch/yaw, derives roll from combined motion.
 * Displays as a mini attitude indicator + numeric readout.
 */
export default function ImuReadout({ depth }) {
  const [imu, setImu] = useState({ pitch: 0, yaw: 0, roll: 0 })
  const smoothRef = useRef({ pitch: 0, yaw: 0, roll: 0 })
  const rafRef    = useRef(null)
  const lastRef   = useRef({ x: null, y: null })

  useEffect(() => {
    const onMove = (e) => {
      if (lastRef.current.x === null) {
        lastRef.current = { x: e.clientX, y: e.clientY }
        return
      }
      const dx = e.clientX - lastRef.current.x
      const dy = e.clientY - lastRef.current.y
      lastRef.current = { x: e.clientX, y: e.clientY }

      // Accumulate with decay — simulates gyro integration
      smoothRef.current.yaw   += dx * 0.18
      smoothRef.current.pitch += dy * 0.18
      smoothRef.current.roll   = smoothRef.current.yaw * 0.35

      // Clamp to realistic endoscope tip angles
      smoothRef.current.pitch = Math.max(-90, Math.min(90,  smoothRef.current.pitch))
      smoothRef.current.yaw   = Math.max(-90, Math.min(90,  smoothRef.current.yaw))
      smoothRef.current.roll  = Math.max(-45, Math.min(45,  smoothRef.current.roll))
    }

    // Decay toward zero when mouse idle — simulates gyro drift correction
    const decay = () => {
      smoothRef.current.pitch *= 0.96
      smoothRef.current.yaw   *= 0.96
      smoothRef.current.roll  *= 0.96
      setImu({
        pitch: parseFloat(smoothRef.current.pitch.toFixed(1)),
        yaw:   parseFloat(smoothRef.current.yaw.toFixed(1)),
        roll:  parseFloat(smoothRef.current.roll.toFixed(1)),
      })
      rafRef.current = requestAnimationFrame(decay)
    }

    window.addEventListener('mousemove', onMove)
    rafRef.current = requestAnimationFrame(decay)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Attitude indicator — artificial horizon SVG
  const pitchOffset = (imu.pitch / 90) * 20   // px shift
  const rollDeg     = imu.roll

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>IMU — TIP ORIENTATION</div>

      <div className={styles.body}>
        {/* Attitude indicator */}
        <div className={styles.adi}>
          <svg viewBox="0 0 60 60" className={styles.adiSvg}>
            <defs>
              <clipPath id="adiClip">
                <circle cx="30" cy="30" r="26"/>
              </clipPath>
            </defs>
            {/* Sky / ground */}
            <g clipPath="url(#adiClip)" transform={`rotate(${rollDeg},30,30)`}>
              <rect x="0" y={-50 + 30 + pitchOffset} width="60" height="60" fill="#0a2a42"/>
              <rect x="0" y={10  + 30 + pitchOffset} width="60" height="60" fill="#3a1a0a"/>
              <line x1="4" y1={30 + pitchOffset} x2="56" y2={30 + pitchOffset}
                    stroke="rgba(255,255,255,0.55)" strokeWidth="0.8"/>
            </g>
            {/* Outer ring */}
            <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(0,210,170,0.4)" strokeWidth="1.5"/>
            {/* Fixed aircraft reference */}
            <line x1="10" y1="30" x2="22" y2="30" stroke="var(--accent,#00d2aa)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="38" y1="30" x2="50" y2="30" stroke="var(--accent,#00d2aa)" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="30" cy="30" r="2" fill="var(--accent,#00d2aa)"/>
          </svg>
        </div>

        {/* Numeric readouts */}
        <div className={styles.values}>
          <div className={styles.row}>
            <span className={styles.axis}>PITCH</span>
            <span className={styles.val} style={{ color: Math.abs(imu.pitch) > 45 ? 'var(--danger,#ff3030)' : 'var(--accent,#00d2aa)' }}>
              {imu.pitch > 0 ? '+' : ''}{imu.pitch}°
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.axis}>YAW</span>
            <span className={styles.val} style={{ color: Math.abs(imu.yaw) > 45 ? 'var(--warn,#ffb020)' : 'var(--accent,#00d2aa)' }}>
              {imu.yaw > 0 ? '+' : ''}{imu.yaw}°
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.axis}>ROLL</span>
            <span className={styles.val}>{imu.roll > 0 ? '+' : ''}{imu.roll}°</span>
          </div>
          <div className={styles.row}>
            <span className={styles.axis}>DEPTH</span>
            <span className={styles.val}>{depth.toFixed(1)} cm</span>
          </div>
        </div>
      </div>
    </div>
  )
}
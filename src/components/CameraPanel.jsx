import { useEffect, useRef, useState } from 'react'
import styles from './CameraPanel.module.css'

export default function CameraPanel() {
  const videoRef  = useRef(null)
  const [status, setStatus] = useState('idle') // idle | active | denied | unavailable

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable')
      return
    }

    let stream = null

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 640 } } })
      .then(s => {
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          videoRef.current.play()
        }
        setStatus('active')
      })
      .catch(() => setStatus('denied'))

    return () => {
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <div className={styles.panel}>
      <div className={styles.label}>
        CAMERA FEED
        <span className={`${styles.dot} ${status === 'active' ? styles.live : styles.off}`} />
        <span className={styles.statusText}>
          {status === 'active' ? 'LIVE' : status === 'denied' ? 'DENIED' : 'OFFLINE'}
        </span>
      </div>

      <div className={styles.frame}>
        {/* Scanline overlay always present */}
        <div className={styles.scanlines} />

        {status === 'active' && (
          <video
            ref={videoRef}
            className={styles.video}
            muted
            playsInline
          />
        )}

        {status !== 'active' && (
          <div className={styles.placeholder}>
            <div className={styles.noSignalGrid} />
            <div className={styles.offlineLabel}>
              {status === 'denied'
                ? 'CAM PERMISSION DENIED'
                : status === 'unavailable'
                ? 'NO CAMERA DETECTED'
                : 'INITIALIZING...'}
            </div>
            {/* Simulated crosshair on placeholder */}
            <div className={styles.phCross} />
          </div>
        )}

        {/* Corner brackets — endoscope aesthetic */}
        <div className={`${styles.corner} ${styles.tl}`} />
        <div className={`${styles.corner} ${styles.tr}`} />
        <div className={`${styles.corner} ${styles.bl}`} />
        <div className={`${styles.corner} ${styles.br}`} />

        {/* HUD overlays */}
        <div className={styles.hudTop}>ESP32-CAM · MJPEG</div>
        <div className={styles.hudBottom}>REC ● {new Date().toLocaleDateString()}</div>
      </div>
    </div>
  )
}
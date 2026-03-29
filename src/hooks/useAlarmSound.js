import { useRef, useCallback } from 'react'

/**
 * useAlarmSound()
 * Returns buzz(type) — call with 'danger' or 'alert'.
 * Uses Web Audio API directly, no library needed.
 * danger → urgent double-beep at 880 Hz
 * alert  → single lower beep at 520 Hz
 */
export function useAlarmSound() {
  const ctxRef = useRef(null)

  // Lazily create AudioContext on first use (browsers require user gesture first)
  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const beep = useCallback((freq, startTime, duration, ctx) => {
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type      = 'square'
    osc.frequency.setValueAtTime(freq, startTime)

    // Sharp attack, quick decay — medical alarm feel
    gain.gain.setValueAtTime(0,    startTime)
    gain.gain.linearRampToValueAtTime(0.18, startTime + 0.01)
    gain.gain.linearRampToValueAtTime(0.12, startTime + duration * 0.6)
    gain.gain.linearRampToValueAtTime(0,    startTime + duration)

    osc.start(startTime)
    osc.stop(startTime + duration)
  }, [])

  const buzz = useCallback((type = 'danger') => {
    try {
      const ctx = getCtx()
      const now = ctx.currentTime

      if (type === 'danger') {
        // Double beep — urgent
        beep(880, now,        0.18, ctx)
        beep(880, now + 0.22, 0.18, ctx)
      } else {
        // Single lower beep — warning
        beep(520, now, 0.25, ctx)
      }
    } catch (_) {
      // AudioContext unavailable — silently skip
    }
  }, [getCtx, beep])

  return buzz
}
import { useEffect, useRef } from 'react'

/**
 * Runs a requestAnimationFrame loop.
 * The callback receives (dt, timestamp) and should be stable (use refs for mutable values).
 * Re-runs whenever deps change (loop restarts cleanly).
 */
export function useGameLoop(callback, deps = []) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    let rafId
    let last = 0

    function loop(ts) {
      const dt = Math.min(0.05, (ts - last) / 1000)
      last = ts
      cbRef.current(dt, ts)
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

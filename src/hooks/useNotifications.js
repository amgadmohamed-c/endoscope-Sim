import { useEffect, useRef, useCallback } from 'react'

/**
 * useNotifications()
 * Returns a `notify(msg)` function.
 * - Requests browser Notification permission once on mount.
 * - Fires a native notification for every danger alarm.
 * - Silently no-ops if the user denies permission or the API is unavailable.
 */
export function useNotifications() {
  const permittedRef = useRef(false)

  // Request permission once when the component mounts
  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
      permittedRef.current = true
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(result => {
        permittedRef.current = result === 'granted'
      })
    }
  }, [])

  const notify = useCallback((msg, { tag = 'endosim-alarm', icon = '' } = {}) => {
    if (!permittedRef.current) return
    if (!('Notification' in window)) return
    try {
      new Notification('ENDOSIM — ALARM', {
        body: msg,
        tag,          // collapses duplicate notifications with the same tag
        icon,
        silent: false,
      })
    } catch (_) {
      // Some browsers block Notification construction in certain contexts
    }
  }, [])

  return notify
}
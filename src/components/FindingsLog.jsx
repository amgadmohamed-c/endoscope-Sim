import { useRef, useEffect, useCallback } from 'react'
import styles from './FindingsLog.module.css'

export default function FindingsLog({ entries, onAck }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [entries.length])

  const downloadCSV = useCallback(() => {
    const header = 'Time,Type,Message\n'
    const rows = [...entries]
      .reverse()
      .map(e => {
        const type = e.type || 'info'
        const msg  = e.msg.replace(/,/g, ';')
        return `${e.time},${type},${msg}`
      })
      .join('\n')

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `endosim_log_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [entries])

  const hasUnacked = entries.some(e => e.type === 'danger' && !e.acked)

  return (
    <>
      <div className={styles.header}>
        FINDINGS LOG
        <div className={styles.headerBtns}>
          {hasUnacked && (
            <button
              className={styles.ackBtn}
              onClick={onAck}
              title="Acknowledge all alarms"
            >
              ✓ ACK
            </button>
          )}
          <button
            className={styles.exportBtn}
            onClick={downloadCSV}
            title="Export log as CSV"
          >
            ↓ CSV
          </button>
        </div>
      </div>

      <div className={styles.scroll} ref={scrollRef}>
        {entries.map((e, i) => (
          <div
            key={i}
            className={`${styles.entry} ${e.type ? styles[e.type] : ''} ${e.acked ? styles.acked : ''}`}
          >
            <span className={styles.ts}>{e.time}</span>
            {e.msg}
            {e.acked && <span className={styles.ackTag}> ✓</span>}
          </div>
        ))}
      </div>
    </>
  )
}
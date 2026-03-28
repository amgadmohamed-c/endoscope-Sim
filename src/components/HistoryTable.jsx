import { useState } from 'react'
import styles from './HistoryTable.module.css'

export default function HistoryTable({ tempHistory, pressHistory, sensors }) {
  const [open, setOpen] = useState(false)

  // Build rows from the last 20 history entries
  // tempHistory & pressHistory are circular arrays of length HISTORY_LEN
  // We pair them by index — index 0 is oldest, last is newest
  const rows = tempHistory.slice(-20).map((t, i) => ({
    idx:  tempHistory.length - 20 + i,
    temp: t.toFixed(1),
    pres: (pressHistory.slice(-20)[i] ?? 0).toFixed(1),
    flow: sensors.flow.toFixed(2),   // flow history not stored separately — use live
    light: sensors.light.toFixed(0),
  })).reverse()  // newest first

  return (
    <div className={styles.wrap}>
      <button className={styles.toggle} onClick={() => setOpen(o => !o)}>
        SENSOR HISTORY
        <span className={styles.arrow}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Temp °C</th>
                <th>Press mmHg</th>
                <th>Flow L/min</th>
                <th>Light %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={
                  parseFloat(r.temp) > 38.5 || parseFloat(r.pres) > 20
                    ? styles.danger
                    : parseFloat(r.temp) > 38.0 || parseFloat(r.pres) > 17
                    ? styles.warn
                    : ''
                }>
                  <td className={styles.idx}>{rows.length - i}</td>
                  <td>{r.temp}</td>
                  <td>{r.pres}</td>
                  <td>{r.flow}</td>
                  <td>{r.light}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
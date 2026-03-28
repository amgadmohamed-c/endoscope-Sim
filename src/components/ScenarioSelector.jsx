import { SCENARIOS } from '../constants'
import styles from './ScenarioSelector.module.css'

export default function ScenarioSelector({ current, onChange }) {
  return (
    <div className={styles.list}>
      {SCENARIOS.map(sc => (
        <button
          key={sc.id}
          className={`${styles.btn} ${current === sc.id ? styles.active : ''} ${current === sc.id ? styles[sc.tagCls] : ''}`}
          onClick={() => onChange(sc.id)}
        >
          {sc.label}
          <span className={`${styles.badge} ${styles[sc.badgeCls]}`}>{sc.badge}</span>
        </button>
      ))}
    </div>
  )
}

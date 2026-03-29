import styles from './MetricCard.module.css'

export default function MetricCard({ name, value, unit, pct, status }) {
  const barColor =
    status === 'danger' ? 'var(--danger)' :
    status === 'warn'   ? 'var(--warn)'   :
    'var(--accent)'

  return (
    <div className={`${styles.card} ${status ? styles[status] : ''}`}>
      <div className={styles.name}>{name}</div>
      <div>
        <span className={styles.value}>{value}</span>
        <span className={styles.unit}>{unit}</span>
      </div>
      <div className={styles.bar}>
        <div
          className={styles.fill}
          style={{ width: `${Math.min(100, pct).toFixed(1)}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}

import { useRef, useEffect } from 'react'
import styles from './FindingsLog.module.css'

export default function FindingsLog({ entries }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [entries.length])

  return (
    <>
      <div className={styles.header}>FINDINGS LOG</div>
      <div className={styles.scroll} ref={scrollRef}>
        {entries.map((e, i) => (
          <div key={i} className={`${styles.entry} ${e.type ? styles[e.type] : ''}`}>
            <span className={styles.ts}>{e.time}</span>
            {e.msg}
          </div>
        ))}
      </div>
    </>
  )
}

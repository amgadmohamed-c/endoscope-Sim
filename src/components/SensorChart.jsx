import { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'
import styles from './SensorChart.module.css'

export default function SensorChart({ data, color, label }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  // Create chart once
  useEffect(() => {
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: Array(data.length).fill(''),
        datasets: [{
          data: [...data],
          borderColor: color,
          borderWidth: 1.5,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: false },
        },
      },
    })
    return () => chartRef.current?.destroy()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Push new data without recreating the chart
  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.data.datasets[0].data = [...data]
    chartRef.current.update('none')
  }, [data])

  return (
    <div className={styles.block}>
      <div className={styles.label}>{label}</div>
      <div className={styles.box}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

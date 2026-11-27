import { useEffect, useState, type CSSProperties } from 'react'

interface ScoreRingProps {
  value: number
  label: string
  color?: string
  size?: number
}

const ScoreRing = ({ value, label, color = '#22D3EE', size = 116 }: ScoreRingProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      setDisplay(clamped)
      return
    }

    let frame = 0
    const started = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - started) / 900, 1)
      setDisplay(Math.round(clamped * progress))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [clamped])

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${clamped} out of 100`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="7"
          className="score-ring-track"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="7"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="score-ring-value"
          style={
            {
              '--ring-circumference': circumference,
              '--ring-offset': offset,
            } as CSSProperties
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="stat-value text-2xl text-ink">
          {display}
          <span className="text-sm text-muted-2">%</span>
        </span>
        <span className="mt-1 max-w-[80%] text-center text-[11px] leading-tight text-muted">
          {label}
        </span>
      </div>
    </div>
  )
}

export default ScoreRing

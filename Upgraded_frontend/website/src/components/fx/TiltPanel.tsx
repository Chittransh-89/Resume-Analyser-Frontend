import { useRef, type PointerEvent, type ReactNode } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const MAX_TILT_DEG = 6

interface TiltPanelProps {
  children: ReactNode
  className?: string
}

/**
 * Subtle CSS-3D tilt toward the cursor.
 * Writes straight to the element's style so pointer movement never re-renders React.
 * Mouse pointers only — touch and reduced-motion never see a transform.
 */
const TiltPanel = ({ children, className }: TiltPanelProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const reset = () => {
    const element = ref.current
    if (element) element.style.transform = ''
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== 'mouse') return

    const element = ref.current
    if (!element) return

    const rect = element.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    const offsetX = (event.clientX - rect.left) / rect.width - 0.5
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5

    element.style.transform = `perspective(1000px) rotateY(${
      offsetX * MAX_TILT_DEG * 2
    }deg) rotateX(${-offsetY * MAX_TILT_DEG * 2}deg)`
  }

  return (
    <div
      ref={ref}
      className={`tilt ${className ?? ''}`.trim()}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      {children}
    </div>
  )
}

export default TiltPanel

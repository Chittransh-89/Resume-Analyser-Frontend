import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface NodePoint {
  x: number
  y: number
  vx: number
  vy: number
}

interface NeuralFieldProps {
  className?: string
}

/**
 * Ambient "neural constellation": drifting nodes joined by proximity lines.
 * One canvas, transform-free drawing, DPR capped at 2, and the loop is parked
 * whenever the canvas is offscreen or the tab is hidden.
 */
const NeuralField = ({ className }: NeuralFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let nodes: NodePoint[] = []
    let frame = 0
    let running = false

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      if (width === 0 || height === 0) return

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Node budget scales with area, not with a fixed constant.
      const count =
        width < 640
          ? Math.min(26, Math.max(14, Math.round(width / 16)))
          : Math.min(64, Math.round(width / 18))

      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
      }))
    }

    const draw = (animate: boolean) => {
      if (width === 0 || height === 0) return
      context.clearRect(0, 0, width, height)

      const linkDistance = width < 640 ? 96 : 132

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i]

        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distance = Math.hypot(dx, dy)
          if (distance > linkDistance) continue

          const strength = 1 - distance / linkDistance
          context.strokeStyle = `rgba(34, 211, 238, ${strength * 0.16})`
          context.lineWidth = 1
          context.beginPath()
          context.moveTo(a.x, a.y)
          context.lineTo(b.x, b.y)
          context.stroke()
        }
      }

      for (const node of nodes) {
        if (animate) {
          node.x += node.vx
          node.y += node.vy
          if (node.x <= 0 || node.x >= width) node.vx *= -1
          if (node.y <= 0 || node.y >= height) node.vy *= -1
        }

        context.fillStyle = 'rgba(167, 139, 250, 0.5)'
        context.beginPath()
        context.arc(node.x, node.y, 1.4, 0, Math.PI * 2)
        context.fill()
      }
    }

    const loop = () => {
      if (!running) return
      draw(true)
      frame = window.requestAnimationFrame(loop)
    }

    const start = () => {
      if (running || reduced) return
      running = true
      frame = window.requestAnimationFrame(loop)
    }

    const stop = () => {
      running = false
      window.cancelAnimationFrame(frame)
    }

    build()

    if (reduced) {
      draw(false)
    } else {
      start()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) start()
          else stop()
        }
      },
      { threshold: 0 },
    )
    observer.observe(canvas)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') start()
      else stop()
    }
    document.addEventListener('visibilitychange', onVisibility)

    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        build()
        if (reduced) draw(false)
      }, 160)
    }
    window.addEventListener('resize', onResize)

    return () => {
      stop()
      window.clearTimeout(resizeTimer)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}

export default NeuralField

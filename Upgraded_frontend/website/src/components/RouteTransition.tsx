import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { useReducedMotion } from '../hooks/useReducedMotion'

/** Must stay in sync with the .route-exit transition duration in index.css. */
const EXIT_MS = 120

interface DisplayedRoute {
  path: string
  node: ReactNode
}

/**
 * Animates a route swap in two phases: the current page fades out, then the
 * incoming page mounts and fades in. The outgoing element is kept mounted during
 * the exit (no flash of empty content), and the shared Layout — navbar, footer,
 * backend polling — never remounts.
 */
const RouteTransition = () => {
  const location = useLocation()
  const outlet = useOutlet()
  const reduced = useReducedMotion()

  const [displayed, setDisplayed] = useState<DisplayedRoute>({
    path: location.pathname,
    node: outlet,
  })
  const [phase, setPhase] = useState<'in' | 'out'>('in')

  // The swap timer needs the newest outlet, but it must not retrigger this effect.
  const latestOutlet = useRef(outlet)
  latestOutlet.current = outlet

  useEffect(() => {
    if (location.pathname === displayed.path) return

    if (reduced) {
      setDisplayed({ path: location.pathname, node: latestOutlet.current })
      setPhase('in')
      return
    }

    setPhase('out')

    const timer = window.setTimeout(() => {
      setDisplayed({ path: location.pathname, node: latestOutlet.current })
      setPhase('in')
    }, EXIT_MS)

    return () => window.clearTimeout(timer)
  }, [location.pathname, displayed.path, reduced])

  return (
    <div
      key={displayed.path}
      className={`min-h-[60vh] ${phase === 'out' ? 'route-exit' : 'route-enter'}`}
    >
      {displayed.node}
    </div>
  )
}

export default RouteTransition

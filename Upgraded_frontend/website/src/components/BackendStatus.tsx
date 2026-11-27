/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { healthService } from '../services/api'

type BackendState = 'checking' | 'online' | 'warming' | 'not-ready' | 'offline'

interface BackendStatusValue {
  status: BackendState
  label: string
  refresh: () => void
}

const BackendStatusContext = createContext<BackendStatusValue>({
  status: 'checking',
  label: 'Checking…',
  refresh: () => undefined,
})

const STATUS_LABELS: Record<BackendState, string> = {
  checking: 'Checking…',
  online: 'Online',
  warming: 'Starting up',
  'not-ready': 'Not ready',
  offline: 'Offline',
}

/** Whole pill carries the state colour, so it is readable without hunting for the dot. */
const PILL_CLASS: Record<BackendState, string> = {
  checking: 'border-line bg-surface-2 text-ink-soft',
  online: 'border-good/40 bg-good/10 text-good',
  warming: 'border-warn/40 bg-warn/10 text-warn',
  'not-ready': 'border-bad/40 bg-bad/10 text-bad',
  offline: 'border-bad/40 bg-bad/10 text-bad',
}

const DOT_CLASS: Record<BackendState, string> = {
  checking: 'bg-muted-2 animate-pulse',
  online: 'bg-good',
  warming: 'bg-warn animate-pulse',
  'not-ready': 'bg-bad',
  offline: 'bg-bad',
}

/**
 * A reachable URL is not the same as a working backend. Green requires the
 * payload to be this API's own shape: a `name` field (which a generic mock or a
 * different service on the port will not return), `status: "online"`, and
 * `brain_loaded === true` as a real boolean.
 */
function interpretHealth(payload: unknown): BackendState {
  if (!payload || typeof payload !== 'object') return 'not-ready'

  const record = payload as Record<string, unknown>
  if (typeof record.name !== 'string' || record.name.trim() === '') return 'not-ready'
  if (record.status !== 'online') return 'not-ready'
  if (record.brain_loaded !== true) return 'warming'

  return 'online'
}

export function useBackendStatus() {
  return useContext(BackendStatusContext)
}

export function BackendStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<BackendState>('checking')

  const statusRef = useRef<BackendState>('checking')
  statusRef.current = status

  const check = useCallback(async () => {
    try {
      const health: unknown = await healthService.checkHealth()
      setStatus(interpretHealth(health))
    } catch {
      setStatus('offline')
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let timer = 0

    // Re-check quickly while degraded, slowly once healthy.
    // The first check always runs so the badge never sits on "Checking…" — a
    // page opened in a background tab must still resolve its state.
    const tick = async (first = false) => {
      if (cancelled) return
      if (first || document.visibilityState === 'visible') await check()
      if (cancelled) return
      const delay = statusRef.current === 'online' ? 30000 : 6000
      timer = window.setTimeout(() => void tick(), delay)
    }

    void tick(true)

    const onVisible = () => {
      if (document.visibilityState === 'visible') void check()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [check])

  return (
    <BackendStatusContext.Provider
      value={{ status, label: STATUS_LABELS[status], refresh: () => void check() }}
    >
      {children}
    </BackendStatusContext.Provider>
  )
}

interface BackendStatusProps {
  /** Adds the word "Backend" for places without surrounding context, like the footer. */
  showContext?: boolean
}

export function BackendStatus({ showContext = false }: BackendStatusProps) {
  const { status, label, refresh } = useBackendStatus()
  const text = showContext ? `Backend ${label.toLowerCase()}` : label

  return (
    <button
      type="button"
      onClick={refresh}
      title="Check the backend again"
      className={`inline-flex min-h-0 items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${PILL_CLASS[status]}`}
      role="status"
      aria-live="polite"
      aria-label={`${text}. Re-check now.`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_CLASS[status]}`}
        aria-hidden="true"
      />
      {text}
    </button>
  )
}

/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { healthService } from '../services/api'

type BackendState = 'checking' | 'online' | 'warming' | 'offline'

interface BackendStatusValue {
  status: BackendState
  label: string
}

const BackendStatusContext = createContext<BackendStatusValue>({
  status: 'checking',
  label: 'Checking backend',
})

const STATUS_LABELS: Record<BackendState, string> = {
  checking: 'Checking backend',
  online: 'Backend ready',
  warming: 'Models warming',
  offline: 'Backend offline',
}

export function useBackendStatus() {
  return useContext(BackendStatusContext)
}

export function BackendStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<BackendState>('checking')

  const check = useCallback(async () => {
    try {
      const health = await healthService.checkHealth()
      if (health.status !== 'online') {
        setStatus('offline')
        return
      }
      setStatus(health.brain_loaded ? 'online' : 'warming')
    } catch {
      setStatus('offline')
    }
  }, [])

  useEffect(() => {
    void check()

    // Poll only while the tab is visible: a hidden tab should not spend requests.
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void check()
    }, 30000)

    const onVisible = () => {
      if (document.visibilityState === 'visible') void check()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [check])

  return (
    <BackendStatusContext.Provider value={{ status, label: STATUS_LABELS[status] }}>
      {children}
    </BackendStatusContext.Provider>
  )
}

const DOT_CLASS: Record<BackendState, string> = {
  checking: 'bg-muted-2',
  online: 'bg-good',
  warming: 'bg-warn',
  offline: 'bg-bad',
}

export function BackendStatus() {
  const { status, label } = useBackendStatus()

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-soft"
      role="status"
      aria-live="polite"
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_CLASS[status]} ${
          status === 'checking' || status === 'warming' ? 'animate-pulse' : ''
        }`}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}

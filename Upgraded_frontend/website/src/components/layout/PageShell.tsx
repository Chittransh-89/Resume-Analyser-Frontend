import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  className?: string
}

/** Constrains a page to the product shell width and resets scroll between routes. */
const PageShell = ({ children, className }: PageShellProps) => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className={`shell py-10 sm:py-14 ${className ?? ''}`.trim()}>{children}</div>
  )
}

export default PageShell

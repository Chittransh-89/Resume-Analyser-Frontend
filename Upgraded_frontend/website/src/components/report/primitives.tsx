import type { ReactNode } from 'react'

interface PanelProps {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

/** A report panel: titled surface with a hairline border and no decorative effects. */
export function Panel({ title, action, children, className }: PanelProps) {
  return (
    <section className={`panel min-w-0 overflow-hidden ${className ?? ''}`.trim()}>
      {title && (
        <div className="panel-head">
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {action}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}

interface InfoCellProps {
  label: string
  value: string
}

/** Label + value cell used throughout the report for flat, scannable facts. */
export function InfoCell({ label, value }: InfoCellProps) {
  return (
    <div className="min-w-0 panel-inset px-3 py-2.5">
      <p className="meta-label">{label}</p>
      <p className="mt-0.5 break-words text-sm font-medium text-ink">{value}</p>
    </div>
  )
}

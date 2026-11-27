import type { ReactNode } from 'react'

export interface KpiItem {
  label: string
  value: ReactNode
}

interface KpiStripProps {
  items: KpiItem[]
}

/** Compact row of report metrics. Numbers only where the backend returned them. */
const KpiStrip = ({ items }: KpiStripProps) => {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 panel-inset px-3 py-2.5">
          <dt className="meta-label">{item.label}</dt>
          <dd className="mt-1 min-w-0 text-sm font-semibold text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default KpiStrip

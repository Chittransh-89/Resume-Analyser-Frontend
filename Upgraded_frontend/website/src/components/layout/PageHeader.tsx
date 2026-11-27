import { useEffect, type ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  label?: string
  actions?: ReactNode
}

/** Page-level header: one title, one sentence of purpose, optional primary action. */
const PageHeader = ({ title, description, label, actions }: PageHeaderProps) => {
  useEffect(() => {
    document.title = `${title} — Resume Analyser`
  }, [title])

  return (
    <header className="mb-8 border-b border-line pb-6 sm:mb-10 sm:pb-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {label && <p className="meta-label mb-2">{label}</p>}
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-lede">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  )
}

export default PageHeader

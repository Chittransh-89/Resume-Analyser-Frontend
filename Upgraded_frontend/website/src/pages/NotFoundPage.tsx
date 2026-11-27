import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import { ArrowRight } from '../components/icons'

const NotFoundPage = () => {
  useEffect(() => {
    document.title = 'Page not found — Resume Analyser'
  }, [])

  return (
    <PageShell>
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
        <p className="stat-value text-sm text-muted-2">404</p>
        <h1 className="mt-3 page-title">This page does not exist</h1>
        <p className="mt-4 text-muted">
          The address you opened is not part of the product. Start from the workspace instead.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/" className="btn btn-secondary">
            Home
          </Link>
          <Link to="/analyze" className="btn btn-primary">
            Analyze a resume
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </PageShell>
  )
}

export default NotFoundPage

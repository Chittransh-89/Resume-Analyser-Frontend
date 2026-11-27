import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PageFallback from './components/layout/PageFallback'
import { pageImports } from './routes/preload'

const AnalyzePage = lazy(pageImports.analyze)
const ClassifyPage = lazy(pageImports.classify)
const AdvisorPage = lazy(pageImports.advisor)
const AboutPage = lazy(pageImports.about)
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const deferred = (node: ReactNode) => <Suspense fallback={<PageFallback />}>{node}</Suspense>

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="analyze" element={deferred(<AnalyzePage />)} />
          <Route path="classify" element={deferred(<ClassifyPage />)} />
          <Route path="advisor" element={deferred(<AdvisorPage />)} />
          <Route path="about" element={deferred(<AboutPage />)} />
          <Route path="*" element={deferred(<NotFoundPage />)} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

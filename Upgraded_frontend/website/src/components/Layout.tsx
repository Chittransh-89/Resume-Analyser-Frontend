import { BackendStatusProvider } from './BackendStatus'
import Navbar from './Navbar'
import Footer from './Footer'
import RouteTransition from './RouteTransition'

const Layout = () => {
  return (
    <BackendStatusProvider>
      <div className="flex min-h-screen flex-col bg-canvas">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-ink focus:shadow-panel"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1 pt-16">
          <RouteTransition />
        </main>
        <Footer />
      </div>
    </BackendStatusProvider>
  )
}

export default Layout

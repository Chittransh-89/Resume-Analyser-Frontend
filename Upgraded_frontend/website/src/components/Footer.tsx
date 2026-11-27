import { Link } from 'react-router-dom'
import { BackendStatus } from './BackendStatus'
import { Github, Linkedin } from './icons'

const PRODUCT_LINKS = [
  { to: '/analyze', label: 'Resume analysis' },
  { to: '/classify', label: 'Role detection' },
  { to: '/advisor', label: 'Career advisor' },
  { to: '/about', label: 'About' },
]

const STACK = [
  'Groq LLaMA 3',
  'GitHub Models GPT-4o',
  'SentenceTransformers E5',
  'FastAPI',
  'ChromaDB',
  'pdfplumber',
]

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-line bg-canvas">
      <div className="shell py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-cyan font-display text-sm font-bold text-[#061021]"
                aria-hidden="true"
              >
                R
              </span>
              <span className="font-display text-[15px] font-bold text-ink">Resume Analyser</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Resume scoring against a real job description, skill-gap detection, bullet rewrites,
              and an AI career advisor — in one workspace.
            </p>
            <div className="mt-5">
              <BackendStatus showContext />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">Product</h3>
            <ul className="mt-4 space-y-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">Built with</h3>
            <ul className="mt-4 space-y-2">
              {STACK.map((item) => (
                <li key={item} className="text-sm text-muted">
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-col gap-2">
              <a
                href="https://github.com/Chittransh-89"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
              >
                <Github size={16} />
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/chittransh-verma-525992338/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
              >
                <Linkedin size={16} />
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} Resume Analyser · Built by{' '}
            <span className="font-medium text-ink">Chittransh Verma</span>
          </p>
          <p className="text-xs">
            Files are sent only to the configured analysis backend.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

import PageShell from '../components/layout/PageShell'
import PageHeader from '../components/layout/PageHeader'
import { Panel } from '../components/report/primitives'
import { ArrowRight, Check, Github, Linkedin } from '../components/icons'

const CAPABILITIES = [
  {
    title: 'Document classification',
    detail:
      'Identifies whether a file reads as a resume or a job description, extracts the target role, and returns a confidence score.',
  },
  {
    title: 'Match scoring',
    detail:
      'Compares the resume against the job description using semantic similarity plus extracted required and preferred skills.',
  },
  {
    title: 'Written review',
    detail:
      'Returns strengths, weaknesses, and a summary of why the match scored the way it did.',
  },
  {
    title: 'Bullet rewriting',
    detail:
      'Rewrites individual resume bullets and reports how many of them changed.',
  },
  {
    title: 'Career advisory',
    detail:
      'A chat advisor with retrieval over a knowledge base and optional live web search for resources.',
  },
]

const STACK: { group: string; items: string[] }[] = [
  { group: 'Frontend', items: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'React Router'] },
  { group: 'Backend', items: ['FastAPI', 'Uvicorn', 'Python', 'AsyncIO'] },
  { group: 'Models', items: ['Groq LLaMA 3', 'GitHub Models GPT-4o', 'SentenceTransformers E5'] },
  { group: 'Retrieval & parsing', items: ['ChromaDB', 'pdfplumber', 'Regex extraction'] },
]

const AboutPage = () => {
  return (
    <PageShell>
      <PageHeader
        label="About"
        title="Resume Analyser"
        description="A resume scoring and career advisory workspace. Two tools share one backend: an analyser that reads documents, and an advisor that answers career questions."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
        <div className="min-w-0 space-y-6">
          <Panel title="What the product does">
            <ul className="space-y-4">
              {CAPABILITIES.map((capability) => (
                <li key={capability.title} className="flex gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/10 text-cyan"
                    aria-hidden="true"
                  >
                    <Check size={12} strokeWidth={2.4} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{capability.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted">{capability.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="How your data is handled">
            <div className="space-y-3 text-sm leading-relaxed text-ink-soft">
              <p>
                Documents you upload are posted directly to the analysis backend configured for this
                build. The response is rendered in your browser.
              </p>
              <p>
                There are no accounts and no server-side history in this app. A refresh clears the
                current report, and conversations are held in the tab only.
              </p>
              <p className="text-muted">
                If a request fails, the error is shown in place — nothing is retried silently beyond
                the client&apos;s configured retry policy.
              </p>
            </div>
          </Panel>

          <Panel title="Stack">
            <div className="grid gap-5 sm:grid-cols-2">
              {STACK.map((group) => (
                <div key={group.group} className="min-w-0">
                  <p className="meta-label">{group.group}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span key={item} className="tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel title="Built by">
            <p className="font-display text-xl font-bold text-ink">Chittransh Verma</p>
            <p className="mt-1 text-sm text-muted">
              3rd year B.Tech CSE · AI/ML and software development
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {['Machine Learning', 'NLP', 'Python', 'FastAPI', 'LLM integration'].map((item) => (
                <span key={item} className="tag">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-5 space-y-2">
              <a
                href="https://github.com/Chittransh-89"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 panel-inset p-3 transition-colors hover:border-line-strong"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-3 text-ink"
                  aria-hidden="true"
                >
                  <Github size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">GitHub</span>
                  <span className="block truncate text-xs text-muted">@Chittransh-89</span>
                </span>
                <ArrowRight size={15} className="shrink-0 text-muted" />
              </a>

              <a
                href="https://www.linkedin.com/in/chittransh-verma-525992338/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 panel-inset p-3 transition-colors hover:border-line-strong"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-3 text-ink"
                  aria-hidden="true"
                >
                  <Linkedin size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">LinkedIn</span>
                  <span className="block truncate text-xs text-muted">Chittransh Verma</span>
                </span>
                <ArrowRight size={15} className="shrink-0 text-muted" />
              </a>
            </div>
          </Panel>

          <Panel title="Current limitations">
            <ul className="space-y-2 text-sm leading-relaxed text-muted">
              <li>Requires the analysis backend to be running and reachable.</li>
              <li>Scanned or image-only PDFs extract poorly.</li>
              <li>No saved history yet — each report lives only in the tab.</li>
            </ul>
          </Panel>
        </div>
      </div>
    </PageShell>
  )
}

export default AboutPage

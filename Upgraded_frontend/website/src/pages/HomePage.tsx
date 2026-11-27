import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import ScoreRing from '../components/ScoreRing'
import KpiStrip from '../components/report/KpiStrip'
import SkillGroups from '../components/report/SkillGroups'
import BulletDiff from '../components/report/BulletDiff'
import NeuralField from '../components/fx/NeuralField'
import TiltPanel from '../components/fx/TiltPanel'
import Reveal from '../components/fx/Reveal'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { ArrowRight, Briefcase, Chat, FileText, Target } from '../components/icons'
import type { BulletImprovement } from '../types/api'

const SAMPLE_MATCHED = ['Python', 'FastAPI', 'Machine Learning', 'Docker', 'PyTorch']
const SAMPLE_MISSING = ['Kubernetes', 'Spark', 'Transformers']
const SAMPLE_BULLETS: BulletImprovement[] = [
  {
    original: 'Worked on machine learning models and APIs.',
    improved:
      'Built and deployed a machine-learning pipeline in Python and FastAPI, cutting inference latency by 35%.',
    changed: true,
  },
]

const CAPABILITIES = [
  {
    to: '/analyze',
    icon: FileText,
    title: 'Resume analysis',
    description:
      'Upload a resume and a job description. Get a match score, semantic similarity, matched and missing skills, a written review, and rewritten bullets.',
    cta: 'Run an analysis',
  },
  {
    to: '/classify',
    icon: Target,
    title: 'Role detection',
    description:
      'Upload one document and confirm whether it reads as a resume or a job description, which role it points to, and how confident the classifier is.',
    cta: 'Check a document',
  },
  {
    to: '/advisor',
    icon: Chat,
    title: 'Career advisor',
    description:
      'Ask CareerBuddy about roadmaps, required skills, interview preparation, or learning resources. Answers come back as markdown with optional live sources.',
    cta: 'Ask a question',
  },
]

const STEPS = [
  {
    title: 'Upload both documents',
    detail: 'A resume and the job description you are targeting. PDF, DOC, or DOCX.',
  },
  {
    title: 'Score and compare',
    detail:
      'The backend parses both files, extracts skills, and scores the match with semantic similarity.',
  },
  {
    title: 'Act on the report',
    detail:
      'Work through the gaps, apply the bullet rewrites, and ask the advisor what to learn next.',
  },
]

const HomePage = () => {
  const heroFxRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  // Pointer-device-only parallax on the hero backdrop, capped and rAF-throttled.
  useEffect(() => {
    if (reduced) return
    if (typeof window.matchMedia !== 'function') return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let frame = 0
    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      frame = window.requestAnimationFrame(() => {
        const element = heroFxRef.current
        if (element) {
          const offset = Math.min(window.scrollY * 0.08, 40)
          element.style.transform = `translate3d(0, ${offset}px, 0)`
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.cancelAnimationFrame(frame)
    }
  }, [reduced])

  return (
    <>
      <div className="hero-ambient relative overflow-hidden border-b border-line">
        <div
          ref={heroFxRef}
          className="pointer-events-none absolute inset-0 opacity-90"
          aria-hidden="true"
        >
          <NeuralField className="h-full w-full" />
        </div>

        <PageShell className="relative">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
            <div className="min-w-0">
              <p className="tag tag-violet">
                <span className="h-1.5 w-1.5 rounded-full bg-violet" aria-hidden="true" />
                Career intelligence platform
              </p>

              <h1 className="mt-5 font-display text-[clamp(2.1rem,5.4vw,3.4rem)] font-bold leading-[1.04] tracking-[-0.03em] text-ink">
                Score your resume against the job you actually want.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
                Upload a resume and a job description. You get a match score, the skills you are
                missing, a written review, and rewritten bullets — then ask CareerBuddy what to
                fix first.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/analyze" className="btn btn-primary">
                  Analyze a resume
                  <ArrowRight size={17} />
                </Link>
                <Link to="/advisor" className="btn btn-secondary">
                  Ask CareerBuddy
                  <Chat size={17} />
                </Link>
              </div>

              <p className="mt-6 text-xs leading-relaxed text-muted">
                Files are sent only to the configured analysis backend. Nothing is stored in this
                browser.
              </p>
            </div>

            <div className="min-w-0">
              <TiltPanel className="panel overflow-hidden">
                <div className="panel-head">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink">Report preview</p>
                    <span className="tag">Sample data</span>
                  </div>
                  <span className="text-xs text-muted">ML engineer</span>
                </div>

                <div className="space-y-5 p-4 sm:p-5">
                  <div className="flex items-center gap-5">
                    <ScoreRing value={82} label="Final score" size={104} />
                    <div className="min-w-0 flex-1">
                      <KpiStrip
                        items={[
                          { label: 'Semantic match', value: '68%' },
                          {
                            label: 'Verdict',
                            value: <span className="tag tag-good">Strong match</span>,
                          },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="rule" />

                  <SkillGroups matched={SAMPLE_MATCHED} missing={SAMPLE_MISSING} limit={5} />

                  <div className="rule" />

                  <div>
                    <p className="meta-label mb-2">Bullet rewrite</p>
                    <BulletDiff bullets={SAMPLE_BULLETS} />
                  </div>
                </div>
              </TiltPanel>

              <p className="mt-3 text-xs text-muted">
                Illustrative output built from a sample resume and job description — not a result
                from your files.
              </p>
            </div>
          </div>
        </PageShell>
      </div>

      <div className="border-b border-line bg-surface/40">
        <PageShell>
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-ink">
              Three tools, one workspace
            </h2>
            <p className="page-lede">
              Each capability runs against your own configured backend. Nothing here is simulated
              except the clearly labelled sample above.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {CAPABILITIES.map((capability, index) => {
              const Icon = capability.icon
              return (
                <Reveal key={capability.to} delay={index * 70}>
                  <Link
                    to={capability.to}
                    className="panel group flex h-full flex-col p-5 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-strong"
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-3 text-cyan"
                      aria-hidden="true"
                    >
                      <Icon size={18} />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold text-ink">
                      {capability.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                      {capability.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-cyan">
                      {capability.cta}
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </PageShell>
      </div>

      <PageShell>
        <Reveal>
          <h2 className="font-display text-2xl font-bold text-ink">How it works</h2>
        </Reveal>

        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Reveal delay={index * 70}>
                <div className="panel h-full p-5">
                  <p className="stat-value text-xs text-cyan">0{index + 1}</p>
                  <h3 className="mt-2 text-sm font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.detail}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal delay={80}>
          <div className="panel mt-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-electric"
              aria-hidden="true"
            >
              <Briefcase size={18} />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-ink">Where your files go</h3>
              <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">
                Documents are posted directly to the analysis backend you configure, and the
                response is rendered in this browser. There is no account system and no
                server-side history in this app, so a refresh clears the current report.
              </p>
              <Link
                to="/about"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-cyan"
              >
                Read more about the product
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </Reveal>
      </PageShell>
    </>
  )
}

export default HomePage

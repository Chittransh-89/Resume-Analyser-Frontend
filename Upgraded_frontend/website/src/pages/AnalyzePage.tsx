import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import PageHeader from '../components/layout/PageHeader'
import FileDrop from '../components/FileDrop'
import ReportView from '../components/report/ReportView'
import { documentService, getErrorMessage } from '../services/api'
import type { AnalysisResponse } from '../types/api'
import { AlertTriangle, Check, Lightbulb, Refresh, Sparkle } from '../components/icons'

type Status = 'idle' | 'loading' | 'success' | 'error'

const REPORT_CONTENTS = [
  'A match score and semantic similarity',
  'Matched and missing skills',
  'Role comparison for both documents',
  'Strengths and weaknesses, in writing',
  'Line-by-line bullet rewrites',
]

/** Honest activity labels. The backend reports no progress, so this is elapsed time only. */
function stageFor(seconds: number) {
  if (seconds < 6) return 'Reading the uploaded documents'
  if (seconds < 18) return 'Extracting skills and comparing both documents'
  if (seconds < 40) return 'Scoring the match and drafting the review'
  return 'Rewriting bullets — longer documents take longer'
}

const AnalyzePage = () => {
  const [resume, setResume] = useState<File | null>(null)
  const [jd, setJd] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [generatedAt, setGeneratedAt] = useState<Date | undefined>(undefined)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (status !== 'loading') {
      setElapsed(0)
      return
    }

    const started = Date.now()
    const interval = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - started) / 1000))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [status])

  const analyze = async () => {
    if (!resume || !jd) {
      setError('Upload both a resume and a job description before analysing.')
      return
    }

    setStatus('loading')
    setError('')
    setResult(null)

    try {
      const data = await documentService.analyze(resume, jd)
      setResult(data)
      setGeneratedAt(new Date())
      setStatus('success')
    } catch (err) {
      setError(getErrorMessage(err))
      setStatus('error')
    }
  }

  const reset = () => {
    setResume(null)
    setJd(null)
    setResult(null)
    setGeneratedAt(undefined)
    setError('')
    setStatus('idle')
  }

  return (
    <PageShell>
      <PageHeader
        label="Resume analysis"
        title="Analyze"
        description="Upload the resume and the job description. The backend scores the match, names the gaps, reviews the writing, and rewrites the weakest bullets."
        actions={
          <Link to="/classify" className="btn btn-secondary">
            Check a single document
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <form
          className="panel p-5 lg:sticky lg:top-24"
          onSubmit={(event) => {
            event.preventDefault()
            void analyze()
          }}
        >
          <h2 className="text-sm font-semibold text-ink">Documents</h2>
          <p className="mt-1 text-sm text-muted">Both files are required for a full match.</p>

          <div className="mt-4 space-y-3">
            <FileDrop
              id="resume-file"
              label="Resume"
              hint="PDF, DOC, or DOCX · up to 10 MB"
              file={resume}
              onFile={setResume}
              onError={setError}
              disabled={status === 'loading'}
            />
            <FileDrop
              id="jd-file"
              label="Job description"
              hint="PDF, DOC, or DOCX · up to 10 MB"
              file={jd}
              onFile={setJd}
              onError={setError}
              disabled={status === 'loading'}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-4 w-full"
            disabled={status === 'loading' || !resume || !jd}
          >
            {status === 'loading' ? (
              <>
                <span
                  className="spinner h-4 w-4 rounded-full border-2 border-[#061021]/30 border-t-[#061021]"
                  aria-hidden="true"
                />
                Analyzing…
              </>
            ) : (
              <>
                <Sparkle size={16} />
                Analyze resume
              </>
            )}
          </button>

          {error && status !== 'error' && (
            <div
              className="mt-4 flex gap-3 rounded-lg border border-bad/30 bg-bad/10 p-3.5 text-sm text-bad"
              role="alert"
            >
              <AlertTriangle size={17} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <p className="mt-4 text-xs leading-relaxed text-muted">
            Analysis can take up to a minute. The files are sent only to the configured backend and
            are not stored in this browser.
          </p>
        </form>

        <div className="min-w-0" aria-live="polite" aria-busy={status === 'loading'}>
          {status === 'idle' && (
            <div className="panel p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-ink">No analysis yet</h2>
              <p className="mt-1.5 text-sm text-muted">
                Add both documents on the left. The report contains:
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {REPORT_CONTENTS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink-soft">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/10 text-cyan"
                      aria-hidden="true"
                    >
                      <Check size={12} strokeWidth={2.4} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-start gap-3 panel-inset p-4">
                <Lightbulb size={18} className="mt-0.5 shrink-0 text-warn" />
                <p className="text-sm leading-relaxed text-muted">
                  Best results come from a text-based PDF. Scanned images and unusual layouts can
                  reduce extraction quality.
                </p>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="panel flex min-h-[22rem] flex-col items-center justify-center p-8 text-center">
              <span
                className="spinner h-10 w-10 rounded-full border-[3px] border-cyan/20 border-t-cyan"
                aria-hidden="true"
              />
              <p className="mt-5 font-display text-lg font-bold text-ink">
                {stageFor(elapsed)}
              </p>
              <div className="scan-track mt-4" aria-hidden="true" />
              <p className="stat-value mt-3 text-sm text-muted">{elapsed}s elapsed</p>
              <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted">
                The backend does not stream progress, so this shows elapsed time rather than a
                percentage. Keep this tab open.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="panel flex min-h-[22rem] flex-col items-center justify-center p-8 text-center">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full bg-bad/10 text-bad"
                aria-hidden="true"
              >
                <AlertTriangle size={22} />
              </span>
              <p className="mt-4 font-display text-lg font-bold text-ink">
                The analysis did not finish
              </p>
              <p className="mt-2 max-w-sm text-sm text-muted">
                {error ||
                  'The backend could not be reached. Check that it is running, then try again.'}
              </p>
              <button type="button" className="btn btn-secondary mt-5" onClick={analyze}>
                <Refresh size={16} />
                Try again
              </button>
            </div>
          )}

          {status === 'success' && result && (
            <ReportView result={result} generatedAt={generatedAt} onReset={reset} />
          )}
        </div>
      </div>
    </PageShell>
  )
}

export default AnalyzePage

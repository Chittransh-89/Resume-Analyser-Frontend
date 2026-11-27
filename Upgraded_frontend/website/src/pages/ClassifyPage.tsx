import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import PageHeader from '../components/layout/PageHeader'
import FileDrop from '../components/FileDrop'
import { InfoCell, Panel } from '../components/report/primitives'
import { documentService, getErrorMessage } from '../services/api'
import type { ClassificationResponse } from '../types/api'
import { AlertTriangle, Check, FileText, Refresh, X } from '../components/icons'

type Status = 'idle' | 'loading' | 'success' | 'error'

const ClassifyPage = () => {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<ClassificationResponse | null>(null)
  const [error, setError] = useState('')

  const handleFile = (next: File | null) => {
    setFile(next)
    setError('')
    if (!next) {
      setResult(null)
      setStatus('idle')
    }
  }

  const classify = async () => {
    if (!file) {
      setError('Choose a resume or job description first.')
      return
    }

    setStatus('loading')
    setError('')
    setResult(null)

    try {
      const data = await documentService.classify(file)
      setResult(data)
      setStatus('success')
    } catch (err) {
      setError(getErrorMessage(err))
      setStatus('error')
    }
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    setError('')
    setStatus('idle')
  }

  const validation = result?.validation ?? result
  const isResume = validation?.resume !== false
  const role = (validation?.job_role || 'Not detected').replace(/_/g, ' ')
  const rawType = (validation?.type || (isResume ? 'Resume' : 'Job description')).replace(
    /_/g,
    ' ',
  )
  const rawConfidence = Number(validation?.confidence ?? 0)
  const confidencePercent = Number.isFinite(rawConfidence)
    ? Math.max(0, Math.min(100, Math.round(rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence)))
    : 0

  return (
    <PageShell>
      <PageHeader
        label="Role detection"
        title="Role check"
        description="Upload one document. The classifier reports whether it reads as a resume or a job description, which role it points to, and how confident it is."
        actions={
          <Link to="/analyze" className="btn btn-secondary">
            Run a full analysis
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <form
          className="panel p-5"
          onSubmit={(event) => {
            event.preventDefault()
            void classify()
          }}
        >
          <h2 className="text-sm font-semibold text-ink">Document</h2>
          <p className="mt-1 text-sm text-muted">
            One resume or one job description, in PDF, DOC, or DOCX.
          </p>

          <div className="mt-4">
            <FileDrop
              id="classify-file"
              label="Resume or job description"
              file={file}
              onFile={handleFile}
              onError={setError}
              disabled={status === 'loading'}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-4 w-full"
            disabled={status === 'loading' || !file}
          >
            {status === 'loading' ? (
              <>
                <span
                  className="spinner h-4 w-4 rounded-full border-2 border-[#061021]/30 border-t-[#061021]"
                  aria-hidden="true"
                />
                Classifying…
              </>
            ) : (
              <>
                <FileText size={16} />
                Classify document
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
            Files are sent only to the configured analysis backend. Nothing is stored in this
            browser.
          </p>
        </form>

        <div className="min-w-0" aria-live="polite" aria-busy={status === 'loading'}>
          {status === 'idle' && (
            <div className="panel flex min-h-[20rem] flex-col justify-center p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-ink">No document checked yet</h2>
              <p className="mt-1.5 text-sm text-muted">
                Useful before a full analysis, or when you are not sure which file you downloaded.
              </p>
              <ol className="mt-5 space-y-3 text-sm text-muted">
                <li className="flex gap-3">
                  <span className="stat-value text-cyan" aria-hidden="true">
                    01
                  </span>
                  Detects whether the text reads as a resume or a job description.
                </li>
                <li className="flex gap-3">
                  <span className="stat-value text-cyan" aria-hidden="true">
                    02
                  </span>
                  Extracts the target role and normalises it to a single label.
                </li>
                <li className="flex gap-3">
                  <span className="stat-value text-cyan" aria-hidden="true">
                    03
                  </span>
                  Returns a confidence score and the raw validation object.
                </li>
              </ol>
            </div>
          )}

          {status === 'loading' && (
            <div className="panel flex min-h-[20rem] flex-col items-center justify-center p-8 text-center">
              <span
                className="spinner h-10 w-10 rounded-full border-[3px] border-cyan/20 border-t-cyan"
                aria-hidden="true"
              />
              <p className="mt-5 font-display text-lg font-bold text-ink">Reading the document</p>
              <div className="scan-track mt-4" aria-hidden="true" />
              <p className="mt-2 max-w-sm text-sm text-muted">
                Detecting the document type, the target role, and the confidence of the
                classification.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="panel flex min-h-[20rem] flex-col items-center justify-center p-8 text-center">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full bg-bad/10 text-bad"
                aria-hidden="true"
              >
                <AlertTriangle size={22} />
              </span>
              <p className="mt-4 font-display text-lg font-bold text-ink">
                Classification did not finish
              </p>
              <p className="mt-2 max-w-sm text-sm text-muted">
                {error ||
                  'The backend could not be reached. Check that it is running, then try again.'}
              </p>
              <button type="button" className="btn btn-secondary mt-5" onClick={classify}>
                <Refresh size={16} />
                Try again
              </button>
            </div>
          )}

          {status === 'success' && result && (
            <div className="fade-in space-y-4">
              <Panel
                title="Classification"
                action={
                  <span className={`tag ${isResume ? 'tag-good' : 'tag-warn'}`}>
                    {isResume ? <Check size={12} strokeWidth={2.4} /> : <X size={12} />}
                    {isResume ? 'Resume' : 'Job description'}
                  </span>
                }
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCell
                    label="Document type"
                    value={rawType.toLowerCase()}
                  />
                  <InfoCell label="Detected role" value={role.toLowerCase()} />
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="meta-label">Confidence</p>
                    <p className="stat-value text-sm text-ink">{confidencePercent}%</p>
                  </div>
                  <div
                    className="bar-track mt-2"
                    role="progressbar"
                    aria-label="Classification confidence"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={confidencePercent}
                  >
                    <div
                      className="bar-fill"
                      style={{ '--bar-scale': confidencePercent / 100 } as CSSProperties}
                    />
                  </div>
                </div>

                <p className="mt-4 text-sm text-muted">
                  {isResume
                    ? 'This file can be used as the resume side of a full analysis.'
                    : 'This file can be used as the job description side of a full analysis.'}
                </p>

                <details className="mt-6 panel-inset">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-ink-soft">
                    Raw API output
                  </summary>
                  <pre className="max-h-56 overflow-auto border-t border-line px-4 py-3 text-xs leading-relaxed text-ink-soft">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </Panel>

              <div className="flex flex-wrap gap-3">
                <button type="button" className="btn btn-secondary" onClick={reset}>
                  <Refresh size={16} />
                  Check another file
                </button>
                <Link to="/analyze" className="btn btn-primary">
                  Use it in a full analysis
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}

export default ClassifyPage

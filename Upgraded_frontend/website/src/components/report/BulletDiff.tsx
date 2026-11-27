import type { BulletImprovement } from '../../types/api'

const KEYWORDS = [
  'python',
  'scikit-learn',
  'machine learning',
  'logistic regression',
  'linear regression',
  'kaggle',
  'pandas',
  'numpy',
  'ai',
  'data',
  'classification',
  'predictive',
  'models',
  'tensorflow',
  'pytorch',
  'keras',
  'docker',
  'kubernetes',
  'aws',
  'azure',
  'gcp',
  'fastapi',
  'spark',
  'ci/cd',
  'git',
  'ml',
  'regression',
  'forecast',
  'accuracy',
  'pipeline',
  'production',
  'deployed',
  'designed',
  'developed',
  'nlp',
  'transformers',
  'bert',
  'llm',
]

const KEYWORD_SET = new Set(KEYWORDS.map((keyword) => keyword.toLowerCase()))

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const KEYWORD_PATTERN = new RegExp(`\\b(${KEYWORDS.map(escapeRegExp).join('|')})\\b`, 'gi')

function HighlightedText({ text }: { text: string }) {
  const parts = text.split(KEYWORD_PATTERN)
  return (
    <>
      {parts.map((part, index) =>
        KEYWORD_SET.has(part.toLowerCase()) ? (
          <mark key={`${part}-${index}`}>{part}</mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  )
}

interface BulletDiffProps {
  bullets: BulletImprovement[]
}

/** Original bullet against its rewrite, keyword-highlighted. */
const BulletDiff = ({ bullets }: BulletDiffProps) => {
  if (bullets.length === 0) {
    return <p className="text-sm text-muted">No bullet-level rewrites were returned.</p>
  }

  return (
    <ul className="space-y-3">
      {bullets.map((bullet, index) => {
        const original = bullet.original || 'No original bullet returned.'
        const improved = bullet.improved || ''
        const changed = Boolean(bullet.changed)

        return (
          <li key={index} className="panel-inset p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`tag ${changed ? 'tag-cyan' : ''}`}>
                {changed ? 'Improved' : 'No change needed'}
              </span>
              <span className="text-xs text-muted">Bullet {index + 1}</span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted line-through decoration-bad/40">
              <HighlightedText text={original} />
            </p>

            {changed && improved && (
              <p className="mt-2 text-sm leading-relaxed text-ink">
                <HighlightedText text={improved} />
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default BulletDiff

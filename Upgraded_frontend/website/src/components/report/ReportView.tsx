import type { ReactNode } from 'react'
import ScoreRing from '../ScoreRing'
import KpiStrip, { type KpiItem } from './KpiStrip'
import SkillGroups from './SkillGroups'
import BulletDiff from './BulletDiff'
import { InfoCell, Panel } from './primitives'
import { AlertTriangle, Check, Lightbulb, Refresh, X } from '../icons'
import type { AnalysisResponse } from '../../types/api'

function displayRoles(roles?: string[]) {
  if (!roles || roles.length === 0) return 'Unknown'
  return roles.map((role) => role.replace(/_/g, ' ')).join(', ')
}

function formatExperience(years?: number) {
  if (typeof years !== 'number' || Number.isNaN(years)) return 'Not provided'
  if (years < 1) return 'Less than 1 year'
  const whole = Math.floor(years)
  return `${whole} ${whole === 1 ? 'year' : 'years'}`
}

function verdictTone(verdict: string) {
  const value = verdict.toUpperCase()
  if (value.includes('PARTIAL') || value.includes('UNCERTAIN')) return 'tag-warn'
  if (value.includes('MISMATCH') || value.includes('WEAK') || value.includes('POOR')) {
    return 'tag-bad'
  }
  if (value.includes('MATCH') || value.includes('STRONG') || value.includes('GOOD')) {
    return 'tag-good'
  }
  return 'tag-warn'
}

function BulletList({
  items,
  tone,
  icon,
}: {
  items: string[]
  tone: 'good' | 'warn'
  icon: ReactNode
}) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2 text-sm text-ink-soft">
          <span className={`mt-0.5 shrink-0 ${tone === 'good' ? 'text-good' : 'text-warn'}`}>
            {icon}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

interface ReportViewProps {
  result: AnalysisResponse
  onReset?: () => void
  generatedAt?: Date
}

/** The full analysis report. Shared by real analyses and labelled sample data. */
const ReportView = ({ result, onReset, generatedAt }: ReportViewProps) => {
  const validation = result.document_validation
  const candidate = result.candidate
  const jobNeeds = result.job_needs
  const review = result.review
  const improvements = result.improvements

  const finalScore = Math.round(result.score?.final_score ?? 0)
  const semanticScore = Math.round(
    result.analysis?.semantic_score ?? result.score?.semantic_score ?? 0,
  )
  const verdict = result.score?.verdict || 'Uncertain'
  const matched = result.analysis?.matched_skills ?? []
  const missing = result.analysis?.missing_skills ?? []
  const bullets = improvements?.line_by_line ?? []
  const topSuggestions = improvements?.top_suggestions ?? []
  const summary = improvements?.summary
  const roleMatch = Boolean(validation?.role_match)

  const kpis: KpiItem[] = [
    { label: 'Semantic match', value: `${semanticScore}%` },
    {
      label: 'Verdict',
      value: (
        <span className={`tag ${verdictTone(verdict)}`}>
          {verdict.replace(/_/g, ' ').toLowerCase()}
        </span>
      ),
    },
    {
      label: 'Role match',
      value: (
        <span className={`tag ${roleMatch ? 'tag-good' : 'tag-bad'}`}>
          {roleMatch ? 'Match' : 'Mismatch'}
        </span>
      ),
    },
    {
      label: 'Bullets improved',
      value: `${summary?.improved_count ?? 0} / ${summary?.total_bullets ?? 0}`,
    },
  ]

  return (
    <div className="fade-in space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold text-ink">Analysis report</h2>
          <p className="mt-1 text-sm text-muted">
            {candidate?.name ? `Prepared for ${candidate.name}` : 'Match report'}
            {generatedAt && (
              <>
                {' · '}
                <span className="stat-value text-xs">
                  {generatedAt.toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </>
            )}
          </p>
        </div>
        {onReset && (
          <button type="button" className="btn btn-secondary" onClick={onReset}>
            <Refresh size={16} />
            New analysis
          </button>
        )}
      </div>

      <div className="panel flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:gap-7 sm:p-5">
        <div className="flex shrink-0 items-center gap-4">
          <ScoreRing value={finalScore} label="Final score" />
        </div>
        <div className="min-w-0 flex-1">
          <KpiStrip items={kpis} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Document validation"
          action={
            <span className={`tag ${roleMatch ? 'tag-good' : 'tag-bad'}`}>
              {roleMatch ? <Check size={12} strokeWidth={2.4} /> : <X size={12} />}
              {roleMatch ? 'Roles match' : 'Roles do not match'}
            </span>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoCell label="Resume role" value={displayRoles(validation?.resume_roles)} />
            <InfoCell
              label="Job description role"
              value={displayRoles(validation?.jd_roles)}
            />
          </div>
        </Panel>

        <Panel title="Candidate">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoCell label="Name" value={candidate?.name || 'Not provided'} />
            <InfoCell label="Email" value={candidate?.email || 'Not provided'} />
            <InfoCell label="Experience" value={formatExperience(candidate?.experience_years)} />
            <InfoCell label="Projects" value={String(candidate?.projects_count ?? 0)} />
          </div>
        </Panel>

        <Panel title="Job requirements">
          <InfoCell label="Job title" value={jobNeeds?.title || 'Unknown'} />
          <div className="mt-4">
            <p className="meta-label">Required skills</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(jobNeeds?.required_skills ?? []).length > 0 ? (
                jobNeeds?.required_skills?.map((skill) => (
                  <span key={skill} className="tag tag-cyan">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted">No required skills were returned.</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <p className="meta-label">Preferred skills</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(jobNeeds?.preferred_skills ?? []).length > 0 ? (
                jobNeeds?.preferred_skills?.map((skill) => (
                  <span key={skill} className="tag">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted">No preferred skills were returned.</p>
              )}
            </div>
          </div>
        </Panel>

        <Panel title="Skills">
          <SkillGroups matched={matched} missing={missing} />
        </Panel>
      </div>

      <Panel title="AI review">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="meta-label">Strengths</p>
            <div className="mt-2">
              {(review?.strengths ?? []).length > 0 ? (
                <BulletList
                  items={review?.strengths ?? []}
                  tone="good"
                  icon={<Check size={15} />}
                />
              ) : (
                <p className="text-sm text-muted">No strengths were returned.</p>
              )}
            </div>
          </div>
          <div>
            <p className="meta-label">Weaknesses</p>
            <div className="mt-2">
              {(review?.weaknesses ?? []).length > 0 ? (
                <BulletList
                  items={review?.weaknesses ?? []}
                  tone="warn"
                  icon={<AlertTriangle size={15} />}
                />
              ) : (
                <p className="text-sm text-muted">No weaknesses were returned.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-3 panel-inset p-4">
          <Lightbulb size={18} className="mt-0.5 shrink-0 text-warn" />
          <p className="text-sm leading-relaxed text-ink-soft">
            {review?.reason || 'No summary was returned.'}
          </p>
        </div>
      </Panel>

      <Panel title="Rewrite notes">
        <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
          <div className="panel-inset px-4 py-3">
            <p className="stat-value text-2xl text-ink">{summary?.total_bullets ?? 0}</p>
            <p className="meta-label mt-1">Bullets reviewed</p>
          </div>
          <div className="panel-inset px-4 py-3">
            <p className="stat-value text-2xl text-cyan">{summary?.improved_count ?? 0}</p>
            <p className="meta-label mt-1">Bullets improved</p>
          </div>
        </div>

        {topSuggestions.length > 0 && (
          <div className="mt-5">
            <p className="meta-label">Top suggestions</p>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-ink-soft">
              {topSuggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-5">
          <p className="meta-label">Line by line</p>
          <div className="mt-2">
            <BulletDiff bullets={bullets} />
          </div>
        </div>
      </Panel>
    </div>
  )
}

export default ReportView

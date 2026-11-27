interface SkillGroupsProps {
  matched: string[]
  missing: string[]
  limit?: number
}

/** Matched and missing skills as chip groups, with an overflow count. */
const SkillGroups = ({ matched, missing, limit = 14 }: SkillGroupsProps) => {
  return (
    <div className="space-y-5">
      <div>
        <p className="meta-label">Matched skills</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {matched.length > 0 ? (
            <>
              {matched.slice(0, limit).map((skill) => (
                <span key={skill} className="tag tag-good">
                  {skill}
                </span>
              ))}
              {matched.length > limit && (
                <span className="tag">+{matched.length - limit} more</span>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">No matched skills were returned.</p>
          )}
        </div>
      </div>

      <div>
        <p className="meta-label">Missing skills</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {missing.length > 0 ? (
            missing.map((skill) => (
              <span key={skill} className="tag tag-bad">
                {skill}
              </span>
            ))
          ) : (
            <p className="text-sm text-good">No missing skills were returned.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default SkillGroups

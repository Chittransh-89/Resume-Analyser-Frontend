export interface HealthResponse {
  status?: string
  brain_loaded?: boolean
  message?: string
}

export interface ClassificationValidation {
  type?: string
  resume?: boolean
  confidence?: number
  job_role?: string
}

export interface ClassificationResponse {
  validation?: ClassificationValidation
  type?: string
  resume?: boolean
  confidence?: number
  job_role?: string
}

export interface CandidateInfo {
  name?: string
  email?: string
  experience_years?: number
  projects_count?: number
}

export interface JobNeeds {
  title?: string
  required_skills?: string[]
  preferred_skills?: string[]
}

export interface Score {
  final_score?: number
  semantic_score?: number
  verdict?: string
}

export interface Analysis {
  matched_skills?: string[]
  missing_skills?: string[]
  semantic_score?: number
}

export interface Review {
  strengths?: string[]
  weaknesses?: string[]
  reason?: string
}

export interface BulletImprovement {
  original?: string
  improved?: string
  changed?: boolean
}

export interface Improvements {
  line_by_line?: BulletImprovement[]
  top_suggestions?: string[]
  summary?: {
    total_bullets?: number
    improved_count?: number
  }
}

export interface DocumentValidation {
  resume_roles?: string[]
  jd_roles?: string[]
  role_match?: boolean
}

export interface AnalysisResponse {
  document_validation?: DocumentValidation
  candidate?: CandidateInfo
  job_needs?: JobNeeds
  score?: Score
  analysis?: Analysis
  review?: Review
  improvements?: Improvements
}

export interface ChatRequest {
  message: string
  use_web_search?: boolean
}

export interface ChatResponse {
  response?: string
  used_web_search?: boolean
  google_links?: string[]
  youtube_links?: string[]
  detail?: string
  error?: string
}

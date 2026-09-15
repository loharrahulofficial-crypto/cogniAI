const BASE = '/api/v1'

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface Division {
  id: string
  name: string
  code: string
  wing: string
}

export interface Competency {
  id: string
  name: string
  description: string | null
  category: 'BEHAVIOURAL' | 'DOMAIN' | 'FUNCTIONAL'
  subjectTag: string | null
  activityId: string
}

export interface OfficerCompetency {
  id: string
  officerId: string
  competencyId: string
  currentLevel: number
  targetLevel: number
  evidenceSource: string
  lastAssessedAt: string
  competency: Competency
}

export interface Officer {
  id: string
  name: string
  email: string
  cadre: string
  divisionId: string
  tenure: string
  posting: string
  division: Division
  competencies: OfficerCompetency[]
}

export interface CourseCompetency {
  id: string
  courseId: string
  competencyId: string
  targetLevel: number
  competency: Competency
}

export interface Course {
  id: string
  identifier: string
  name: string
  description: string | null
  learningOutcome: string | null
  source: string
  organisation: string
  duration: string
  competencies: CourseCompetency[]
}

export interface GapRecord {
  id: string
  officerId: string
  competencyId: string
  gapSize: number
  priority: 'HIGH' | 'MED' | 'LOW'
  competency: Competency
  recommendedCourseIds: string[]
}

export interface Recommendation {
  id: string
  officerId: string
  courseId: string
  rationale: string
  priority: number
  course: {
    name: string
    source: string
    organisation: string
    duration: string
  }
}

// ── Fetchers ─────────────────────────────────────────────────────────────────

export const api = {
  officers: () => fetchJSON<Officer[]>('/officers'),
  officer: (id: string) => fetchJSON<Officer>(`/officers/${id}`),
  divisions: () => fetchJSON<Division[]>('/divisions'),
  competencies: () => fetchJSON<Competency[]>('/competencies'),
  courses: () => fetchJSON<Course[]>('/courses'),
  gaps: (officerId: string) => fetchJSON<GapRecord[]>(`/gaps/officer/${officerId}`),
  recommendations: (officerId: string) => fetchJSON<Recommendation[]>(`/recommendations/officer/${officerId}`),
  heatmap: (divisionId: string) => fetchJSON<Record<string, unknown>>(`/gaps/division/${divisionId}/heatmap`),
}

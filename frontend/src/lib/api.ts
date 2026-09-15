const BASE = '/api/v1'

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
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

export interface Assessment {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string | null
  competencyId: string
  targetLevel: number
  bloomLevel: string
  rationale: string
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewedBy: string | null
  reviewedAt: string | null
  sourceDocumentChunkId: string | null
  createdAt: string
  competency?: Competency
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  competencyId: string
  targetLevel: number
  bloomLevel: string
  rationale: string
}

export interface QuizGenerateResponse {
  questions: Assessment[]
  competencyNames: Record<string, string>
}

export interface QuizSubmitResponse {
  quizResult: {
    score: number
    maxScore: number
    percentage: number
    results: { assessmentId: string; correct: boolean; selectedOption: number; correctAnswer: number }[]
    proficiencyUpdates: { competencyId: string; oldLevel: number; newLevel: number }[]
  }
  rationale: string
}

export interface HeatmapEntry {
  competency: Competency
  gaps: { officerId: string; gapSize: number; officer: Officer }[]
  avgGap: number
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
  heatmap: (divisionId: string) => fetchJSON<HeatmapEntry[]>(`/gaps/division/${divisionId}/heatmap`),

  assessments: () => fetchJSON<Assessment[]>('/assessments'),
  reviewQueue: () => fetchJSON<Assessment[]>('/assessments/review-queue'),
  approveAssessment: (id: string) => postJSON<Assessment>(`/assessments/${id}/approve`, {}),
  rejectAssessment: (id: string) => postJSON<Assessment>(`/assessments/${id}/reject`, {}),

  generateQuiz: (officerId: string, count = 10) =>
    fetchJSON<QuizGenerateResponse>(`/assessments/quiz/${officerId}?count=${count}`),
  submitQuiz: (dto: { officerId: string; answers: { assessmentId: string; selectedOption: number; timeTakenMs?: number }[]; totalTimeTakenMs?: number }) =>
    postJSON<QuizSubmitResponse>('/assessments/quiz/submit', dto),
}

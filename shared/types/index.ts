/**
 * Shared types for UNNATI — generated from OpenAPI spec via openapi-typescript.
 *
 * Run `npm run generate:types` after core-api OpenAPI spec changes.
 * These types are consumed by both frontend and ai-service.
 */

// Placeholder until OpenAPI spec is generated from NestJS decorators.
// The actual types will be auto-generated from the core-api OpenAPI output.

export type CompetencyCategory = 'BEHAVIOURAL' | 'DOMAIN' | 'FUNCTIONAL'

export type BloomLevel = 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYSE' | 'EVALUATE' | 'CREATE'

export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5

export type MCQReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type GapPriority = 'HIGH' | 'MED' | 'LOW'

export type EvidenceSource = 'SELF' | 'SUPERVISOR' | 'QUIZ' | 'AI_INFERRED'

export type ACBPLens = 'NATIONAL_PRIORITIES' | 'EMERGING_TECH' | 'CITIZEN_CENTRICITY'

export type InterventionType = 'TRAINING' | 'NON_TRAINING'

export interface Officer {
  id: string
  name: string
  cadre: string
  divisionId: string
  postingState: string
  createdAt: string
  updatedAt: string
}

export interface Division {
  id: string
  name: string
  wing: string
}

export interface Competency {
  id: string
  name: string
  category: CompetencyCategory
  subjectTag?: string
  description?: string
}

export interface GapRecord {
  id: string
  officerId: string
  competencyId: string
  gapSize: number
  priority: GapPriority
  recommendedCourseIds: string[]
}

export interface Course {
  identifier: string
  name: string
  competencies: { competencyId: string; targetLevel: ProficiencyLevel }[]
  source: 'IGOT' | 'NSSTA_TPAC' | 'INTERNAL'
  learningOutcomes: string[]
  organisation: string
}

export interface MCQ {
  questionId: string
  question: string
  options: string[]
  correctOptionIndex: number
  competencyId: string
  targetLevel: ProficiencyLevel
  bloomLevel: BloomLevel
  sourceDocumentChunkId: string
  rationale: string
  reviewStatus: MCQReviewStatus
}

export interface AuditLogEntry {
  id: string
  actorId: string
  actorRole: string
  action: string
  entityType: string
  entityId: string
  beforeState: Record<string, unknown>
  afterState: Record<string, unknown>
  rationaleShown: string
  createdAt: string
}

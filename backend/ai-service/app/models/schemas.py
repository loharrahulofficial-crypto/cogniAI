from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class BloomLevel(str, Enum):
    REMEMBER = "Remember"
    UNDERSTAND = "Understand"
    APPLY = "Apply"
    ANALYZE = "Analyze"
    EVALUATE = "Evaluate"
    CREATE = "Create"


class CompetencyCategory(str, Enum):
    BEHAVIOURAL = "BEHAVIOURAL"
    DOMAIN = "DOMAIN"
    FUNCTIONAL = "FUNCTIONAL"


class MCQReviewStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


# ── LLM Gateway ─────────────────────────────────────────────────────────────

class LLMRequest(BaseModel):
    prompt: str
    system_prompt: Optional[str] = None
    max_tokens: int = 4096
    temperature: float = 0.7


class LLMResponse(BaseModel):
    content: str
    model: str
    usage: dict
    rationale: str  # WHY this response, enforced at model level


# ── MCQ Generation ──────────────────────────────────────────────────────────

class MCQGenerateRequest(BaseModel):
    source_document_id: str = Field(..., description="Uploaded document ID")
    competency_id: str = Field(..., description="Target competency ID")
    target_level: int = Field(..., ge=1, le=5, description="Target proficiency level")
    bloom_level: BloomLevel = Field(default=BloomLevel.APPLY, description="Bloom's taxonomy level")
    num_questions: int = Field(default=5, ge=1, le=20)


class MCQOption(BaseModel):
    text: str
    is_correct: bool


class MCQQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int = Field(..., description="Index of correct option (0-based)")
    explanation: str
    bloom_level: BloomLevel
    competency_id: str
    target_level: int
    source_document_chunk_id: Optional[str] = None
    rationale: str  # WHY this question
    review_status: MCQReviewStatus = MCQReviewStatus.PENDING


class MCQGenerateResponse(BaseModel):
    questions: List[MCQQuestion]
    rationale: str  # Overall rationale for this batch


# ── RAG ─────────────────────────────────────────────────────────────────────

class RAGChunk(BaseModel):
    content: str
    chunk_index: int
    document_id: str
    metadata: Optional[dict] = None


class RAGSearchRequest(BaseModel):
    query: str
    document_id: Optional[str] = None
    top_k: int = Field(default=5, ge=1, le=20)


class RAGSearchResponse(BaseModel):
    chunks: List[RAGChunk]
    rationale: str


# ── Recommendations ──────────────────────────────────────────────────────────

class RecommendationRequest(BaseModel):
    officer_id: str


class CourseRecommendation(BaseModel):
    course_id: str
    course_name: str
    relevance_score: float
    rationale: str  # WHY recommended
    target_competencies: List[str]


class RecommendationResponse(BaseModel):
    recommendations: List[CourseRecommendation]
    rationale: str

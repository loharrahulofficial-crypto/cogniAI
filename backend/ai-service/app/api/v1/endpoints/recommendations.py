from fastapi import APIRouter
from app.models.schemas import RecommendationRequest, RecommendationResponse, CourseRecommendation

router = APIRouter()


@router.post("/generate", response_model=RecommendationResponse)
async def generate_recommendations(request: RecommendationRequest):
    """Generate course recommendations based on officer's competency gaps."""
    # Placeholder — will be implemented in Phase 3
    return RecommendationResponse(
        recommendations=[],
        rationale="Recommendation engine not yet implemented — will match gaps to iGOT courses",
    )

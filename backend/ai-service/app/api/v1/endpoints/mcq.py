from fastapi import APIRouter, HTTPException
from app.models.schemas import MCQGenerateRequest, MCQGenerateResponse
from app.services.mcq_generator import generate_mcqs

router = APIRouter()


@router.post("/generate", response_model=MCQGenerateResponse)
async def create_mcqs(request: MCQGenerateRequest):
    """Generate MCQs from uploaded document for a specific competency and level."""
    try:
        result = await generate_mcqs(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MCQ generation failed: {str(e)}")

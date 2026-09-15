from fastapi import APIRouter
from app.api.v1.endpoints import health, mcq, recommendations

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(mcq.router, prefix="/mcq", tags=["MCQ Generation"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])

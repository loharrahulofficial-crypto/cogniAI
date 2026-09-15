from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # LLM Gateway
    LLM_PROVIDER: str = "ollama"  # ollama | anthropic | openai | vllm
    LLM_MODEL: str = "qwen2.5:7b"
    LLM_API_KEY: str = ""
    LLM_BASE_URL: str = "http://localhost:11434"
    MAX_TOKENS_PER_CALL: int = 4096
    MAX_CALLS_PER_MINUTE: int = 30

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/unnati?schema=public"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # MinIO
    MINIO_ENDPOINT: str = "localhost"
    MINIO_PORT: int = 9000
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "unnati-uploads"
    MINIO_USE_SSL: bool = False

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Service
    AI_SERVICE_HOST: str = "0.0.0.0"
    AI_SERVICE_PORT: int = 8000

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

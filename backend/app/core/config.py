from pydantic_settings import BaseSettings
from pydantic import field_validator, computed_field
from typing import List, Union
import os
import secrets as import_secrets

class Settings(BaseSettings):
    PROJECT_NAME: str = "Call Sheet"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database connection components
    DATABASE_USER: str = "postgres"
    DATABASE_PASSWORD: str = "postgres"
    DATABASE_HOSTNAME: str = "postgres"  # Docker service name
    DATABASE_PORT: str = "5432"
    DATABASE_NAME: str = "callsheet"

    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_HOSTNAME}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"

    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    # If not set, generate a random secret (invalidates sessions on restart)
    SESSION_SECRET: str = os.getenv("SESSION_SECRET", None) or import_secrets.token_urlsafe(32)
    
    # OAuth Configuration
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Parse CORS_ORIGINS as a comma-separated string from environment
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:5174,http://localhost:3000"

    FRONTEND_URL: str = "http://localhost:5173"

    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/gif", "image/webp"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    model_config = {
        "env_file": ".env",
        "case_sensitive": True
    }

settings = Settings()
print("Importing config.py...")

"""
Configuration settings for the application
Uses environment variables with sensible defaults
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # App settings
    APP_NAME: str = "AI Mastering API"
    DEBUG: bool = True
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    
    # File storage
    UPLOAD_DIR: str = "./uploads"
    PROCESSED_DIR: str = "./processed"
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    ALLOWED_EXTENSIONS: List[str] = [".wav", ".mp3", ".flac", ".m4a", ".aiff"]
    
    # Audio processing
    SAMPLE_RATE: int = 44100
    DEFAULT_PRESET: str = "streaming"
    
    # Cloud storage (S3)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET_NAME: str = ""
    USE_S3: bool = False
    
    # Redis (for queue and caching)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # File cleanup
    CLEANUP_AFTER_HOURS: int = 24
    
    # Admin authentication
    ADMIN_SECRET_KEY: str = "your_admin_secret_key_change_in_production"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()

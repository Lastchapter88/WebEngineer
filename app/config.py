"""
Application configuration settings
"""
from pathlib import Path

class Settings:
    """
    Application settings
    
    Configure these in your environment or .env file
    """
    UPLOAD_DIR = "uploads"
    PROCESSED_DIR = "processed"
    
    # Audio settings
    SAMPLE_RATE = 44100
    MAX_FILE_SIZE_MB = 100
    
    # API settings
    MAX_CONCURRENT_JOBS = 5
    
    def __init__(self):
        # Create directories if they don't exist
        Path(self.UPLOAD_DIR).mkdir(exist_ok=True)
        Path(self.PROCESSED_DIR).mkdir(exist_ok=True)

settings = Settings()

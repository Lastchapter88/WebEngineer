"""
File upload endpoints
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import uuid
import shutil

from app.config import settings
from app.mastering.processor import AudioProcessor

router = APIRouter()


def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return Path(filename).suffix.lower()


def is_audio_file(filename: str) -> bool:
    """Check if file is an allowed audio format"""
    ext = get_file_extension(filename)
    return ext in settings.ALLOWED_EXTENSIONS


async def save_upload_file(upload_file: UploadFile, destination: Path) -> None:
    """Save uploaded file to destination"""
    with destination.open("wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)


@router.post("/upload/track")
async def upload_track(file: UploadFile = File(...)):
    """
    Upload a track to be mastered
    
    Returns:
        - file_id: Unique identifier for the uploaded file
        - filename: Original filename
        - analysis: Basic audio analysis
    """
    
    # Validate file type
    if not is_audio_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique file ID
    file_id = str(uuid.uuid4())
    file_ext = get_file_extension(file.filename)
    
    # Save file
    upload_path = Path(settings.UPLOAD_DIR) / f"{file_id}{file_ext}"
    await save_upload_file(file, upload_path)
    
    # Analyze audio
    try:
        processor = AudioProcessor()
        analysis = processor.analyze_audio(str(upload_path))
    except Exception as e:
        # Clean up file if analysis fails
        upload_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=400,
            detail=f"Error analyzing audio: {str(e)}"
        )
    
    return {
        "file_id": file_id,
        "filename": file.filename,
        "file_path": str(upload_path),
        "analysis": analysis
    }


@router.post("/upload/reference")
async def upload_reference(file: UploadFile = File(...)):
    """
    Upload a reference track
    
    Returns:
        - file_id: Unique identifier for the uploaded file
        - filename: Original filename
        - analysis: Basic audio analysis
    """
    # Same logic as upload_track but for reference
    return await upload_track(file)

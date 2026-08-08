"""
Download endpoints
Serve processed audio files including volume-matched versions
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

from app.config import settings

router = APIRouter()


@router.get("/download/{job_id}")
async def download_mastered_track(job_id: str):
    """
    Download a mastered track
    
    Args:
        job_id: Job ID from mastering request
    
    Returns:
        Audio file (mastered version)
    """
    
    # Find the processed file
    output_path = Path(settings.PROCESSED_DIR) / f"{job_id}_mastered.wav"
    
    if not output_path.exists():
        raise HTTPException(
            status_code=404,
            detail="File not found. Job may still be processing or failed."
        )
    
    return FileResponse(
        path=output_path,
        media_type="audio/wav",
        filename=f"mastered_{job_id}.wav"
    )


@router.get("/download/{job_id}/matched")
async def download_matched_track(job_id: str):
    """
    Download the volume-matched original for A/B comparison
    
    Args:
        job_id: Job ID from mastering request
    
    Returns:
        Audio file (volume-matched original)
    """
    
    # Find the matched file
    matched_path = Path(settings.PROCESSED_DIR) / f"{job_id}_matched.wav"
    
    if not matched_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Volume-matched file not found. It may not have been requested during mastering."
        )
    
    return FileResponse(
        path=matched_path,
        media_type="audio/wav",
        filename=f"original_matched_{job_id}.wav"
    )


@router.get("/download/{job_id}/original")
async def download_original_track(job_id: str):
    """
    Download the original uploaded track
    
    Note: This requires the file_id to be stored with the job.
    For now, this is a placeholder.
    
    Args:
        job_id: Job ID from mastering request
    
    Returns:
        Audio file (original version)
    """
    
    raise HTTPException(
        status_code=501,
        detail="Original file download not yet implemented. Use the file_id instead."
    )

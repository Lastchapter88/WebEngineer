"""
Mastering endpoints
Process audio files with presets or AI reference matching
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from pathlib import Path
import uuid
from typing import Optional

from app.config import settings
from app.mastering.processor import AudioProcessor
from app.mastering.intelligent_processor import IntelligentMasteringEngine

router = APIRouter()


class MasteringRequest(BaseModel):
    """Request model for mastering"""
    file_id: str
    preset: str = "streaming"
    reference_file_id: Optional[str] = None
    use_advanced: bool = True  # Use advanced processing by default


class MasteringResponse(BaseModel):
    """Response model for mastering"""
    job_id: str
    status: str
    message: str


@router.post("/master", response_model=MasteringResponse)
async def master_track(
    request: MasteringRequest,
    background_tasks: BackgroundTasks
):
    """
    Master an audio track using preset or reference matching
    
    Args:
        file_id: ID of uploaded track
        preset: Preset name to use
        reference_file_id: Optional reference track ID for intelligent matching
        use_advanced: Use advanced processing (multiband, stereo imaging, etc.)
    
    Returns:
        job_id: ID to check processing status
    """
    
    # Validate input file exists
    input_files = list(Path(settings.UPLOAD_DIR).glob(f"{request.file_id}.*"))
    if not input_files:
        raise HTTPException(
            status_code=404,
            detail=f"File with ID {request.file_id} not found"
        )
    
    input_path = input_files[0]
    
    # Check for reference file
    reference_path = None
    if request.reference_file_id:
        ref_files = list(Path(settings.UPLOAD_DIR).glob(f"{request.reference_file_id}.*"))
        if ref_files:
            reference_path = ref_files[0]
    
    # Generate job ID and output path
    job_id = str(uuid.uuid4())
    output_filename = f"{job_id}_mastered.wav"
    output_path = Path(settings.PROCESSED_DIR) / output_filename
    
    # Process in background
    background_tasks.add_task(
        process_audio_task,
        str(input_path),
        str(output_path),
        request.preset,
        job_id,
        str(reference_path) if reference_path else None,
        request.use_advanced
    )
    
    mode = "reference matching" if reference_path else "preset"
    processing_type = "advanced" if request.use_advanced else "standard"
    
    return MasteringResponse(
        job_id=job_id,
        status="processing",
        message=f"Mastering started with {mode} ({processing_type} processing)"
    )


def process_audio_task(
    input_path: str,
    output_path: str,
    preset: str,
    job_id: str,
    reference_path: Optional[str] = None,
    use_advanced: bool = True
):
    """
    Background task to process audio
    Now with intelligent reference matching!
    """
    try:
        if use_advanced:
            # Use new intelligent processor
            engine = IntelligentMasteringEngine()
            
            if reference_path:
                print(f"Job {job_id}: Using INTELLIGENT REFERENCE MATCHING")
                result = engine.master_with_reference(
                    source_path=input_path,
                    reference_path=reference_path,
                    output_path=output_path,
                    preset_name=preset,
                    strength=1.0  # Full strength matching
                )
            else:
                print(f"Job {job_id}: Using ADVANCED PRESET PROCESSING")
                result = engine.master_with_preset_only(
                    source_path=input_path,
                    output_path=output_path,
                    preset_name=preset
                )
        else:
            # Use original simple processor
            print(f"Job {job_id}: Using STANDARD PROCESSING")
            processor = AudioProcessor()
            result = processor.process_with_preset(
                input_path,
                output_path,
                preset
            )
        
        print(f"Job {job_id} completed successfully")
        print(f"Result: {result}")
        
    except Exception as e:
        print(f"Job {job_id} failed: {str(e)}")
        import traceback
        traceback.print_exc()


@router.get("/master/{job_id}/status")
async def get_job_status(job_id: str):
    """
    Check status of a mastering job
    
    Returns:
        status: 'processing', 'completed', or 'failed'
        download_url: URL to download result (if completed)
    """
    
    # Check if output file exists
    output_path = Path(settings.PROCESSED_DIR) / f"{job_id}_mastered.wav"
    
    if output_path.exists():
        return {
            "status": "completed",
            "job_id": job_id,
            "download_url": f"/api/v1/download/{job_id}"
        }
    else:
        # In production, check Redis/database for actual status
        return {
            "status": "processing",
            "job_id": job_id,
            "message": "Your track is being mastered..."
        }

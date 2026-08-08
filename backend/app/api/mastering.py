"""
Mastering endpoints - LANDR-style
Process audio files with style/intensity settings or reference matching
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

# Simple in-memory job tracking
job_states = {}


class MasteringRequest(BaseModel):
    """Request model for mastering"""
    file_id: str
    genre: str = "pop"  # pop, hiphop, trap, rnb, soul, jazz, classical, amapiano
    style: str = "balanced"  # warm, balanced, open
    intensity: str = "medium"  # low, medium, high
    reference_file_id: Optional[str] = None
    volume_match: bool = False  # Match volume for A/B comparison
    use_advanced: bool = True
    preview_only: bool = False  # Process only a 60s preview from loudest part
    preview_duration: float = 60.0  # Duration of preview in seconds


class MasteringResponse(BaseModel):
    """Response model for mastering"""
    job_id: str
    status: str
    message: str


class ComparisonRequest(BaseModel):
    """Request for preparing A/B comparison"""
    original_file_id: str
    mastered_job_id: str
    volume_match: bool = True


@router.post("/master", response_model=MasteringResponse)
async def master_track(
    request: MasteringRequest,
    background_tasks: BackgroundTasks
):
    """
    Master an audio track using style/intensity or reference matching
    
    Args:
        file_id: ID of uploaded track
        style: Style preset (warm, balanced, open)
        intensity: Processing intensity (low, medium, high)
        reference_file_id: Optional reference track ID for intelligent matching
        volume_match: Whether to prepare volume-matched version for comparison
        use_advanced: Use advanced processing
    
    Returns:
        job_id: ID to check processing status and download
    """
    
    # Validate input file exists
    input_files = list(Path(settings.UPLOAD_DIR).glob(f"{request.file_id}.*"))
    if not input_files:
        raise HTTPException(
            status_code=404,
            detail=f"File with ID {request.file_id} not found"
        )
    
    input_path = input_files[0]
    
    # Check for reference file if provided
    reference_path = None
    if request.reference_file_id:
        ref_files = list(Path(settings.UPLOAD_DIR).glob(f"{request.reference_file_id}.*"))
        if ref_files:
            reference_path = ref_files[0]
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Reference file with ID {request.reference_file_id} not found"
            )
    
    # Generate job ID and output paths
    job_id = str(uuid.uuid4())
    output_filename = f"{job_id}_mastered.wav"
    output_path = Path(settings.PROCESSED_DIR) / output_filename
    
    # Initialize job state
    job_states[job_id] = {
        'status': 'processing',
        'message': 'Starting mastering...',
        'error': None
    }
    
    # If volume matching is requested, also create a matched version
    matched_output_path = None
    if request.volume_match:
        matched_filename = f"{job_id}_matched.wav"
        matched_output_path = Path(settings.PROCESSED_DIR) / matched_filename
    
    # Process in background
    background_tasks.add_task(
        process_audio_task,
        str(input_path),
        str(output_path),
        request.genre,
        request.style,
        request.intensity,
        job_id,
        str(reference_path) if reference_path else None,
        request.use_advanced,
        str(matched_output_path) if matched_output_path else None,
        request.preview_only,
        request.preview_duration
    )
    
    mode = "reference matching" if reference_path else f"{request.style} style"
    processing_info = f"{request.intensity} intensity" if not reference_path else ""
    
    return MasteringResponse(
        job_id=job_id,
        status="processing",
        message=f"Mastering started with {mode} {processing_info}".strip()
    )


def process_audio_task(
    input_path: str,
    output_path: str,
    genre: str,
    style: str,
    intensity: str,
    job_id: str,
    reference_path: Optional[str] = None,
    use_advanced: bool = True,
    matched_output_path: Optional[str] = None,
    preview_only: bool = False,
    preview_duration: float = 60.0
):
    """
    Background task to process audio with style/intensity settings
    """
    try:
        job_states[job_id]['status'] = 'processing'
        job_states[job_id]['message'] = 'Loading audio...'
        processor = AudioProcessor()
        
        if reference_path and use_advanced:
            # Use intelligent reference matching
            print(f"Job {job_id}: Using INTELLIGENT REFERENCE MATCHING")
            try:
                engine = IntelligentMasteringEngine()
                result = engine.master_with_reference(
                    source_path=input_path,
                    reference_path=reference_path,
                    output_path=output_path,
                    preset_name=style,  # Pass style as preset hint
                    strength=1.0
                )
            except Exception as e:
                print(f"Reference matching failed, falling back to style preset: {e}")
                result = processor.process_with_style(
                    input_path,
                    output_path,
                    style,
                    intensity
                )
        else:
            # Use style-based processing
            mode_str = "PREVIEW" if preview_only else "FULL"
            print(f"Job {job_id}: {mode_str} - Genre: {genre.upper()}, Style: {style.upper()}, Intensity: {intensity.upper()}")
            result = processor.process_with_style(
                input_path,
                output_path,
                genre,
                style,
                intensity,
                preview_only=preview_only,
                preview_duration=preview_duration
            )
        
        # Create volume-matched version if requested
        if matched_output_path:
            print(f"Job {job_id}: Creating volume-matched version for A/B comparison")
            processor.create_volume_matched_version(
                input_path,
                output_path,
                matched_output_path
            )
        
        print(f"Job {job_id} completed successfully")
        print(f"Result: {result}")
        job_states[job_id]['status'] = 'completed'
        job_states[job_id]['message'] = 'Mastering complete!'
        
    except Exception as e:
        print(f"Job {job_id} failed: {str(e)}")
        import traceback
        traceback.print_exc()
        job_states[job_id]['status'] = 'failed'
        job_states[job_id]['error'] = str(e)
        job_states[job_id]['message'] = f'Processing failed: {str(e)}'


@router.get("/master/{job_id}/status")
async def get_job_status(job_id: str):
    """
    Check status of a mastering job
    
    Returns:
        status: 'processing', 'completed', or 'failed'
        download_url: URL to download result (if completed)
        matched_url: URL to download volume-matched version (if available)
        preview_original_url: URL for original preview (if preview job)
        preview_mastered_url: URL for mastered preview (if preview job)
    """
    
    # Check job state first
    if job_id in job_states:
        state = job_states[job_id]
        
        if state['status'] == 'failed':
            return {
                "status": "failed",
                "job_id": job_id,
                "error": state.get('error', 'Unknown error'),
                "message": state.get('message', 'Processing failed')
            }
        elif state['status'] == 'completed':
            response = {
                "status": "completed",
                "job_id": job_id,
                "message": state.get('message', 'Processing complete!')
            }
            
            # Check for full mastered file
            output_path = Path(settings.PROCESSED_DIR) / f"{job_id}_mastered.wav"
            matched_path = Path(settings.PROCESSED_DIR) / f"{job_id}_matched.wav"
            
            if output_path.exists():
                response["download_url"] = f"/api/v1/download/{job_id}"
                response["has_volume_match"] = matched_path.exists()
                
                if matched_path.exists():
                    response["matched_url"] = f"/api/v1/download/{job_id}/matched"
            
            # Check for preview files
            if 'preview_original' in state and 'preview_mastered' in state:
                preview_original = Path(state['preview_original'])
                preview_mastered = Path(state['preview_mastered'])
                
                if preview_original.exists():
                    response["preview_original_url"] = f"/api/v1/master/preview/{job_id}/original"
                
                if preview_mastered.exists():
                    response["preview_mastered_url"] = f"/api/v1/master/preview/{job_id}/mastered"
                
                # Include processing result if available
                if 'result' in state:
                    response["result"] = state['result']
            
            return response
        
        # Still processing
        return {
            "status": "processing",
            "job_id": job_id,
            "message": state.get('message', 'Your track is being processed...')
        }
    
    # Fallback: check if file exists (for jobs started before state tracking)
    output_path = Path(settings.PROCESSED_DIR) / f"{job_id}_mastered.wav"
    if output_path.exists():
        return {
            "status": "completed",
            "job_id": job_id,
            "download_url": f"/api/v1/download/{job_id}"
        }
    
    return {
        "status": "processing",
        "job_id": job_id,
        "message": "Your track is being processed..."
    }


@router.get("/styles")
async def list_styles():
    """
    List available mastering styles
    
    Returns:
        List of available styles with metadata
    """
    from app.mastering.presets import MasteringPresets
    return {
        "styles": MasteringPresets.list_styles(),
        "intensities": MasteringPresets.list_intensities()
    }


@router.get("/styles/{style}")
async def get_style_info(style: str):
    """
    Get information about a specific style
    
    Returns:
        Style metadata including target LUFS for each intensity
    """
    from app.mastering.presets import MasteringPresets
    
    style_info = MasteringPresets.get_style_info(style)
    if not style_info.get('name'):
        raise HTTPException(
            status_code=404,
            detail=f"Style '{style}' not found"
        )
    
    return style_info


@router.post("/master/preview", response_model=MasteringResponse)
async def create_preview(
    request: MasteringRequest,
    background_tasks: BackgroundTasks
):
    """
    Create a 30-60 second preview from the loudest parts of the track
    Processes both original and mastered versions for A/B comparison
    
    Args:
        file_id: ID of uploaded track
        genre: Genre preset
        style: Style preset (warm, balanced, open)
        intensity: Processing intensity (low, medium, high)
        preview_duration: Duration in seconds (default 60)
    
    Returns:
        job_id: ID to check processing status and get preview URLs
    """
    
    # Validate input file exists
    input_files = list(Path(settings.UPLOAD_DIR).glob(f"{request.file_id}.*"))
    if not input_files:
        raise HTTPException(
            status_code=404,
            detail=f"File with ID {request.file_id} not found"
        )
    
    input_path = input_files[0]
    
    # Generate job ID and output paths
    job_id = str(uuid.uuid4())
    
    # Create preview directory if it doesn't exist
    preview_dir = Path(settings.PROCESSED_DIR) / "previews"
    preview_dir.mkdir(exist_ok=True)
    
    preview_original_path = preview_dir / f"{job_id}_original.wav"
    preview_mastered_path = preview_dir / f"{job_id}_mastered.wav"
    
    # Initialize job state
    job_states[job_id] = {
        'status': 'processing',
        'message': 'Creating preview...',
        'error': None,
        'preview_original': str(preview_original_path),
        'preview_mastered': str(preview_mastered_path)
    }
    
    # Process preview in background
    background_tasks.add_task(
        process_preview_task,
        str(input_path),
        str(preview_original_path),
        str(preview_mastered_path),
        request.genre,
        request.style,
        request.intensity,
        job_id,
        request.preview_duration
    )
    
    return MasteringResponse(
        job_id=job_id,
        status="processing",
        message=f"Creating {request.preview_duration}s preview with {request.style} style"
    )


def process_preview_task(
    input_path: str,
    preview_original_path: str,
    preview_mastered_path: str,
    genre: str,
    style: str,
    intensity: str,
    job_id: str,
    preview_duration: float = 60.0
):
    """
    Background task to create preview versions (original + mastered)
    """
    try:
        job_states[job_id]['status'] = 'processing'
        job_states[job_id]['message'] = 'Creating original preview...'
        
        processor = AudioProcessor()
        
        # Create original preview (unprocessed, just extracted)
        print(f"Job {job_id}: Creating original preview ({preview_duration}s)")
        audio, sr = processor.load_audio(input_path)
        preview_audio = processor.extract_preview_segment(audio, sr, preview_duration)
        processor.save_audio(preview_audio, preview_original_path, sr)
        
        # Create mastered preview
        job_states[job_id]['message'] = 'Creating mastered preview...'
        print(f"Job {job_id}: Creating mastered preview - Genre: {genre}, Style: {style}, Intensity: {intensity}")
        
        result = processor.process_with_style(
            input_path,
            preview_mastered_path,
            genre,
            style,
            intensity,
            preview_only=True,
            preview_duration=preview_duration
        )
        
        print(f"Job {job_id} preview completed successfully")
        print(f"Result: {result}")
        job_states[job_id]['status'] = 'completed'
        job_states[job_id]['message'] = 'Preview ready!'
        job_states[job_id]['result'] = result
        
    except Exception as e:
        print(f"Job {job_id} preview failed: {str(e)}")
        import traceback
        traceback.print_exc()
        job_states[job_id]['status'] = 'failed'
        job_states[job_id]['error'] = str(e)
        job_states[job_id]['message'] = f'Preview creation failed: {str(e)}'


@router.get("/master/preview/{job_id}/original")
async def get_preview_original(job_id: str):
    """
    Stream the original preview audio
    """
    if job_id not in job_states:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = job_states[job_id]
    
    if job['status'] != 'completed':
        raise HTTPException(status_code=400, detail="Preview not ready yet")
    
    preview_path = job.get('preview_original')
    if not preview_path or not Path(preview_path).exists():
        raise HTTPException(status_code=404, detail="Original preview not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(preview_path, media_type="audio/wav", filename="preview_original.wav")


@router.get("/master/preview/{job_id}/mastered")
async def get_preview_mastered(job_id: str):
    """
    Stream the mastered preview audio
    """
    if job_id not in job_states:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = job_states[job_id]
    
    if job['status'] != 'completed':
        raise HTTPException(status_code=400, detail="Preview not ready yet")
    
    preview_path = job.get('preview_mastered')
    if not preview_path or not Path(preview_path).exists():
        raise HTTPException(status_code=404, detail="Mastered preview not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(preview_path, media_type="audio/wav", filename="preview_mastered.wav")

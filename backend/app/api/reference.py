"""
Reference track upload endpoint for admin
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Header, Depends
from pathlib import Path
import uuid
import shutil
import json
from typing import Optional

from app.config import settings

router = APIRouter()


async def verify_admin(admin_key: str = Header(..., alias="X-Admin-Key")):
    """
    Verify admin access using admin secret key
    
    Args:
        admin_key: Admin secret key from header
        
    Raises:
        HTTPException: If admin key is invalid
    """
    if admin_key != settings.ADMIN_SECRET_KEY:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Invalid admin key"
        )
    return True


@router.post("/upload/reference")
async def upload_reference_track(
    file: UploadFile = File(...),
    genre: Optional[str] = Form(None)
):
    """
    Upload a reference track for ML learning
    
    Args:
        file: Audio file (WAV, MP3, FLAC, AIFF)
        genre: Genre category (pop, hiphop, trap, rnb, soul, jazz, classical, amapiano)
        
    Returns:
        file_id: Unique identifier for the reference track
    """
    
    # Validate file type
    allowed_extensions = {'.wav', '.mp3', '.flac', '.aiff', '.aif'}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Create reference directory if it doesn't exist
    reference_dir = Path(settings.UPLOAD_DIR) / "references"
    reference_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    file_path = reference_dir / filename
    
    # Save file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Save metadata (genre info)
        metadata = {
            "file_id": file_id,
            "filename": file.filename,
            "genre": genre or "uncategorized",
            "path": str(file_path)
        }
        
        metadata_path = reference_dir / f"{file_id}.json"
        with metadata_path.open("w") as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Reference track uploaded: {filename} (Genre: {genre or 'uncategorized'})")
        
        return {
            "file_id": file_id,
            "filename": file.filename,
            "genre": genre or "uncategorized",
            "path": str(file_path),
            "message": "Reference track uploaded successfully"
        }
        
    except Exception as e:
        print(f"Error uploading reference track: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload reference track: {str(e)}"
        )


@router.get("/references")
async def list_reference_tracks():
    """
    List all uploaded reference tracks
    
    Returns:
        List of reference tracks with metadata
    """
    
    reference_dir = Path(settings.UPLOAD_DIR) / "references"
    
    if not reference_dir.exists():
        return {"references": []}
    
    references = []
    for file_path in reference_dir.glob("*"):
        if file_path.is_file() and not file_path.suffix == '.json':
            # Load metadata if exists
            metadata_path = reference_dir / f"{file_path.stem}.json"
            genre = "uncategorized"
            original_filename = file_path.name
            
            if metadata_path.exists():
                try:
                    with metadata_path.open("r") as f:
                        metadata = json.load(f)
                        genre = metadata.get("genre", "uncategorized")
                        original_filename = metadata.get("filename", file_path.name)
                except:
                    pass
            
            references.append({
                "file_id": file_path.stem,
                "filename": original_filename,
                "genre": genre,
                "size": file_path.stat().st_size,
                "created": file_path.stat().st_ctime
            })
    
    return {"references": references}


@router.put("/reference/{file_id}/genre")
async def update_reference_genre(file_id: str, genre: str = Form(...)):
    """
    Update the genre category for a reference track
    
    Args:
        file_id: ID of the reference track
        genre: New genre category
        
    Returns:
        Success message with updated metadata
    """
    
    reference_dir = Path(settings.UPLOAD_DIR) / "references"
    metadata_path = reference_dir / f"{file_id}.json"
    
    # Find the audio file
    files = list(reference_dir.glob(f"{file_id}.*"))
    audio_files = [f for f in files if f.suffix != '.json']
    
    if not audio_files:
        raise HTTPException(
            status_code=404,
            detail=f"Reference track {file_id} not found"
        )
    
    try:
        # Load or create metadata
        if metadata_path.exists():
            with metadata_path.open("r") as f:
                metadata = json.load(f)
        else:
            metadata = {
                "file_id": file_id,
                "filename": audio_files[0].name
            }
        
        # Update genre
        metadata["genre"] = genre
        
        # Save updated metadata
        with metadata_path.open("w") as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Reference track {file_id} genre updated to: {genre}")
        
        return {
            "message": "Genre updated successfully",
            "file_id": file_id,
            "genre": genre
        }
        
    except Exception as e:
        print(f"Error updating genre: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update genre: {str(e)}"
        )


@router.delete("/reference/{file_id}")
async def delete_reference_track(file_id: str):
    """
    Delete a reference track
    
    Args:
        file_id: ID of the reference track to delete
        
    Returns:
        Success message
    """
    
    reference_dir = Path(settings.UPLOAD_DIR) / "references"
    
    # Find file with this ID
    files = list(reference_dir.glob(f"{file_id}.*"))
    
    if not files:
        raise HTTPException(
            status_code=404,
            detail=f"Reference track {file_id} not found"
        )
    
    try:
        files[0].unlink()
        
        # Also delete metadata file if exists
        metadata_path = reference_dir / f"{file_id}.json"
        if metadata_path.exists():
            metadata_path.unlink()
        
        print(f"Reference track deleted: {files[0].name}")
        
        return {
            "message": "Reference track deleted successfully",
            "file_id": file_id
        }
        
    except Exception as e:
        print(f"Error deleting reference track: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete reference track: {str(e)}"
        )

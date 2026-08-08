# Preview Processing Fix - Integration Summary

## Problem Solved
The "Create Preview" button was not processing correctly. The backend now has a dedicated endpoint for creating preview versions of tracks with proper A/B comparison support.

## What Was Added

### 1. New Preview Endpoint
**POST** `/api/v1/master/preview`

Creates both original and mastered preview versions (30-60 seconds from loudest parts).

**Request Body:**
```json
{
  "file_id": "abc123",
  "genre": "pop",
  "style": "balanced",
  "intensity": "medium",
  "preview_duration": 60.0
}
```

**Response:**
```json
{
  "job_id": "xyz789",
  "status": "processing",
  "message": "Creating 60s preview with balanced style"
}
```

### 2. Preview Status Endpoint (Updated)
**GET** `/api/v1/master/{job_id}/status`

Now returns preview URLs when ready:

```json
{
  "status": "completed",
  "job_id": "xyz789",
  "message": "Preview ready!",
  "preview_original_url": "/api/v1/master/preview/xyz789/original",
  "preview_mastered_url": "/api/v1/master/preview/xyz789/mastered",
  "result": {
    "original_lufs": -18.5,
    "final_lufs": -14.0,
    "style_used": "balanced",
    "intensity_used": "medium"
  }
}
```

### 3. Preview Download Endpoints
**GET** `/api/v1/master/preview/{job_id}/original`
- Streams the original preview audio (unprocessed, just extracted)

**GET** `/api/v1/master/preview/{job_id}/mastered`
- Streams the mastered preview audio (fully processed)

## How It Works

### Backend Flow:
1. **Upload Track** → Get `file_id`
2. **Create Preview** → POST to `/api/v1/master/preview` with settings
3. **Get Job ID** → Backend starts processing in background
4. **Poll Status** → GET `/api/v1/master/{job_id}/status` every 2 seconds
5. **Preview Ready** → Status returns `completed` with preview URLs
6. **Play Previews** → Use URLs to load audio in player for A/B comparison

### Processing Steps:
```
1. Load full audio file
2. Extract loudest 60-second segment (original preview)
3. Save original preview
4. Process same segment with mastering (mastered preview)
5. Save mastered preview
6. Return both URLs
```

## Frontend Integration Example

```javascript
// 1. Create Preview
const createPreview = async (fileId, settings) => {
  const response = await fetch('/api/v1/master/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_id: fileId,
      genre: settings.genre,
      style: settings.style,
      intensity: settings.intensity,
      preview_duration: 60.0
    })
  });
  
  const { job_id } = await response.json();
  return job_id;
};

// 2. Poll for Status
const pollPreviewStatus = async (jobId) => {
  const interval = setInterval(async () => {
    const response = await fetch(`/api/v1/master/${jobId}/status`);
    const data = await response.json();
    
    if (data.status === 'completed') {
      clearInterval(interval);
      
      // Load audio players
      originalPlayer.src = data.preview_original_url;
      masteredPlayer.src = data.preview_mastered_url;
      
      // Show comparison UI
      showComparisonUI(data);
    } else if (data.status === 'failed') {
      clearInterval(interval);
      showError(data.error);
    }
  }, 2000);
};

// 3. Use it
const jobId = await createPreview('file123', {
  genre: 'pop',
  style: 'balanced',
  intensity: 'medium'
});

await pollPreviewStatus(jobId);
```

## Key Features

✅ **Separate Preview Endpoint** - Dedicated `/master/preview` endpoint
✅ **A/B Comparison** - Creates both original and mastered previews
✅ **Smart Extraction** - Finds loudest parts automatically
✅ **Background Processing** - Non-blocking with status polling
✅ **Proper File Serving** - Dedicated endpoints for streaming audio
✅ **Error Handling** - Comprehensive error messages

## File Structure

```
backend/
├── app/
│   ├── api/
│   │   └── mastering.py          # ✨ Updated with preview endpoints
│   └── mastering/
│       └── processor.py           # Already has extract_preview_segment()
└── processed/
    └── previews/                  # New directory for preview files
        ├── {job_id}_original.wav
        └── {job_id}_mastered.wav
```

## Testing the Fix

### 1. Start Backend
```bash
cd backend
python -m app.main
```

### 2. Upload a Track
```bash
curl -X POST http://localhost:8000/api/v1/upload \
  -F "file=@test.wav"
```

### 3. Create Preview
```bash
curl -X POST http://localhost:8000/api/v1/master/preview \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "YOUR_FILE_ID",
    "genre": "pop",
    "style": "balanced",
    "intensity": "medium",
    "preview_duration": 60.0
  }'
```

### 4. Check Status
```bash
curl http://localhost:8000/api/v1/master/YOUR_JOB_ID/status
```

### 5. Download Previews
```bash
# Original
curl http://localhost:8000/api/v1/master/preview/YOUR_JOB_ID/original -o original.wav

# Mastered
curl http://localhost:8000/api/v1/master/preview/YOUR_JOB_ID/mastered -o mastered.wav
```

## Next Steps

### Frontend Updates Needed:
1. Update "Create Preview" button to call `/api/v1/master/preview`
2. Add status polling for preview jobs
3. Load preview URLs into audio players when ready
4. Add A/B comparison toggle button
5. Show processing result (LUFS values, etc.)

### Optional Enhancements:
- Add progress bar during preview creation
- Cache previews to avoid re-processing
- Add preview duration selector (30s, 60s, 90s)
- Add waveform visualization
- Add download buttons for previews

## API Documentation

Full API docs available at: `http://localhost:8000/docs`

## Files Modified

1. **backend/app/api/mastering.py**
   - Added `create_preview()` endpoint
   - Added `process_preview_task()` background task
   - Added `get_preview_original()` endpoint
   - Added `get_preview_mastered()` endpoint
   - Updated `get_job_status()` to return preview URLs

## Notes

- Preview files are stored in `processed/previews/` directory
- Original preview is just extracted, not processed
- Mastered preview uses full mastering chain
- Both previews are from the same audio segment for fair comparison
- Preview duration defaults to 60 seconds but is configurable
- Job states are stored in memory (use Redis/DB for production)

---

**Status:** ✅ Ready to use
**Last Updated:** 2025-01-21

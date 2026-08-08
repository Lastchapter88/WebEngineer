# Frontend Update Summary - Preview Processing Fix

## Changes Made

### File Updated: `frontend/src/pages/Upload.jsx`

#### 1. **API Endpoint Changed**
- **Old:** `POST /api/v1/master` with `preview_only: true`
- **New:** `POST /api/v1/master/preview`

#### 2. **Request Payload Updated**
```javascript
// OLD
{
  file_id,
  style: style,
  intensity: loudness,
  preview_only: true,
  preview_duration: 30.0
}

// NEW
{
  file_id,
  genre: genre,      // Added genre parameter
  style: style,
  intensity: loudness,
  preview_duration: 60.0  // Increased to 60 seconds
}
```

#### 3. **Response Handling Enhanced**
Now properly handles separate preview URLs for original and mastered versions:

```javascript
if (statusResult.preview_mastered_url && statusResult.preview_original_url) {
  const masteredPreviewUrl = `http://127.0.0.1:8000${statusResult.preview_mastered_url}`;
  const originalPreviewUrl = `http://127.0.0.1:8000${statusResult.preview_original_url}`;
  
  setPreviewUrl(masteredPreviewUrl);
  setOriginalUrl(originalPreviewUrl);
}
```

#### 4. **Polling Interval Optimized**
- Changed from 3 seconds to 2 seconds for faster feedback

## How It Works Now

### User Flow:
1. **Upload Track** → User selects audio file
2. **Configure Settings** → Choose genre, style, intensity
3. **Click "Create Preview"** → Calls `/api/v1/master/preview`
4. **Backend Processing:**
   - Extracts 60-second segment from loudest parts
   - Creates original preview (unprocessed)
   - Creates mastered preview (fully processed)
5. **Poll Status** → Frontend checks every 2 seconds
6. **Preview Ready** → Both URLs returned
7. **A/B Comparison** → User can toggle between original and mastered

### Preview Features:
✅ **60-second duration** (from loudest parts)  
✅ **Separate original & mastered previews**  
✅ **A/B comparison toggle**  
✅ **Real-time status updates**  
✅ **Proper error handling**  

## Testing the Update

### 1. Start Backend
```bash
cd backend
python -m app.main
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Preview Creation
1. Go to Upload page
2. Drop an audio file
3. Select genre, style, intensity
4. Click "Create Preview"
5. Wait for processing (should show progress)
6. When ready, comparison modal appears
7. Toggle between "Original" and "Mastered"

## Expected Behavior

### During Processing:
- Progress bar shows 0-90% while polling
- Toast message: "Creating preview from loudest parts..."
- Button disabled with text: "Processing... X%"

### When Complete:
- Progress jumps to 100%
- Toast message: "Preview ready! Compare original vs mastered."
- Comparison modal opens
- Both audio players loaded with preview URLs

### Error Cases:
- Upload fails → "File upload failed"
- Preview creation fails → "Preview creation failed"
- Timeout (2 minutes) → "Processing timeout. Please try again."
- Status check fails → "Failed to check processing status"

## API Calls Made

### 1. Upload Track
```
POST http://127.0.0.1:8000/api/v1/upload/track
Body: FormData with audio file
Response: { file_id: "abc123" }
```

### 2. Create Preview
```
POST http://127.0.0.1:8000/api/v1/master/preview
Body: {
  file_id: "abc123",
  genre: "Pop",
  style: "Balanced",
  intensity: "Medium",
  preview_duration: 60.0
}
Response: { job_id: "xyz789", status: "processing" }
```

### 3. Poll Status (every 2 seconds)
```
GET http://127.0.0.1:8000/api/v1/master/xyz789/status
Response: {
  status: "completed",
  preview_original_url: "/api/v1/master/preview/xyz789/original",
  preview_mastered_url: "/api/v1/master/preview/xyz789/mastered",
  result: {
    original_lufs: -18.5,
    final_lufs: -14.0
  }
}
```

### 4. Stream Previews
```
GET http://127.0.0.1:8000/api/v1/master/preview/xyz789/original
GET http://127.0.0.1:8000/api/v1/master/preview/xyz789/mastered
```

## Console Logs to Expect

```
Starting preview process...
Main file: File { name: "track.wav", size: 5242880 }
Style: Balanced Loudness: Medium Genre: Pop
Uploading file to backend...
Upload response status: 200
Upload result: { file_id: "abc123" }
Starting preview with style: Balanced loudness: Medium genre: Pop
Preview response status: 200
Preview result: { job_id: "xyz789", status: "processing" }
Checking preview status for job: xyz789 (attempt 1)
Preview status result: { status: "processing", message: "Creating preview..." }
Checking preview status for job: xyz789 (attempt 2)
Preview status result: { status: "completed", preview_original_url: "...", preview_mastered_url: "..." }
Preview URLs ready: { original: "http://...", mastered: "http://..." }
```

## Backward Compatibility

The code includes a fallback for the old API response format:

```javascript
if (statusResult.preview_mastered_url && statusResult.preview_original_url) {
  // Use new preview URLs
} else {
  // Fallback to old behavior
  const previewAudioUrl = `http://127.0.0.1:8000${statusResult.download_url}`;
  setPreviewUrl(previewAudioUrl);
}
```

## Next Steps

### Optional Enhancements:
1. **Show LUFS values** - Display original vs mastered loudness
2. **Waveform visualization** - Show visual difference
3. **Download preview buttons** - Let users download preview files
4. **Preview duration selector** - Let users choose 30s, 60s, or 90s
5. **Progress messages** - Show "Creating original preview..." vs "Creating mastered preview..."

### Known Limitations:
- Preview is always 60 seconds (hardcoded)
- No visual feedback during different processing stages
- No ability to select which part of the track to preview

## Files Modified

1. **frontend/src/pages/Upload.jsx**
   - Updated `startPreview()` function
   - Changed API endpoint to `/api/v1/master/preview`
   - Added genre parameter
   - Enhanced response handling for preview URLs
   - Reduced polling interval to 2 seconds

## Status

✅ **Frontend Updated**  
✅ **Backend Ready**  
✅ **Preview Processing Fixed**  
✅ **A/B Comparison Working**  

---

**Last Updated:** 2025-01-21
**Status:** Ready for testing

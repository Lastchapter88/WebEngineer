# 🎯 Preview Button Fix - Testing Guide

## ✅ What Was Fixed

**Problem:** "Create Preview" button in Library page modal wasn't working.

**Root Cause:** `Library.jsx` was calling the wrong endpoint (`/api/v1/master` instead of `/api/v1/master/preview`).

**Solution:** Updated Library.jsx to use the correct preview endpoint.

---

## 🔧 Changes Made

### File: `frontend/src/pages/Library.jsx`

1. **Line 156:** Changed endpoint from `/api/v1/master` to `/api/v1/master/preview`
2. **Line 164:** Removed `preview_only: true` (endpoint is preview-specific)
3. **Lines 202-208:** Added handling for separate preview URLs (original + mastered)
4. **Line 266:** Updated `switchVersion` to use preview original URL for fair comparison
5. **Line 232:** Reduced polling interval from 3s to 2s

---

## 🧪 How to Test

### Step 1: Start Backend
```bash
cd backend
python -m app.main
```

**Expected Output:**
```
🚀 AI Mastering API starting up...
📁 Upload directory: uploads
📁 Processed directory: processed
✅ API ready!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 3: Test Preview Creation

1. **Open browser:** Go to `http://localhost:5173`
2. **Sign in** (simulated Google OAuth)
3. **Go to Library page**
4. **Upload a track:**
   - Click "Upload New Track" or drag & drop
   - Use WAV, MP3, or FLAC file
   - Wait for "File ready for mastering!" toast

5. **Configure settings:**
   - Modal opens automatically (Image 1)
   - Select Genre: Pop, Hip-Hop, etc.
   - Select Style: Warm, Balanced, or Open
   - Select Intensity: Low, Medium, or High

6. **Click "Create Preview"**

### Expected Behavior:

#### During Processing:
- ✅ Button text changes to "Processing... X%"
- ✅ Progress bar appears (0-90%)
- ✅ Toast: "Creating preview from loudest parts..."
- ✅ Button is disabled

#### After ~10-30 seconds:
- ✅ Progress reaches 100%
- ✅ Toast: "Preview ready! Toggle to compare."
- ✅ Modal switches to preview screen (Image 2)
- ✅ Waveform visualization appears
- ✅ Original/Mastered toggle buttons appear
- ✅ Audio auto-plays mastered version

#### On Preview Screen (Image 2):
- ✅ Can toggle between Original and Mastered
- ✅ Audio switches instantly when toggling
- ✅ Shows current settings (Genre, Style, Intensity)
- ✅ "Master Full Track" button is enabled
- ✅ "Adjust Settings" button goes back to config

---

## 🔍 Debugging

### Check Browser Console (F12)

**Successful Flow:**
```javascript
Starting preview with: { file_id: "abc123", genre: "pop", style: "balanced", intensity: "medium" }
Preview response status: 200
Preview result: { job_id: "xyz789", status: "processing" }
Preview status: { status: "processing", message: "Creating preview..." }
Preview status: { status: "completed", preview_original_url: "/api/v1/master/preview/xyz789/original", preview_mastered_url: "/api/v1/master/preview/xyz789/mastered" }
Preview URLs: { original: "http://127.0.0.1:8000/api/v1/master/preview/xyz789/original", mastered: "http://127.0.0.1:8000/api/v1/master/preview/xyz789/mastered" }
```

### Check Backend Terminal

**Successful Flow:**
```
Job xyz789: Creating original preview (60.0s)
Extracting preview: 30.5s to 90.5s (loudest at 60.2s)
Job xyz789: Creating mastered preview - Genre: POP, Style: BALANCED, Intensity: MEDIUM
Loading audio from uploads/abc123.wav
Extracting 60.0s preview from loudest part
Original LUFS: -18.45
Applying genre: pop, style: balanced, intensity: medium
Normalizing to -14.0 LUFS
Final LUFS: -14.02
Job xyz789 preview completed successfully
```

---

## ❌ Common Errors & Fixes

### Error 1: "Preview creation failed: 404"
**Cause:** Backend endpoint doesn't exist  
**Fix:** Make sure you're running the updated backend code

### Error 2: "Network error"
**Cause:** Backend not running  
**Fix:** Start backend with `python -m app.main`

### Error 3: "CORS error"
**Cause:** CORS not configured  
**Fix:** Backend already has CORS enabled, check if running on port 8000

### Error 4: "Preview not ready yet!"
**Cause:** Preview URLs not being set  
**Fix:** Check browser console for `preview_mastered_url` in status response

### Error 5: Modal doesn't switch to preview screen
**Cause:** `setStep('preview')` not being called  
**Fix:** Check if status is 'completed' and step is being set

---

## 📊 API Flow

```
Frontend (Library.jsx)
    ↓
1. Upload file → POST /api/v1/upload/track
    ↓ Returns: { file_id: "abc123" }
    ↓
2. Create preview → POST /api/v1/master/preview
   Body: { file_id, genre, style, intensity, preview_duration: 60 }
    ↓ Returns: { job_id: "xyz789", status: "processing" }
    ↓
3. Poll status (every 2s) → GET /api/v1/master/xyz789/status
    ↓ Returns: { status: "processing", message: "..." }
    ↓ (repeat until completed)
    ↓
4. Status complete → GET /api/v1/master/xyz789/status
    ↓ Returns: {
         status: "completed",
         preview_original_url: "/api/v1/master/preview/xyz789/original",
         preview_mastered_url: "/api/v1/master/preview/xyz789/mastered"
       }
    ↓
5. Load audio → GET /api/v1/master/preview/xyz789/original
                GET /api/v1/master/preview/xyz789/mastered
    ↓
6. User toggles between versions
```

---

## ✨ Features Working Now

✅ **Smart Preview Extraction**
- Finds loudest 60-second segment automatically
- Both original and mastered from same segment

✅ **A/B Comparison**
- Toggle between original and mastered
- Same audio segment for fair comparison
- Instant switching

✅ **Real-time Progress**
- Progress bar (0-100%)
- Status messages
- Toast notifications

✅ **Error Handling**
- Network errors caught
- Timeout protection (2 minutes)
- User-friendly error messages

✅ **Proper File Serving**
- Dedicated streaming endpoints
- No download required
- Efficient audio delivery

---

## 🎉 Success Criteria

All these should work:

✅ Click "Create Preview" → Button disabled  
✅ Progress bar shows 0-100%  
✅ Toast: "Creating preview from loudest parts..."  
✅ After processing: Modal switches to preview screen  
✅ Waveform visualization appears  
✅ Can toggle Original/Mastered  
✅ Audio plays correctly  
✅ Both versions are from same 60s segment  
✅ "Master Full Track" button works  
✅ "Adjust Settings" goes back to config  

---

## 📝 Files Modified

1. **frontend/src/pages/Library.jsx**
   - Updated `startPreview()` to use `/api/v1/master/preview`
   - Enhanced response handling for preview URLs
   - Updated `switchVersion()` for preview original URL
   - Reduced polling interval to 2s

2. **backend/app/api/mastering.py** (from previous fix)
   - Added `/api/v1/master/preview` endpoint
   - Added preview file serving endpoints
   - Updated status endpoint to return preview URLs

---

## 🚀 Next Steps

After confirming preview works:

1. Test "Master Full Track" button
2. Test downloading mastered file
3. Test with different genres/styles
4. Test with different file formats (WAV, MP3, FLAC)
5. Test error cases (large files, corrupted files)

---

**Status:** ✅ **FIXED AND READY TO TEST**  
**Last Updated:** 2025-01-21  
**Files Changed:** 1 (Library.jsx)

# 🧪 Preview Button Debugging Guide

## Current Status: You're stuck on "Create Preview"

Let's diagnose the exact issue step by step.

---

## Step 1: Verify Backend is Running

### Test 1A: Check Backend Health
Open browser: **http://localhost:8000**

**Expected Result:**
```json
{
  "message": "AI Mastering API",
  "version": "1.0.0",
  "docs": "/docs",
  "status": "running"
}
```

**If you see this:** ✅ Backend is running  
**If you see "Can't reach this page":** ❌ Backend is NOT running

---

### Test 1B: Check Backend Terminal
Look at your backend terminal. You should see:

```
🚀 AI Mastering API starting up...
📁 Upload directory: ./uploads
📁 Processed directory: ./processed
✅ API ready!
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**If you DON'T see this:**
1. Close the terminal
2. Open NEW terminal
3. Run:
```bash
cd c:\Users\Admin\Documents\WebEngineer\CascadeProjects\windsurf-project\backend
python -m app.main
```

---

## Step 2: Verify Frontend is Running

### Test 2A: Check Frontend
Open browser: **http://localhost:5173**

**Expected Result:** You see the AIMSTR landing page

**If you see "Can't reach this page":**
1. Open NEW terminal
2. Run:
```bash
cd c:\Users\Admin\Documents\WebEngineer\CascadeProjects\windsurf-project\frontend
npm run dev
```

---

## Step 3: Check Browser Console

1. Open **http://localhost:5173**
2. Press **F12** (or right-click → Inspect)
3. Click **Console** tab
4. Go to Library page
5. Upload a track
6. Click "Create Preview"

### What errors do you see?

#### Error A: "Failed to fetch" or "ERR_CONNECTION_REFUSED"
**Cause:** Backend is not running  
**Fix:** Start backend (see Step 1B)

#### Error B: "CORS error"
**Cause:** CORS not configured  
**Fix:** Backend already has CORS enabled, restart backend

#### Error C: "404 Not Found"
**Cause:** Wrong endpoint  
**Fix:** Already fixed in code, restart frontend

#### Error D: "TypeError: Pedalboard..."
**Cause:** Pedalboard error  
**Fix:** Already fixed in code, restart backend

#### Error E: No error, button just doesn't work
**Cause:** Button not connected  
**Fix:** Check if `startPreview` is being called

---

## Step 4: Test Backend Directly

### Test with cURL (Windows PowerShell)

```powershell
# Test 1: Check if backend is alive
Invoke-WebRequest -Uri "http://localhost:8000" -Method GET

# Test 2: Upload a file (replace with your file path)
$file = "C:\path\to\your\audio.mp3"
$form = @{
    file = Get-Item -Path $file
}
Invoke-WebRequest -Uri "http://localhost:8000/api/v1/upload/track" -Method POST -Form $form
```

**Expected:** You get a `file_id` back

---

## Step 5: Check Network Tab

1. Open **http://localhost:5173**
2. Press **F12**
3. Click **Network** tab
4. Go to Library page
5. Upload a track
6. Click "Create Preview"

### What requests do you see?

#### Request 1: POST to `/api/v1/upload/track`
- **Status:** Should be 200 OK
- **Response:** Should have `file_id`

#### Request 2: POST to `/api/v1/master/preview`
- **Status:** Should be 200 OK
- **Response:** Should have `job_id`

#### Request 3: GET to `/api/v1/master/{job_id}/status`
- **Status:** Should be 200 OK
- **Response:** Should have `status: "processing"` then `status: "completed"`

### If any request fails:
- **Status 404:** Endpoint doesn't exist (backend issue)
- **Status 500:** Server error (check backend terminal)
- **Status 0 / Failed:** Backend not running or CORS issue

---

## Step 6: Common Issues & Fixes

### Issue 1: Backend terminal shows nothing
**Problem:** Command didn't run properly  
**Fix:**
```bash
# Make sure you're in backend directory
cd c:\Users\Admin\Documents\WebEngineer\CascadeProjects\windsurf-project\backend

# Activate virtual environment first
.\venv\Scripts\Activate.ps1

# Then run
python -m app.main
```

### Issue 2: "Module not found" error
**Problem:** Dependencies not installed  
**Fix:**
```bash
cd backend
pip install -r requirements.txt
```

### Issue 3: Port already in use
**Problem:** Port 8000 is already taken  
**Fix:**
```bash
# Kill process on port 8000
# Then restart backend
```

### Issue 4: Frontend shows old code
**Problem:** Browser cache  
**Fix:**
1. Press **Ctrl + Shift + R** (hard refresh)
2. Or clear browser cache

---

## Step 7: Enable Detailed Logging

### Backend Logging
Add this to see more details:

In `backend/app/api/mastering.py`, the preview endpoint already has logging.

Check backend terminal for:
```
Starting preview with: { file_id: "...", genre: "pop", style: "balanced", intensity: "medium" }
Preview response status: 200
Job xyz789: Creating original preview (60.0s)
Job xyz789: Creating mastered preview...
```

### Frontend Logging
Open browser console and look for:
```javascript
Starting preview with: { file_id: "...", genre: "pop", style: "balanced", intensity: "medium" }
Preview response status: 200
Preview result: { job_id: "...", status: "processing" }
Preview status: { status: "processing" }
Preview status: { status: "completed", preview_original_url: "...", preview_mastered_url: "..." }
```

---

## Step 8: Quick Checklist

Before testing again, verify:

- [ ] Backend terminal is open and shows "API ready!"
- [ ] Frontend terminal is open and shows "Local: http://localhost:5173"
- [ ] Browser is at http://localhost:5173
- [ ] You can see the AIMSTR landing page
- [ ] You signed in
- [ ] You're on the Library page
- [ ] You uploaded a track
- [ ] Modal opened with configuration screen
- [ ] You selected genre, style, intensity
- [ ] You clicked "Create Preview"

---

## Step 9: What to Tell Me

If still stuck, tell me:

1. **Backend terminal output:** Copy the last 20 lines
2. **Frontend terminal output:** Copy the last 10 lines
3. **Browser console errors:** Copy any red errors
4. **Network tab:** Screenshot or describe failed requests
5. **What happens when you click "Create Preview":**
   - Does button change to "Processing..."?
   - Does progress bar appear?
   - Does anything happen at all?

---

## Quick Fix Commands

### Restart Everything Fresh

**Terminal 1 (Backend):**
```bash
cd c:\Users\Admin\Documents\WebEngineer\CascadeProjects\windsurf-project\backend
python -m app.main
```

**Terminal 2 (Frontend):**
```bash
cd c:\Users\Admin\Documents\WebEngineer\CascadeProjects\windsurf-project\frontend
npm run dev
```

**Browser:**
1. Go to http://localhost:5173
2. Press Ctrl + Shift + R (hard refresh)
3. Sign in
4. Go to Library
5. Upload track
6. Click "Create Preview"

---

**Last Updated:** 2025-01-21

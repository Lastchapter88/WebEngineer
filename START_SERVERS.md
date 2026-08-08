# 🚀 How to Start AIMSTR Servers

## ⚠️ IMPORTANT: You Need 2 Terminals

You need to run **TWO separate commands** in **TWO different terminals**.

---

## Terminal 1: Backend (Port 8000)

```bash
cd c:\Users\Admin\Documents\WebEngineer\CascadeProjects\windsurf-project\backend
python -m app.main
```

**Wait for this output:**
```
🚀 AI Mastering API starting up...
📁 Upload directory: uploads
📁 Processed directory: processed
✅ API ready!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ **Backend is ready when you see this!**

---

## Terminal 2: Frontend (Port 5173)

**Open a NEW terminal** (don't close the backend one!) and run:

```bash
cd c:\Users\Admin\Documents\WebEngineer\CascadeProjects\windsurf-project\frontend
npm run dev
```

**Wait for this output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

✅ **Frontend is ready when you see this!**

---

## 🌐 Open Browser

Go to: **http://localhost:5173**

---

## ✅ Checklist Before Testing

Make sure BOTH terminals show:

- [ ] Terminal 1: Backend running on port 8000
- [ ] Terminal 2: Frontend running on port 5173
- [ ] Browser open at http://localhost:5173
- [ ] No error messages in either terminal

---

## 🧪 Test the Preview Button

1. **Sign in** (click "Start Free" button)
2. **Go to Library page** (left sidebar)
3. **Upload a track** (drag & drop or click)
4. **Wait for "File ready for mastering!" toast**
5. **Modal opens automatically**
6. **Select settings:**
   - Genre: Pop
   - Style: Balanced
   - Intensity: Medium
7. **Click "Create Preview"**
8. **Wait 10-30 seconds**
9. **Modal should switch to preview screen!**

---

## ❌ Common Mistakes

### Mistake 1: Running backend from frontend folder
```bash
# ❌ WRONG
cd frontend
python -m app.main  # This won't work!

# ✅ CORRECT
cd backend
python -m app.main
```

### Mistake 2: Typo in npm command
```bash
# ❌ WRONG
npm run dev\  # Extra backslash!

# ✅ CORRECT
npm run dev
```

### Mistake 3: Only running one server
```
❌ You need BOTH servers running at the same time!
✅ Backend on port 8000 AND Frontend on port 5173
```

### Mistake 4: Closing the terminal
```
❌ Don't close the terminals while testing!
✅ Keep both terminals open and running
```

---

## 🔍 How to Check if Servers are Running

### Check Backend (Port 8000)
Open browser: http://localhost:8000

**Should see:**
```json
{
  "message": "AI Mastering API",
  "version": "1.0.0",
  "docs": "/docs",
  "status": "running"
}
```

### Check Frontend (Port 5173)
Open browser: http://localhost:5173

**Should see:** AIMSTR landing page

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if Python is installed
python --version

# Check if in correct directory
pwd  # Should show: .../windsurf-project/backend

# Install dependencies
pip install -r requirements.txt
```

### Frontend won't start
```bash
# Check if Node is installed
node --version

# Check if in correct directory
pwd  # Should show: .../windsurf-project/frontend

# Install dependencies
npm install
```

### Port already in use
```bash
# Backend (port 8000)
# Kill process using port 8000, then restart

# Frontend (port 5173)
# Kill process using port 5173, then restart
```

---

## 📊 What You Should See

### Terminal 1 (Backend):
```
🚀 AI Mastering API starting up...
📁 Upload directory: uploads
📁 Processed directory: processed
✅ API ready!
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Terminal 2 (Frontend):
```
  VITE v5.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Browser Console (F12):
When you click "Create Preview", you should see:
```javascript
Starting preview with: { file_id: "...", genre: "pop", style: "balanced", intensity: "medium" }
Preview response status: 200
Preview result: { job_id: "...", status: "processing" }
```

---

## 🎉 Success!

If you see the preview screen (Image 2) with:
- ✅ Waveform visualization
- ✅ Original/Mastered toggle buttons
- ✅ Audio playing
- ✅ Settings displayed

**Then it's working!** 🚀

---

**Last Updated:** 2025-01-21

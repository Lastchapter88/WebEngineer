# 🎵 Full Master Flow - Complete Guide

## ✅ How It Works

The full mastering flow is **already implemented**! Here's how to use it:

---

## 📋 Step-by-Step Flow

### **1. Upload & Preview**
1. Go to Library page
2. Upload your track
3. Select Genre, Style, Intensity
4. Click "Create Preview"
5. Listen to 60-second preview
6. Toggle between Original and Mastered

### **2. Fine-Tune (Optional)**
1. In preview screen, adjust Style or Intensity
2. Click "Regenerate Preview"
3. Compare different variations
4. Repeat until satisfied

### **3. Master Full Track** ✨
1. Once satisfied with preview
2. Click **"Master Full Track"** button
3. Modal switches to "Processing" screen
4. Shows progress: 0% → 100%
5. Shows stages:
   - Analyzing frequency spectrum...
   - Applying EQ adjustments...
   - Dynamic range processing...
   - Loudness maximization...
   - Finalizing master...

### **4. Download**
1. When complete, modal switches to "Complete" screen
2. Shows green checkmark
3. Shows track info (Genre, Style, Intensity)
4. Click **"Download Mastered Track"** button
5. File downloads as `{filename}_Mastered.wav`

---

## 🔧 Technical Flow

### **Frontend → Backend:**

```javascript
// 1. User clicks "Master Full Track"
createFinalMaster()

// 2. Upload file again (to get file_id)
POST /api/v1/upload/track
Response: { file_id: "abc123" }

// 3. Start full mastering
POST /api/v1/master
Body: {
  file_id: "abc123",
  genre: "pop",
  style: "balanced",
  intensity: "medium",
  preview_only: false  // ← Full track!
}
Response: { job_id: "xyz789", status: "processing" }

// 4. Poll status every 3 seconds
GET /api/v1/master/xyz789/status
Response: { status: "processing", message: "..." }

// 5. When complete
GET /api/v1/master/xyz789/status
Response: {
  status: "completed",
  download_url: "/api/v1/download/xyz789"
}

// 6. Download file
GET /api/v1/download/xyz789
Downloads: xyz789_mastered.wav
```

---

## 🎯 What Happens on Backend

### **When `preview_only: false`:**

1. **Load Full Audio**
   - Loads entire track (not just 60s)
   - Analyzes full frequency spectrum

2. **Apply Processing**
   - Genre-specific EQ
   - Style adjustments (warm/balanced/open)
   - Intensity scaling (low/medium/high)
   - Compression
   - Limiting

3. **Save Full Master**
   - Saves as `{job_id}_mastered.wav`
   - Full length, fully processed
   - Ready for download

---

## 🐛 Troubleshooting

### **Issue 1: "Master Full Track" button doesn't work**

**Check:**
1. Is preview loaded? (Button only works after preview)
2. Open browser console (F12)
3. Click "Master Full Track"
4. Look for errors

**Common Errors:**
- "Upload failed" → File object lost, re-upload track
- "Mastering failed" → Backend error, check backend terminal
- "Status check failed" → Backend not responding

### **Issue 2: Processing never completes**

**Check:**
1. Backend terminal for errors
2. File size (very large files take longer)
3. Timeout is 3 minutes (60 polls × 3 seconds)

**Debug:**
```bash
# Check backend logs
# Look for: "Job xyz789: FULL - Genre: POP, Style: BALANCED, Intensity: MEDIUM"
# Should see: "Job xyz789 completed successfully"
```

### **Issue 3: Download button doesn't appear**

**Check:**
1. Did status return `completed`?
2. Is `finalMasteredUrl` set?
3. Is step set to `'complete'`?

**Debug in console:**
```javascript
// Check state
console.log('Step:', step);
console.log('Final URL:', finalMasteredUrl);
```

### **Issue 4: Download fails**

**Check:**
1. Does file exist on backend?
2. Check `backend/processed/` directory
3. Look for `{job_id}_mastered.wav`

**Fix:**
```bash
# Check if file exists
ls backend/processed/*.wav

# Check file size
ls -lh backend/processed/{job_id}_mastered.wav
```

---

## 📊 Expected Timeline

| Track Length | Processing Time |
|--------------|----------------|
| 3 minutes    | ~30-60 seconds |
| 5 minutes    | ~60-90 seconds |
| 10 minutes   | ~2-3 minutes   |

*Times vary based on CPU speed and file complexity*

---

## 🎨 UI States

### **State 1: Preview Screen**
```
┌─────────────────────────────────┐
│ Preview Comparison              │
│ [Play Button]                   │
│ [Waveform]                      │
│ [Original] [Mastered]           │
│                                 │
│ Fine-tune Settings              │
│ [Regenerate Preview]            │
│                                 │
│ [Master Full Track] ← Click!    │
│ [Change Genre]                  │
└─────────────────────────────────┘
```

### **State 2: Processing**
```
┌─────────────────────────────────┐
│ Mastering Your Track            │
│ This may take a few minutes...  │
│                                 │
│ [Spinning Animation]            │
│ 75%                             │
│                                 │
│ [Progress Bar ████████░░]       │
│                                 │
│ Dynamic range processing...     │
│                                 │
│ Processing: song.mp3            │
│ Genre: Pop                      │
│ Style: Balanced                 │
│ Intensity: Medium               │
└─────────────────────────────────┘
```

### **State 3: Complete**
```
┌─────────────────────────────────┐
│ [Green Checkmark ✓]             │
│ Mastering Complete!             │
│ Your track is ready to download │
│                                 │
│ song.mp3                        │
│ Genre: Pop                      │
│ Style: Balanced                 │
│ Intensity: Medium               │
│ 📄 song.mp3_Mastered.wav        │
│                                 │
│ [⬇ Download Mastered Track]    │
│                                 │
│ [Master Another Track]          │
└─────────────────────────────────┘
```

---

## 🧪 Testing Steps

### **Test 1: Basic Flow**
1. Upload track
2. Create preview
3. Click "Master Full Track"
4. Wait for processing
5. Click "Download Mastered Track"
6. Verify file downloads

### **Test 2: Different Settings**
1. Upload track
2. Create preview with Pop + Balanced + Medium
3. Master full track
4. Download
5. Upload same track again
6. Create preview with Hip-Hop + Warm + High
7. Master full track
8. Download
9. Compare the two masters

### **Test 3: Large File**
1. Upload 10-minute track
2. Create preview (should be fast, only 60s)
3. Master full track (should take 2-3 minutes)
4. Verify full 10-minute file is processed

### **Test 4: Error Handling**
1. Upload track
2. Create preview
3. Stop backend server
4. Click "Master Full Track"
5. Should show error message
6. Restart backend
7. Try again, should work

---

## 📁 File Locations

### **Backend Files:**
```
backend/
├── uploads/
│   └── {file_id}.mp3          # Original uploaded file
├── processed/
│   ├── {job_id}_mastered.wav  # Full mastered track
│   └── previews/
│       ├── {job_id}_original.wav   # Preview original
│       └── {job_id}_mastered.wav   # Preview mastered
```

### **Downloaded Files:**
```
Downloads/
└── {filename}_Mastered.wav    # Your mastered track!
```

---

## 💡 Tips

### **For Best Results:**

1. **Use Preview First**
   - Always create preview before full master
   - Experiment with different settings
   - Find your perfect sound

2. **Choose Right Genre**
   - Genre affects fundamental processing
   - Pop: Bright, punchy
   - Hip-Hop: Heavy bass, crisp highs
   - Classical: Natural, dynamic

3. **Adjust Style**
   - Warm: More low-end, smooth
   - Balanced: Even across spectrum
   - Open: Airy, spacious

4. **Set Intensity**
   - Low: Subtle, natural
   - Medium: Noticeable improvement
   - High: Aggressive, loud

5. **Compare Versions**
   - Download multiple versions
   - Compare in your DAW
   - Choose the best one

---

## 🚀 Advanced Usage

### **Batch Processing:**
1. Upload multiple tracks
2. Create previews for each
3. Master all with same settings
4. Download all masters

### **A/B Testing:**
1. Master with different settings
2. Download each version
3. Import into DAW
4. Level-match and compare
5. Choose winner

### **Reference Matching:**
*(Coming soon)*
1. Upload your track
2. Upload reference track
3. AI matches sonic characteristics
4. Download matched master

---

## ✅ Success Checklist

After mastering, verify:

- [ ] File downloaded successfully
- [ ] File plays in media player
- [ ] Full length (not just 60s)
- [ ] Sounds mastered (louder, fuller)
- [ ] No distortion or clipping
- [ ] Matches preview sound
- [ ] Correct settings applied

---

## 🎉 You're Done!

Your mastered track is ready for:
- ✅ Streaming platforms (Spotify, Apple Music)
- ✅ Social media (Instagram, TikTok)
- ✅ Radio play
- ✅ Physical distribution
- ✅ Client delivery

---

**Status:** ✅ **FULLY FUNCTIONAL**  
**Last Updated:** 2025-01-21  
**Ready for:** Production use

# 🚀 Quick Start: Download ML Training Data

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies

```bash
cd backend
pip install requests tqdm musdb
```

### Step 2: Run Download Script

```bash
python scripts/download_training_data.py
```

### Step 3: Choose Option

```
Options:
1. FMA Small (8,000 tracks, 7.2 GB) - RECOMMENDED START ⭐
2. Jamendo Single Genre (custom amount)
3. Jamendo All Genres (15,000 tracks, ~50 GB)
4. MUSDB18 (150 tracks, 4 GB)
5. Show Statistics
6. Download All
```

**Recommended:** Start with Option 1 (FMA Small)

---

## 📋 What You Get

### FMA Small (Option 1)
- **8,000 tracks** (30 seconds each)
- **7.2 GB** download
- **161 genres** included
- **Creative Commons** licensed
- **10-30 minutes** download time

### Jamendo (Option 2/3)
- **500,000+ tracks** available
- **Genre-specific** downloads
- **320kbps MP3** quality
- **API key required** (free)
- Get key: https://devportal.jamendo.com/

### MUSDB18 (Option 4)
- **150 tracks** with stems
- **4 GB** download
- **Professional quality**
- **Vocals, drums, bass, other** separated

---

## 🎯 Recommended Path

### For Testing (Today)
```bash
# 1. Download FMA Small
python scripts/download_training_data.py
# Choose: 1

# Result: 8,000 tracks in ml_training_data/fma_small/
```

### For Production (This Week)
```bash
# 1. Get Jamendo API key
# Visit: https://devportal.jamendo.com/

# 2. Download by genre
python scripts/download_training_data.py
# Choose: 3
# Enter API key

# Result: 15,000 genre-specific tracks
```

---

## 📁 File Structure After Download

```
backend/
└── ml_training_data/
    ├── fma_small/
    │   ├── fma_small/
    │   │   ├── 000/
    │   │   │   ├── 000002.mp3
    │   │   │   ├── 000005.mp3
    │   │   │   └── ...
    │   │   └── ...
    │   └── fma_metadata/
    │       ├── tracks.csv
    │       ├── genres.csv
    │       └── ...
    │
    ├── jamendo/
    │   ├── pop/
    │   │   ├── 12345.mp3
    │   │   ├── 12345.mp3.json
    │   │   └── ...
    │   ├── hiphop/
    │   ├── trap/
    │   └── ...
    │
    └── musdb18/
        ├── train/
        └── test/
```

---

## 🔑 Get Jamendo API Key (Free)

1. Go to: https://devportal.jamendo.com/
2. Click "Sign Up"
3. Verify email
4. Go to "Applications"
5. Click "Create New Application"
6. Copy your **Client ID** (this is your API key)

Takes 2 minutes! ⏱️

---

## 💡 Pro Tips

### Tip 1: Start Small
```bash
# Test with FMA Small first (7.2 GB)
# Verify everything works
# Then scale up with Jamendo
```

### Tip 2: Download Overnight
```bash
# Large downloads (50+ GB) take hours
# Run before bed:
python scripts/download_training_data.py
# Choose: 6 (Download All)
# Wake up to full dataset!
```

### Tip 3: Genre-Specific Training
```bash
# Download specific genres you need
# Option 2: Single genre
# Example: 5,000 pop tracks for pop-specific model
```

---

## 📊 Dataset Comparison

| Dataset | Tracks | Size | Quality | Time |
|---------|--------|------|---------|------|
| FMA Small | 8,000 | 7.2 GB | High | 10-30 min |
| FMA Medium | 25,000 | 22 GB | High | 1-3 hours |
| Jamendo (5k/genre) | 35,000 | ~50 GB | Pro | 3-6 hours |
| MUSDB18 | 150 | 4 GB | Pro | 10-20 min |

---

## ✅ Verification

After download, check:

```bash
# Show statistics
python scripts/download_training_data.py
# Choose: 5

# Expected output:
# FMA Small: 8,000 tracks
# Jamendo pop: 5,000 tracks
# Jamendo hiphop: 3,000 tracks
# ...
# Total: 23,000 tracks
```

---

## 🚨 Troubleshooting

### Problem: Download fails
**Solution:** Check internet connection, try again

### Problem: "API key invalid"
**Solution:** Get new key from https://devportal.jamendo.com/

### Problem: "musdb not installed"
**Solution:** `pip install musdb`

### Problem: Disk space
**Solution:** 
- FMA Small needs 10 GB free
- Full setup needs 100 GB free
- Check: `df -h` (Linux/Mac) or `dir` (Windows)

---

## 🎓 Next Steps

After downloading:

1. **Organize by genre:**
   ```bash
   python scripts/organize_references.py
   ```

2. **Extract features:**
   ```bash
   python scripts/extract_features.py
   ```

3. **Train model:**
   ```bash
   python scripts/train_model.py
   ```

---

## 📈 Growth Strategy

### Week 1: Prototype
- Download: FMA Small (8k tracks)
- Train: Basic model
- Test: Verify approach works

### Week 2-4: MVP
- Download: Jamendo (35k tracks)
- Train: Production model
- Deploy: Beta testing

### Month 2-3: Scale
- Download: FMA Full (106k tracks)
- Train: Advanced model
- Launch: Full production

---

## 💰 Cost

**Total Cost: $0**

All datasets are:
- ✅ Free to download
- ✅ Free to use commercially
- ✅ Creative Commons licensed
- ✅ No attribution required (most)

---

## 🎉 Ready to Start?

```bash
cd backend
python scripts/download_training_data.py
```

Choose Option 1 (FMA Small) and you'll have 8,000 professional tracks in 30 minutes!

---

**Questions?** Check `ML_TRAINING_DATA_GUIDE.md` for detailed info.

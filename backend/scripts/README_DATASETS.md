# 🎵 Dataset Download Scripts

## Quick Start

### 1. Install Dependencies
```bash
pip install requests tqdm musdb
```

### 2. Download Test Dataset (Recommended First Step)
```bash
python download_datasets.py --fma-small
```
**Result:** 8,000 tracks in 30 minutes

### 3. Download Production Dataset
```bash
# Get Jamendo API key first: https://devportal.jamendo.com/

python download_datasets.py --fma-medium --jamendo --api-key YOUR_KEY --num-tracks 10000
```
**Result:** 35,000 tracks for production training

---

## Available Scripts

### `download_datasets.py` - Command-line downloader
**Best for:** Automated, scriptable downloads

```bash
# Examples:
python download_datasets.py --fma-small
python download_datasets.py --jamendo --api-key YOUR_KEY --genre pop --num-tracks 5000
python download_datasets.py --all --api-key YOUR_KEY
```

### `download_training_data.py` - Interactive menu
**Best for:** Manual, guided downloads

```bash
python download_training_data.py
# Then choose from menu
```

---

## Command Reference

### FMA Datasets
```bash
# Small (8k tracks, 7.2 GB) - Testing
python download_datasets.py --fma-small

# Medium (25k tracks, 22 GB) - Production
python download_datasets.py --fma-medium
```

### Jamendo (Requires API Key)
```bash
# Get API key: https://devportal.jamendo.com/

# Download 1000 tracks (any genre)
python download_datasets.py --jamendo --api-key YOUR_KEY

# Download 5000 pop tracks
python download_datasets.py --jamendo --api-key YOUR_KEY --genre pop --num-tracks 5000

# Download multiple genres (run separately)
python download_datasets.py --jamendo --api-key YOUR_KEY --genre pop --num-tracks 5000
python download_datasets.py --jamendo --api-key YOUR_KEY --genre hiphop --num-tracks 3000
python download_datasets.py --jamendo --api-key YOUR_KEY --genre trap --num-tracks 2000
```

### MUSDB18
```bash
# 150 tracks with stems (4 GB)
python download_datasets.py --musdb18
```

### Download Everything
```bash
python download_datasets.py --all --api-key YOUR_KEY
```

---

## Output Structure

```
backend/
└── ml_training_data/
    ├── fma_small/
    │   ├── fma_small/
    │   │   └── 000/
    │   │       ├── 000002.mp3
    │   │       └── ...
    │   └── fma_metadata/
    │       ├── tracks.csv
    │       └── genres.csv
    │
    ├── jamendo/
    │   ├── pop/
    │   │   ├── 12345.mp3
    │   │   ├── metadata.json
    │   │   └── ...
    │   ├── hiphop/
    │   └── ...
    │
    └── musdb18/
        ├── train/
        └── test/
```

---

## Recommended Download Strategy

### Phase 1: Prototype (Today)
```bash
python download_datasets.py --fma-small
```
- **Time:** 30 minutes
- **Size:** 7.2 GB
- **Tracks:** 8,000
- **Purpose:** Test your pipeline

### Phase 2: MVP (This Week)
```bash
# Get Jamendo API key first
python download_datasets.py --fma-medium
python download_datasets.py --jamendo --api-key YOUR_KEY --num-tracks 10000
```
- **Time:** 3-6 hours
- **Size:** ~35 GB
- **Tracks:** 35,000
- **Purpose:** Production training

### Phase 3: Scale (This Month)
```bash
# Download by genre for balanced dataset
for genre in pop hiphop trap rnb soul jazz classical; do
    python download_datasets.py --jamendo --api-key YOUR_KEY --genre $genre --num-tracks 5000
done
```
- **Time:** Overnight
- **Size:** ~50 GB
- **Tracks:** 50,000+
- **Purpose:** Industry-leading model

---

## Tips

### Resume Downloads
Both scripts skip already-downloaded files, so you can safely interrupt and resume.

### Check Progress
```bash
python download_datasets.py --fma-small
# Shows progress bar and ETA
```

### View Statistics
```bash
python download_training_data.py
# Choose option 5: Show Statistics
```

### Parallel Downloads
Download different genres in parallel:
```bash
# Terminal 1
python download_datasets.py --jamendo --api-key YOUR_KEY --genre pop --num-tracks 5000

# Terminal 2
python download_datasets.py --jamendo --api-key YOUR_KEY --genre hiphop --num-tracks 5000
```

---

## Troubleshooting

### "No module named 'tqdm'"
```bash
pip install tqdm requests
```

### "No module named 'musdb'"
```bash
pip install musdb
```

### "API key invalid"
Get a new key at: https://devportal.jamendo.com/

### Download interrupted
Just run the same command again - it will skip existing files and resume.

### Disk space
- FMA Small: Need 10 GB free
- FMA Medium: Need 30 GB free
- Full setup: Need 100 GB free

---

## Next Steps

After downloading:

1. **Organize by genre:**
   ```bash
   python organize_references.py
   ```

2. **Extract features:**
   ```bash
   python extract_features.py
   ```

3. **Train model:**
   ```bash
   python train_model.py
   ```

---

## Legal & Licensing

All datasets are:
- ✅ Creative Commons licensed
- ✅ Free for commercial use
- ✅ Safe for ML training
- ✅ No attribution required (most)

**Sources:**
- FMA: https://github.com/mdeff/fma
- Jamendo: https://www.jamendo.com
- MUSDB18: https://sigsep.github.io/datasets/musdb.html

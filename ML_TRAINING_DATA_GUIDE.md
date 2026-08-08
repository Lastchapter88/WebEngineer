# 🎵 ML Training Data for AIMSTR - Complete Guide

## 🎯 Recommended Strategy for AIMSTR

### Phase 1: Prototype (Start Here)
**Dataset:** FMA Small (8,000 tracks, 7.2 GB)
**Goal:** Prove the concept works
**Timeline:** 1-2 weeks

### Phase 2: MVP
**Dataset:** FMA Medium (25,000 tracks) + Jamendo (50,000 tracks)
**Goal:** Production-ready model
**Timeline:** 1 month

### Phase 3: Scale
**Dataset:** FMA Full (106k) + Jamendo (500k+) + Internet Archive
**Goal:** Industry-leading model
**Timeline:** 3-6 months

---

## 📥 Quick Start: Download Training Data

### Option 1: FMA Small (Recommended for Testing)

```bash
# Download FMA Small (7.2 GB)
cd backend
mkdir -p ml_training_data/fma_small
cd ml_training_data

# Download
wget https://os.unil.cloud.switch.ch/fma/fma_small.zip

# Extract
unzip fma_small.zip

# Download metadata
wget https://os.unil.cloud.switch.ch/fma/fma_metadata.zip
unzip fma_metadata.zip
```

### Option 2: Jamendo API (Scalable)

```python
# backend/scripts/download_jamendo.py
import requests
import os
from tqdm import tqdm

API_KEY = "your_api_key_here"  # Get from https://devportal.jamendo.com/
OUTPUT_DIR = "ml_training_data/jamendo"

def download_jamendo_by_genre(genre, limit=1000):
    """Download Jamendo tracks by genre"""
    os.makedirs(f"{OUTPUT_DIR}/{genre}", exist_ok=True)
    
    url = "https://api.jamendo.com/v3.0/tracks/"
    params = {
        "client_id": API_KEY,
        "format": "json",
        "limit": 200,
        "audioformat": "mp32",  # 320kbps
        "tags": genre,
        "include": "musicinfo"
    }
    
    downloaded = 0
    offset = 0
    
    while downloaded < limit:
        params['offset'] = offset
        response = requests.get(url, params=params)
        tracks = response.json()['results']
        
        if not tracks:
            break
        
        for track in tqdm(tracks, desc=f"Downloading {genre}"):
            if downloaded >= limit:
                break
            
            try:
                audio_url = track['audio']
                track_id = track['id']
                filename = f"{OUTPUT_DIR}/{genre}/{track_id}.mp3"
                
                # Download audio
                audio_response = requests.get(audio_url, timeout=30)
                with open(filename, 'wb') as f:
                    f.write(audio_response.content)
                
                # Save metadata
                metadata = {
                    'id': track_id,
                    'name': track['name'],
                    'artist': track['artist_name'],
                    'genre': genre,
                    'duration': track['duration']
                }
                
                import json
                with open(f"{filename}.json", 'w') as f:
                    json.dump(metadata, f)
                
                downloaded += 1
            except Exception as e:
                print(f"Error downloading {track.get('name')}: {e}")
        
        offset += 200
    
    print(f"Downloaded {downloaded} {genre} tracks")

if __name__ == "__main__":
    # Download by genre (matching your app's genres)
    genres = ['pop', 'hiphop', 'trap', 'rnb', 'soul', 'jazz', 'classical']
    
    for genre in genres:
        print(f"\n=== Downloading {genre.upper()} ===")
        download_jamendo_by_genre(genre, limit=5000)  # 5k per genre = 35k total
```

---

## 🔧 Data Preprocessing Pipeline

### Step 1: Organize Reference Tracks

```python
# backend/scripts/organize_references.py
import os
import shutil
from pathlib import Path

def organize_by_genre(source_dir, output_dir):
    """
    Organize downloaded tracks by genre for training
    """
    genres = ['pop', 'hiphop', 'trap', 'rnb', 'soul', 'jazz', 'classical', 'amapiano']
    
    for genre in genres:
        genre_dir = Path(output_dir) / genre
        genre_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy reference tracks to appropriate genre folders
    reference_dir = Path("uploads/references")
    
    for ref_file in reference_dir.glob("*.wav"):
        # Load metadata
        metadata_file = ref_file.with_suffix('.json')
        if metadata_file.exists():
            import json
            with open(metadata_file) as f:
                metadata = json.load(f)
                genre = metadata.get('genre', 'uncategorized')
                
                if genre in genres:
                    dest = Path(output_dir) / genre / ref_file.name
                    shutil.copy(ref_file, dest)
                    print(f"Copied {ref_file.name} to {genre}/")

if __name__ == "__main__":
    organize_by_genre("uploads/references", "ml_training_data/organized")
```

### Step 2: Extract Audio Features

```python
# backend/scripts/extract_features.py
import librosa
import numpy as np
import json
from pathlib import Path
from tqdm import tqdm

def extract_features(audio_path):
    """
    Extract features from mastered reference track
    """
    # Load audio
    y, sr = librosa.load(audio_path, sr=44100, mono=True)
    
    # Normalize
    y = y / (np.max(np.abs(y)) + 1e-8)
    
    features = {
        # Spectral features
        'spectral_centroid': librosa.feature.spectral_centroid(y=y, sr=sr).mean(),
        'spectral_bandwidth': librosa.feature.spectral_bandwidth(y=y, sr=sr).mean(),
        'spectral_rolloff': librosa.feature.spectral_rolloff(y=y, sr=sr).mean(),
        
        # Loudness
        'rms': librosa.feature.rms(y=y).mean(),
        'loudness_lufs': estimate_lufs(y, sr),
        
        # Dynamic range
        'dynamic_range': np.max(y) - np.min(y),
        'crest_factor': np.max(np.abs(y)) / (np.sqrt(np.mean(y**2)) + 1e-8),
        
        # Frequency content
        'low_energy': np.mean(np.abs(librosa.stft(y)[:50, :])),  # < 1kHz
        'mid_energy': np.mean(np.abs(librosa.stft(y)[50:200, :])),  # 1-4kHz
        'high_energy': np.mean(np.abs(librosa.stft(y)[200:, :])),  # > 4kHz
        
        # Stereo width (if stereo)
        'stereo_width': calculate_stereo_width(audio_path),
    }
    
    return features

def estimate_lufs(y, sr):
    """Estimate LUFS (simplified)"""
    # K-weighting filter approximation
    rms = np.sqrt(np.mean(y**2))
    lufs = -0.691 + 10 * np.log10(rms + 1e-8)
    return lufs

def calculate_stereo_width(audio_path):
    """Calculate stereo width"""
    try:
        y, sr = librosa.load(audio_path, sr=44100, mono=False)
        if y.shape[0] == 2:
            # Calculate correlation between L and R
            correlation = np.corrcoef(y[0], y[1])[0, 1]
            width = 1 - correlation  # 0 = mono, 1 = wide
            return width
        return 0.0  # Mono
    except:
        return 0.0

def process_dataset(input_dir, output_file):
    """
    Process all tracks and save features
    """
    audio_files = list(Path(input_dir).rglob("*.mp3")) + \
                  list(Path(input_dir).rglob("*.wav"))
    
    dataset = []
    
    for audio_file in tqdm(audio_files, desc="Extracting features"):
        try:
            features = extract_features(str(audio_file))
            features['file_path'] = str(audio_file)
            features['genre'] = audio_file.parent.name
            dataset.append(features)
        except Exception as e:
            print(f"Error processing {audio_file}: {e}")
    
    # Save dataset
    with open(output_file, 'w') as f:
        json.dump(dataset, f, indent=2)
    
    print(f"Saved {len(dataset)} tracks to {output_file}")

if __name__ == "__main__":
    process_dataset(
        "ml_training_data/organized",
        "ml_training_data/reference_features.json"
    )
```

---

## 🤖 Training Pipeline

### Step 1: Create Training Pairs

```python
# backend/scripts/create_training_pairs.py
import numpy as np
import librosa
from pathlib import Path

def create_training_pair(unmastered_path, reference_features):
    """
    Create input-output pair for training
    
    Input: Unmastered track
    Output: Target features from reference
    """
    # Load unmastered audio
    y, sr = librosa.load(unmastered_path, sr=44100)
    
    # Extract current features
    current_features = extract_features(unmastered_path)
    
    # Calculate deltas (what needs to change)
    deltas = {
        'loudness_delta': reference_features['loudness_lufs'] - current_features['loudness_lufs'],
        'spectral_centroid_delta': reference_features['spectral_centroid'] - current_features['spectral_centroid'],
        'dynamic_range_delta': reference_features['dynamic_range'] - current_features['dynamic_range'],
        # ... more deltas
    }
    
    return {
        'input': current_features,
        'target': reference_features,
        'deltas': deltas
    }
```

### Step 2: Model Architecture

```python
# backend/app/ml/mastering_model.py
import torch
import torch.nn as nn

class MasteringNet(nn.Module):
    """
    Neural network for audio mastering
    Predicts optimal processing parameters
    """
    def __init__(self, input_features=10, hidden_size=128):
        super().__init__()
        
        self.encoder = nn.Sequential(
            nn.Linear(input_features, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.3),
        )
        
        # Output: EQ, Compression, Limiting parameters
        self.eq_head = nn.Linear(hidden_size, 5)  # 5-band EQ gains
        self.comp_head = nn.Linear(hidden_size, 4)  # threshold, ratio, attack, release
        self.limiter_head = nn.Linear(hidden_size, 2)  # threshold, ceiling
        
    def forward(self, x):
        features = self.encoder(x)
        
        return {
            'eq_gains': self.eq_head(features),
            'compressor': self.comp_head(features),
            'limiter': self.limiter_head(features)
        }
```

---

## 📊 Dataset Statistics

### Recommended Breakdown

```
Genre Distribution (for balanced training):
- Pop: 15,000 tracks (30%)
- Hip-Hop: 10,000 tracks (20%)
- Electronic: 8,000 tracks (16%)
- Rock: 7,000 tracks (14%)
- R&B/Soul: 5,000 tracks (10%)
- Jazz: 3,000 tracks (6%)
- Classical: 2,000 tracks (4%)

Total: 50,000 tracks
Storage: ~150 GB
Training time: 2-3 weeks on GPU
```

---

## 🚀 Quick Start Commands

```bash
# 1. Setup directories
mkdir -p backend/ml_training_data/{fma_small,jamendo,organized,models}

# 2. Download FMA Small (test dataset)
cd backend/ml_training_data
wget https://os.unil.cloud.switch.ch/fma/fma_small.zip
unzip fma_small.zip

# 3. Get Jamendo API key
# Visit: https://devportal.jamendo.com/

# 4. Download by genre
python scripts/download_jamendo.py

# 5. Organize references
python scripts/organize_references.py

# 6. Extract features
python scripts/extract_features.py

# 7. Train model
python scripts/train_model.py
```

---

## 💡 Integration with AIMSTR

### Use Reference Tracks in Backend

```python
# backend/app/ml/reference_matcher.py
import json
from pathlib import Path

class ReferenceMatcher:
    """
    Match user tracks to similar reference tracks
    """
    def __init__(self, features_file="ml_training_data/reference_features.json"):
        with open(features_file) as f:
            self.references = json.load(f)
    
    def find_similar(self, track_features, genre, top_k=5):
        """
        Find similar reference tracks
        """
        genre_refs = [r for r in self.references if r['genre'] == genre]
        
        # Calculate similarity
        similarities = []
        for ref in genre_refs:
            distance = self.calculate_distance(track_features, ref)
            similarities.append((ref, distance))
        
        # Return top K most similar
        similarities.sort(key=lambda x: x[1])
        return [ref for ref, _ in similarities[:top_k]]
    
    def calculate_distance(self, features1, features2):
        """Calculate feature distance"""
        import numpy as np
        
        keys = ['spectral_centroid', 'loudness_lufs', 'dynamic_range']
        distances = []
        
        for key in keys:
            if key in features1 and key in features2:
                distances.append((features1[key] - features2[key]) ** 2)
        
        return np.sqrt(np.mean(distances))
```

---

## 📈 Success Metrics

### Track Your Progress

```python
# backend/scripts/evaluate_model.py
def evaluate_model(model, test_set):
    """
    Evaluate model performance
    """
    metrics = {
        'loudness_error': [],
        'spectral_accuracy': [],
        'user_satisfaction': []
    }
    
    for test_track in test_set:
        prediction = model.predict(test_track)
        ground_truth = test_track['target']
        
        # Calculate errors
        loudness_error = abs(prediction['loudness'] - ground_truth['loudness'])
        metrics['loudness_error'].append(loudness_error)
    
    return {
        'avg_loudness_error': np.mean(metrics['loudness_error']),
        'accuracy': calculate_accuracy(metrics)
    }
```

---

## 🎯 Next Steps

1. **Download FMA Small** (7.2 GB) - Start today
2. **Get Jamendo API key** - Free, instant
3. **Run preprocessing scripts** - Extract features
4. **Train initial model** - Prove concept
5. **Scale up** - Add more data
6. **Deploy** - Integrate with AIMSTR

---

## 📚 Resources

- FMA Dataset: https://github.com/mdeff/fma
- Jamendo API: https://developer.jamendo.com/
- MUSDB18: https://sigsep.github.io/datasets/musdb.html
- Librosa Docs: https://librosa.org/doc/latest/index.html
- PyTorch Audio: https://pytorch.org/audio/stable/index.html

---

**Status:** Ready to implement
**Estimated Time:** 1 week for prototype, 1 month for production
**Cost:** $0 (all datasets are free!)

# AIMSTR - AI Mastering API (LANDR-Style)

Professional audio mastering API with style-based presets and intelligent processing.

## 🎵 Features

### Style-Based Mastering
Instead of genre presets, we use **3 musical styles** with **3 intensity levels** each:

- **Warm** 🔥 - Rich low-end, smooth highs, vintage analog character
- **Balanced** ⚖️ - Even frequency response, natural and transparent
- **Open** ✨ - Bright highs, wide stereo field, airy and spacious

Each style has 3 intensity levels:
- **Low** - Subtle, preserves dynamics (-16 LUFS)
- **Medium** - Balanced enhancement (-14 LUFS)  
- **High** - Maximum impact (-11 to -12 LUFS)

### A/B Comparison with Volume Matching
- Toggle between original and mastered versions
- Optional volume matching for fair comparison
- Eliminates loudness bias when evaluating processing quality

### Reference Matching (Advanced)
- Upload a reference track to match its sonic characteristics
- AI-powered analysis (when ML components available)
- Intelligent parameter prediction

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Create directories
mkdir uploads processed
```

### 2. Environment Setup

Create a `.env` file:

```env
DEBUG=True
UPLOAD_DIR=./uploads
PROCESSED_DIR=./processed
SAMPLE_RATE=44100
```

### 3. Run the API

```bash
# Development
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 4. Open Frontend

Open `frontend-example.html` in your browser or serve it:

```bash
python -m http.server 3000
```

Then navigate to `http://localhost:3000/frontend-example.html`

## 📡 API Endpoints

### Upload Track

```bash
POST /api/v1/upload/track
Content-Type: multipart/form-data

# Response
{
  "file_id": "uuid-here",
  "filename": "track.wav",
  "analysis": {
    "lufs": -12.3,
    "peak": 0.89,
    "duration": 180.5,
    "sample_rate": 44100,
    "channels": 2
  }
}
```

### Start Mastering

```bash
POST /api/v1/master
Content-Type: application/json

{
  "file_id": "uuid-here",
  "style": "warm",           # warm, balanced, or open
  "intensity": "medium",     # low, medium, or high
  "volume_match": true,      # Create volume-matched original
  "use_advanced": true
}

# Response
{
  "job_id": "job-uuid",
  "status": "processing",
  "message": "Mastering started with warm style medium intensity"
}
```

### Check Status

```bash
GET /api/v1/master/{job_id}/status

# Response (Processing)
{
  "status": "processing",
  "job_id": "job-uuid",
  "message": "Your track is being mastered..."
}

# Response (Completed)
{
  "status": "completed",
  "job_id": "job-uuid",
  "download_url": "/api/v1/download/{job_id}",
  "has_volume_match": true,
  "matched_url": "/api/v1/download/{job_id}/matched"
}
```

### Download Files

```bash
# Download mastered track
GET /api/v1/download/{job_id}

# Download volume-matched original (for A/B comparison)
GET /api/v1/download/{job_id}/matched
```

### List Styles

```bash
GET /api/v1/styles

# Response
{
  "styles": [
    {
      "id": "warm",
      "name": "Warm",
      "description": "Rich low-end, smooth highs, vintage character",
      "icon": "🔥",
      "character": "Warm, rich, analog-inspired sound",
      "target_lufs": {
        "low": -16,
        "medium": -14,
        "high": -12
      }
    },
    // ... more styles
  ],
  "intensities": ["low", "medium", "high"]
}
```

## 🎛️ Processing Pipeline

### 1. Audio Analysis
- LUFS loudness measurement
- Peak level detection
- Dynamic range analysis
- Format validation

### 2. Style Application
Each style applies a custom processing chain:

**Warm Style:**
- Enhanced low-end (bass boost)
- Smooth highs (gentle roll-off)
- Midrange warmth
- Analog-style saturation
- Moderate compression

**Balanced Style:**
- Flat frequency response
- Transparent processing
- Minimal coloration
- Natural dynamics preservation
- Clean limiting

**Open Style:**
- Bright high-end enhancement
- Air band boost (10kHz+)
- Tight low-end
- Wide stereo imaging
- Clarity-focused processing

### 3. Intensity Scaling
- **Low**: Subtle enhancement, preserves dynamics
- **Medium**: Balanced processing, competitive loudness
- **High**: Maximum impact, streaming-ready

### 4. Loudness Normalization
- Target LUFS varies by style and intensity
- Intelligent gain staging
- Peak limiting to prevent clipping
- Maintains headroom for distribution

### 5. Volume Matching (Optional)
- Matches original to mastered loudness
- Enables fair A/B comparison
- Removes loudness bias

## 🏗️ Project Structure

```
app/
├── main.py                          # FastAPI application
├── config.py                        # Configuration settings
├── api/
│   ├── mastering.py                 # Mastering endpoints
│   ├── upload.py                    # File upload
│   ├── download.py                  # File download
│   ├── health.py                    # Health checks
│   └── presets.py                   # Preset info (legacy)
└── mastering/
    ├── presets.py                   # Style presets (NEW)
    ├── processor.py                 # Audio processing (UPDATED)
    └── intelligent_processor.py     # AI processing (optional)
```

## 🔧 Technical Details

### Audio Processing Stack
- **Pedalboard** - Professional DSP effects (Spotify's library)
- **pyloudnorm** - ITU-R BS.1770 loudness measurement
- **librosa** - Audio analysis and resampling
- **soundfile** - High-quality I/O

### Processing Chain Components
1. **High-pass filter** - Remove DC offset and rumble
2. **EQ** - Frequency shaping (style-dependent)
3. **Saturation** - Analog warmth (warm style)
4. **Compression** - Dynamic control
5. **Limiting** - Final peak control
6. **Normalization** - Target LUFS

### Performance
- Typical processing time: 5-15 seconds
- Supports files up to 100MB
- Sample rates: 44.1kHz, 48kHz (auto-converts)
- Formats: WAV, MP3, FLAC, M4A, AIFF

## 🎯 Use Cases

### Music Production
```python
# Warm, punchy master for hip-hop
POST /api/v1/master
{
  "style": "warm",
  "intensity": "high"
}
```

### Streaming Optimization
```python
# Balanced master for Spotify/Apple Music
POST /api/v1/master
{
  "style": "balanced",
  "intensity": "medium"
}
```

### Podcast/Voice
```python
# Open, clear master for podcasts
POST /api/v1/master
{
  "style": "open",
  "intensity": "low"
}
```

## 🆚 Legacy Preset Support

Old genre presets are still supported and automatically mapped:

| Old Preset | New Style | Intensity |
|------------|-----------|-----------|
| pop | balanced | high |
| hiphop | warm | high |
| rock | warm | medium |
| edm | open | high |
| jazz | balanced | low |
| podcast | balanced | medium |
| lofi | warm | medium |
| streaming | balanced | medium |

## 🔮 Advanced Features (Optional)

### Reference Matching
When ML components are available:

```python
POST /api/v1/master
{
  "file_id": "your-track-id",
  "reference_file_id": "reference-track-id",
  "use_advanced": true
}
```

The system will:
1. Extract features from both tracks
2. Predict optimal mastering parameters
3. Apply intelligent processing
4. Match sonic characteristics

### ML Setup (Optional)
```bash
# Install ML dependencies
cd ml-training
pip install -r requirements.txt

# Train model (if you have training data)
python train_model.py

# Model is automatically used when available
```

## 📊 Monitoring

### Health Check
```bash
GET /api/v1/health

# Response
{
  "status": "healthy",
  "timestamp": "2025-01-20T10:30:00Z",
  "service": "AI Mastering API"
}
```

### Metrics to Track
- Average processing time
- LUFS before/after
- Style distribution
- Upload success rate

## 🚢 Deployment

### Docker (Recommended)

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t aimstr .
docker run -p 8000:8000 -v $(pwd)/uploads:/app/uploads -v $(pwd)/processed:/app/processed aimstr
```

### Environment Variables

```env
# App
APP_NAME=AI Mastering API
DEBUG=False

# Storage
UPLOAD_DIR=/app/uploads
PROCESSED_DIR=/app/processed
MAX_FILE_SIZE=104857600  # 100MB

# Processing
SAMPLE_RATE=44100

# Cleanup
CLEANUP_AFTER_HOURS=24
```

## 🤝 Contributing

We welcome contributions! Areas for improvement:

1. **More styles** - Add genre-specific presets
2. **Advanced DSP** - Multi-band processing, stereo enhancement
3. **ML improvements** - Better reference matching
4. **Real-time preview** - Stream processing progress
5. **Batch processing** - Process multiple files

## 📝 License

MIT License - See LICENSE file

## 🙏 Credits

- Spotify's **Pedalboard** library for DSP
- **pyloudnorm** for ITU-R BS.1770 implementation
- Inspired by **LANDR** mastering workflow

## 📧 Support

- GitHub Issues: [Report bugs or request features]
- Documentation: [Full API docs at /docs]
- Email: support@aimstr.io

---

Made with ❤️ for audio engineers and musicians

# 🎵 AIMstr - AI-Powered Audio Mastering Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-green.svg)
![Node](https://img.shields.io/badge/node-18+-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109.1-009688.svg)
![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)

**A professional full-stack audio mastering application with AI-powered reference-based processing and real-time audio analysis.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack)

</div>

---

## ✨ Features

### 🎚️ Audio Processing
- **AI-Powered Mastering** - Intelligent audio processing with reference-based analysis
- **Multiple Presets** - Streaming, CD, Vinyl, and custom mastering profiles
- **Real-time Analysis** - Live waveform visualization and audio metrics
- **Format Support** - WAV, MP3, FLAC, M4A, AIFF (up to 100MB)

### 🎨 User Interface
- **Modern React UI** - Built with React 18, TypeScript, and TailwindCSS
- **Drag & Drop Upload** - Intuitive file upload with progress tracking
- **Audio Visualization** - WaveSurfer.js integration for waveform display
- **Responsive Design** - Works seamlessly on desktop and mobile

### ⚡ Performance
- **Async Processing** - Redis-backed job queue with Celery workers
- **Fast API** - High-performance FastAPI backend
- **Optimized Audio** - Librosa and Pedalboard for professional-grade processing
- **Real-time Updates** - WebSocket support for live job status

### 🔒 Production Ready
- **RESTful API** - Well-documented API with OpenAPI/Swagger
- **Error Handling** - Comprehensive error handling and validation
- **Health Checks** - Built-in health monitoring endpoints
- **Scalable Architecture** - Microservices-ready design

---

## 📸 Screenshots

<div align="center">

### Landing Page
![Landing Page](./docs/screenshots/landing.png)

### Upload & Processing
![Upload Interface](./docs/screenshots/upload.png)

### Audio Analysis
![Audio Analysis](./docs/screenshots/analysis.png)

### Mastering Console
![Mastering Console](./docs/screenshots/console.png)

</div>

> **Note:** Screenshots coming soon! The application features a modern, responsive UI built with React and TailwindCSS.

---

## 🛠 Tech Stack

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern, fast web framework for building APIs
- **[Celery](https://docs.celeryq.dev/)** - Distributed task queue for async processing
- **[Redis](https://redis.io/)** - In-memory data store for caching and job queue
- **[Librosa](https://librosa.org/)** - Audio analysis and feature extraction
- **[Pedalboard](https://github.com/spotify/pedalboard)** - Spotify's audio effects library
- **[Pyloudnorm](https://github.com/csteinmetz1/pyloudnorm)** - Audio loudness normalization

### Frontend
- **[React 18](https://react.dev/)** - Modern UI library with hooks
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Next-generation frontend tooling
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[WaveSurfer.js](https://wavesurfer-js.org/)** - Audio waveform visualization
- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+ ([Download](https://www.python.org/downloads/))
- Node.js 18+ ([Download](https://nodejs.org/))
- Redis ([Download](https://redis.io/download))

Verify installations:
```bash
python --version  # Should be 3.9+
node --version    # Should be 18+
redis-cli ping    # Should return "PONG"
```

## 🔧 Backend Setup

1. Navigate to backend directory
```bash
cd backend
```

2. Create Python virtual environment
```bash
python -m venv venv
```

3. Activate virtual environment
```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

4. Install dependencies
```bash
pip install -r requirements.txt
```

5. Create environment file
```bash
cp .env.example .env
```
Edit `.env` if needed (defaults work for local development)

6. Create necessary directories
```bash
mkdir uploads processed
```

7. Start Redis (in a separate terminal)
```bash
redis-server
```

8. Start the backend server
```bash
python -m app.main
```
Or with auto-reload:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend should now be running at: http://localhost:8000
API Docs: http://localhost:8000/docs

## 🎨 Frontend Setup

1. Open a new terminal and navigate to frontend
```bash
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```
Add this to `.env`:
```
VITE_API_URL=http://localhost:8000/api/v1
```

4. Start development server
```bash
npm run dev
```

Frontend should now be running at: http://localhost:3000

## ✅ Verification

1. **Backend Health Check**
```bash
curl http://localhost:8000/api/v1/health
```
Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-18T...",
  "service": "AI Mastering API"
}
```

2. **Test Presets Endpoint**
```bash
curl http://localhost:8000/api/v1/presets
```
Should return list of presets

3. **Frontend Check**
Open http://localhost:3000 - you should see the landing page

## 🎵 Testing the Mastering Process

1. **Via API**
```bash
# Upload a track
curl -X POST "http://localhost:8000/api/v1/upload/track" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/audio.wav"

# Master the track (use file_id from above)
curl -X POST "http://localhost:8000/api/v1/master" \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "YOUR_FILE_ID_HERE",
    "preset": "streaming"
  }'

# Download result (use job_id from above)
curl "http://localhost:8000/api/v1/download/YOUR_JOB_ID" \
  --output mastered.wav
```

2. **Via Frontend**
- Go to http://localhost:3000
- Upload your track
- Select a preset
- Click "Master Track"
- Download the result!

## 🐛 Troubleshooting

### Backend Issues
- **ModuleNotFoundError**: Ensure virtual environment is activated and run `pip install -r requirements.txt` again
- **Redis ConnectionError**: Make sure Redis is running (`redis-cli ping`)
- **Permission errors**: Check folder permissions for `uploads` and `processed` directories

### Frontend Issues
- **Missing modules**: Delete `node_modules` and `package-lock.json`, then run `npm install`
- **API call failures**: Verify `.env` has correct `VITE_API_URL` and backend is running

### Audio Processing
- **Invalid file type**: Supported formats: WAV, MP3, FLAC, M4A, AIFF (<100MB)
- **Analysis errors**: Try a different audio file if current one may be corrupted

## 📦 Project Structure

```
ai-mastering-app/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py      # Entry point
│   │   ├── config.py    # Settings
│   │   ├── api/v1/      # API routes
│   │   └── mastering/   # Processing logic
│   ├── uploads/         # Uploaded files
│   ├── processed/       # Mastered files
│   └── requirements.txt
│
└── frontend/            # React frontend
    ├── src/
    │   ├── pages/       # Page components
    │   ├── components/  # Reusable UI
    │   └── services/    # API clients
    └── package.json
```

## 🛠 Development

### Frontend
- Built with React + TypeScript + Vite
- Uses ESLint for code quality (see original config below)
- React Compiler enabled for optimizations

### Backend
- FastAPI for REST API
- Redis for job queue
- Audio processing with Librosa, Pyloudnorm, Pedalboard

<details>
<summary>Original ESLint Configuration</summary>

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```
</details>

## 📚 Documentation
- API Docs: http://localhost:8000/docs
- React Docs: https://react.dev
- FastAPI Docs: https://fastapi.tiangolo.com

## 🚀 Deployment

### Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Deployment

**Backend (Production)**
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run with Gunicorn
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**Frontend (Production)**
```bash
# Build for production
cd frontend
npm run build

# Serve with nginx or any static file server
# Build output is in frontend/dist
```

### Environment Variables

**Backend (.env)**
```env
REDIS_URL=redis://localhost:6379
UPLOAD_DIR=./uploads
PROCESSED_DIR=./processed
MAX_FILE_SIZE=104857600  # 100MB
```

**Frontend (.env)**
```env
VITE_API_URL=https://your-api-domain.com/api/v1
```

---

## 📡 API Endpoints

### Health Check
```bash
GET /api/v1/health
```

### Upload Audio
```bash
POST /api/v1/upload/track
Content-Type: multipart/form-data
Body: file (audio file)
```

### Master Audio
```bash
POST /api/v1/master
Content-Type: application/json
Body: {
  "file_id": "string",
  "preset": "streaming" | "cd" | "vinyl" | "custom"
}
```

### Get Job Status
```bash
GET /api/v1/status/{job_id}
```

### Download Mastered Audio
```bash
GET /api/v1/download/{job_id}
```

### List Presets
```bash
GET /api/v1/presets
```

For complete API documentation, visit: `http://localhost:8000/docs`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- **Backend**: Follow PEP 8 guidelines
- **Frontend**: ESLint configuration is provided
- Run linters before committing:
  ```bash
  # Backend
  cd backend && pylint app/
  
  # Frontend
  cd frontend && npm run lint
  ```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**AIMstr Team**

- GitHub: [@Lastchapter88](https://github.com/Lastchapter88)
- Repository: [aimstr-api](https://github.com/Lastchapter88/aimstr-api)

---

## 🙏 Acknowledgments

- [Spotify Pedalboard](https://github.com/spotify/pedalboard) - Professional audio effects
- [Librosa](https://librosa.org/) - Audio analysis library
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://react.dev/) - UI library

---

## 📞 Support

If you encounter any issues or have questions:

- 🐛 [Report a Bug](https://github.com/Lastchapter88/aimstr-api/issues)
- 💡 [Request a Feature](https://github.com/Lastchapter88/aimstr-api/issues)
- 📧 Contact: [Your Email]

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by the AIMstr Team

</div>

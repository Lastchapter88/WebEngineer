"""
AI Mastering App - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api import mastering, download, health, upload, reference, advanced_mastering
from app.config import settings

# Create FastAPI app
app = FastAPI(
    title="AI Mastering API",
    description="Professional audio mastering with AI and presets",
    version="1.0.0"
)

# CORS middleware - allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(mastering.router, prefix="/api/v1", tags=["mastering"])
app.include_router(advanced_mastering.router, prefix="/api/v1", tags=["advanced"])
app.include_router(download.router, prefix="/api/v1", tags=["download"])
app.include_router(upload.router, prefix="/api/v1", tags=["upload"])
app.include_router(reference.router, prefix="/api/v1", tags=["reference"])

# Serve uploaded/processed files
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/files", StaticFiles(directory=settings.UPLOAD_DIR), name="files")


@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    print("🚀 AI Mastering API starting up...")
    
    # Create necessary directories
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.PROCESSED_DIR, exist_ok=True)
    
    print(f"📁 Upload directory: {settings.UPLOAD_DIR}")
    print(f"📁 Processed directory: {settings.PROCESSED_DIR}")
    print("✅ API ready!")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    print("👋 AI Mastering API shutting down...")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Mastering API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Auto-reload on code changes
    )

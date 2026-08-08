
import sys

print(f"Python executable: {sys.executable}")

try:
    import fastapi
    print("fastapi imported")
    import uvicorn
    print("uvicorn imported")
    import pydantic
    print("pydantic imported")
    import pydantic_settings
    print("pydantic_settings imported")
    import dotenv
    print("dotenv imported")
    import pedalboard
    print("pedalboard imported")
    import pyloudnorm
    print("pyloudnorm imported")
    import librosa
    print("librosa imported")
    import soundfile
    print("soundfile imported")
    import numpy
    print("numpy imported")
    import redis
    print("redis imported")
    import celery
    print("celery imported")
    import multipart
    print("python-multipart imported")
    
    from app.main import app
    print("app.main imported successfully")

except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Error: {e}")

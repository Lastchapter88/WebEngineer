import uvicorn
import sys

if __name__ == "__main__":
    try:
        print("Starting uvicorn...")
        # reload=True requires the string format "app.main:app"
        uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
        print("Uvicorn returned.")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

# Reference Track Genre Categorization - Implementation Complete

## Feature Overview

Admin can now categorize reference tracks by genre to help ML learn genre-specific characteristics.

## Backend Changes

### 1. Updated Reference Upload Endpoint
- File: backend/app/api/reference.py
- Added genre parameter to upload
- Stores metadata in JSON files
- Supports: pop, hiphop, trap, rnb, soul, jazz, classical, amapiano, uncategorized

### 2. New Update Genre Endpoint
- PUT /api/v1/reference/{file_id}/genre
- Allows updating genre for existing tracks
- Creates metadata file if doesn't exist

### 3. Enhanced List Endpoint
- GET /api/v1/references
- Now returns genre for each track
- Loads from metadata JSON files

### 4. Metadata Storage
- Each reference track has a .json metadata file
- Stores: file_id, filename, genre, path
- Example: abc123.wav has abc123.json

## How It Works

### Upload with Genre
```bash
POST /api/v1/upload/reference
Content-Type: multipart/form-data

file: audio.wav
genre: pop
```

### Update Genre Later
```bash
PUT /api/v1/reference/abc123/genre
Content-Type: application/x-www-form-urlencoded

genre=hiphop
```

### List with Genres
```bash
GET /api/v1/references

Response:
{
  "references": [
    {
      "file_id": "abc123",
      "filename": "reference_track.wav",
      "genre": "pop",
      "size": 12345678,
      "created": 1234567890
    }
  ]
}
```

## Admin Panel Integration

The admin panel should display:
- List of all reference tracks
- Genre dropdown for each track
- Ability to change genre
- Visual grouping by genre

## ML Learning Benefits

1. Genre-Specific Training
   - ML can learn pop characteristics from pop references
   - Hip-hop references teach hip-hop style
   - Better genre-specific mastering

2. Organized Dataset
   - Easy to see which genres need more references
   - Balance training data across genres
   - Quality control per genre

3. Future Enhancements
   - Train separate models per genre
   - Genre-specific presets based on references
   - Automatic genre detection

## File Structure

```
uploads/
└── references/
    ├── abc123.wav          (audio file)
    ├── abc123.json         (metadata: genre, filename)
    ├── def456.mp3
    ├── def456.json
    └── ...
```

## Status

Backend: COMPLETE
Endpoints: COMPLETE
Metadata Storage: COMPLETE
Admin UI: NEEDS IMPLEMENTATION

## Next Steps

1. Update admin panel to show genre dropdown
2. Add genre filter/grouping
3. Show statistics (tracks per genre)
4. Add bulk genre update

## Testing

1. Upload reference with genre:
```bash
curl -X POST http://localhost:8000/api/v1/upload/reference \
  -F "file=@track.wav" \
  -F "genre=pop"
```

2. Update genre:
```bash
curl -X PUT http://localhost:8000/api/v1/reference/abc123/genre \
  -d "genre=hiphop"
```

3. List all:
```bash
curl http://localhost:8000/api/v1/references
```

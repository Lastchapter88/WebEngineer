#!/usr/bin/env python3
"""
Download free mastered music datasets for AIMSTR ML training
"""

import os
import requests
from tqdm import tqdm
import zipfile
import json
from pathlib import Path

# Configuration
OUTPUT_DIR = Path("ml_training_data")
OUTPUT_DIR.mkdir(exist_ok=True)


def download_file(url, filename, desc="Downloading"):
    """Download file with progress bar"""
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(filename, 'wb') as f:
        with tqdm(total=total_size, unit='B', unit_scale=True, desc=desc) as pbar:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    pbar.update(len(chunk))


def download_fma_small():
    """Download FMA Small dataset (8,000 tracks, 7.2 GB)"""
    print("\n=== Downloading FMA Small ===")
    print("Size: 7.2 GB")
    print("Tracks: 8,000 (30 sec each)")
    print("This will take 10-30 minutes depending on your connection\n")
    
    fma_dir = OUTPUT_DIR / "fma_small"
    fma_dir.mkdir(exist_ok=True)
    
    # Download dataset
    zip_file = fma_dir / "fma_small.zip"
    if not zip_file.exists():
        url = "https://os.unil.cloud.switch.ch/fma/fma_small.zip"
        download_file(url, zip_file, "FMA Small")
    else:
        print("FMA Small already downloaded, skipping...")
    
    # Extract
    if not (fma_dir / "fma_small").exists():
        print("\nExtracting...")
        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            zip_ref.extractall(fma_dir)
        print("Extraction complete!")
    
    # Download metadata
    metadata_zip = fma_dir / "fma_metadata.zip"
    if not metadata_zip.exists():
        print("\nDownloading metadata...")
        url = "https://os.unil.cloud.switch.ch/fma/fma_metadata.zip"
        download_file(url, metadata_zip, "Metadata")
        
        print("Extracting metadata...")
        with zipfile.ZipFile(metadata_zip, 'r') as zip_ref:
            zip_ref.extractall(fma_dir)
    
    print(f"\n✅ FMA Small ready at: {fma_dir}")
    print(f"   Tracks: {fma_dir / 'fma_small'}")
    print(f"   Metadata: {fma_dir / 'fma_metadata'}")


def download_jamendo_by_genre(api_key, genre, limit=1000):
    """Download Jamendo tracks by genre"""
    print(f"\n=== Downloading {genre.upper()} from Jamendo ===")
    
    genre_dir = OUTPUT_DIR / "jamendo" / genre
    genre_dir.mkdir(parents=True, exist_ok=True)
    
    url = "https://api.jamendo.com/v3.0/tracks/"
    params = {
        "client_id": api_key,
        "format": "json",
        "limit": 200,
        "audioformat": "mp32",  # 320kbps MP3
        "tags": genre,
        "include": "musicinfo"
    }
    
    downloaded = 0
    offset = 0
    
    while downloaded < limit:
        params['offset'] = offset
        
        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            if 'results' not in data or not data['results']:
                print(f"No more tracks found for {genre}")
                break
            
            tracks = data['results']
            
            for track in tqdm(tracks, desc=f"{genre} tracks"):
                if downloaded >= limit:
                    break
                
                try:
                    track_id = track['id']
                    filename = genre_dir / f"{track_id}.mp3"
                    
                    # Skip if already downloaded
                    if filename.exists():
                        downloaded += 1
                        continue
                    
                    # Download audio
                    audio_url = track['audio']
                    audio_response = requests.get(audio_url, timeout=30)
                    audio_response.raise_for_status()
                    
                    with open(filename, 'wb') as f:
                        f.write(audio_response.content)
                    
                    # Save metadata
                    metadata = {
                        'id': track_id,
                        'name': track['name'],
                        'artist': track['artist_name'],
                        'genre': genre,
                        'duration': track['duration'],
                        'audio_url': audio_url
                    }
                    
                    with open(f"{filename}.json", 'w') as f:
                        json.dump(metadata, f, indent=2)
                    
                    downloaded += 1
                    
                except Exception as e:
                    print(f"\nError downloading track: {e}")
                    continue
            
            offset += 200
            
        except Exception as e:
            print(f"\nAPI Error: {e}")
            break
    
    print(f"\n✅ Downloaded {downloaded} {genre} tracks to: {genre_dir}")


def download_jamendo_all_genres(api_key):
    """Download tracks for all AIMSTR genres"""
    genres = {
        'pop': 5000,
        'hiphop': 3000,
        'trap': 2000,
        'rnb': 2000,
        'soul': 1000,
        'jazz': 1000,
        'classical': 1000
    }
    
    print("\n=== Jamendo Multi-Genre Download ===")
    print(f"Total tracks to download: {sum(genres.values())}")
    print("This will take several hours...\n")
    
    for genre, limit in genres.items():
        download_jamendo_by_genre(api_key, genre, limit)
    
    print("\n✅ All genres downloaded!")


def download_musdb18():
    """Download MUSDB18 dataset"""
    print("\n=== Downloading MUSDB18 ===")
    print("Size: ~4 GB")
    print("Tracks: 150 (with stems)")
    
    try:
        import musdb
        
        musdb_dir = OUTPUT_DIR / "musdb18"
        musdb_dir.mkdir(exist_ok=True)
        
        print("\nDownloading MUSDB18...")
        mus = musdb.DB(download=True, root=str(musdb_dir))
        
        print(f"\n✅ Downloaded {len(mus)} tracks to: {musdb_dir}")
        
    except ImportError:
        print("\n❌ musdb not installed")
        print("Install with: pip install musdb")


def show_stats():
    """Show downloaded dataset statistics"""
    print("\n=== Dataset Statistics ===\n")
    
    total_size = 0
    total_tracks = 0
    
    if (OUTPUT_DIR / "fma_small").exists():
        fma_tracks = len(list((OUTPUT_DIR / "fma_small" / "fma_small").rglob("*.mp3")))
        print(f"FMA Small: {fma_tracks} tracks")
        total_tracks += fma_tracks
    
    jamendo_dir = OUTPUT_DIR / "jamendo"
    if jamendo_dir.exists():
        for genre_dir in jamendo_dir.iterdir():
            if genre_dir.is_dir():
                tracks = len(list(genre_dir.glob("*.mp3")))
                print(f"Jamendo {genre_dir.name}: {tracks} tracks")
                total_tracks += tracks
    
    if (OUTPUT_DIR / "musdb18").exists():
        print(f"MUSDB18: 150 tracks (with stems)")
        total_tracks += 150
    
    print(f"\n📊 Total: {total_tracks} tracks")
    print(f"📁 Location: {OUTPUT_DIR.absolute()}")


def main():
    """Main menu"""
    print("=" * 60)
    print("  AIMSTR ML Training Data Downloader")
    print("=" * 60)
    print("\nOptions:")
    print("1. FMA Small (8,000 tracks, 7.2 GB) - RECOMMENDED START")
    print("2. Jamendo Single Genre (custom amount)")
    print("3. Jamendo All Genres (15,000 tracks, ~50 GB)")
    print("4. MUSDB18 (150 tracks, 4 GB)")
    print("5. Show Statistics")
    print("6. Download All (FMA + Jamendo + MUSDB18)")
    print("0. Exit")
    
    choice = input("\nChoose (0-6): ").strip()
    
    if choice == "1":
        download_fma_small()
        
    elif choice == "2":
        api_key = input("\nEnter Jamendo API key: ").strip()
        if not api_key:
            print("❌ API key required. Get one at: https://devportal.jamendo.com/")
            return
        
        genre = input("Enter genre (pop/hiphop/trap/rnb/soul/jazz/classical): ").strip().lower()
        limit = int(input("Number of tracks to download: ").strip())
        
        download_jamendo_by_genre(api_key, genre, limit)
        
    elif choice == "3":
        api_key = input("\nEnter Jamendo API key: ").strip()
        if not api_key:
            print("❌ API key required. Get one at: https://devportal.jamendo.com/")
            return
        
        confirm = input("\nThis will download ~15,000 tracks (~50 GB). Continue? (y/n): ")
        if confirm.lower() == 'y':
            download_jamendo_all_genres(api_key)
        
    elif choice == "4":
        download_musdb18()
        
    elif choice == "5":
        show_stats()
        
    elif choice == "6":
        print("\n⚠️  This will download:")
        print("   - FMA Small: 7.2 GB")
        print("   - Jamendo: ~50 GB")
        print("   - MUSDB18: 4 GB")
        print("   Total: ~60 GB")
        
        confirm = input("\nContinue? (y/n): ")
        if confirm.lower() == 'y':
            download_fma_small()
            
            api_key = input("\nEnter Jamendo API key: ").strip()
            if api_key:
                download_jamendo_all_genres(api_key)
            
            download_musdb18()
            
            show_stats()
        
    elif choice == "0":
        print("\nGoodbye!")
        return
    
    else:
        print("\n❌ Invalid choice")
        return
    
    # Show stats after download
    if choice in ["1", "2", "3", "4", "6"]:
        show_stats()
    
    print("\n✅ Done!")
    print("\nNext steps:")
    print("1. Run: python scripts/organize_references.py")
    print("2. Run: python scripts/extract_features.py")
    print("3. Start training your model!")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Download interrupted")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

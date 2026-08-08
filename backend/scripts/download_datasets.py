#!/usr/bin/env python3
"""
Automated Music Dataset Downloader for ML Training
Downloads free, legally-safe mastered music for training mastering AI
"""

import os
import sys
import requests
import zipfile
from tqdm import tqdm
import json
import argparse
from pathlib import Path

class MusicDatasetDownloader:
    def __init__(self, output_dir='ml_training_data'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    def download_file(self, url, filename, desc="Downloading"):
        """Download file with progress bar"""
        filepath = self.output_dir / filename
        
        if filepath.exists():
            print(f"✓ {filename} already exists, skipping...")
            return filepath
        
        print(f"📥 {desc}...")
        
        response = requests.get(url, stream=True)
        total_size = int(response.headers.get('content-length', 0))
        
        with open(filepath, 'wb') as f:
            with tqdm(total=total_size, unit='B', unit_scale=True, desc=filename) as pbar:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    pbar.update(len(chunk))
        
        return filepath
    
    def extract_zip(self, zip_path, extract_to=None):
        """Extract zip file"""
        if extract_to is None:
            extract_to = self.output_dir / zip_path.stem
        
        if extract_to.exists():
            print(f"✓ {extract_to.name} already extracted, skipping...")
            return extract_to
        
        print(f"📦 Extracting {zip_path.name}...")
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        
        return extract_to
    
    def download_fma_small(self):
        """Download FMA Small dataset (8,000 tracks, 7.2 GB)"""
        print("\n=== FREE MUSIC ARCHIVE - SMALL ===")
        print("8,000 tracks | 7.2 GB | 30-second clips")
        print("Perfect for: Initial training and testing\n")
        
        url = "https://os.unil.cloud.switch.ch/fma/fma_small.zip"
        zip_path = self.download_file(url, "fma_small.zip", "Downloading FMA Small")
        
        extract_path = self.extract_zip(zip_path)
        
        # Download metadata
        metadata_url = "https://os.unil.cloud.switch.ch/fma/fma_metadata.zip"
        metadata_zip = self.download_file(metadata_url, "fma_metadata.zip", "Downloading metadata")
        self.extract_zip(metadata_zip)
        
        print(f"✅ FMA Small ready at: {extract_path}")
        print(f"📊 Metadata at: {self.output_dir / 'fma_metadata'}")
        
        return extract_path
    
    def download_fma_medium(self):
        """Download FMA Medium dataset (25,000 tracks, 22 GB)"""
        print("\n=== FREE MUSIC ARCHIVE - MEDIUM ===")
        print("25,000 tracks | 22 GB | 30-second clips")
        print("Perfect for: Production training\n")
        
        url = "https://os.unil.cloud.switch.ch/fma/fma_medium.zip"
        zip_path = self.download_file(url, "fma_medium.zip", "Downloading FMA Medium")
        
        extract_path = self.extract_zip(zip_path)
        
        print(f"✅ FMA Medium ready at: {extract_path}")
        
        return extract_path
    
    def download_jamendo(self, api_key, num_tracks=1000, genre=None):
        """Download tracks from Jamendo API"""
        print("\n=== JAMENDO ===")
        print(f"Downloading {num_tracks} tracks...")
        
        if not api_key:
            print("❌ Need API key! Get one at: https://devportal.jamendo.com/")
            print("Then run: python download_datasets.py --jamendo --api-key YOUR_KEY")
            return None
        
        jamendo_dir = self.output_dir / 'jamendo'
        if genre:
            jamendo_dir = jamendo_dir / genre
        jamendo_dir.mkdir(parents=True, exist_ok=True)
        
        url = "https://api.jamendo.com/v3.0/tracks/"
        
        downloaded = 0
        offset = 0
        metadata = []
        
        while downloaded < num_tracks:
            params = {
                "client_id": api_key,
                "format": "json",
                "limit": 200,
                "offset": offset,
                "audioformat": "mp32"  # 320kbps MP3
            }
            
            if genre:
                params['tags'] = genre
            
            try:
                response = requests.get(url, params=params, timeout=30)
                response.raise_for_status()
                tracks = response.json()['results']
                
                if not tracks:
                    break
                
                for track in tracks:
                    if downloaded >= num_tracks:
                        break
                    
                    track_id = track['id']
                    track_name = track['name']
                    audio_url = track['audio']
                    
                    filename = jamendo_dir / f"{track_id}.mp3"
                    
                    if filename.exists():
                        print(f"✓ {track_name} already exists")
                        downloaded += 1
                        continue
                    
                    print(f"📥 [{downloaded+1}/{num_tracks}] {track_name}")
                    
                    audio_response = requests.get(audio_url, timeout=30)
                    with open(filename, 'wb') as f:
                        f.write(audio_response.content)
                    
                    # Save metadata
                    metadata.append({
                        'id': track_id,
                        'name': track_name,
                        'artist': track['artist_name'],
                        'album': track.get('album_name', ''),
                        'genre': track.get('musicinfo', {}).get('tags', {}).get('genres', []),
                        'file': str(filename)
                    })
                    
                    downloaded += 1
                
                offset += 200
                
            except Exception as e:
                print(f"❌ Error: {e}")
                break
        
        # Save metadata
        metadata_file = jamendo_dir / 'metadata.json'
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"✅ Downloaded {downloaded} tracks to {jamendo_dir}")
        print(f"📊 Metadata saved to {metadata_file}")
        
        return jamendo_dir
    
    def download_musdb18(self):
        """Download MUSDB18 (requires musdb package)"""
        print("\n=== MUSDB18 ===")
        print("150 full tracks | 4 GB | Includes stems")
        print("Perfect for: Understanding mastering process\n")
        
        try:
            import musdb
        except ImportError:
            print("❌ musdb not installed")
            print("Install with: pip install musdb")
            return None
        
        musdb_dir = self.output_dir / 'musdb18'
        
        print("📥 Downloading MUSDB18...")
        mus = musdb.DB(download=True, root=str(musdb_dir))
        
        print(f"✅ Downloaded {len(mus)} tracks to {musdb_dir}")
        
        return musdb_dir
    
    def generate_summary(self):
        """Generate summary of downloaded datasets"""
        print("\n" + "="*60)
        print("📊 DATASET SUMMARY")
        print("="*60)
        
        total_size = 0
        total_tracks = 0
        
        for subdir in self.output_dir.iterdir():
            if subdir.is_dir():
                # Count audio files
                audio_files = list(subdir.rglob('*.mp3')) + list(subdir.rglob('*.wav'))
                num_files = len(audio_files)
                
                # Calculate size
                size = sum(f.stat().st_size for f in audio_files) / (1024**3)  # GB
                
                if num_files > 0:
                    print(f"\n{subdir.name}:")
                    print(f"  Tracks: {num_files:,}")
                    print(f"  Size: {size:.2f} GB")
                    
                    total_tracks += num_files
                    total_size += size
        
        print(f"\n{'─'*60}")
        print(f"TOTAL:")
        print(f"  Tracks: {total_tracks:,}")
        print(f"  Size: {total_size:.2f} GB")
        print(f"  Location: {self.output_dir.absolute()}")
        print("="*60)


def main():
    parser = argparse.ArgumentParser(
        description='Download free music datasets for ML training',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Download FMA Small (recommended for testing)
  python download_datasets.py --fma-small

  # Download everything
  python download_datasets.py --all --api-key YOUR_JAMENDO_KEY

  # Download specific genre from Jamendo
  python download_datasets.py --jamendo --api-key YOUR_KEY --genre pop --num-tracks 5000

Get Jamendo API key: https://devportal.jamendo.com/
        """
    )
    
    parser.add_argument(
        '--output-dir',
        default='ml_training_data',
        help='Output directory (default: ml_training_data)'
    )
    
    parser.add_argument(
        '--fma-small',
        action='store_true',
        help='Download FMA Small (8k tracks, 7.2 GB)'
    )
    
    parser.add_argument(
        '--fma-medium',
        action='store_true',
        help='Download FMA Medium (25k tracks, 22 GB)'
    )
    
    parser.add_argument(
        '--jamendo',
        action='store_true',
        help='Download from Jamendo (requires API key)'
    )
    
    parser.add_argument(
        '--api-key',
        help='Jamendo API key'
    )
    
    parser.add_argument(
        '--num-tracks',
        type=int,
        default=1000,
        help='Number of Jamendo tracks (default: 1000)'
    )
    
    parser.add_argument(
        '--genre',
        help='Filter by genre (for Jamendo)'
    )
    
    parser.add_argument(
        '--musdb18',
        action='store_true',
        help='Download MUSDB18 (150 tracks, 4 GB)'
    )
    
    parser.add_argument(
        '--all',
        action='store_true',
        help='Download all recommended datasets'
    )
    
    args = parser.parse_args()
    
    print("🎵 MUSIC DATASET DOWNLOADER FOR AIMSTR")
    print("="*60)
    
    downloader = MusicDatasetDownloader(args.output_dir)
    
    if args.all:
        print("\n📦 Downloading ALL recommended datasets...")
        downloader.download_fma_small()
        downloader.download_musdb18()
        if args.api_key:
            downloader.download_jamendo(args.api_key, args.num_tracks, args.genre)
        else:
            print("\n⚠️  Skipping Jamendo (no API key provided)")
            print("Get API key: https://devportal.jamendo.com/")
    else:
        if args.fma_small:
            downloader.download_fma_small()
        
        if args.fma_medium:
            downloader.download_fma_medium()
        
        if args.jamendo:
            downloader.download_jamendo(args.api_key, args.num_tracks, args.genre)
        
        if args.musdb18:
            downloader.download_musdb18()
    
    if not any([args.all, args.fma_small, args.fma_medium, args.jamendo, args.musdb18]):
        print("\n❌ No dataset selected!")
        print("\nQuick start options:")
        print("  1. Test/prototype:  python download_datasets.py --fma-small")
        print("  2. Production:      python download_datasets.py --fma-medium")
        print("  3. Everything:      python download_datasets.py --all --api-key YOUR_KEY")
        print("\nFor help: python download_datasets.py --help")
        sys.exit(1)
    
    # Generate summary
    downloader.generate_summary()
    
    print("\n✅ DONE!")
    print("\nNext steps:")
    print("  1. Organize by genre: python scripts/organize_references.py")
    print("  2. Extract features: python scripts/extract_features.py")
    print("  3. Train model: python scripts/train_model.py")
    print("  4. Dominate market! 🚀")


if __name__ == "__main__":
    main()

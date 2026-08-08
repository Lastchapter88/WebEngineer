"""
Audio Processing Engine
Handles audio file processing and mastering with style-based presets
"""

import soundfile as sf
import numpy as np
import pyloudnorm as pyln
from pathlib import Path
from typing import Tuple, Optional

from app.mastering.presets import MasteringPresets


class AudioProcessor:
    """Main audio processing class"""
    
    def __init__(self, sample_rate: int = 44100):
        self.sample_rate = sample_rate
        self.meter = pyln.Meter(sample_rate)
    
    def load_audio(self, file_path: str) -> Tuple[np.ndarray, int]:
        """Load audio file and return audio data + sample rate"""
        audio, sr = sf.read(file_path, always_2d=True)
        
        # Resample if needed
        if sr != self.sample_rate:
            import librosa
            audio = librosa.resample(
                audio.T, 
                orig_sr=sr, 
                target_sr=self.sample_rate
            ).T
            sr = self.sample_rate
        
        return audio, sr
    
    def save_audio(self, audio: np.ndarray, file_path: str, sample_rate: int = None):
        """Save audio to file"""
        if sample_rate is None:
            sample_rate = self.sample_rate
        
        sf.write(file_path, audio, sample_rate, subtype='PCM_24')
    
    def measure_lufs(self, audio: np.ndarray) -> float:
        """Measure integrated LUFS loudness"""
        try:
            loudness = self.meter.integrated_loudness(audio)
            return loudness
        except Exception as e:
            print(f"Error measuring LUFS: {e}")
            return -23.0  # Default fallback
    
    def extract_preview_segment(
        self, 
        audio: np.ndarray, 
        sample_rate: int,
        duration_seconds: float = 60.0
    ) -> np.ndarray:
        """
        Extract a preview segment from the loudest part of the audio
        
        Args:
            audio: Audio data (samples, channels)
            sample_rate: Sample rate
            duration_seconds: Duration of preview in seconds (default 60s)
            
        Returns:
            Preview segment
        """
        total_samples = len(audio)
        segment_samples = int(duration_seconds * sample_rate)
        
        # If audio is shorter than preview duration, return full audio
        if total_samples <= segment_samples:
            return audio
        
        # Calculate RMS energy in overlapping windows
        window_size = int(2.0 * sample_rate)  # 2-second windows
        hop_size = int(0.5 * sample_rate)  # 0.5-second hops
        
        max_energy = 0
        loudest_position = 0
        
        for i in range(0, total_samples - window_size, hop_size):
            window = audio[i:i + window_size]
            energy = np.sqrt(np.mean(window ** 2))
            
            if energy > max_energy:
                max_energy = energy
                loudest_position = i
        
        # Center the preview around the loudest part
        start = max(0, loudest_position - segment_samples // 2)
        end = min(total_samples, start + segment_samples)
        
        # Adjust start if we hit the end
        if end == total_samples:
            start = max(0, end - segment_samples)
        
        print(f"Extracting preview: {start/sample_rate:.1f}s to {end/sample_rate:.1f}s (loudest at {loudest_position/sample_rate:.1f}s)")
        
        return audio[start:end]
    
    def normalize_to_lufs(
        self, 
        audio: np.ndarray, 
        target_lufs: float = -14.0
    ) -> np.ndarray:
        """Normalize audio to target LUFS"""
        current_lufs = self.measure_lufs(audio)
        
        # Calculate gain needed
        gain_db = target_lufs - current_lufs
        
        # Convert dB to linear gain
        gain_linear = 10 ** (gain_db / 20.0)
        
        # Apply gain
        normalized = audio * gain_linear
        
        # Prevent clipping
        max_val = np.abs(normalized).max()
        if max_val > 0.99:
            normalized = normalized * (0.99 / max_val)
        
        return normalized
    
    def process_with_style(
        self,
        input_path: str,
        output_path: str,
        genre: str = 'pop',
        style: str = 'balanced',
        intensity: str = 'medium',
        preview_only: bool = False,
        preview_duration: float = 60.0
    ) -> dict:
        """
        Process audio file with a style and intensity
        
        Args:
            input_path: Path to input audio file
            output_path: Path to save processed audio
            style: Style preset (warm, balanced, open)
            intensity: Processing intensity (low, medium, high)
            preview_only: If True, only process a 60-second preview from loudest part
            preview_duration: Duration of preview in seconds (default 60)
            
        Returns:
            dict with processing info
        """
        
        # Load audio
        print(f"Loading audio from {input_path}")
        audio, sr = self.load_audio(input_path)
        
        # Extract preview segment if requested
        if preview_only:
            print(f"Extracting {preview_duration}s preview from loudest part")
            audio = self.extract_preview_segment(audio, sr, preview_duration)
        
        # Measure original loudness
        original_lufs = self.measure_lufs(audio)
        print(f"Original LUFS: {original_lufs:.2f}")
        
        # Get preset
        print(f"Applying genre: {genre}, style: {style}, intensity: {intensity}")
        preset_board = MasteringPresets.get_preset(genre, style, intensity, sr)
        
        # Process audio
        # Pedalboard expects audio in shape (channels, samples)
        audio_transposed = audio.T
        processed = preset_board(audio_transposed, sr)
        
        # Transpose back to (samples, channels)
        processed = processed.T
        
        # Normalize to target LUFS
        target_lufs = MasteringPresets.get_target_lufs(genre, intensity)
        print(f"Normalizing to {target_lufs} LUFS")
        processed = self.normalize_to_lufs(processed, target_lufs)
        
        # Measure final loudness
        final_lufs = self.measure_lufs(processed)
        print(f"Final LUFS: {final_lufs:.2f}")
        
        # Save
        print(f"Saving to {output_path}")
        self.save_audio(processed, output_path, sr)
        
        return {
            'success': True,
            'original_lufs': float(original_lufs),
            'final_lufs': float(final_lufs),
            'style_used': style,
            'intensity_used': intensity,
            'target_lufs': float(target_lufs),
            'output_file': output_path
        }
    
    def process_with_preset(
        self,
        input_path: str,
        output_path: str,
        preset_name: str = 'streaming'
    ) -> dict:
        """
        Legacy method - process audio file with old preset system
        Maps old presets to new style system
        
        Args:
            input_path: Path to input audio file
            output_path: Path to save processed audio
            preset_name: Name of legacy preset to use
            
        Returns:
            dict with processing info
        """
        
        # Map old presets to new style system
        preset_mapping = {
            'pop': ('balanced', 'high'),
            'hiphop': ('warm', 'high'),
            'rock': ('warm', 'medium'),
            'edm': ('open', 'high'),
            'jazz': ('balanced', 'low'),
            'podcast': ('balanced', 'medium'),
            'lofi': ('warm', 'medium'),
            'streaming': ('balanced', 'medium'),
        }
        
        style, intensity = preset_mapping.get(preset_name.lower(), ('balanced', 'medium'))
        return self.process_with_style(input_path, output_path, style, intensity)
    
    def create_volume_matched_version(
        self,
        original_path: str,
        mastered_path: str,
        output_path: str
    ) -> dict:
        """
        Create a volume-matched version of the original for fair A/B comparison
        
        Matches the loudness of the original to the mastered version so you can
        compare the actual processing, not just the loudness increase.
        
        Args:
            original_path: Path to original audio
            mastered_path: Path to mastered audio
            output_path: Path to save volume-matched original
            
        Returns:
            dict with matching info
        """
        
        print(f"Creating volume-matched version")
        
        # Load both files
        original_audio, sr = self.load_audio(original_path)
        mastered_audio, _ = self.load_audio(mastered_path)
        
        # Measure loudness of both
        original_lufs = self.measure_lufs(original_audio)
        mastered_lufs = self.measure_lufs(mastered_audio)
        
        print(f"Original LUFS: {original_lufs:.2f}")
        print(f"Mastered LUFS: {mastered_lufs:.2f}")
        
        # Match original to mastered loudness
        matched_original = self.normalize_to_lufs(original_audio, mastered_lufs)
        
        # Measure final loudness
        final_lufs = self.measure_lufs(matched_original)
        print(f"Matched LUFS: {final_lufs:.2f}")
        
        # Save
        self.save_audio(matched_original, output_path, sr)
        
        return {
            'success': True,
            'original_lufs': float(original_lufs),
            'mastered_lufs': float(mastered_lufs),
            'matched_lufs': float(final_lufs),
            'output_file': output_path
        }
    
    def analyze_audio(self, file_path: str) -> dict:
        """Analyze audio file and return metrics"""
        audio, sr = self.load_audio(file_path)
        
        # Calculate metrics
        lufs = self.measure_lufs(audio)
        peak = np.abs(audio).max()
        rms = np.sqrt(np.mean(audio ** 2))
        crest_factor = peak / rms if rms > 0 else 0
        
        # Dynamic range (simplified)
        dynamic_range = 20 * np.log10(peak / rms) if rms > 0 else 0
        
        return {
            'lufs': float(lufs),
            'peak': float(peak),
            'rms': float(rms),
            'crest_factor': float(crest_factor),
            'dynamic_range_db': float(dynamic_range),
            'sample_rate': sr,
            'duration': len(audio) / sr,
            'channels': audio.shape[1] if len(audio.shape) > 1 else 1
        }
    
    def apply_mastering_chain(self, audio: np.ndarray, params: dict) -> np.ndarray:
        """
        Apply mastering processing using predicted parameters
        Used by intelligent processor
        
        Args:
            audio: Input audio array
            params: Dictionary of processing parameters
            
        Returns:
            Processed audio array
        """
        # This is called by the intelligent processor
        # For now, we'll apply a simple preset-based approach
        # In the future, this could use the ML-predicted parameters
        
        style = params.get('style', 'balanced')
        intensity = params.get('intensity', 'medium')
        
        preset_board = MasteringPresets.get_preset(style, intensity, self.sample_rate)
        
        # Process audio
        audio_transposed = audio.T
        processed = preset_board(audio_transposed, self.sample_rate)
        processed = processed.T
        
        return processed

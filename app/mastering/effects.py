"""
Advanced Mastering Effects
Professional-grade processors to compete with iZotope
"""

import numpy as np
from scipy import signal
from typing import Tuple


class MultibandCompressor:
    """
    Multiband compression - compresses different frequency bands separately
    Critical for professional mastering
    """
    
    def __init__(
        self,
        sample_rate: int = 44100,
        bands: list = None
    ):
        self.sr = sample_rate
        
        # Default 4-band configuration
        if bands is None:
            self.bands = [
                {'name': 'low', 'freq': (20, 120), 'threshold': -20, 'ratio': 3.0, 'attack': 50, 'release': 150},
                {'name': 'low_mid', 'freq': (120, 1000), 'threshold': -18, 'ratio': 2.5, 'attack': 30, 'release': 100},
                {'name': 'high_mid', 'freq': (1000, 6000), 'threshold': -16, 'ratio': 2.0, 'attack': 20, 'release': 80},
                {'name': 'high', 'freq': (6000, 20000), 'threshold': -18, 'ratio': 2.5, 'attack': 15, 'release': 60}
            ]
        else:
            self.bands = bands
    
    def _split_bands(self, audio: np.ndarray) -> list:
        """Split audio into frequency bands"""
        bands_audio = []
        
        for band_config in self.bands:
            low_freq, high_freq = band_config['freq']
            
            # Create bandpass filter
            sos = signal.butter(
                4,  # 4th order
                [low_freq, high_freq],
                btype='band',
                fs=self.sr,
                output='sos'
            )
            
            # Apply filter to each channel
            if len(audio.shape) > 1:
                filtered = np.zeros_like(audio)
                for ch in range(audio.shape[1]):
                    filtered[:, ch] = signal.sosfilt(sos, audio[:, ch])
            else:
                filtered = signal.sosfilt(sos, audio)
            
            bands_audio.append(filtered)
        
        return bands_audio
    
    def _compress_band(
        self,
        audio: np.ndarray,
        threshold_db: float,
        ratio: float,
        attack_ms: float,
        release_ms: float
    ) -> np.ndarray:
        """
        Compress a single band
        Simple but effective compression algorithm
        """
        # Convert to samples
        attack_samples = int((attack_ms / 1000) * self.sr)
        release_samples = int((release_ms / 1000) * self.sr)
        
        # Convert threshold to linear
        threshold = 10 ** (threshold_db / 20)
        
        # Process each channel
        if len(audio.shape) > 1:
            compressed = np.zeros_like(audio)
            for ch in range(audio.shape[1]):
                compressed[:, ch] = self._compress_channel(
                    audio[:, ch],
                    threshold,
                    ratio,
                    attack_samples,
                    release_samples
                )
        else:
            compressed = self._compress_channel(
                audio,
                threshold,
                ratio,
                attack_samples,
                release_samples
            )
        
        return compressed
    
    def _compress_channel(
        self,
        audio: np.ndarray,
        threshold: float,
        ratio: float,
        attack_samples: int,
        release_samples: int
    ) -> np.ndarray:
        """Compress a single channel"""
        envelope = np.abs(audio)
        gain = np.ones_like(audio)
        
        # Simple envelope follower
        for i in range(1, len(audio)):
            if envelope[i] > envelope[i-1]:
                # Attack
                envelope[i] = envelope[i-1] + (envelope[i] - envelope[i-1]) / attack_samples
            else:
                # Release
                envelope[i] = envelope[i-1] + (envelope[i] - envelope[i-1]) / release_samples
        
        # Calculate gain reduction
        for i in range(len(audio)):
            if envelope[i] > threshold:
                # Amount over threshold
                over = envelope[i] / threshold
                # Apply ratio
                gain[i] = 1.0 / (1.0 + (over - 1.0) * (ratio - 1.0) / ratio)
        
        return audio * gain
    
    def process(self, audio: np.ndarray) -> np.ndarray:
        """
        Process audio with multiband compression
        """
        # Split into bands
        bands_audio = self._split_bands(audio)
        
        # Compress each band
        compressed_bands = []
        for band_audio, band_config in zip(bands_audio, self.bands):
            compressed = self._compress_band(
                band_audio,
                band_config['threshold'],
                band_config['ratio'],
                band_config['attack'],
                band_config['release']
            )
            compressed_bands.append(compressed)
        
        # Sum bands back together
        output = np.sum(compressed_bands, axis=0)
        
        # Normalize to prevent clipping
        peak = np.max(np.abs(output))
        if peak > 0.99:
            output = output * (0.99 / peak)
        
        return output


class StereoImager:
    """
    Advanced stereo imaging with mid-side processing
    """
    
    def __init__(self, sample_rate: int = 44100):
        self.sr = sample_rate
    
    def encode_mid_side(self, audio: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Encode stereo to mid-side
        Mid = (L + R) / 2
        Side = (L - R) / 2
        """
        if audio.shape[1] < 2:
            raise ValueError("Stereo audio required")
        
        left = audio[:, 0]
        right = audio[:, 1]
        
        mid = (left + right) / 2
        side = (left - right) / 2
        
        return mid, side
    
    def decode_mid_side(self, mid: np.ndarray, side: np.ndarray) -> np.ndarray:
        """
        Decode mid-side back to stereo
        L = Mid + Side
        R = Mid - Side
        """
        left = mid + side
        right = mid - side
        
        return np.column_stack([left, right])
    
    def process(
        self,
        audio: np.ndarray,
        width: float = 1.0,
        mono_bass_hz: float = 120
    ) -> np.ndarray:
        """
        Process stereo image
        
        Args:
            audio: Stereo audio
            width: Stereo width multiplier (0.5 = narrow, 1.0 = normal, 1.5 = wide)
            mono_bass_hz: Frequency below which to keep mono
        """
        if audio.shape[1] < 2:
            return audio
        
        # Encode to mid-side
        mid, side = self.encode_mid_side(audio)
        
        # Apply width to side channel
        side_processed = side * width
        
        # Mono bass: filter out low frequencies from side
        if mono_bass_hz > 0:
            # High-pass filter for side channel
            sos = signal.butter(
                4,
                mono_bass_hz,
                btype='high',
                fs=self.sr,
                output='sos'
            )
            side_processed = signal.sosfilt(sos, side_processed)
        
        # Decode back to stereo
        stereo = self.decode_mid_side(mid, side_processed)
        
        # Normalize if needed
        peak = np.max(np.abs(stereo))
        if peak > 0.99:
            stereo = stereo * (0.99 / peak)
        
        return stereo


class DeEsser:
    """
    De-esser to reduce harsh sibilance
    """
    
    def __init__(self, sample_rate: int = 44100):
        self.sr = sample_rate
    
    def process(
        self,
        audio: np.ndarray,
        frequency: float = 7000,
        threshold_db: float = -20,
        ratio: float = 4.0
    ) -> np.ndarray:
        """
        Reduce sibilance in specified frequency range
        
        Args:
            audio: Input audio
            frequency: Center frequency of sibilance (usually 6-8kHz)
            threshold_db: Threshold for reduction
            ratio: Compression ratio for sibilant frequencies
        """
        # Extract high frequencies where sibilance lives
        sos_high = signal.butter(
            4,
            frequency,
            btype='high',
            fs=self.sr,
            output='sos'
        )
        
        # Process each channel
        if len(audio.shape) > 1:
            output = np.zeros_like(audio)
            for ch in range(audio.shape[1]):
                output[:, ch] = self._deess_channel(
                    audio[:, ch],
                    sos_high,
                    threshold_db,
                    ratio
                )
        else:
            output = self._deess_channel(audio, sos_high, threshold_db, ratio)
        
        return output
    
    def _deess_channel(
        self,
        audio: np.ndarray,
        sos_high,
        threshold_db: float,
        ratio: float
    ) -> np.ndarray:
        """De-ess a single channel"""
        # Extract high frequencies
        highs = signal.sosfilt(sos_high, audio)
        
        # Detect sibilance
        threshold = 10 ** (threshold_db / 20)
        envelope = np.abs(highs)
        
        # Simple envelope follower
        smoothed_env = signal.lfilter([0.1], [1, -0.9], envelope)
        
        # Calculate gain reduction
        gain = np.ones_like(audio)
        mask = smoothed_env > threshold
        
        if np.any(mask):
            over = smoothed_env[mask] / threshold
            gain[mask] = 1.0 / (1.0 + (over - 1.0) * (ratio - 1.0) / ratio)
        
        # Apply gain to high frequencies only
        highs_reduced = highs * gain
        
        # Subtract original highs and add reduced highs
        output = audio - highs + highs_reduced
        
        return output


class TransientShaper:
    """
    Transient shaper - control attack and sustain
    """
    
    def __init__(self, sample_rate: int = 44100):
        self.sr = sample_rate
    
    def process(
        self,
        audio: np.ndarray,
        attack_gain: float = 1.0,
        sustain_gain: float = 1.0,
        attack_time_ms: float = 10
    ) -> np.ndarray:
        """
        Shape transients
        
        Args:
            audio: Input audio
            attack_gain: Multiplier for attack (>1 = more punch)
            sustain_gain: Multiplier for sustain (>1 = more body)
            attack_time_ms: Attack window in milliseconds
        """
        attack_samples = int((attack_time_ms / 1000) * self.sr)
        
        if len(audio.shape) > 1:
            output = np.zeros_like(audio)
            for ch in range(audio.shape[1]):
                output[:, ch] = self._shape_channel(
                    audio[:, ch],
                    attack_gain,
                    sustain_gain,
                    attack_samples
                )
        else:
            output = self._shape_channel(
                audio,
                attack_gain,
                sustain_gain,
                attack_samples
            )
        
        return output
    
    def _shape_channel(
        self,
        audio: np.ndarray,
        attack_gain: float,
        sustain_gain: float,
        attack_samples: int
    ) -> np.ndarray:
        """Shape transients in a single channel"""
        # Calculate envelope
        envelope = np.abs(audio)
        
        # Fast envelope (attack)
        fast_env = signal.lfilter([0.3], [1, -0.7], envelope)
        
        # Slow envelope (sustain)
        slow_env = signal.lfilter([0.01], [1, -0.99], envelope)
        
        # Transient = fast - slow
        transient = fast_env - slow_env
        transient = np.maximum(transient, 0)  # Only positive
        
        # Sustain = slow envelope
        sustain = slow_env
        
        # Apply gains
        output = audio.copy()
        
        # Enhance attack
        if attack_gain != 1.0:
            attack_mask = transient > 0
            output[attack_mask] *= (1.0 + (attack_gain - 1.0) * (transient[attack_mask] / (envelope[attack_mask] + 1e-10)))
        
        # Enhance sustain
        if sustain_gain != 1.0:
            sustain_mask = sustain > 0
            output[sustain_mask] *= (1.0 + (sustain_gain - 1.0) * (sustain[sustain_mask] / (envelope[sustain_mask] + 1e-10)))
        
        # Prevent clipping
        peak = np.max(np.abs(output))
        if peak > 0.99:
            output = output * (0.99 / peak)
        
        return output


class LinearPhaseEQ:
    """
    Linear phase EQ using FFT
    Preserves phase relationships - critical for mastering
    """
    
    def __init__(self, sample_rate: int = 44100):
        self.sr = sample_rate
    
    def process(
        self,
        audio: np.ndarray,
        bands: list
    ) -> np.ndarray:
        """
        Apply linear phase EQ
        
        Args:
            audio: Input audio
            bands: List of (frequency_hz, gain_db, q) tuples
        """
        if len(audio.shape) > 1:
            output = np.zeros_like(audio)
            for ch in range(audio.shape[1]):
                output[:, ch] = self._eq_channel(audio[:, ch], bands)
        else:
            output = self._eq_channel(audio, bands)
        
        return output
    
    def _eq_channel(self, audio: np.ndarray, bands: list) -> np.ndarray:
        """Apply EQ to a single channel using FFT"""
        # FFT
        fft_data = np.fft.rfft(audio)
        freqs = np.fft.rfftfreq(len(audio), 1/self.sr)
        
        # Build filter curve
        filter_curve = np.ones(len(freqs))
        
        for freq_hz, gain_db, q in bands:
            # Calculate bandwidth
            bandwidth = freq_hz / q
            
            # Create bell curve
            for i, f in enumerate(freqs):
                if f > 0:
                    # Distance from center frequency
                    octaves = np.log2(f / freq_hz) if f != freq_hz else 0
                    
                    # Gaussian-like curve
                    curve_factor = np.exp(-(octaves * q) ** 2)
                    
                    # Apply gain
                    gain_linear = 10 ** (gain_db / 20)
                    filter_curve[i] *= 1.0 + (gain_linear - 1.0) * curve_factor
        
        # Apply filter
        fft_filtered = fft_data * filter_curve
        
        # IFFT
        output = np.fft.irfft(fft_filtered, len(audio))
        
        return output

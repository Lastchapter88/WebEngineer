"""
Feature Extractor
Extracts audio features for ML training
"""

import numpy as np
import librosa
from typing import Dict, Tuple
from scipy import signal
from scipy.stats import kurtosis, skewness


class FeatureExtractor:
    """
    Extract comprehensive audio features for ML training
    """
    
    def __init__(self, sample_rate: int = 44100):
        self.sample_rate = sample_rate
        
        # Frequency bands (Hz)
        self.bands = {
            'sub': (20, 60),
            'bass': (60, 250),
            'low_mid': (250, 500),
            'mid': (500, 2000),
            'high_mid': (2000, 4000),
            'presence': (4000, 6000),
            'brilliance': (6000, 12000),
            'air': (12000, 20000)
        }
    
    def extract_all_features(
        self,
        audio: np.ndarray,
        analyze_full: bool = True
    ) -> Dict:
        """
        Extract all features from audio
        
        Args:
            audio: Audio signal (mono or stereo)
            analyze_full: If False, only analyze loudest 30s
            
        Returns:
            Dictionary of features
        """
        
        # Convert to mono if stereo
        if len(audio.shape) > 1:
            audio_mono = np.mean(audio, axis=0)
            is_stereo = True
        else:
            audio_mono = audio
            is_stereo = False
        
        # Select analysis section
        if not analyze_full:
            audio_mono = self._get_loudest_section(audio_mono, duration_seconds=30)
        
        # Extract features
        features = {
            'loudness': self._extract_loudness_features(audio_mono),
            'frequency': self._extract_frequency_features(audio_mono),
            'transients': self._extract_transient_features(audio_mono),
            'temporal': self._extract_temporal_features(audio_mono),
            'spectral': self._extract_spectral_features(audio_mono)
        }
        
        # Add stereo features if applicable
        if is_stereo:
            features['stereo'] = self._extract_stereo_features(audio)
        
        return features
    
    def _get_loudest_section(self, audio: np.ndarray, duration_seconds: int = 30) -> np.ndarray:
        """Extract loudest section of audio"""
        
        window_samples = int(duration_seconds * self.sample_rate)
        
        if len(audio) <= window_samples:
            return audio
        
        # Calculate RMS in sliding windows
        hop_length = self.sample_rate  # 1 second hops
        rms = librosa.feature.rms(
            y=audio,
            frame_length=2048,
            hop_length=hop_length
        )[0]
        
        # Find loudest window
        window_frames = duration_seconds
        best_rms = 0
        best_idx = 0
        
        for i in range(len(rms) - window_frames):
            window_rms = np.mean(rms[i:i + window_frames])
            if window_rms > best_rms:
                best_rms = window_rms
                best_idx = i
        
        # Extract section
        start_sample = best_idx * hop_length
        end_sample = start_sample + window_samples
        
        return audio[start_sample:end_sample]
    
    def _extract_loudness_features(self, audio: np.ndarray) -> Dict:
        """Extract loudness-related features"""
        
        # LUFS (using simplified calculation)
        lufs = self._calculate_lufs(audio)
        
        # Peak and RMS
        peak_db = 20 * np.log10(np.max(np.abs(audio)) + 1e-10)
        rms = np.sqrt(np.mean(audio**2))
        rms_db = 20 * np.log10(rms + 1e-10)
        
        # Dynamic range
        percentile_99 = np.percentile(np.abs(audio), 99)
        percentile_10 = np.percentile(np.abs(audio), 10)
        dynamic_range = 20 * np.log10((percentile_99 / (percentile_10 + 1e-10)) + 1e-10)
        
        # Crest factor
        crest_factor = peak_db - rms_db
        
        return {
            'lufs': lufs,
            'peak_db': peak_db,
            'rms_db': rms_db,
            'dynamic_range': dynamic_range,
            'crest_factor': crest_factor
        }
    
    def _calculate_lufs(self, audio: np.ndarray) -> float:
        """Calculate LUFS (simplified K-weighted loudness)"""
        
        # K-weighting filter (simplified)
        # High shelf filter at 4kHz
        sos = signal.butter(2, 4000, 'high', fs=self.sample_rate, output='sos')
        audio_weighted = signal.sosfilt(sos, audio)
        
        # Calculate loudness
        mean_square = np.mean(audio_weighted**2)
        lufs = -0.691 + 10 * np.log10(mean_square + 1e-10)
        
        return lufs
    
    def _extract_frequency_features(self, audio: np.ndarray) -> Dict:
        """Extract frequency-related features"""
        
        # STFT
        stft = librosa.stft(audio, n_fft=2048, hop_length=512)
        magnitude = np.abs(stft)
        
        # Frequency bins
        frequencies = librosa.fft_frequencies(sr=self.sample_rate, n_fft=2048)
        
        # Energy per band
        band_energy = {}
        for band_name, (low_freq, high_freq) in self.bands.items():
            # Find frequency bin indices
            low_idx = np.argmin(np.abs(frequencies - low_freq))
            high_idx = np.argmin(np.abs(frequencies - high_freq))
            
            # Calculate mean energy in band
            band_magnitude = magnitude[low_idx:high_idx, :]
            energy = np.mean(band_magnitude**2)
            energy_db = 10 * np.log10(energy + 1e-10)
            
            band_energy[band_name] = energy_db
        
        # Spectral centroid (brightness)
        spectral_centroid = np.mean(
            librosa.feature.spectral_centroid(y=audio, sr=self.sample_rate)
        )
        
        # Spectral rolloff (high frequency content)
        spectral_rolloff = np.mean(
            librosa.feature.spectral_rolloff(y=audio, sr=self.sample_rate, roll_percent=0.85)
        )
        
        return {
            'band_energy': band_energy,
            'spectral_centroid': spectral_centroid,
            'spectral_rolloff': spectral_rolloff
        }
    
    def _extract_transient_features(self, audio: np.ndarray) -> Dict:
        """Extract transient-related features"""
        
        # Onset strength
        onset_env = librosa.onset.onset_strength(y=audio, sr=self.sample_rate)
        
        # Detect onsets
        onsets = librosa.onset.onset_detect(
            onset_envelope=onset_env,
            sr=self.sample_rate,
            units='time'
        )
        
        # Transient density (onsets per second)
        duration = len(audio) / self.sample_rate
        transient_density = len(onsets) / duration if duration > 0 else 0
        
        # Average onset strength
        avg_onset_strength = np.mean(onset_env)
        
        # Attack time (simplified)
        if len(onsets) > 0:
            # Get first onset
            first_onset_sample = int(onsets[0] * self.sample_rate)
            attack_section = audio[first_onset_sample:first_onset_sample + 2048]
            
            # Find peak
            peak_idx = np.argmax(np.abs(attack_section))
            attack_ms = (peak_idx / self.sample_rate) * 1000
        else:
            attack_ms = 0.0
        
        return {
            'transient_density': transient_density,
            'average_attack_ms': attack_ms,
            'onset_strength': avg_onset_strength
        }
    
    def _extract_temporal_features(self, audio: np.ndarray) -> Dict:
        """Extract temporal features"""
        
        # Zero crossing rate
        zcr = np.mean(librosa.feature.zero_crossing_rate(audio))
        
        # Tempo estimation
        tempo, _ = librosa.beat.beat_track(y=audio, sr=self.sample_rate)
        
        return {
            'zero_crossing_rate': zcr,
            'tempo': tempo
        }
    
    def _extract_spectral_features(self, audio: np.ndarray) -> Dict:
        """Extract spectral shape features"""
        
        # Spectral flatness (noisiness)
        spectral_flatness = np.mean(
            librosa.feature.spectral_flatness(y=audio)
        )
        
        # Spectral contrast
        spectral_contrast = librosa.feature.spectral_contrast(
            y=audio,
            sr=self.sample_rate
        )
        spectral_contrast_mean = np.mean(spectral_contrast, axis=1)
        
        return {
            'spectral_flatness': spectral_flatness,
            'spectral_contrast': spectral_contrast_mean.tolist()
        }
    
    def _extract_stereo_features(self, audio: np.ndarray) -> Dict:
        """Extract stereo features"""
        
        if len(audio.shape) != 2 or audio.shape[0] != 2:
            return {
                'stereo_width': 1.0,
                'correlation': 1.0,
                'side_energy': 0.0
            }
        
        left = audio[0]
        right = audio[1]
        
        # Mid-side encoding
        mid = (left + right) / 2
        side = (left - right) / 2
        
        # Stereo width (ratio of side to mid energy)
        mid_energy = np.mean(mid**2)
        side_energy = np.mean(side**2)
        stereo_width = side_energy / (mid_energy + 1e-10)
        
        # Correlation
        correlation = np.corrcoef(left, right)[0, 1]
        
        # Side energy (dB)
        side_energy_db = 10 * np.log10(side_energy + 1e-10)
        
        return {
            'stereo_width': stereo_width,
            'correlation': correlation,
            'side_energy': side_energy_db
        }
    
    def features_to_vector(self, features: Dict) -> np.ndarray:
        """
        Convert features dictionary to flat numpy array
        
        Args:
            features: Features dictionary
            
        Returns:
            1D numpy array of features
        """
        
        vector = []
        
        # Loudness features (5)
        vector.extend([
            features['loudness']['lufs'],
            features['loudness']['peak_db'],
            features['loudness']['rms_db'],
            features['loudness']['dynamic_range'],
            features['loudness']['crest_factor']
        ])
        
        # Frequency bands (8)
        bands = features['frequency']['band_energy']
        vector.extend([
            bands['sub'],
            bands['bass'],
            bands['low_mid'],
            bands['mid'],
            bands['high_mid'],
            bands['presence'],
            bands['brilliance'],
            bands['air']
        ])
        
        # Frequency features (2)
        vector.extend([
            features['frequency']['spectral_centroid'],
            features['frequency']['spectral_rolloff']
        ])
        
        # Transient features (3)
        vector.extend([
            features['transients']['transient_density'],
            features['transients']['average_attack_ms'],
            features['transients']['onset_strength']
        ])
        
        # Temporal features (2)
        vector.extend([
            features['temporal']['zero_crossing_rate'],
            features['temporal']['tempo']
        ])
        
        # Spectral features (1 + 7 = 8)
        vector.append(features['spectral']['spectral_flatness'])
        vector.extend(features['spectral']['spectral_contrast'])
        
        # Stereo features (3) - if available
        if 'stereo' in features:
            vector.extend([
                features['stereo']['stereo_width'],
                features['stereo']['correlation'],
                features['stereo']['side_energy']
            ])
        else:
            vector.extend([1.0, 1.0, 0.0])  # Defaults for mono
        
        return np.array(vector, dtype=np.float32)

"""
Advanced Audio Analysis
Analyzes reference tracks like iZotope - focusing on loudest parts
"""

import numpy as np
import librosa
import pyloudnorm as pyln
from scipy import signal
from typing import Dict, Tuple


class ReferenceAnalyzer:
    """
    Analyzes reference tracks focusing on loudest sections
    Like iZotope - we need the most representative parts
    """
    
    def __init__(self, sample_rate: int = 44100):
        self.sr = sample_rate
        self.meter = pyln.Meter(sample_rate)
    
    def find_loudest_sections(
        self, 
        audio: np.ndarray, 
        section_length: float = 10.0,
        num_sections: int = 3
    ) -> list:
        """
        Find the loudest sections of the track (like iZotope does)
        
        Args:
            audio: Audio data
            section_length: Length of each section in seconds
            num_sections: Number of sections to analyze
            
        Returns:
            List of (start_sample, end_sample) tuples
        """
        # Convert to mono for analysis
        if len(audio.shape) > 1:
            mono = np.mean(audio, axis=1)
        else:
            mono = audio
        
        # Calculate section size in samples
        section_samples = int(section_length * self.sr)
        hop_samples = section_samples // 2  # 50% overlap
        
        # Calculate RMS for each section
        sections = []
        for start in range(0, len(mono) - section_samples, hop_samples):
            end = start + section_samples
            section = mono[start:end]
            rms = np.sqrt(np.mean(section ** 2))
            sections.append({
                'start': start,
                'end': end,
                'rms': rms
            })
        
        # Sort by RMS and take loudest sections
        sections.sort(key=lambda x: x['rms'], reverse=True)
        loudest = sections[:num_sections]
        
        return [(s['start'], s['end']) for s in loudest]
    
    def analyze_reference(
        self, 
        audio: np.ndarray,
        analyze_full: bool = False
    ) -> Dict:
        """
        Comprehensive reference analysis
        
        Args:
            audio: Audio data (samples, channels)
            analyze_full: If False, analyze only loudest parts (like iZotope)
            
        Returns:
            Dictionary with all analysis results
        """
        
        if not analyze_full:
            # iZotope approach: analyze loudest sections
            sections = self.find_loudest_sections(audio)
            
            # Concatenate loudest sections for analysis
            audio_to_analyze = []
            for start, end in sections:
                audio_to_analyze.append(audio[start:end])
            audio_to_analyze = np.concatenate(audio_to_analyze, axis=0)
        else:
            audio_to_analyze = audio
        
        # Ensure 2D array (samples, channels)
        if len(audio_to_analyze.shape) == 1:
            audio_to_analyze = audio_to_analyze.reshape(-1, 1)
        
        analysis = {}
        
        # === LOUDNESS ANALYSIS ===
        analysis['loudness'] = self._analyze_loudness(audio_to_analyze)
        
        # === FREQUENCY ANALYSIS ===
        analysis['frequency'] = self._analyze_frequency(audio_to_analyze)
        
        # === DYNAMICS ANALYSIS ===
        analysis['dynamics'] = self._analyze_dynamics(audio_to_analyze)
        
        # === STEREO ANALYSIS ===
        if audio_to_analyze.shape[1] >= 2:
            analysis['stereo'] = self._analyze_stereo(audio_to_analyze)
        
        # === TRANSIENT ANALYSIS ===
        analysis['transients'] = self._analyze_transients(audio_to_analyze)
        
        return analysis
    
    def _analyze_loudness(self, audio: np.ndarray) -> Dict:
        """Analyze loudness characteristics"""
        lufs = self.meter.integrated_loudness(audio)
        peak = np.max(np.abs(audio))
        rms = np.sqrt(np.mean(audio ** 2))
        crest_factor = peak / rms if rms > 0 else 0
        
        return {
            'lufs': float(lufs),
            'peak_db': float(20 * np.log10(peak + 1e-10)),
            'rms_db': float(20 * np.log10(rms + 1e-10)),
            'crest_factor_db': float(20 * np.log10(crest_factor + 1e-10)),
            'dynamic_range': float(20 * np.log10(peak / rms) if rms > 0 else 0)
        }
    
    def _analyze_frequency(self, audio: np.ndarray) -> Dict:
        """Analyze frequency balance using multiband approach"""
        # Convert to mono for frequency analysis
        if audio.shape[1] > 1:
            mono = np.mean(audio, axis=1)
        else:
            mono = audio.flatten()
        
        # Define frequency bands (similar to multiband compressor)
        bands = {
            'sub': (20, 60),
            'bass': (60, 250),
            'low_mid': (250, 500),
            'mid': (500, 2000),
            'high_mid': (2000, 4000),
            'presence': (4000, 8000),
            'brilliance': (8000, 16000),
            'air': (16000, 20000)
        }
        
        band_energy = {}
        
        for band_name, (low_freq, high_freq) in bands.items():
            # Bandpass filter
            sos = signal.butter(
                4, 
                [low_freq, high_freq], 
                btype='band', 
                fs=self.sr, 
                output='sos'
            )
            filtered = signal.sosfilt(sos, mono)
            
            # Calculate RMS energy in dB
            rms = np.sqrt(np.mean(filtered ** 2))
            db = 20 * np.log10(rms + 1e-10)
            band_energy[band_name] = float(db)
        
        # Calculate spectral features
        spectral_centroid = librosa.feature.spectral_centroid(
            y=mono, 
            sr=self.sr
        ).mean()
        
        spectral_rolloff = librosa.feature.spectral_rolloff(
            y=mono, 
            sr=self.sr
        ).mean()
        
        return {
            'band_energy': band_energy,
            'spectral_centroid': float(spectral_centroid),
            'spectral_rolloff': float(spectral_rolloff),
            'brightness': float(spectral_centroid / (self.sr / 2))  # Normalized
        }
    
    def _analyze_dynamics(self, audio: np.ndarray) -> Dict:
        """Analyze dynamic characteristics"""
        if audio.shape[1] > 1:
            mono = np.mean(audio, axis=1)
        else:
            mono = audio.flatten()
        
        # Calculate envelope
        envelope = np.abs(signal.hilbert(mono))
        
        # Measure compression amount (how much dynamics are reduced)
        peak = np.max(envelope)
        rms = np.sqrt(np.mean(envelope ** 2))
        
        # Estimate compression ratio from dynamic range
        dynamic_range_db = 20 * np.log10(peak / rms) if rms > 0 else 0
        
        # Typical uncompressed track: 12-20 dB dynamic range
        # Heavily compressed: 6-10 dB
        compression_amount = max(0, (15 - dynamic_range_db) / 15)  # 0-1 scale
        
        return {
            'dynamic_range_db': float(dynamic_range_db),
            'compression_amount': float(compression_amount),
            'envelope_peak': float(peak),
            'envelope_rms': float(rms)
        }
    
    def _analyze_stereo(self, audio: np.ndarray) -> Dict:
        """Analyze stereo field"""
        if audio.shape[1] < 2:
            return {}
        
        left = audio[:, 0]
        right = audio[:, 1]
        
        # Calculate mid and side
        mid = (left + right) / 2
        side = (left - right) / 2
        
        # Stereo width calculation
        mid_rms = np.sqrt(np.mean(mid ** 2))
        side_rms = np.sqrt(np.mean(side ** 2))
        
        stereo_width = side_rms / (mid_rms + 1e-10)
        
        # Correlation (-1 to 1)
        correlation = np.corrcoef(left, right)[0, 1]
        
        # Mid/Side balance in dB
        mid_db = 20 * np.log10(mid_rms + 1e-10)
        side_db = 20 * np.log10(side_rms + 1e-10)
        
        return {
            'stereo_width': float(stereo_width),
            'correlation': float(correlation),
            'mid_db': float(mid_db),
            'side_db': float(side_db),
            'balance': float(side_db - mid_db)
        }
    
    def _analyze_transients(self, audio: np.ndarray) -> Dict:
        """Analyze transient characteristics"""
        if audio.shape[1] > 1:
            mono = np.mean(audio, axis=1)
        else:
            mono = audio.flatten()
        
        # Onset detection (transients)
        onset_env = librosa.onset.onset_strength(y=mono, sr=self.sr)
        onsets = librosa.onset.onset_detect(
            onset_envelope=onset_env,
            sr=self.sr,
            units='time'
        )
        
        # Calculate transient density
        duration = len(mono) / self.sr
        transient_density = len(onsets) / duration if duration > 0 else 0
        
        # Measure attack characteristics
        onset_frames = librosa.onset.onset_detect(
            onset_envelope=onset_env,
            sr=self.sr
        )
        
        # Average attack time (simplified)
        attack_samples = 0
        if len(onset_frames) > 0:
            # Look at first 10ms after each onset
            attack_window = int(0.01 * self.sr)
            attacks = []
            for frame in onset_frames[:10]:  # Sample first 10 onsets
                sample = librosa.frames_to_samples(frame)
                if sample + attack_window < len(mono):
                    segment = mono[sample:sample + attack_window]
                    # Time to reach 90% of peak
                    peak = np.max(np.abs(segment))
                    threshold = peak * 0.9
                    attack_time = np.argmax(np.abs(segment) >= threshold)
                    attacks.append(attack_time)
            
            if attacks:
                attack_samples = np.mean(attacks)
        
        attack_ms = (attack_samples / self.sr) * 1000 if attack_samples > 0 else 10
        
        return {
            'transient_density': float(transient_density),
            'average_attack_ms': float(attack_ms),
            'num_onsets': len(onsets)
        }
    
    def compare_tracks(
        self, 
        source_audio: np.ndarray, 
        reference_audio: np.ndarray
    ) -> Dict:
        """
        Compare source track to reference and calculate differences
        This is what drives the mastering decisions
        """
        source_analysis = self.analyze_reference(source_audio, analyze_full=False)
        ref_analysis = self.analyze_reference(reference_audio, analyze_full=False)
        
        delta = {}
        
        # Loudness delta
        delta['loudness_delta'] = {
            'lufs': ref_analysis['loudness']['lufs'] - source_analysis['loudness']['lufs'],
            'dynamic_range': ref_analysis['loudness']['dynamic_range'] - source_analysis['loudness']['dynamic_range']
        }
        
        # Frequency delta (band by band)
        delta['frequency_delta'] = {}
        for band in ref_analysis['frequency']['band_energy'].keys():
            ref_energy = ref_analysis['frequency']['band_energy'][band]
            source_energy = source_analysis['frequency']['band_energy'][band]
            delta['frequency_delta'][band] = ref_energy - source_energy
        
        # Stereo delta
        if 'stereo' in ref_analysis and 'stereo' in source_analysis:
            delta['stereo_delta'] = {
                'width': ref_analysis['stereo']['stereo_width'] - source_analysis['stereo']['stereo_width'],
                'correlation': ref_analysis['stereo']['correlation'] - source_analysis['stereo']['correlation']
            }
        
        # Dynamics delta
        delta['dynamics_delta'] = {
            'compression_needed': ref_analysis['dynamics']['compression_amount'] - source_analysis['dynamics']['compression_amount']
        }
        
        # Transient delta
        delta['transient_delta'] = {
            'attack_difference': ref_analysis['transients']['average_attack_ms'] - source_analysis['transients']['average_attack_ms']
        }
        
        return {
            'source': source_analysis,
            'reference': ref_analysis,
            'delta': delta
        }

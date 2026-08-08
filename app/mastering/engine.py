"""
Intelligent Mastering Processor
Uses reference analysis to drive mastering decisions
"""

import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from pathlib import Path
from typing import Optional, Dict

from app.mastering.analyzer import ReferenceAnalyzer
from app.mastering.effects import (
    MultibandCompressor,
    StereoImager,
    DeEsser,
    TransientShaper,
    LinearPhaseEQ
)
from app.mastering.presets import MasteringPresets


class IntelligentMasteringEngine:
    """
    Advanced mastering engine that analyzes reference tracks
    and applies intelligent processing
    """
    
    def __init__(self, sample_rate: int = 44100):
        self.sr = sample_rate
        self.analyzer = ReferenceAnalyzer(sample_rate)
        self.meter = pyln.Meter(sample_rate)
        
        # Initialize processors
        self.multiband = MultibandCompressor(sample_rate)
        self.stereo = StereoImager(sample_rate)
        self.deesser = DeEsser(sample_rate)
        self.transient = TransientShaper(sample_rate)
        self.linear_eq = LinearPhaseEQ(sample_rate)
    
    def load_audio(self, file_path: str) -> np.ndarray:
        """Load audio file"""
        audio, sr = sf.read(file_path, always_2d=True)
        
        # Resample if needed
        if sr != self.sr:
            import librosa
            audio = librosa.resample(
                audio.T,
                orig_sr=sr,
                target_sr=self.sr
            ).T
        
        return audio
    
    def master_with_reference(
        self,
        source_path: str,
        reference_path: str,
        output_path: str,
        preset_name: str = 'streaming',
        strength: float = 1.0
    ) -> Dict:
        """
        Master audio using reference track analysis
        
        Args:
            source_path: Path to track to be mastered
            reference_path: Path to reference track
            output_path: Where to save result
            preset_name: Starting preset to use
            strength: How much to apply reference matching (0-1)
        
        Returns:
            Dictionary with processing info
        """
        
        print(f"Loading source: {source_path}")
        source_audio = self.load_audio(source_path)
        
        print(f"Loading reference: {reference_path}")
        reference_audio = self.load_audio(reference_path)
        
        # Analyze both tracks (focusing on loudest parts for reference)
        print("Analyzing reference track (loudest sections)...")
        comparison = self.analyzer.compare_tracks(source_audio, reference_audio)
        
        delta = comparison['delta']
        ref_analysis = comparison['reference']
        source_analysis = comparison['source']
        
        print("\n=== ANALYSIS RESULTS ===")
        print(f"Source LUFS: {source_analysis['loudness']['lufs']:.2f}")
        print(f"Reference LUFS: {ref_analysis['loudness']['lufs']:.2f}")
        print(f"LUFS Delta: {delta['loudness_delta']['lufs']:.2f} dB")
        
        # Start with preset as base
        print(f"\nStarting with '{preset_name}' preset as base...")
        processed = source_audio.copy()
        
        # === STEP 1: LINEAR PHASE EQ (Frequency Matching) ===
        print("\n[1/6] Applying frequency matching...")
        eq_bands = self._calculate_eq_from_delta(delta['frequency_delta'], strength)
        if eq_bands:
            processed = self.linear_eq.process(processed, eq_bands)
            print(f"  Applied {len(eq_bands)} EQ adjustments")
        
        # === STEP 2: MULTIBAND COMPRESSION (Dynamics) ===
        print("\n[2/6] Applying multiband compression...")
        self._configure_multiband_from_delta(delta, ref_analysis)
        processed = self.multiband.process(processed)
        print("  Compressed across 4 frequency bands")
        
        # === STEP 3: DE-ESSING (if needed) ===
        if self._needs_deessing(source_analysis, ref_analysis):
            print("\n[3/6] Applying de-essing...")
            processed = self.deesser.process(
                processed,
                frequency=7000,
                threshold_db=-20,
                ratio=4.0
            )
            print("  Reduced sibilance at 7kHz")
        else:
            print("\n[3/6] Skipping de-essing (not needed)")
        
        # === STEP 4: TRANSIENT SHAPING ===
        if 'transient_delta' in delta:
            print("\n[4/6] Shaping transients...")
            attack_gain, sustain_gain = self._calculate_transient_gains(delta)
            processed = self.transient.process(
                processed,
                attack_gain=attack_gain,
                sustain_gain=sustain_gain
            )
            print(f"  Attack: {attack_gain:.2f}x, Sustain: {sustain_gain:.2f}x")
        else:
            print("\n[4/6] Skipping transient shaping")
        
        # === STEP 5: STEREO IMAGING ===
        if processed.shape[1] >= 2 and 'stereo_delta' in delta:
            print("\n[5/6] Adjusting stereo width...")
            width = self._calculate_stereo_width(delta['stereo_delta'], strength)
            processed = self.stereo.process(
                processed,
                width=width,
                mono_bass_hz=120
            )
            print(f"  Stereo width: {width:.2f}x")
        else:
            print("\n[5/6] Skipping stereo adjustment")
        
        # === STEP 6: FINAL LIMITING & LOUDNESS ===
        print("\n[6/6] Final limiting and loudness normalization...")
        target_lufs = ref_analysis['loudness']['lufs']
        processed = self._apply_final_limiting(processed, target_lufs)
        print(f"  Target LUFS: {target_lufs:.2f}")
        
        # Measure final result
        final_lufs = self.meter.integrated_loudness(processed)
        print(f"  Final LUFS: {final_lufs:.2f}")
        
        # Save
        print(f"\nSaving to: {output_path}")
        sf.write(output_path, processed, self.sr, subtype='PCM_24')
        
        return {
            'success': True,
            'source_lufs': float(source_analysis['loudness']['lufs']),
            'reference_lufs': float(ref_analysis['loudness']['lufs']),
            'final_lufs': float(final_lufs),
            'eq_bands_applied': len(eq_bands) if eq_bands else 0,
            'stereo_width': float(width) if processed.shape[1] >= 2 else 1.0,
            'output_file': output_path
        }
    
    def _calculate_eq_from_delta(self, freq_delta: Dict, strength: float) -> list:
        """
        Calculate EQ adjustments from frequency delta
        """
        eq_bands = []
        
        # Map band names to frequencies and Q values
        band_mapping = {
            'sub': (40, 0.7),
            'bass': (120, 1.0),
            'low_mid': (350, 1.5),
            'mid': (1000, 2.0),
            'high_mid': (3000, 2.0),
            'presence': (6000, 2.0),
            'brilliance': (10000, 1.5),
            'air': (16000, 1.0)
        }
        
        for band_name, gain_db in freq_delta.items():
            if band_name in band_mapping:
                freq, q = band_mapping[band_name]
                
                # Apply strength factor
                adjusted_gain = gain_db * strength
                
                # Only apply significant changes (> 0.5 dB)
                if abs(adjusted_gain) > 0.5:
                    eq_bands.append((freq, adjusted_gain, q))
        
        return eq_bands
    
    def _configure_multiband_from_delta(self, delta: Dict, ref_analysis: Dict):
        """
        Configure multiband compressor based on analysis
        """
        compression_needed = delta['dynamics_delta'].get('compression_amount', 0)
        
        # Adjust ratios based on compression needed
        for band in self.multiband.bands:
            # More compression needed = higher ratios
            if compression_needed > 0.2:
                band['ratio'] = min(band['ratio'] * 1.3, 6.0)
            elif compression_needed < -0.2:
                band['ratio'] = max(band['ratio'] * 0.8, 1.5)
    
    def _needs_deessing(self, source: Dict, reference: Dict) -> bool:
        """
        Determine if de-essing is needed
        """
        # Check if source has more high-frequency energy than reference
        source_brilliance = source['frequency']['band_energy'].get('brilliance', 0)
        ref_brilliance = reference['frequency']['band_energy'].get('brilliance', 0)
        
        return source_brilliance > ref_brilliance + 3.0  # 3dB threshold
    
    def _calculate_transient_gains(self, delta: Dict) -> tuple:
        """
        Calculate transient shaping gains
        """
        attack_diff = delta['transient_delta'].get('attack_difference', 0)
        
        # If reference has faster attack, enhance ours
        if attack_diff < -2:  # Reference is 2ms faster
            attack_gain = 1.2
        elif attack_diff > 2:  # Reference is slower
            attack_gain = 0.9
        else:
            attack_gain = 1.0
        
        sustain_gain = 1.0  # Keep sustain neutral for now
        
        return attack_gain, sustain_gain
    
    def _calculate_stero_width(self, stereo_delta: Dict, strength: float) -> float:
        """
        Calculate stereo width adjustment
        """
        width_delta = stereo_delta.get('width', 0)
        
        # Convert delta to multiplier
        # width_delta > 0 means reference is wider
        base_width = 1.0
        target_width = base_width + (width_delta * strength)
        
        # Clamp to reasonable range
        return np.clip(target_width, 0.7, 1.5)
    
    def _apply_final_limiting(self, audio: np.ndarray, target_lufs: float) -> np.ndarray:
        """
        Apply final limiting and loudness normalization
        """
        from pedalboard import Limiter, Gain
        
        # Measure current loudness
        current_lufs = self.meter.integrated_loudness(audio)
        
        # Calculate gain needed
        gain_db = target_lufs - current_lufs
        gain_linear = 10 ** (gain_db / 20)
        
        # Apply gain
        gained = audio * gain_linear
        
        # Apply limiter to prevent clipping
        limiter = Limiter(threshold_db=-0.3, release_ms=50)
        
        # Transpose for pedalboard (expects channels, samples)
        limited = limiter(gained.T, self.sr).T
        
        # Final safety check
        peak = np.max(np.abs(limited))
        if peak > 0.99:
            limited = limited * (0.99 / peak)
        
        return limited
    
    def master_with_preset_only(
        self,
        source_path: str,
        output_path: str,
        preset_name: str = 'streaming'
    ) -> Dict:
        """
        Master using preset only (no reference)
        Uses the advanced processors with preset configuration
        """
        print(f"Loading source: {source_path}")
        source_audio = self.load_audio(source_path)
        
        print(f"Applying '{preset_name}' preset with advanced processing...")
        
        # Get preset configuration
        preset_board = MasteringPresets.get_preset(preset_name, self.sr)
        target_lufs = MasteringPresets.get_target_lufs(preset_name)
        
        # Apply preset chain
        processed = preset_board(source_audio.T, self.sr).T
        
        # Apply advanced multiband compression
        print("Applying multiband compression...")
        processed = self.multiband.process(processed)
        
        # Apply stereo imaging (moderate width)
        if processed.shape[1] >= 2:
            print("Applying stereo imaging...")
            processed = self.stereo.process(processed, width=1.1, mono_bass_hz=120)
        
        # Final loudness normalization
        print("Normalizing loudness...")
        processed = self._apply_final_limiting(processed, target_lufs)
        
        # Save
        sf.write(output_path, processed, self.sr, subtype='PCM_24')
        
        final_lufs = self.meter.integrated_loudness(processed)
        
        return {
            'success': True,
            'preset_used': preset_name,
            'target_lufs': float(target_lufs),
            'final_lufs': float(final_lufs),
            'output_file': output_path
        }

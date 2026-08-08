"""
Mastering Presets - LANDR-style
Style-based mastering chains with intensity controls
"""

from pedalboard import (
    Pedalboard, Compressor, Gain, Limiter,
    HighpassFilter, LowShelfFilter, HighShelfFilter, 
    PeakFilter, Distortion
)
from typing import Dict, List


class MasteringPresets:
    """Collection of style-based mastering presets with intensity levels"""
    
    # Style metadata
    STYLE_INFO = {
        'warm': {
            'name': 'Warm',
            'description': 'Rich low-end, smooth highs, vintage character',
            'icon': '🔥',
            'character': 'Warm, rich, analog-inspired sound',
            'target_lufs': {
                'low': -16,
                'medium': -14,
                'high': -12
            }
        },
        'balanced': {
            'name': 'Balanced',
            'description': 'Even frequency response, natural dynamics',
            'icon': '⚖️',
            'character': 'Transparent, neutral, true to source',
            'target_lufs': {
                'low': -16,
                'medium': -14,
                'high': -11
            }
        },
        'open': {
            'name': 'Open',
            'description': 'Bright highs, wide stereo, airy feel',
            'icon': '✨',
            'character': 'Bright, spacious, crystal clear',
            'target_lufs': {
                'low': -16,
                'medium': -14,
                'high': -11
            }
        }
    }
    
    @staticmethod
    def warm_low(sample_rate: int = 44100) -> Pedalboard:
        """Warm style - Low intensity"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=35),
            LowShelfFilter(cutoff_frequency_hz=120, gain_db=2.0),  # Warm bass
            HighShelfFilter(cutoff_frequency_hz=8000, gain_db=-1.0),  # Smooth highs
            PeakFilter(cutoff_frequency_hz=800, gain_db=1.0, q=1.0),  # Midrange warmth
            Distortion(drive_db=1.5),  # Subtle saturation
            Compressor(
                threshold_db=-22.0,
                ratio=2.0,
                attack_ms=50.0,
                release_ms=150.0
            ),
            Limiter(threshold_db=-1.0, release_ms=100.0),
        ], sample_rate=sample_rate)
    
    @staticmethod
    def warm_medium(sample_rate: int = 44100) -> Pedalboard:
        """Warm style - Medium intensity"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=30),
            LowShelfFilter(cutoff_frequency_hz=120, gain_db=2.5),
            HighShelfFilter(cutoff_frequency_hz=8000, gain_db=-0.5),
            PeakFilter(cutoff_frequency_hz=800, gain_db=1.5, q=1.0),
            Distortion(drive_db=3.0),
            Compressor(
                threshold_db=-18.0,
                ratio=2.5,
                attack_ms=40.0,
                release_ms=120.0
            ),
            Limiter(threshold_db=-0.5, release_ms=80.0),
        ], sample_rate=sample_rate)
    
    @staticmethod
    def warm_high(sample_rate: int = 44100) -> Pedalboard:
        """Warm style - High intensity"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=30),
            LowShelfFilter(cutoff_frequency_hz=120, gain_db=3.0),
            HighShelfFilter(cutoff_frequency_hz=8000, gain_db=0.0),
            PeakFilter(cutoff_frequency_hz=800, gain_db=2.0, q=1.0),
            Distortion(drive_db=5.0),
            Compressor(
                threshold_db=-16.0,
                ratio=3.0,
                attack_ms=30.0,
                release_ms=100.0
            ),
            Limiter(threshold_db=-0.3, release_ms=50.0),
        ], sample_rate=sample_rate)
    
    @staticmethod
    def balanced_low(sample_rate: int = 44100) -> Pedalboard:
        """Balanced style - Low intensity"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=30),
            LowShelfFilter(cutoff_frequency_hz=100, gain_db=0.5),
            HighShelfFilter(cutoff_frequency_hz=8000, gain_db=0.5),
            Compressor(
                threshold_db=-22.0,
                ratio=2.0,
                attack_ms=50.0,
                release_ms=150.0
            ),
            Limiter(threshold_db=-1.0, release_ms=100.0),
        ], sample_rate=sample_rate)
    
    @staticmethod
    def balanced_medium(sample_rate: int = 44100) -> Pedalboard:
        """Balanced style - Medium intensity"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=30),
            LowShelfFilter(cutoff_frequency_hz=100, gain_db=1.0),
            HighShelfFilter(cutoff_frequency_hz=8000, gain_db=1.0),
            PeakFilter(cutoff_frequency_hz=300, gain_db=-0.5, q=1.0),  # Clean up mud
            Compressor(
                threshold_db=-18.0,
                ratio=2.5,
                attack_ms=40.0,
                release_ms=120.0
            ),
            Limiter(threshold_db=-0.5, release_ms=80.0),
        ], sample_rate=sample_rate)
    
    @staticmethod
    def balanced_high(sample_rate: int = 44100) -> Pedalboard:
        """Balanced style - High intensity"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=30),
            LowShelfFilter(cutoff_frequency_hz=100, gain_db=1.5),
            HighShelfFilter(cutoff_frequency_hz=8000, gain_db=1.5),
            PeakFilter(cutoff_frequency_hz=300, gain_db=-1.0, q=1.0),
            Compressor(
                threshold_db=-16.0,
                ratio=3.0,
                attack_ms=30.0,
                release_ms=100.0
            ),
            Limiter(threshold_db=-0.3, release_ms=50.0),
        ], sample_rate=sample_rate)
    
    @staticmethod
    def open_low(sample_rate: int = 44100) -> Pedalboard:
        """Open style - Low intensity"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=30),
            HighShelfFilter(cutoff_frequency_hz=6000, gain_db=1.5),  # Bright highs
            LowShelfFilter(cutoff_frequency_hz=100, gain_db=-0.5),  # Tight bass
            PeakFilter(cutoff_frequency_hz=250, gain_db=-1.0, q=1.0),  # Clear mids
            Compressor(
                threshold_db=-22.0,
                ratio=2.0,
                attack_ms=50.0,
                release_ms=150.0
            ),
            Limiter(threshold_db=-1.0, release_ms=100.0),
        ], sample_rate=sample_rate)
    
    @staticmethod
    def open_medium(sample_rate: int = 44100) -> Pedalboard:
        """Open style - Medium intensity"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=30),
            HighShelfFilter(cutoff_frequency_hz=6000, gain_db=2.5),
            LowShelfFilter(cutoff_frequency_hz=100, gain_db=-0.5),
            PeakFilter(cutoff_frequency_hz=250, gain_db=-1.5, q=1.0),
            PeakFilter(cutoff_frequency_hz=10000, gain_db=1.0, q=1.5),  # Air band
            Compressor(
                threshold_db=-18.0,
                ratio=2.5,
                attack_ms=40.0,
                release_ms=120.0
            ),
            Limiter(threshold_db=-0.5, release_ms=80.0),
        ], sample_rate=sample_rate)
    
    @staticmethod
    def open_high(sample_rate: int = 44100) -> Pedalboard:
        """Open style - High intensity"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=30),
            HighShelfFilter(cutoff_frequency_hz=6000, gain_db=3.0),
            LowShelfFilter(cutoff_frequency_hz=100, gain_db=-0.5),
            PeakFilter(cutoff_frequency_hz=250, gain_db=-2.0, q=1.0),
            PeakFilter(cutoff_frequency_hz=10000, gain_db=1.5, q=1.5),
            Compressor(
                threshold_db=-16.0,
                ratio=3.0,
                attack_ms=30.0,
                release_ms=100.0
            ),
            Limiter(threshold_db=-0.3, release_ms=50.0),
        ], sample_rate=sample_rate)
    
    @classmethod
    def get_preset(cls, style: str, intensity: str, sample_rate: int = 44100) -> Pedalboard:
        """
        Get a preset by style and intensity
        
        Args:
            style: 'warm', 'balanced', or 'open'
            intensity: 'low', 'medium', or 'high'
            sample_rate: Audio sample rate
        
        Returns:
            Pedalboard preset
        """
        preset_map = {
            ('warm', 'low'): cls.warm_low,
            ('warm', 'medium'): cls.warm_medium,
            ('warm', 'high'): cls.warm_high,
            ('balanced', 'low'): cls.balanced_low,
            ('balanced', 'medium'): cls.balanced_medium,
            ('balanced', 'high'): cls.balanced_high,
            ('open', 'low'): cls.open_low,
            ('open', 'medium'): cls.open_medium,
            ('open', 'high'): cls.open_high,
        }
        
        key = (style.lower(), intensity.lower())
        preset_func = preset_map.get(key, cls.balanced_medium)
        return preset_func(sample_rate)
    
    @classmethod
    def get_target_lufs(cls, style: str, intensity: str) -> float:
        """Get target LUFS for a style and intensity combination"""
        style_info = cls.STYLE_INFO.get(style.lower(), {})
        target_lufs_map = style_info.get('target_lufs', {})
        return target_lufs_map.get(intensity.lower(), -14.0)
    
    @classmethod
    def list_styles(cls) -> List[Dict]:
        """List all available styles with metadata"""
        return [
            {
                'id': style_id,
                **style_data
            }
            for style_id, style_data in cls.STYLE_INFO.items()
        ]
    
    @classmethod
    def get_style_info(cls, style: str) -> Dict:
        """Get metadata for a specific style"""
        return {
            'id': style,
            **cls.STYLE_INFO.get(style.lower(), {})
        }
    
    @classmethod
    def list_intensities(cls) -> List[str]:
        """List available intensity levels"""
        return ['low', 'medium', 'high']

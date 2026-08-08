"""
Mastering Presets
Professional mastering chains for different genres
"""

from pedalboard import (
    Pedalboard, Compressor, Gain, Limiter,
    HighpassFilter, LowShelfFilter, HighShelfFilter, 
    PeakFilter, Distortion
)
from typing import Dict, List


class MasteringPresets:
    """Collection of mastering presets"""
    
    # Preset metadata
    PRESET_INFO = {
        'pop': {
            'name': 'Pop/Commercial',
            'description': 'Bright, punchy, radio-ready sound',
            'icon': '',
            'tags': ['Pop', 'Dance', 'Mainstream'],
            'target_lufs': -14,
            'character': 'Bright, energetic, wide stereo field'
        },
        'hiphop': {
            'name': 'Hip-Hop/Trap',
            'description': 'Heavy bass, punchy drums, controlled dynamics',
            'icon': '',
            'tags': ['Hip-Hop', 'Trap', 'Rap'],
            'target_lufs': -12,
            'character': 'Bass-heavy, loud, aggressive'
        },
        'rock': {
            'name': 'Rock/Alternative',
            'description': 'Natural dynamics, punchy mids, analog warmth',
            'icon': '',
            'tags': ['Rock', 'Indie', 'Alternative'],
            'target_lufs': -13,
            'character': 'Warm, punchy, preserves dynamics'
        },
        'edm': {
            'name': 'Electronic/EDM',
            'description': 'Crystal clear, wide stereo, maximum loudness',
            'icon': '',
            'tags': ['EDM', 'House', 'Techno', 'Dubstep'],
            'target_lufs': -11,
            'character': 'Loud, bright, wide, energetic'
        },
        'jazz': {
            'name': 'Jazz/Acoustic',
            'description': 'Natural, dynamic, minimal processing',
            'icon': '',
            'tags': ['Jazz', 'Classical', 'Acoustic'],
            'target_lufs': -16,
            'character': 'Natural, spacious, dynamic'
        },
        'podcast': {
            'name': 'Podcast/Voice',
            'description': 'Clear speech, controlled dynamics, broadcast-ready',
            'icon': '',
            'tags': ['Podcast', 'Voice', 'Speech'],
            'target_lufs': -16,
            'character': 'Clear, intelligible, consistent'
        },
        'lofi': {
            'name': 'Lo-Fi/Vintage',
            'description': 'Warm, nostalgic, slightly degraded',
            'icon': '',
            'tags': ['Lo-Fi', 'Chill', 'Vintage'],
            'target_lufs': -14,
            'character': 'Warm, cozy, slightly degraded'
        },
        'streaming': {
            'name': 'Streaming Optimized',
            'description': 'Balanced for Spotify, Apple Music, YouTube',
            'icon': '',
            'tags': ['Spotify', 'Universal', 'Safe Choice'],
            'target_lufs': -14,
            'character': 'Balanced, competitive, streaming-friendly'
        }
    }
    
    @staticmethod
    def pop_commercial(sample_rate: int = 44100) -> Pedalboard:
        """Pop/Commercial preset"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=30),
            HighShelfFilter(cutoff_frequency_hz=10000, gain_db=2.0),
            LowShelfFilter(cutoff_frequency_hz=100, gain_db=1.0),
            Compressor(
                threshold_db=-18.0,
                ratio=3.0,
                attack_ms=30.0,
                release_ms=100.0
            ),
            Limiter(threshold_db=-0.3, release_ms=50.0),
        ])
    
    @staticmethod
    def hip_hop_trap(sample_rate: int = 44100) -> Pedalboard:
        """Hip-Hop/Trap preset"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=25),
            LowShelfFilter(cutoff_frequency_hz=60, gain_db=3.0),
            PeakFilter(cutoff_frequency_hz=300, gain_db=-1.0, q=1.0),
            Compressor(
                threshold_db=-16.0,
                ratio=4.0,
                attack_ms=10.0,
                release_ms=80.0
            ),
            Distortion(drive_db=3.0),
            Limiter(threshold_db=-0.1, release_ms=30.0),
        ])
    
    @staticmethod
    def rock_alternative(sample_rate: int = 44100) -> Pedalboard:
        """Rock/Alternative preset"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=35),
            PeakFilter(cutoff_frequency_hz=3500, gain_db=1.5, q=1.2),
            LowShelfFilter(cutoff_frequency_hz=80, gain_db=1.0),
            Compressor(
                threshold_db=-20.0,
                ratio=2.5,
                attack_ms=50.0,
                release_ms=150.0
            ),
            Distortion(drive_db=2.0),
            Limiter(threshold_db=-0.5, release_ms=100.0),
        ])
    
    @staticmethod
    def electronic_edm(sample_rate: int = 44100) -> Pedalboard:
        """Electronic/EDM preset"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=30),
            HighShelfFilter(cutoff_frequency_hz=10000, gain_db=2.0),
            PeakFilter(cutoff_frequency_hz=250, gain_db=-2.0, q=1.0),
            Compressor(
                threshold_db=-14.0,
                ratio=3.0,
                attack_ms=30.0,
                release_ms=80.0
            ),
            Limiter(threshold_db=-0.1, release_ms=30.0),
        ])
    
    @staticmethod
    def jazz_acoustic(sample_rate: int = 44100) -> Pedalboard:
        """Jazz/Acoustic preset"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=40),
            HighShelfFilter(cutoff_frequency_hz=5000, gain_db=0.5),
            PeakFilter(cutoff_frequency_hz=400, gain_db=-0.5, q=1.0),
            Compressor(
                threshold_db=-24.0,
                ratio=1.5,
                attack_ms=100.0,
                release_ms=200.0
            ),
            Distortion(drive_db=1.0),
            Limiter(threshold_db=-1.0, release_ms=150.0),
        ])
    
    @staticmethod
    def podcast_voice(sample_rate: int = 44100) -> Pedalboard:
        """Podcast/Voice preset"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=80),
            PeakFilter(cutoff_frequency_hz=7000, gain_db=-4.0, q=3.0),  # De-esser
            PeakFilter(cutoff_frequency_hz=3000, gain_db=2.0, q=1.5),   # Presence
            PeakFilter(cutoff_frequency_hz=200, gain_db=-3.0, q=1.0),   # Remove boom
            Compressor(
                threshold_db=-20.0,
                ratio=4.0,
                attack_ms=10.0,
                release_ms=50.0
            ),
            Limiter(threshold_db=-1.0, release_ms=50.0),
        ])
    
    @staticmethod
    def lofi_vintage(sample_rate: int = 44100) -> Pedalboard:
        """Lo-Fi/Vintage preset"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=50),
            HighShelfFilter(cutoff_frequency_hz=5000, gain_db=-2.0),
            PeakFilter(cutoff_frequency_hz=800, gain_db=2.0, q=1.0),
            Distortion(drive_db=6.0),
            Compressor(
                threshold_db=-18.0,
                ratio=3.0,
                attack_ms=80.0,
                release_ms=150.0
            ),
            Limiter(threshold_db=-1.0, release_ms=100.0),
        ])
    
    @staticmethod
    def streaming_optimized(sample_rate: int = 44100) -> Pedalboard:
        """Streaming Optimized preset"""
        return Pedalboard([
            HighpassFilter(cutoff_frequency_hz=30),
            LowShelfFilter(cutoff_frequency_hz=80, gain_db=1.0),
            HighShelfFilter(cutoff_frequency_hz=8000, gain_db=1.5),
            PeakFilter(cutoff_frequency_hz=300, gain_db=-1.0, q=1.0),
            Compressor(
                threshold_db=-18.0,
                ratio=2.5,
                attack_ms=30.0,
                release_ms=100.0
            ),
            Limiter(threshold_db=-0.5, release_ms=50.0),
        ])
    
    @classmethod
    def get_preset(cls, genre: str, style: str = 'balanced', intensity: str = 'medium', sample_rate: int = 44100) -> Pedalboard:
        """
        Get a preset by genre, style, and intensity
        
        Args:
            genre: 'pop', 'jazz', 'hiphop', 'trap', 'rnb', 'soul', 'amapiano', 'classical', etc.
            style: 'warm', 'balanced', or 'open' (fine-tuning)
            intensity: 'low', 'medium', or 'high' (processing strength)
            sample_rate: Sample rate
            
        Returns:
            Pedalboard with configured effects
        """
        genre = genre.lower()
        style = style.lower()
        intensity = intensity.lower()
        
        # Intensity multipliers
        intensity_multipliers = {
            'low': 0.6,
            'medium': 1.0,
            'high': 1.4
        }
        multiplier = intensity_multipliers.get(intensity, 1.0)
        
        # Style modifiers (applied on top of genre)
        style_mods = {
            'warm': {'low_shelf': 1.5, 'high_shelf': -0.5, 'compression': 0.9},
            'balanced': {'low_shelf': 1.0, 'high_shelf': 1.0, 'compression': 1.0},
            'open': {'low_shelf': 0.7, 'high_shelf': 1.5, 'compression': 0.8}
        }
        mod = style_mods.get(style, style_mods['balanced'])
        
        # Genre-specific presets
        if genre == 'pop':
            return Pedalboard([
                HighpassFilter(cutoff_frequency_hz=30),
                LowShelfFilter(cutoff_frequency_hz=100, gain_db=1.0 * multiplier * mod['low_shelf']),
                HighShelfFilter(cutoff_frequency_hz=10000, gain_db=2.0 * multiplier * mod['high_shelf']),
                Compressor(
                    threshold_db=-18.0 / multiplier,
                    ratio=3.0 * multiplier * mod['compression'],
                    attack_ms=30.0,
                    release_ms=100.0
                ),
                Limiter(threshold_db=-0.3, release_ms=50.0),
            ])
            
        elif genre == 'hiphop' or genre == 'trap':
            return Pedalboard([
                HighpassFilter(cutoff_frequency_hz=25),
                LowShelfFilter(cutoff_frequency_hz=60, gain_db=3.0 * multiplier * mod['low_shelf']),
                PeakFilter(cutoff_frequency_hz=300, gain_db=-1.0 * multiplier, q=1.0),
                HighShelfFilter(cutoff_frequency_hz=10000, gain_db=1.0 * multiplier * mod['high_shelf']),
                Compressor(
                    threshold_db=-16.0 / multiplier,
                    ratio=4.0 * multiplier * mod['compression'],
                    attack_ms=10.0,
                    release_ms=80.0
                ),
                Distortion(drive_db=3.0 * multiplier),
                Limiter(threshold_db=-0.1, release_ms=30.0),
            ])
            
        elif genre == 'rnb' or genre == 'soul':
            return Pedalboard([
                HighpassFilter(cutoff_frequency_hz=30),
                LowShelfFilter(cutoff_frequency_hz=80, gain_db=1.5 * multiplier * mod['low_shelf']),
                PeakFilter(cutoff_frequency_hz=3000, gain_db=1.5 * multiplier, q=1.2),
                HighShelfFilter(cutoff_frequency_hz=8000, gain_db=1.0 * multiplier * mod['high_shelf']),
                Compressor(
                    threshold_db=-19.0 / multiplier,
                    ratio=2.8 * multiplier * mod['compression'],
                    attack_ms=40.0,
                    release_ms=120.0
                ),
                Limiter(threshold_db=-0.4, release_ms=80.0),
            ])
            
        elif genre == 'jazz':
            return Pedalboard([
                HighpassFilter(cutoff_frequency_hz=40),
                LowShelfFilter(cutoff_frequency_hz=100, gain_db=0.5 * multiplier * mod['low_shelf']),
                HighShelfFilter(cutoff_frequency_hz=5000, gain_db=0.5 * multiplier * mod['high_shelf']),
                PeakFilter(cutoff_frequency_hz=400, gain_db=-0.5 * multiplier, q=1.0),
                Compressor(
                    threshold_db=-24.0 / multiplier,
                    ratio=1.5 * multiplier * mod['compression'],
                    attack_ms=100.0,
                    release_ms=200.0
                ),
                Limiter(threshold_db=-1.0, release_ms=150.0),
            ])
            
        elif genre == 'classical':
            return Pedalboard([
                HighpassFilter(cutoff_frequency_hz=35),
                LowShelfFilter(cutoff_frequency_hz=100, gain_db=0.3 * multiplier * mod['low_shelf']),
                HighShelfFilter(cutoff_frequency_hz=6000, gain_db=0.8 * multiplier * mod['high_shelf']),
                Compressor(
                    threshold_db=-28.0 / multiplier,
                    ratio=1.3 * multiplier * mod['compression'],
                    attack_ms=150.0,
                    release_ms=250.0
                ),
                Limiter(threshold_db=-1.5, release_ms=200.0),
            ])
            
        elif genre == 'amapiano':
            return Pedalboard([
                HighpassFilter(cutoff_frequency_hz=28),
                LowShelfFilter(cutoff_frequency_hz=70, gain_db=2.5 * multiplier * mod['low_shelf']),
                PeakFilter(cutoff_frequency_hz=500, gain_db=1.0 * multiplier, q=1.0),
                HighShelfFilter(cutoff_frequency_hz=9000, gain_db=1.5 * multiplier * mod['high_shelf']),
                Compressor(
                    threshold_db=-17.0 / multiplier,
                    ratio=3.5 * multiplier * mod['compression'],
                    attack_ms=20.0,
                    release_ms=90.0
                ),
                Limiter(threshold_db=-0.2, release_ms=40.0),
            ])
            
        else:  # Default/Streaming optimized
            return Pedalboard([
                HighpassFilter(cutoff_frequency_hz=30),
                LowShelfFilter(cutoff_frequency_hz=100, gain_db=1.0 * multiplier * mod['low_shelf']),
                HighShelfFilter(cutoff_frequency_hz=10000, gain_db=1.5 * multiplier * mod['high_shelf']),
                Compressor(
                    threshold_db=-18.0 / multiplier,
                    ratio=2.5 * multiplier * mod['compression'],
                    attack_ms=30.0,
                    release_ms=100.0
                ),
                Limiter(threshold_db=-0.5, release_ms=50.0),
            ])
    
    @classmethod
    def get_target_lufs(cls, genre: str, intensity: str = 'medium') -> float:
        """Get target LUFS based on genre and intensity"""
        # Base LUFS per genre
        genre_lufs = {
            'pop': -14.0,
            'hiphop': -12.0,
            'trap': -11.0,
            'rnb': -14.0,
            'soul': -14.0,
            'jazz': -16.0,
            'classical': -18.0,
            'amapiano': -12.0,
        }
        
        base_lufs = genre_lufs.get(genre.lower(), -14.0)
        
        # Adjust by intensity
        intensity_adjustments = {
            'low': 2.0,      # Quieter
            'medium': 0.0,   # Standard
            'high': 3.0      # Louder
        }
        
        adjustment = intensity_adjustments.get(intensity.lower(), 0.0)
        return base_lufs + adjustment
    
    @classmethod
    def list_genres(cls) -> List[str]:
        """List available genres"""
        return ['pop', 'hiphop', 'trap', 'rnb', 'soul', 'jazz', 'classical', 'amapiano']
    
    @classmethod
    def list_styles(cls) -> List[str]:
        """List available styles"""
        return ['warm', 'balanced', 'open']
    
    @classmethod
    def list_intensities(cls) -> List[str]:
        """List available intensities"""
        return ['low', 'medium', 'high']
    
    @classmethod
    def list_presets(cls) -> List[Dict]:
        """List all available presets with metadata"""
        return [
            {
                'id': preset_id,
                **preset_data
            }
            for preset_id, preset_data in cls.PRESET_INFO.items()
        ]
    
    @classmethod
    def get_preset_info(cls, preset_name: str) -> Dict:
        """Get metadata for a specific preset"""
        return {
            'id': preset_name,
            **cls.PRESET_INFO.get(preset_name.lower(), {})
        }

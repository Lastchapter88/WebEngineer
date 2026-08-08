"""
Data Collector for ML Training
Collects features from every upload (with user consent)
"""

import numpy as np
from datetime import datetime
from typing import Dict, Optional
import json

from feature_extractor import FeatureExtractor


class DataCollector:
    """
    Collects training data from uploads
    Privacy-first: Only stores features, never actual audio
    """
    
    def __init__(self, database_connection):
        self.db = database_connection
        self.feature_extractor = FeatureExtractor()
    
    def collect_from_mastering_job(
        self,
        source_audio: np.ndarray,
        reference_audio: Optional[np.ndarray],
        preset_used: str,
        processing_params: Dict,
        user_opted_in: bool = True,
        sample_rate: int = 44100
    ) -> str:
        """
        Collect training data from a mastering job
        
        Args:
            source_audio: User's track
            reference_audio: Reference track (if provided)
            preset_used: Which preset was used
            processing_params: What processing was applied
            user_opted_in: Whether user consented to data collection
            
        Returns:
            data_id: ID of stored training example
        """
        
        if not user_opted_in:
            return None
        
        # Extract features from source
        source_features = self.feature_extractor.extract_all_features(
            source_audio,
            analyze_full=True
        )
        
        # Extract features from reference (if provided)
        ref_features = None
        if reference_audio is not None:
            ref_features = self.feature_extractor.extract_all_features(
                reference_audio,
                analyze_full=False  # Only loudest parts
            )
        
        # Prepare training example
        training_example = {
            'timestamp': datetime.utcnow().isoformat(),
            
            # Source features - loudness
            'source_lufs': source_features['loudness']['lufs'],
            'source_dynamic_range': source_features['loudness']['dynamic_range'],
            'source_peak_db': source_features['loudness']['peak_db'],
            'source_rms_db': source_features['loudness']['rms_db'],
            'source_crest_factor': source_features['loudness']['crest_factor'],
            
            # Source frequency bands
            'source_freq_sub': source_features['frequency']['band_energy']['sub'],
            'source_freq_bass': source_features['frequency']['band_energy']['bass'],
            'source_freq_low_mid': source_features['frequency']['band_energy']['low_mid'],
            'source_freq_mid': source_features['frequency']['band_energy']['mid'],
            'source_freq_high_mid': source_features['frequency']['band_energy']['high_mid'],
            'source_freq_presence': source_features['frequency']['band_energy']['presence'],
            'source_freq_brilliance': source_features['frequency']['band_energy']['brilliance'],
            'source_freq_air': source_features['frequency']['band_energy']['air'],
            
            # Source spectral features
            'source_spectral_centroid': source_features['frequency']['spectral_centroid'],
            'source_spectral_rolloff': source_features['frequency']['spectral_rolloff'],
            'source_spectral_flatness': source_features['spectral']['spectral_flatness'],
            
            # Source stereo
            'source_stereo_width': source_features.get('stereo', {}).get('stereo_width', 1.0),
            'source_correlation': source_features.get('stereo', {}).get('correlation', 1.0),
            'source_side_energy': source_features.get('stereo', {}).get('side_energy', 0.0),
            
            # Source transients
            'source_transient_density': source_features['transients']['transient_density'],
            'source_attack_ms': source_features['transients']['average_attack_ms'],
            'source_onset_strength': source_features['transients']['onset_strength'],
            
            # Source temporal
            'source_zero_crossing_rate': source_features['temporal']['zero_crossing_rate'],
            'source_tempo': source_features['temporal']['tempo'],
            
            # Processing applied
            'preset_used': preset_used,
            'processing_params': json.dumps(processing_params),
            
            # Metadata
            'has_reference': reference_audio is not None,
            'opted_in': user_opted_in,
            'sample_rate': sample_rate,
            'duration_seconds': len(source_audio) / sample_rate
        }
        
        # Add reference features if available
        if ref_features:
            training_example.update({
                'ref_lufs': ref_features['loudness']['lufs'],
                'ref_dynamic_range': ref_features['loudness']['dynamic_range'],
                'ref_peak_db': ref_features['loudness']['peak_db'],
                'ref_rms_db': ref_features['loudness']['rms_db'],
                'ref_crest_factor': ref_features['loudness']['crest_factor'],
                
                # Reference frequency bands
                'ref_freq_sub': ref_features['frequency']['band_energy']['sub'],
                'ref_freq_bass': ref_features['frequency']['band_energy']['bass'],
                'ref_freq_low_mid': ref_features['frequency']['band_energy']['low_mid'],
                'ref_freq_mid': ref_features['frequency']['band_energy']['mid'],
                'ref_freq_high_mid': ref_features['frequency']['band_energy']['high_mid'],
                'ref_freq_presence': ref_features['frequency']['band_energy']['presence'],
                'ref_freq_brilliance': ref_features['frequency']['band_energy']['brilliance'],
                'ref_freq_air': ref_features['frequency']['band_energy']['air'],
                
                # Reference spectral
                'ref_spectral_centroid': ref_features['frequency']['spectral_centroid'],
                'ref_spectral_rolloff': ref_features['frequency']['spectral_rolloff'],
                'ref_spectral_flatness': ref_features['spectral']['spectral_flatness'],
                
                # Reference stereo
                'ref_stereo_width': ref_features.get('stereo', {}).get('stereo_width', 1.0),
                'ref_correlation': ref_features.get('stereo', {}).get('correlation', 1.0),
                'ref_side_energy': ref_features.get('stereo', {}).get('side_energy', 0.0),
                
                # Reference transients
                'ref_transient_density': ref_features['transients']['transient_density'],
                'ref_attack_ms': ref_features['transients']['average_attack_ms'],
                'ref_onset_strength': ref_features['transients']['onset_strength'],
                
                # Reference temporal
                'ref_zero_crossing_rate': ref_features['temporal']['zero_crossing_rate'],
                'ref_tempo': ref_features['temporal']['tempo'],
            })
        
        # Store in database
        data_id = self._store_training_example(training_example)
        
        print(f"✅ Training data collected: {data_id}")
        print(f"   Source LUFS: {training_example['source_lufs']:.2f}")
        if ref_features:
            print(f"   Reference LUFS: {training_example['ref_lufs']:.2f}")
        
        return data_id
    
    def add_user_feedback(
        self,
        data_id: str,
        rating: int,
        feedback_text: Optional[str] = None
    ):
        """
        Add user feedback to a training example
        
        Args:
            data_id: ID of training example
            rating: 1-5 stars
            feedback_text: Optional text feedback
        """
        
        if not (1 <= rating <= 5):
            raise ValueError("Rating must be between 1 and 5")
        
        self.db.update_training_example(
            data_id,
            {'user_rating': rating, 'feedback_text': feedback_text}
        )
        
        print(f"✅ User feedback added: {rating} stars")
    
    def _store_training_example(self, example: Dict) -> str:
        """Store training example in database"""
        return self.db.insert_training_example(example)
    
    def get_training_dataset(
        self,
        min_rating: int = 3,
        has_reference_only: bool = False,
        limit: Optional[int] = None
    ) -> list:
        """
        Retrieve training dataset
        
        Args:
            min_rating: Minimum user rating (if rated)
            has_reference_only: Only get examples with reference tracks
            limit: Maximum number of examples to return
            
        Returns:
            List of training examples
        """
        
        query = "SELECT * FROM training_data WHERE opted_in = TRUE"
        
        if min_rating > 0:
            query += f" AND (user_rating >= {min_rating} OR user_rating IS NULL)"
        
        if has_reference_only:
            query += " AND has_reference = TRUE"
        
        query += " ORDER BY timestamp DESC"
        
        if limit:
            query += f" LIMIT {limit}"
        
        return self.db.execute_query(query)
    
    def get_dataset_stats(self) -> Dict:
        """Get statistics about collected data"""
        
        stats = {
            'total_examples': self.db.count('training_data'),
            'with_reference': self.db.count('training_data', 'has_reference = TRUE'),
            'with_rating': self.db.count('training_data', 'user_rating IS NOT NULL'),
            'average_rating': self.db.average('training_data', 'user_rating'),
            'by_preset': self.db.group_count('training_data', 'preset_used')
        }
        
        return stats


# Simple in-memory database for development
class InMemoryDatabase:
    """
    Simple in-memory database for development
    Replace with PostgreSQL/MongoDB in production
    """
    
    def __init__(self):
        self.data = []
        self.counter = 0
    
    def insert_training_example(self, example: Dict) -> str:
        """Insert training example"""
        self.counter += 1
        data_id = f"train_{self.counter:06d}"
        example['id'] = data_id
        self.data.append(example)
        return data_id
    
    def update_training_example(self, data_id: str, updates: Dict):
        """Update training example"""
        for item in self.data:
            if item['id'] == data_id:
                item.update(updates)
                break
    
    def execute_query(self, query: str) -> list:
        """Execute query (simplified)"""
        # For development, just return all data
        return self.data.copy()
    
    def count(self, table: str, condition: str = None) -> int:
        """Count records"""
        if condition == 'has_reference = TRUE':
            return len([d for d in self.data if d.get('has_reference')])
        elif condition == 'user_rating IS NOT NULL':
            return len([d for d in self.data if d.get('user_rating') is not None])
        return len(self.data)
    
    def average(self, table: str, column: str) -> float:
        """Calculate average"""
        values = [d.get(column) for d in self.data if d.get(column) is not None]
        return sum(values) / len(values) if values else 0.0
    
    def group_count(self, table: str, column: str) -> Dict:
        """Group by and count"""
        counts = {}
        for item in self.data:
            key = item.get(column, 'unknown')
            counts[key] = counts.get(key, 0) + 1
        return counts

"""
Model Deployment and Inference
Load trained model and make predictions
"""

import numpy as np
from typing import Dict, Optional
import json
from pathlib import Path

from model import MasteringModel
from feature_extractor import FeatureExtractor


class MasteringPredictor:
    """
    Production inference class for mastering predictions
    """
    
    def __init__(self, model_path: str = 'trained_model_latest.keras'):
        """
        Initialize predictor
        
        Args:
            model_path: Path to trained model
        """
        
        self.model = MasteringModel()
        self.feature_extractor = FeatureExtractor()
        
        # Load model if exists
        if Path(model_path).exists():
            self.model.load_model(model_path)
            print(f"✅ Model loaded from {model_path}")
        else:
            print(f"⚠️  No model found at {model_path}")
            print("   Using default presets until model is trained.")
            self.model = None
    
    def predict_mastering_params(
        self,
        source_audio: np.ndarray,
        reference_audio: Optional[np.ndarray] = None,
        sample_rate: int = 44100
    ) -> Dict:
        """
        Predict optimal mastering parameters
        
        Args:
            source_audio: User's audio to master
            reference_audio: Reference track (optional)
            sample_rate: Sample rate
            
        Returns:
            Dictionary of predicted mastering parameters
        """
        
        # If no model trained yet, return default preset
        if self.model is None or self.model.model is None:
            return self._get_default_preset()
        
        # Extract features
        print("🔍 Extracting features...")
        source_features = self.feature_extractor.extract_all_features(
            source_audio,
            analyze_full=True
        )
        
        ref_features = None
        if reference_audio is not None:
            ref_features = self.feature_extractor.extract_all_features(
                reference_audio,
                analyze_full=False
            )
        
        # Prepare input vector
        input_vector = self._prepare_input_vector(source_features, ref_features)
        
        # Reshape for model (batch size of 1)
        X = input_vector.reshape(1, -1)
        
        # Make prediction
        print("🤖 Making prediction...")
        predictions = self.model.predict(X)
        
        # Convert to mastering parameters
        params = self._predictions_to_params(predictions)
        
        print("✅ Prediction complete!")
        return params
    
    def _prepare_input_vector(
        self,
        source_features: Dict,
        ref_features: Optional[Dict]
    ) -> np.ndarray:
        """Prepare input vector from features"""
        
        vector = []
        
        # Source features (16)
        vector.extend([
            source_features['loudness']['lufs'],
            source_features['loudness']['dynamic_range'],
            source_features['loudness']['peak_db'],
            source_features['loudness']['rms_db'],
            source_features['frequency']['band_energy']['sub'],
            source_features['frequency']['band_energy']['bass'],
            source_features['frequency']['band_energy']['low_mid'],
            source_features['frequency']['band_energy']['mid'],
            source_features['frequency']['band_energy']['high_mid'],
            source_features['frequency']['band_energy']['presence'],
            source_features['frequency']['band_energy']['brilliance'],
            source_features['frequency']['band_energy']['air'],
            source_features.get('stereo', {}).get('stereo_width', 1.0),
            source_features.get('stereo', {}).get('correlation', 1.0),
            source_features['transients']['transient_density'],
            source_features['transients']['average_attack_ms']
        ])
        
        # Reference deltas (14)
        if ref_features:
            vector.extend([
                ref_features['loudness']['lufs'] - source_features['loudness']['lufs'],
                ref_features['loudness']['dynamic_range'] - source_features['loudness']['dynamic_range'],
                ref_features['loudness']['peak_db'] - source_features['loudness']['peak_db'],
                ref_features['loudness']['rms_db'] - source_features['loudness']['rms_db'],
                ref_features['frequency']['band_energy']['sub'] - source_features['frequency']['band_energy']['sub'],
                ref_features['frequency']['band_energy']['bass'] - source_features['frequency']['band_energy']['bass'],
                ref_features['frequency']['band_energy']['low_mid'] - source_features['frequency']['band_energy']['low_mid'],
                ref_features['frequency']['band_energy']['mid'] - source_features['frequency']['band_energy']['mid'],
                ref_features['frequency']['band_energy']['high_mid'] - source_features['frequency']['band_energy']['high_mid'],
                ref_features['frequency']['band_energy']['presence'] - source_features['frequency']['band_energy']['presence'],
                ref_features['frequency']['band_energy']['brilliance'] - source_features['frequency']['band_energy']['brilliance'],
                ref_features['frequency']['band_energy']['air'] - source_features['frequency']['band_energy']['air'],
                ref_features.get('stereo', {}).get('stereo_width', 1.0) - source_features.get('stereo', {}).get('stereo_width', 1.0),
                ref_features.get('stereo', {}).get('correlation', 1.0) - source_features.get('stereo', {}).get('correlation', 1.0),
            ])
        else:
            vector.extend([0] * 14)
        
        return np.array(vector, dtype=np.float32)
    
    def _predictions_to_params(self, predictions: Dict) -> Dict:
        """Convert model predictions to mastering parameters"""
        
        # EQ (map 20 bands to 8 frequency bands)
        eq_20 = predictions['eq'][0]  # Shape: (20,)
        
        # Average groups of bands
        eq_params = {
            'sub': float(np.mean(eq_20[0:2])),
            'bass': float(np.mean(eq_20[2:5])),
            'low_mid': float(np.mean(eq_20[5:8])),
            'mid': float(np.mean(eq_20[8:11])),
            'high_mid': float(np.mean(eq_20[11:14])),
            'presence': float(np.mean(eq_20[14:16])),
            'brilliance': float(np.mean(eq_20[16:18])),
            'air': float(np.mean(eq_20[18:20]))
        }
        
        # Compression
        comp_pred = predictions['compression'][0]
        compression_params = {
            'threshold': float(comp_pred[0]),
            'ratio': float(comp_pred[1]),
            'attack': float(comp_pred[2]),
            'release': float(comp_pred[3])
        }
        
        # Limiting
        lim_pred = predictions['limiting'][0]
        limiting_params = {
            'threshold': float(lim_pred[0]),
            'ceiling': float(lim_pred[1])
        }
        
        # Stereo
        stereo_pred = predictions['stereo'][0]
        stereo_params = {
            'width': float(stereo_pred[0]),
            'correlation_target': float(stereo_pred[1]),
            'side_gain': float(stereo_pred[2])
        }
        
        # Loudness
        target_lufs = float(predictions['loudness'][0][0])
        
        # Combine all parameters
        mastering_params = {
            'eq': eq_params,
            'compression': compression_params,
            'limiting': limiting_params,
            'stereo': stereo_params,
            'target_lufs': target_lufs,
            'preset_name': 'AI-Generated',
            'description': 'Custom parameters predicted by ML model'
        }
        
        return mastering_params
    
    def _get_default_preset(self) -> Dict:
        """Return default preset when no model is available"""
        
        return {
            'eq': {
                'sub': 0.0,
                'bass': 1.0,
                'low_mid': 0.0,
                'mid': 0.5,
                'high_mid': 0.0,
                'presence': 1.0,
                'brilliance': 0.5,
                'air': 1.0
            },
            'compression': {
                'threshold': -20.0,
                'ratio': 3.0,
                'attack': 10.0,
                'release': 100.0
            },
            'limiting': {
                'threshold': -1.0,
                'ceiling': -0.1
            },
            'stereo': {
                'width': 1.0,
                'correlation_target': 0.8,
                'side_gain': 1.0
            },
            'target_lufs': -14.0,
            'preset_name': 'Default',
            'description': 'Default preset (no ML model trained yet)'
        }
    
    def recommend_preset(
        self,
        source_audio: np.ndarray,
        reference_audio: Optional[np.ndarray] = None,
        available_presets: list = None
    ) -> str:
        """
        Recommend best preset from available presets
        
        Args:
            source_audio: User's audio
            reference_audio: Reference track (optional)
            available_presets: List of preset names
            
        Returns:
            Recommended preset name
        """
        
        if available_presets is None:
            available_presets = [
                'balanced',
                'bright',
                'warm',
                'punchy',
                'transparent',
                'loud',
                'vintage',
                'modern'
            ]
        
        # Extract features
        source_features = self.feature_extractor.extract_all_features(source_audio)
        
        # Simple heuristic-based recommendation
        # (This will be replaced with ML-based recommendation later)
        
        lufs = source_features['loudness']['lufs']
        dynamic_range = source_features['loudness']['dynamic_range']
        
        bands = source_features['frequency']['band_energy']
        bass_energy = bands['bass']
        high_energy = bands['brilliance']
        
        # Decision tree
        if reference_audio is not None:
            # If user provides reference, use "balanced" for matching
            return 'balanced'
        elif lufs > -10:
            # Already loud
            return 'transparent'
        elif bass_energy < -20:
            # Weak bass
            return 'warm'
        elif high_energy < -20:
            # Weak highs
            return 'bright'
        elif dynamic_range < 6:
            # Already compressed
            return 'transparent'
        elif dynamic_range > 15:
            # Very dynamic
            return 'punchy'
        else:
            # Default
            return 'balanced'
    
    def explain_prediction(self, params: Dict) -> str:
        """
        Generate human-readable explanation of predictions
        
        Args:
            params: Predicted mastering parameters
            
        Returns:
            Explanation string
        """
        
        explanation = []
        
        # EQ analysis
        eq = params['eq']
        eq_changes = []
        
        if eq['bass'] > 2.0:
            eq_changes.append("boosting bass for more warmth")
        elif eq['bass'] < -2.0:
            eq_changes.append("reducing bass to clean up low end")
        
        if eq['mid'] > 2.0:
            eq_changes.append("enhancing mids for presence")
        elif eq['mid'] < -2.0:
            eq_changes.append("reducing mids to avoid muddiness")
        
        if eq['brilliance'] > 2.0:
            eq_changes.append("adding high-end sparkle")
        elif eq['brilliance'] < -2.0:
            eq_changes.append("taming harsh highs")
        
        if eq_changes:
            explanation.append("EQ: " + ", ".join(eq_changes))
        
        # Compression analysis
        comp = params['compression']
        ratio = comp['ratio']
        
        if ratio > 6:
            explanation.append("Compression: Heavy (for tight, controlled sound)")
        elif ratio > 3:
            explanation.append("Compression: Moderate (for balance)")
        else:
            explanation.append("Compression: Light (preserving dynamics)")
        
        # Loudness analysis
        target_lufs = params['target_lufs']
        
        if target_lufs > -10:
            explanation.append("Loudness: Competitive streaming level")
        elif target_lufs > -14:
            explanation.append("Loudness: Standard mastering level")
        else:
            explanation.append("Loudness: Dynamic, audiophile level")
        
        return " | ".join(explanation)


# Example usage
if __name__ == "__main__":
    import librosa
    
    # Initialize predictor
    predictor = MasteringPredictor()
    
    # Load example audio
    print("📂 Loading audio...")
    audio, sr = librosa.load('example.wav', sr=44100, mono=False)
    
    # Make prediction
    print("\n🎯 Predicting mastering parameters...")
    params = predictor.predict_mastering_params(audio, sample_rate=sr)
    
    # Print results
    print("\n📊 Predicted Parameters:")
    print(json.dumps(params, indent=2))
    
    # Get explanation
    print("\n📝 Explanation:")
    print(predictor.explain_prediction(params))
    
    # Recommend preset
    print("\n💡 Recommended Preset:")
    preset = predictor.recommend_preset(audio)
    print(f"   {preset}")

import numpy as np
import soundfile as sf
from pathlib import Path
from typing import Dict, Optional
import sys

# Add ml-training directory to Python path
ml_training_path = Path(__file__).parent.parent.parent.parent / 'ml-training'
sys.path.append(str(ml_training_path))

# Attempt to import ML components
try:
    from predictor import MasteringPredictor
    from feature_extractor import FeatureExtractor
    ML_AVAILABLE = True
except ImportError as e:
    print(f"Warning: ML components not found. AI features will be disabled. Error: {e}")
    ML_AVAILABLE = False

from app.mastering.processor import AudioProcessor

class IntelligentMasteringEngine:
    """
    Applies mastering using AI predictions or advanced presets.
    This class was recreated by Cascade based on project structure.
    """
    def __init__(self):
        if ML_AVAILABLE:
            self.predictor = MasteringPredictor()
        else:
            self.predictor = None
        self.processor = AudioProcessor()

    def master_with_reference(self, source_path: str, reference_path: str, output_path: str, preset_name: str, strength: float) -> Dict:
        if not self.predictor:
            raise RuntimeError("ML model is not available for reference mastering.")

        source_audio, sr = self.processor.load_audio(source_path)
        ref_audio, _ = self.processor.load_audio(reference_path)

        # Predict parameters using the ML model
        predicted_params = self.predictor.predict_mastering_params(source_audio, ref_audio)
        
        # Apply the predicted parameters
        mastered_audio = self.processor.apply_mastering_chain(source_audio, predicted_params)

        self.processor.save_audio(mastered_audio, output_path, sr)
        return {"status": "completed", "engine": "intelligent_reference"}

    def master_with_preset_only(self, source_path: str, output_path: str, preset_name: str) -> Dict:
        source_audio, sr = self.processor.load_audio(source_path)

        if self.predictor and self.predictor.model:
            # Use the model to predict based on source audio only
            predicted_params = self.predictor.predict_mastering_params(source_audio)
            mastered_audio = self.processor.apply_mastering_chain(source_audio, predicted_params)
            engine = "intelligent_preset"
        else:
            # Fallback to simple preset-based processing
            mastered_audio = self.processor.process_with_preset(source_path, output_path, preset_name)
            engine = "standard_preset"

        self.processor.save_audio(mastered_audio, output_path, sr)
        return {"status": "completed", "engine": engine}

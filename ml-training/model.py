"""
Neural Network Model for Audio Mastering
Multi-head architecture predicting EQ, compression, limiting, stereo, and loudness
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, Model
from typing import Dict, List, Tuple
import json


class MasteringModel:
    """
    Neural network for predicting mastering parameters
    """
    
    def __init__(
        self,
        input_dim: int = 30,
        hidden_dims: List[int] = [512, 256, 128]
    ):
        """
        Initialize model
        
        Args:
            input_dim: Number of input features
            hidden_dims: Hidden layer dimensions
        """
        
        self.input_dim = input_dim
        self.hidden_dims = hidden_dims
        self.model = None
        
        # Output dimensions
        self.output_dims = {
            'eq': 20,  # 20-band EQ adjustments
            'compression': 4,  # threshold, ratio, attack, release
            'limiting': 2,  # threshold, ceiling
            'stereo': 3,  # width, correlation, side_gain
            'loudness': 1  # target LUFS
        }
    
    def build_model(self) -> Model:
        """Build multi-head neural network"""
        
        # Input layer
        inputs = layers.Input(shape=(self.input_dim,), name='input_features')
        
        # Shared hidden layers
        x = inputs
        for i, dim in enumerate(self.hidden_dims):
            x = layers.Dense(
                dim,
                activation='relu',
                kernel_regularizer=keras.regularizers.l2(0.001),
                name=f'hidden_{i+1}'
            )(x)
            x = layers.Dropout(0.3, name=f'dropout_{i+1}')(x)
        
        # Multi-head outputs
        outputs = {}
        
        # EQ head (20 bands, -12 to +12 dB)
        eq_output = layers.Dense(
            self.output_dims['eq'],
            activation='tanh',
            name='eq_head'
        )(x)
        # Scale to [-12, 12] range
        outputs['eq'] = layers.Lambda(
            lambda x: x * 12.0,
            name='eq_output'
        )(eq_output)
        
        # Compression head
        compression_output = layers.Dense(
            self.output_dims['compression'],
            activation='sigmoid',
            name='compression_head'
        )(x)
        # Scale to reasonable ranges
        # threshold: [-40, 0], ratio: [1, 10], attack: [1, 50]ms, release: [50, 500]ms
        outputs['compression'] = layers.Lambda(
            lambda x: tf.stack([
                x[:, 0] * -40.0,  # threshold
                1.0 + x[:, 1] * 9.0,  # ratio
                1.0 + x[:, 2] * 49.0,  # attack
                50.0 + x[:, 3] * 450.0  # release
            ], axis=1),
            name='compression_output'
        )(compression_output)
        
        # Limiting head
        limiting_output = layers.Dense(
            self.output_dims['limiting'],
            activation='sigmoid',
            name='limiting_head'
        )(x)
        # threshold: [-10, 0], ceiling: [-1, 0]
        outputs['limiting'] = layers.Lambda(
            lambda x: tf.stack([
                x[:, 0] * -10.0,  # threshold
                x[:, 1] * -1.0  # ceiling
            ], axis=1),
            name='limiting_output'
        )(limiting_output)
        
        # Stereo head
        stereo_output = layers.Dense(
            self.output_dims['stereo'],
            activation='sigmoid',
            name='stereo_head'
        )(x)
        # width: [0.5, 1.5], correlation: [0, 1], side_gain: [0.5, 1.5]
        outputs['stereo'] = layers.Lambda(
            lambda x: tf.stack([
                0.5 + x[:, 0] * 1.0,  # width
                x[:, 1],  # correlation
                0.5 + x[:, 2] * 1.0  # side_gain
            ], axis=1),
            name='stereo_output'
        )(stereo_output)
        
        # Loudness head (target LUFS: -16 to -8)
        loudness_output = layers.Dense(
            self.output_dims['loudness'],
            activation='sigmoid',
            name='loudness_head'
        )(x)
        outputs['loudness'] = layers.Lambda(
            lambda x: -16.0 + x * 8.0,
            name='loudness_output'
        )(loudness_output)
        
        # Create model
        model = Model(inputs=inputs, outputs=outputs, name='mastering_model')
        
        self.model = model
        return model
    
    def compile_model(
        self,
        learning_rate: float = 0.001,
        loss_weights: Dict[str, float] = None
    ):
        """
        Compile model with optimizer and losses
        
        Args:
            learning_rate: Learning rate for Adam optimizer
            loss_weights: Weights for each output loss
        """
        
        if self.model is None:
            self.build_model()
        
        # Default loss weights
        if loss_weights is None:
            loss_weights = {
                'eq_output': 1.0,
                'compression_output': 1.0,
                'limiting_output': 1.0,
                'stereo_output': 0.5,
                'loudness_output': 2.0  # Higher weight for loudness
            }
        
        # Compile
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=learning_rate),
            loss={
                'eq_output': 'mse',
                'compression_output': 'mse',
                'limiting_output': 'mse',
                'stereo_output': 'mse',
                'loudness_output': 'mse'
            },
            loss_weights=loss_weights,
            metrics=['mae']
        )
    
    def train(
        self,
        X_train: np.ndarray,
        y_train: Dict[str, np.ndarray],
        X_val: np.ndarray = None,
        y_val: Dict[str, np.ndarray] = None,
        epochs: int = 100,
        batch_size: int = 32,
        callbacks: List = None
    ):
        """
        Train the model
        
        Args:
            X_train: Training features
            y_train: Training targets (dict of arrays)
            X_val: Validation features
            y_val: Validation targets
            epochs: Number of epochs
            batch_size: Batch size
            callbacks: Keras callbacks
            
        Returns:
            Training history
        """
        
        if self.model is None:
            raise ValueError("Model not compiled. Call compile_model() first.")
        
        # Default callbacks
        if callbacks is None:
            callbacks = [
                keras.callbacks.EarlyStopping(
                    monitor='val_loss',
                    patience=15,
                    restore_best_weights=True
                ),
                keras.callbacks.ReduceLROnPlateau(
                    monitor='val_loss',
                    factor=0.5,
                    patience=5,
                    min_lr=1e-6
                )
            ]
        
        # Prepare validation data
        validation_data = None
        if X_val is not None and y_val is not None:
            validation_data = (X_val, y_val)
        
        # Train
        history = self.model.fit(
            X_train,
            y_train,
            validation_data=validation_data,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def predict(self, X: np.ndarray) -> Dict[str, np.ndarray]:
        """
        Predict mastering parameters
        
        Args:
            X: Input features
            
        Returns:
            Dictionary of predictions
        """
        
        if self.model is None:
            raise ValueError("Model not built or loaded.")
        
        predictions = self.model.predict(X, verbose=0)
        
        return predictions
    
    def save_model(self, filepath: str):
        """Save model to disk"""
        if self.model is None:
            raise ValueError("No model to save.")
        
        self.model.save(filepath)
        print(f"✅ Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """Load model from disk"""
        self.model = keras.models.load_model(filepath)
        print(f"✅ Model loaded from {filepath}")
    
    def prepare_training_data(
        self,
        training_examples: List[Dict]
    ) -> Tuple[np.ndarray, Dict[str, np.ndarray]]:
        """
        Prepare training data from collected examples
        
        Args:
            training_examples: List of training examples from database
            
        Returns:
            X: Input features
            y: Target outputs (dict)
        """
        
        X = []
        y = {key: [] for key in ['eq', 'compression', 'limiting', 'stereo', 'loudness']}
        
        for example in training_examples:
            # Extract input features
            input_features = self._extract_input_features(example)
            X.append(input_features)
            
            # Extract target outputs from processing params
            targets = self._extract_targets(example)
            for key in y.keys():
                y[key].append(targets[key])
        
        # Convert to numpy arrays
        X = np.array(X, dtype=np.float32)
        for key in y.keys():
            y[key] = np.array(y[key], dtype=np.float32)
        
        return X, y
    
    def _extract_input_features(self, example: Dict) -> np.ndarray:
        """Extract input features from training example"""
        
        features = []
        
        # Source features (16 features)
        features.extend([
            example.get('source_lufs', 0),
            example.get('source_dynamic_range', 0),
            example.get('source_peak_db', 0),
            example.get('source_rms_db', 0),
            example.get('source_freq_sub', 0),
            example.get('source_freq_bass', 0),
            example.get('source_freq_low_mid', 0),
            example.get('source_freq_mid', 0),
            example.get('source_freq_high_mid', 0),
            example.get('source_freq_presence', 0),
            example.get('source_freq_brilliance', 0),
            example.get('source_freq_air', 0),
            example.get('source_stereo_width', 1.0),
            example.get('source_correlation', 1.0),
            example.get('source_transient_density', 0),
            example.get('source_attack_ms', 0)
        ])
        
        # Reference deltas (14 features) - if available
        if example.get('has_reference'):
            features.extend([
                example.get('ref_lufs', 0) - example.get('source_lufs', 0),
                example.get('ref_dynamic_range', 0) - example.get('source_dynamic_range', 0),
                example.get('ref_peak_db', 0) - example.get('source_peak_db', 0),
                example.get('ref_rms_db', 0) - example.get('source_rms_db', 0),
                example.get('ref_freq_sub', 0) - example.get('source_freq_sub', 0),
                example.get('ref_freq_bass', 0) - example.get('source_freq_bass', 0),
                example.get('ref_freq_low_mid', 0) - example.get('source_freq_low_mid', 0),
                example.get('ref_freq_mid', 0) - example.get('source_freq_mid', 0),
                example.get('ref_freq_high_mid', 0) - example.get('source_freq_high_mid', 0),
                example.get('ref_freq_presence', 0) - example.get('source_freq_presence', 0),
                example.get('ref_freq_brilliance', 0) - example.get('source_freq_brilliance', 0),
                example.get('ref_freq_air', 0) - example.get('source_freq_air', 0),
                example.get('ref_stereo_width', 1.0) - example.get('source_stereo_width', 1.0),
                example.get('ref_correlation', 1.0) - example.get('source_correlation', 1.0),
            ])
        else:
            features.extend([0] * 14)  # Zeros if no reference
        
        return np.array(features, dtype=np.float32)
    
    def _extract_targets(self, example: Dict) -> Dict[str, np.ndarray]:
        """Extract target outputs from processing params"""
        
        # Parse processing params
        params = json.loads(example.get('processing_params', '{}'))
        
        # EQ (20 bands) - simplified, using 8 bands repeated
        eq_gains = []
        for band in ['sub', 'bass', 'low_mid', 'mid', 'high_mid', 'presence', 'brilliance', 'air']:
            gain = params.get('eq', {}).get(band, 0.0)
            eq_gains.extend([gain] * 2 + [gain / 2])  # Spread to 20 bands
        eq = np.array(eq_gains[:20], dtype=np.float32)
        
        # Compression
        comp = params.get('compression', {})
        compression = np.array([
            comp.get('threshold', -20.0),
            comp.get('ratio', 3.0),
            comp.get('attack', 10.0),
            comp.get('release', 100.0)
        ], dtype=np.float32)
        
        # Limiting
        lim = params.get('limiting', {})
        limiting = np.array([
            lim.get('threshold', -1.0),
            lim.get('ceiling', -0.1)
        ], dtype=np.float32)
        
        # Stereo
        stereo_params = params.get('stereo', {})
        stereo = np.array([
            stereo_params.get('width', 1.0),
            example.get('source_correlation', 1.0),
            stereo_params.get('side_gain', 1.0)
        ], dtype=np.float32)
        
        # Loudness (target LUFS)
        loudness = np.array([
            params.get('target_lufs', -14.0)
        ], dtype=np.float32)
        
        return {
            'eq': eq,
            'compression': compression,
            'limiting': limiting,
            'stereo': stereo,
            'loudness': loudness
        }
    
    def get_model_summary(self) -> str:
        """Get model architecture summary"""
        if self.model is None:
            return "Model not built yet."
        
        from io import StringIO
        import sys
        
        stream = StringIO()
        self.model.summary(print_fn=lambda x: stream.write(x + '\n'))
        return stream.getvalue()

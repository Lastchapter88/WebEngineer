"""
Training Script
Run this weekly to retrain the model with new data
"""

import numpy as np
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
from datetime import datetime
import os

from data_collector import DataCollector, InMemoryDatabase
from model import MasteringModel


def train_model(
    min_examples: int = 100,
    test_size: float = 0.2,
    epochs: int = 100,
    save_plots: bool = True
):
    """
    Train the mastering model
    
    Args:
        min_examples: Minimum training examples needed
        test_size: Fraction of data for validation
        epochs: Training epochs
        save_plots: Whether to save training plots
    """
    
    print("="*60)
    print("🤖 AIMSTR ML TRAINING PIPELINE")
    print("="*60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Initialize data collector
    db = InMemoryDatabase()  # Replace with real DB in production
    collector = DataCollector(db)
    
    # Get training data
    print("\n📊 Fetching training data...")
    training_data = collector.get_training_dataset(
        min_rating=3,  # Only use 3+ star ratings
        has_reference_only=False,  # Use all data
        limit=None
    )
    
    if len(training_data) < min_examples:
        print(f"\n❌ Not enough training data!")
        print(f"   Need: {min_examples}")
        print(f"   Have: {len(training_data)}")
        print(f"   Come back when you have more uploads!")
        return None
    
    print(f"✅ Found {len(training_data)} training examples")
    
    # Get statistics
    stats = collector.get_dataset_stats()
    print(f"\n📈 Dataset Statistics:")
    print(f"   Total examples: {stats['total_examples']}")
    print(f"   With reference: {stats['with_reference']}")
    print(f"   With rating: {stats['with_rating']}")
    print(f"   Average rating: {stats['average_rating']:.2f}")
    print(f"   By preset:")
    for preset, count in stats['by_preset'].items():
        print(f"      {preset}: {count}")
    
    # Initialize model
    print("\n🏗️  Building neural network...")
    model = MasteringModel(
        input_dim=30,  # 16 source features + 14 delta features
        hidden_dims=[512, 256, 128]
    )
    
    model.compile_model(learning_rate=0.001)
    print(f"✅ Model built: {model.model.count_params():,} parameters")
    
    # Print model summary
    print("\n📐 Model Architecture:")
    print(model.get_model_summary())
    
    # Prepare data
    print("\n🔧 Preparing training data...")
    X, y = model.prepare_training_data(training_data)
    
    print(f"   Input shape: {X.shape}")
    print(f"   Output shapes:")
    for key, values in y.items():
        print(f"      {key}: {values.shape}")
    
    # Split data
    print(f"\n✂️  Splitting data ({int((1-test_size)*100)}% train, {int(test_size*100)}% validation)...")
    
    # Split X
    X_train, X_val = train_test_split(X, test_size=test_size, random_state=42)
    
    # Split each y output
    y_train = {}
    y_val = {}
    for key in y.keys():
        y_train[key], y_val[key] = train_test_split(
            y[key], 
            test_size=test_size, 
            random_state=42
        )
    
    print(f"   Training examples: {len(X_train)}")
    print(f"   Validation examples: {len(X_val)}")
    
    # Train model
    print(f"\n🚀 Training model for {epochs} epochs...")
    print("   (This may take a while...)\n")
    
    history = model.train(
        X_train, y_train,
        X_val, y_val,
        epochs=epochs,
        batch_size=32
    )
    
    # Evaluate
    print("\n📊 Training Results:")
    final_loss = history.history['loss'][-1]
    final_val_loss = history.history['val_loss'][-1]
    
    print(f"   Final training loss: {final_loss:.4f}")
    print(f"   Final validation loss: {final_val_loss:.4f}")
    
    # Check overfitting
    overfitting_ratio = final_val_loss / final_loss
    if overfitting_ratio > 1.5:
        print(f"   ⚠️  Warning: Model may be overfitting (ratio: {overfitting_ratio:.2f})")
    else:
        print(f"   ✅ Model looks good! (ratio: {overfitting_ratio:.2f})")
    
    # Per-output performance
    print(f"\n📈 Per-Output Performance:")
    for output_name in ['eq', 'compression', 'limiting', 'stereo', 'loudness']:
        train_loss = history.history[f'{output_name}_output_loss'][-1]
        val_loss = history.history[f'val_{output_name}_output_loss'][-1]
        print(f"   {output_name}:")
        print(f"      Train: {train_loss:.4f} | Val: {val_loss:.4f}")
    
    # Save model
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    model_path = f'trained_model_{timestamp}.keras'
    model.save_model(model_path)
    
    # Also save as latest
    model.save_model('trained_model_latest.keras')
    
    # Save training plots
    if save_plots:
        print("\n📊 Generating training plots...")
        plot_training_history(history, timestamp)
    
    # Final summary
    print("\n" + "="*60)
    print("✅ TRAINING COMPLETE!")
    print("="*60)
    print(f"   Model saved to: {model_path}")
    print(f"   Training examples: {len(X_train)}")
    print(f"   Validation loss: {final_val_loss:.4f}")
    print(f"   Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    return model, history


def plot_training_history(history, timestamp: str):
    """
    Plot and save training history
    
    Args:
        history: Keras training history
        timestamp: Timestamp for filename
    """
    
    # Create plots directory
    os.makedirs('training_plots', exist_ok=True)
    
    # 1. Overall Loss Plot
    plt.figure(figsize=(12, 6))
    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'], label='Training Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Overall Model Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # 2. Per-Output Loss Plot
    plt.subplot(1, 2, 2)
    outputs = ['eq', 'compression', 'limiting', 'stereo', 'loudness']
    for output in outputs:
        val_loss_key = f'val_{output}_output_loss'
        if val_loss_key in history.history:
            plt.plot(history.history[val_loss_key], label=output)
    plt.title('Validation Loss per Output')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(f'training_plots/training_history_{timestamp}.png', dpi=150)
    plt.close()
    
    print(f"   ✅ Plot saved to: training_plots/training_history_{timestamp}.png")
    
    # 3. Individual Output Plots
    fig, axes = plt.subplots(2, 3, figsize=(15, 10))
    axes = axes.flatten()
    
    for idx, output in enumerate(outputs):
        train_key = f'{output}_output_loss'
        val_key = f'val_{output}_output_loss'
        
        if train_key in history.history and val_key in history.history:
            axes[idx].plot(history.history[train_key], label='Train', alpha=0.7)
            axes[idx].plot(history.history[val_key], label='Val', alpha=0.7)
            axes[idx].set_title(f'{output.capitalize()} Output')
            axes[idx].set_xlabel('Epoch')
            axes[idx].set_ylabel('Loss')
            axes[idx].legend()
            axes[idx].grid(True, alpha=0.3)
    
    # Remove extra subplot
    fig.delaxes(axes[-1])
    
    plt.tight_layout()
    plt.savefig(f'training_plots/outputs_detail_{timestamp}.png', dpi=150)
    plt.close()
    
    print(f"   ✅ Detail plot saved to: training_plots/outputs_detail_{timestamp}.png")


def evaluate_model(model_path: str = 'trained_model_latest.keras'):
    """
    Evaluate a trained model
    
    Args:
        model_path: Path to saved model
    """
    
    print("\n🔍 Evaluating Model...")
    
    # Load model
    model = MasteringModel()
    model.load_model(model_path)
    
    # Get test data
    db = InMemoryDatabase()
    collector = DataCollector(db)
    test_data = collector.get_training_dataset(limit=100)
    
    if len(test_data) == 0:
        print("❌ No test data available")
        return
    
    # Prepare data
    X_test, y_test = model.prepare_training_data(test_data)
    
    # Evaluate
    results = model.model.evaluate(X_test, y_test, verbose=0)
    
    print(f"\n📊 Test Set Performance:")
    print(f"   Total Loss: {results[0]:.4f}")
    
    # Get predictions
    predictions = model.predict(X_test)
    
    # Calculate per-output metrics
    for output_name in ['eq', 'compression', 'limiting', 'stereo', 'loudness']:
        y_true = y_test[output_name]
        y_pred = predictions[output_name]
        
        mse = np.mean((y_true - y_pred)**2)
        mae = np.mean(np.abs(y_true - y_pred))
        
        print(f"\n   {output_name.capitalize()}:")
        print(f"      MSE: {mse:.4f}")
        print(f"      MAE: {mae:.4f}")


if __name__ == "__main__":
    # Train model
    model, history = train_model(
        min_examples=100,
        test_size=0.2,
        epochs=100,
        save_plots=True
    )
    
    if model is not None:
        # Evaluate
        evaluate_model()

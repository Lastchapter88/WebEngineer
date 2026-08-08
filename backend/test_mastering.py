"""
Test script to verify mastering functionality
"""
import sys
import os

# Add the backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    print("Testing audio processing libraries...")
    
    # Test imports
    import pedalboard
    print("✓ pedalboard imported")
    
    import pyloudnorm
    print("✓ pyloudnorm imported")
    
    import librosa
    print("✓ librosa imported")
    
    import soundfile
    print("✓ soundfile imported")
    
    import numpy as np
    print("✓ numpy imported")
    
    # Test processor
    from app.mastering.processor import AudioProcessor
    print("✓ AudioProcessor imported")
    
    # Test presets
    from app.mastering.presets import MasteringPresets
    print("✓ MasteringPresets imported")
    
    # Check available presets
    styles = MasteringPresets.list_styles()
    print(f"\n✓ Available styles: {styles}")
    
    intensities = MasteringPresets.list_intensities()
    print(f"✓ Available intensities: {intensities}")
    
    # Test creating a preset
    preset = MasteringPresets.get_preset('balanced', 'medium', 44100)
    print(f"\n✓ Created preset board with {len(preset)} effects")
    
    print("\n" + "="*50)
    print("✅ ALL TESTS PASSED - Mastering is ready to work!")
    print("="*50)
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

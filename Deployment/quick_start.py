import subprocess
import sys
import os
import time

def install_missing_packages():
    """Install missing packages"""
    print("🔧 Installing missing dependencies...")
    packages = [
        "tensorflow",
        "opencv-python",
        "pandas", 
        "scikit-learn",
        "joblib"
    ]
    
    for package in packages:
        try:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ {package} installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}: {e}")

def check_models():
    """Check if all models exist"""
    models = {
        "ConvNeXt Model": "../Models/convnext_handwriting_best.keras",
        "MLP Model": "../Models/mlp_dementia_model.h5",
        "Preprocessor": "../Models/preprocessor.pkl", 
        "Meta Model": "../Models/meta_xgb_safe.pkl"
    }
    
    all_exist = True
    for name, path in models.items():
        if os.path.exists(path):
            print(f"✅ {name}: Found")
        else:
            print(f"❌ {name}: Missing ({path})")
            all_exist = False
    
    return all_exist

def start_server():
    """Start the Neuro Trace API server"""
    print("🚀 Starting Neuro Trace API Server...")
    print("   Access at: http://localhost:9000")
    print("   API Docs: http://localhost:9000/docs")
    print("   Sample Data: http://localhost:9000/sample-data/positive")
    print()
    
    try:
        # Change to deployment directory
        deployment_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(deployment_dir)
        
        # Start the server
        subprocess.run([sys.executable, "main.py"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Server failed to start: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    return True

def main():
    print("=" * 50)
    print("🧠 NEURO TRACE - Quick Start")
    print("=" * 50)
    print()
    
    # Check if we're in the right directory
    if not os.path.exists("main.py"):
        print("❌ main.py not found. Make sure you're in the Deployment directory.")
        return
    
    # Check models
    print("🔍 Checking models...")
    if not check_models():
        print("⚠️  Some models are missing, but the server will try to load what's available.")
        print()
    
    # Install dependencies if needed
    try:
        import tensorflow
        import cv2
        import pandas
        import sklearn
        import joblib
        print("✅ All dependencies are installed")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        choice = input("Install missing dependencies? (y/n): ").lower()
        if choice == 'y':
            install_missing_packages()
        else:
            print("⚠️  Server may fail to start without dependencies")
    
    print()
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
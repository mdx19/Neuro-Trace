import os
import sys
import json

def check_models():
    """Check if all required models exist"""
    print("🔍 Checking Model Files...")
    
    models = {
        "ConvNeXt Handwriting Model": "../Models/convnext_handwriting_best.keras",
        "MLP Dementia Model": "../Models/mlp_dementia_model.h5", 
        "Preprocessor": "../Models/preprocessor.pkl",
        "Meta XGB Model": "../Models/meta_xgb_safe.pkl"
    }
    
    all_exist = True
    for name, path in models.items():
        if os.path.exists(path):
            size_mb = os.path.getsize(path) / (1024 * 1024)
            print(f"✅ {name}: {size_mb:.1f} MB")
        else:
            print(f"❌ {name}: Missing ({path})")
            all_exist = False
    
    return all_exist

def check_dependencies():
    """Check if all Python dependencies are available"""
    print("\n📦 Checking Python Dependencies...")
    
    required_packages = [
        "fastapi", "uvicorn", "tensorflow", "opencv-python", 
        "pandas", "numpy", "scikit-learn", "joblib"
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - Not installed")
            missing.append(package)
    
    if missing:
        print(f"\n🔧 To install missing packages:")
        print(f"   pip install {' '.join(missing)}")
    
    return len(missing) == 0

def check_project_structure():
    """Check if project structure is correct"""
    print("\n📁 Checking Project Structure...")
    
    required_files = [
        "main.py",
        "requirements.txt",
        "../Models/",
        "../Datasets/"
    ]
    
    all_exist = True
    for file_path in required_files:
        if os.path.exists(file_path):
            if os.path.isdir(file_path):
                count = len(os.listdir(file_path)) if os.path.exists(file_path) else 0
                print(f"✅ {file_path} ({count} items)")
            else:
                print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} - Missing")
            all_exist = False
    
    return all_exist

def display_system_info():
    """Display system information"""
    print("\n💻 System Information:")
    print(f"   Python Version: {sys.version.split()[0]}")
    print(f"   Current Directory: {os.getcwd()}")
    print(f"   Platform: {sys.platform}")

def main():
    """Run all system checks"""
    print("🚀 Neuro Trace System Check\n")
    
    display_system_info()
    
    models_ok = check_models()
    deps_ok = check_dependencies() 
    structure_ok = check_project_structure()
    
    print("\n📋 Summary:")
    if models_ok and deps_ok and structure_ok:
        print("✅ All systems ready! You can start the API with: python main.py")
    else:
        print("❌ Some issues found. Please resolve them before starting the API.")
        
    print("\n🏆 Competition Ready Features:")
    print("   • Modern UI with glassmorphism effects")
    print("   • ConvNeXt model for better accuracy")
    print("   • Multi-method preprocessing")
    print("   • Sample data for demos")
    print("   • Enhanced error handling")
    print("   • Real-time prediction timing")

if __name__ == "__main__":
    main()
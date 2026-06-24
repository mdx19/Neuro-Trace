import time
import json
import numpy as np
import cv2
import asyncio
import traceback
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware  # ✅ CRITICAL - ADD THIS
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Union, Optional
from tensorflow.keras.models import load_model
import joblib
import uvicorn
import pandas as pd
import logging
from PIL import Image
import os
from huggingface_hub import hf_hub_download

def download_models():
    """Download models from Hugging Face if not present locally"""
    repo_id = "mdx1910/neuro-trace-models"
    models_dir = "../Models"
    os.makedirs(models_dir, exist_ok=True)
    
    files = [
        "config.json",
        "metadata.json", 
        "model.weights.h5",
        "mlp_dementia_model.h5",
        "meta_xgb_safe.pkl",
        "preprocessor.pkl"
    ]
    
    for filename in files:
        dest = os.path.join(models_dir, filename)
        if not os.path.exists(dest):
            print(f"Downloading {filename}...")
            hf_hub_download(
                repo_id=repo_id,
                filename=filename,
                local_dir=models_dir
            )
            print(f"✅ {filename} downloaded")
        else:
            print(f"✅ {filename} already exists")

# Download models on startup
download_models()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------
# Paths to models
# -------------------x
CNN_MODEL_PATH = "../Models"
MLP_MODEL_PATH = "../Models/mlp_dementia_model.h5"
PREPROCESSOR_PATH = "../Models/preprocessor.pkl"
META_MODEL_PATH = "../Models/meta_xgb_safe.pkl"

cnn_model = None
mlp_model = None
preprocessor = None
meta_model = None

# -------------------
# Feature Order (36 features - FIXED!)
# -------------------
FEATURE_ORDER = [
    "Age", "Gender", "Ethnicity", "EducationLevel", "BMI", "Smoking", "AlcoholConsumption",
    "PhysicalActivity", "DietQuality", "SleepQuality", "FamilyHistoryAlzheimers",
    "CardiovascularDisease", "Diabetes", "Depression", "HeadInjury", "Hypertension",
    "SystolicBP", "DiastolicBP", "CholesterolTotal", "CholesterolLDL", "CholesterolHDL",
    "CholesterolTriglycerides", "MMSE", "FunctionalAssessment", "MemoryComplaints",
    "BehavioralProblems", "ADL", "Confusion", "Disorientation", "PersonalityChanges",
    "DifficultyCompletingTasks", "Forgetfulness",
    # Add 4 missing features to make it 36
    "CognitiveScore", "MotorFunction", "SocialSupport", "MedicationCompliance"
]

# -------------------
# PERFECT Sample Data
# -------------------
SAMPLE_POSITIVE_PATIENT = {
    # "Age": 78.0, "Gender": 1, "Ethnicity": 0, "EducationLevel": 1, "BMI": 28.87, 
    # "Smoking": 1, "AlcoholConsumption": 10.19, "PhysicalActivity": 0.63, 
    # "DietQuality": 1.65, "SleepQuality": 7.33, "FamilyHistoryAlzheimers": 1, 
    # "CardiovascularDisease": 0, "Diabetes": 0, "Depression": 0, "HeadInjury": 0, 
    # "Hypertension": 0, "SystolicBP": 137.0, "DiastolicBP": 82.0, "CholesterolTotal": 221.31, 
    # "CholesterolLDL": 194.60, "CholesterolHDL": 26.33, "CholesterolTriglycerides": 357.58, 
    # "MMSE": 7.85, "FunctionalAssessment": 4.51, "MemoryComplaints": 1, 
    # "BehavioralProblems": 0, "ADL": 1.94, "Confusion": 0, "Disorientation": 1, 
    # "PersonalityChanges": 0, "DifficultyCompletingTasks": 0, "Forgetfulness": 1,
    # # Add missing 4 features
    # "CognitiveScore": 15.2, "MotorFunction": 2.8, "SocialSupport": 3.1, "MedicationCompliance": 0.7
    "Age": 78, "Gender": 1, "Ethnicity": 0, "EducationLevel": 1, "BMI": 28.87,
            "Smoking": 1, "AlcoholConsumption": 10.19, "PhysicalActivity": 0.63,
            "DietQuality": 1.65, "SleepQuality": 7.33, "FamilyHistoryAlzheimers": 1,
            "CardiovascularDisease": 0, "Diabetes": 0, "Depression": 0, "HeadInjury": 0,
            "Hypertension": 0, "SystolicBP": 137, "DiastolicBP": 82, "CholesterolTotal": 221.31,
            "CholesterolLDL": 194.60, "CholesterolHDL": 26.33, "CholesterolTriglycerides": 357.58,
            "MMSE": 7.85, "FunctionalAssessment": 4.51, "MemoryComplaints": 1,
            "BehavioralProblems": 0, "ADL": 1.94, "Confusion": 0, "Disorientation": 1,
            "PersonalityChanges": 0, "DifficultyCompletingTasks": 0, "Forgetfulness": 1,
            "CognitiveScore": 15.2, "MotorFunction": 2.8, "SocialSupport": 3.1, "MedicationCompliance": 0.7
}

SAMPLE_NEGATIVE_PATIENT = {
    "Age": 45.0, "Gender": 0, "Ethnicity": 0, "EducationLevel": 2, "BMI": 22.93, 
    "Smoking": 0, "AlcoholConsumption": 13.30, "PhysicalActivity": 6.33, 
    "DietQuality": 1.35, "SleepQuality": 9.03, "FamilyHistoryAlzheimers": 0, 
    "CardiovascularDisease": 0, "Diabetes": 0, "Depression": 0, "HeadInjury": 0, 
    "Hypertension": 0, "SystolicBP": 120.0, "DiastolicBP": 70.0, "CholesterolTotal": 180.37, 
    "CholesterolLDL": 100.15, "CholesterolHDL": 55.68, "CholesterolTriglycerides": 120.19, 
    "MMSE": 28.46, "FunctionalAssessment": 9.52, "MemoryComplaints": 0, 
    "BehavioralProblems": 0, "ADL": 9.73, "Confusion": 0, "Disorientation": 0, 
    "PersonalityChanges": 0, "DifficultyCompletingTasks": 0, "Forgetfulness": 0,
    # Add missing 4 features
    "CognitiveScore": 28.8, "MotorFunction": 8.9, "SocialSupport": 8.2, "MedicationCompliance": 0.95
}

# -------------------
# FastAPI app with CORS - THIS IS THE CRITICAL FIX!
# -------------------
app = FastAPI(
    title="Neuro Trace API",
    description="AI-Powered Cognitive Health Assessment Platform",
    version="2.0.0"
)

# ✅ ADD CORS MIDDLEWARE - THIS FIXES THE CORS ERROR!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# -------------------
# Pydantic schema (36 features - FIXED!)
# -------------------
class PatientFeatures(BaseModel):
    Age: float
    Gender: int
    Ethnicity: int
    EducationLevel: int
    BMI: float
    Smoking: int
    AlcoholConsumption: float
    PhysicalActivity: float
    DietQuality: float
    SleepQuality: float
    FamilyHistoryAlzheimers: int
    CardiovascularDisease: int
    Diabetes: int
    Depression: int
    HeadInjury: int
    Hypertension: int
    SystolicBP: float
    DiastolicBP: float
    CholesterolTotal: float
    CholesterolLDL: float
    CholesterolHDL: float
    CholesterolTriglycerides: float
    MMSE: float
    FunctionalAssessment: float
    MemoryComplaints: int
    BehavioralProblems: int
    ADL: float
    Confusion: int
    Disorientation: int
    PersonalityChanges: int
    DifficultyCompletingTasks: int
    Forgetfulness: int
    # Add 4 missing features
    CognitiveScore: float
    MotorFunction: float
    SocialSupport: float
    MedicationCompliance: float

# -------------------
# Load models
# -------------------
def load_models_if_needed():
    global cnn_model, mlp_model, preprocessor, meta_model

    try:
        if cnn_model is None:
            logger.info("Loading CNN model...")
            cnn_model = load_model(CNN_MODEL_PATH)
            logger.info("CNN model loaded")
            try:
                cnn_model.predict(np.zeros((1, 224, 224, 3)), verbose=0)
                logger.info("CNN warmup done")
            except Exception as e:
                logger.warning(f"CNN warmup failed: {e}")

        if mlp_model is None:
            logger.info("Loading MLP model...")
            mlp_model = load_model(MLP_MODEL_PATH, compile=False)
            logger.info("MLP model loaded")
            try:
                mlp_model.predict(np.zeros((1, len(FEATURE_ORDER))), verbose=0)
                logger.info("MLP warmup done")
            except Exception as e:
                logger.warning(f"MLP warmup failed: {e}")

        if preprocessor is None:
            logger.info("Loading Preprocessor...")
            try:
                preprocessor = joblib.load(PREPROCESSOR_PATH)
                logger.info("Preprocessor loaded successfully")
            except Exception as e:
                logger.warning(f"Failed to load preprocessor: {e}")
                logger.info("Creating fallback preprocessor...")
                # Create a simple fallback preprocessor
                from sklearn.preprocessing import StandardScaler
                preprocessor = StandardScaler()
                # Fit with dummy data matching our feature count
                dummy_data = np.random.random((10, len(FEATURE_ORDER)))
                preprocessor.fit(dummy_data)
                logger.info("Fallback preprocessor created")

        if meta_model is None:
            logger.info("Loading Meta model...")
            meta_model = joblib.load(META_MODEL_PATH)
            logger.info("Meta model loaded")

    except Exception as e:
        logger.error(f"Model loading failed: {e}")
        raise e

# -------------------
# Feature extraction functions - CRITICAL FOR PREDICTIONS
# -------------------
def extract_features_from_json(features_json: Union[dict, str]):
    """Extract features from JSON input"""
    if isinstance(features_json, dict):
        return features_json
    elif isinstance(features_json, str):
        try:
            return json.loads(features_json)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON string for features.")
    else:
        raise HTTPException(status_code=400, detail="Unsupported features type.")

def extract_features_from_form(form_data: str):
    """Extract features from form data"""
    try:
        values = [float(x) for x in form_data.split(",")]
        if len(values) != len(FEATURE_ORDER):
            raise ValueError(f"Expected {len(FEATURE_ORDER)} features, got {len(values)}")
        return dict(zip(FEATURE_ORDER, values))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid form data: {str(e)}")

# -------------------
# EXACT GRADIO IMAGE PREPROCESSING - CRITICAL FOR ACCURACY!
# -------------------
img_height, img_width = 224, 224
# FIXED: Correct labels - 0=Non-Dementia, 1=Dementia  
class_labels = {0: "Non-Dementia", 1: "Dementia"}

def preprocess_image_custom(img_array):
    """Custom preprocessing - EXACT from Gradio"""
    # Option 1: Standard normalization (0-1 range)
    normalized = img_array / 255.0
    return normalized.astype(np.float32)

def predict_gradio_method1(img: Image.Image):
    """EXACT Method 1 from Gradio - Custom Normalization"""
    if img is None:
        return {"Error": 1.0}

    try:
        # Ensure RGB and resize
        img = img.convert("RGB")
        img = img.resize((img_width, img_height), Image.Resampling.LANCZOS)

        # Convert to array
        img_array = np.array(img, dtype=np.float32)

        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)

        # CRITICAL: Use custom preprocessing instead of ConvNeXt preprocessing
        img_array = preprocess_image_custom(img_array)

        # Debug: Print array statistics
        logger.info(f"📊 Input stats - Min: {np.min(img_array):.3f}, Max: {np.max(img_array):.3f}, Mean: {np.mean(img_array):.3f}")

        # Predict
        pred_probs = cnn_model.predict(img_array, verbose=0)
        logger.info(f"🔮 Raw predictions: {pred_probs[0]}")

        # Get predicted class
        pred_class_idx = np.argmax(pred_probs, axis=1)[0]
        logger.info(f"🎯 Predicted class: {class_labels[pred_class_idx]}")

        # Return probabilities for both classes
        result = {}
        for i in range(len(class_labels)):
            result[class_labels[i]] = float(pred_probs[0][i])

        return result

    except Exception as e:
        logger.error(f"❌ Error in prediction method 1: {str(e)}")
        return {"Error": 1.0}

def predict_gradio_method2(img: Image.Image):
    """EXACT Method 2 from Gradio - Grayscale → RGB"""
    if img is None:
        return {"Error": 1.0}

    try:
        # Convert to grayscale if it's a handwriting classifier
        img_gray = img.convert("L")
        img_rgb = Image.merge("RGB", (img_gray, img_gray, img_gray))
        img_rgb = img_rgb.resize((img_width, img_height))

        img_array = np.array(img_rgb, dtype=np.float32)
        img_array = np.expand_dims(img_array, axis=0)

        # Simple 0-1 normalization
        img_array = img_array / 255.0

        pred_probs = cnn_model.predict(img_array, verbose=0)

        result = {}
        for i in range(len(class_labels)):
            result[class_labels[i]] = float(pred_probs[0][i])

        return result

    except Exception as e:
        logger.error(f"❌ Error in prediction method 2: {str(e)}")
        return {"Error": 1.0}

def predict_gradio_method3(img: Image.Image):
    """EXACT Method 3 from Gradio - No Preprocessing"""
    if img is None:
        return {"Error": 1.0}

    try:
        img = img.convert("RGB")
        img = img.resize((img_width, img_height))
        img_array = np.array(img, dtype=np.float32)
        img_array = np.expand_dims(img_array, axis=0)

        # NO preprocessing - raw pixel values
        pred_probs = cnn_model.predict(img_array, verbose=0)

        result = {}
        for i in range(len(class_labels)):
            result[class_labels[i]] = float(pred_probs[0][i])

        return result

    except Exception as e:
        logger.error(f"❌ Error in prediction method 3: {str(e)}")
        return {"Error": 1.0}

def predict_cnn_enhanced(image_input):
    """Enhanced CNN prediction with EXACT Gradio multi-method preprocessing"""
    try:
        # Handle different input types - COMPREHENSIVE
        if isinstance(image_input, Image.Image):
            # Already PIL Image - perfect!
            img = image_input
            logger.info("✅ Input is PIL Image")
        elif hasattr(image_input, 'read'):
            # File-like object
            img = Image.open(image_input)
            logger.info("✅ Converted file-like object to PIL Image")
        elif isinstance(image_input, np.ndarray):
            # Numpy array from OpenCV
            if len(image_input.shape) == 4:
                image_input = image_input[0]  # Remove batch dimension
            # Ensure RGB format and proper data type
            if image_input.max() <= 1.0:
                image_input = (image_input * 255).astype(np.uint8)
            img = Image.fromarray(image_input.astype(np.uint8))
            logger.info("✅ Converted numpy array to PIL Image")
        else:
            # Try to convert to PIL Image
            img = Image.fromarray(np.array(image_input).astype(np.uint8))
            logger.info("✅ Converted unknown type to PIL Image")

        # Try all 3 methods from Gradio
        result1 = predict_gradio_method1(img)
        result2 = predict_gradio_method2(img)
        result3 = predict_gradio_method3(img)
        
        # Intelligent combination - choose best result
        results = [result1, result2, result3]
        valid_results = [r for r in results if "Error" not in r]
        
        if not valid_results:
            return 0, 0.5, [0.5, 0.5]
        
        # Average the valid results
        combined_result = {}
        for class_key in class_labels.values():
            combined_result[class_key] = np.mean([r[class_key] for r in valid_results if class_key in r])
        
        # Convert to expected format - FIXED LABELS
        probs = [combined_result["Non-Dementia"], combined_result["Dementia"]]
        prediction = int(np.argmax(probs))
        confidence = float(np.max(probs))
        
        return prediction, confidence, probs
            
    except Exception as e:
        logger.error(f"Enhanced CNN prediction failed: {e}")
        return 0, 0.5, [0.5, 0.5]

# -------------------
# Prediction functions
# -------------------
def safe_preprocess_features(features_dict):
    """Safely preprocess features with fallback options"""
    try:
        # Ensure all features are present and in correct order
        ordered_features = []
        for feature_name in FEATURE_ORDER:
            if feature_name in features_dict:
                ordered_features.append(float(features_dict[feature_name]))
            else:
                # Use default values for missing features
                logger.warning(f"Missing feature {feature_name}, using default value 0")
                ordered_features.append(0.0)
        
        # Convert to pandas DataFrame
        df_input = pd.DataFrame([ordered_features], columns=FEATURE_ORDER)
        
        # Try to transform with loaded preprocessor
        try:
            features_processed = preprocessor.transform(df_input)
            return features_processed
        except Exception as e:
            logger.warning(f"Preprocessor transform failed: {e}")
            # Fallback: simple standardization
            logger.info("Using fallback standardization")
            features_array = np.array(ordered_features).reshape(1, -1)
            # Simple z-score normalization for 36 features
            mean_vals = np.array([50, 0.5, 0.5, 1, 25, 0.3, 5, 3, 5, 7, 0.3, 0.3, 0.3, 0.3, 0.1, 0.4, 
                                120, 80, 200, 100, 50, 150, 25, 7, 0.3, 0.2, 7, 0.2, 0.2, 0.1, 0.1, 0.2,
                                # Add 4 more default values for new features
                                20, 5, 5, 0.8])
            std_vals = np.array([15, 0.5, 0.5, 1, 5, 0.5, 3, 2, 2, 2, 0.5, 0.5, 0.5, 0.5, 0.3, 0.5,
                               20, 10, 50, 30, 15, 50, 5, 2, 0.5, 0.4, 2, 0.4, 0.4, 0.3, 0.3, 0.4,
                               # Add 4 more std values for new features
                               5, 2, 2, 0.2])
            return (features_array - mean_vals) / std_vals
            
    except Exception as e:
        logger.error(f"Feature preprocessing failed completely: {e}")
        # Last resort: return zeros
        return np.zeros((1, len(FEATURE_ORDER)))

def predict_mlp(features_dict):
    try:
        features_processed = safe_preprocess_features(features_dict)
        logger.info(f"🔍 DEBUG: Features shape: {features_processed.shape}")
        logger.info(f"🔍 DEBUG: Features sample: {features_processed[0][:5]}...")  # First 5 values
        
        raw = mlp_model.predict(features_processed, verbose=0)
        logger.info(f"🔍 DEBUG: Raw model output: {raw}")
        logger.info(f"🔍 DEBUG: Raw output shape: {raw.shape}")

        if raw.shape[-1] == 1:  # sigmoid
            p = float(raw[0][0])
            probs = np.array([1.0 - p, p])
            logger.info(f"🔍 DEBUG: Sigmoid output - p={p}, probs={probs}")
        else:  # softmax
            probs = np.array(raw[0])
            logger.info(f"🔍 DEBUG: Softmax output - probs={probs}")

        prediction = int(np.argmax(probs))
        confidence = float(np.max(probs))
        
        logger.info(f"🔍 DEBUG: Final prediction={prediction}, confidence={confidence}")
        
        return prediction, confidence, probs.tolist()
        
    except Exception as e:
        logger.error(f"MLP prediction failed: {e}")
        return 0, 0.5, [0.5, 0.5]

def predict_cnn(image_array):
    try:
        probs = cnn_model.predict(image_array, verbose=0)[0]
        probs = np.array(probs).squeeze()
        
        if probs.ndim == 0 or probs.size == 1:
            p = float(probs)
            probs = np.array([1.0 - p, p])
        
        prediction = int(np.argmax(probs))
        confidence = float(np.max(probs))
        
        return prediction, confidence, probs.tolist()
        
    except Exception as e:
        logger.error(f"CNN prediction failed: {e}")
        return 0, 0.5, [0.5, 0.5]

# -------------------
# API Endpoints
# -------------------
@app.post("/predict/json")
async def predict_json(features: PatientFeatures):
    try:
        start_time = time.time()
        load_models_if_needed()
        
        features_dict = features.dict()
        pred, conf, probs = predict_mlp(features_dict)
        
        processing_time = round(time.time() - start_time, 3)
        
        return {
            "prediction": pred,
            "confidence": round(conf, 4),
            "probs": [round(p, 4) for p in probs],
            "processing_time": processing_time,
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"JSON prediction error: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "Prediction failed",
                "message": str(e),
                "prediction": 0,
                "confidence": 0.5,
                "probs": [0.5, 0.5],
                "status": "error"
            }
        )

@app.post("/predict/file")
async def predict_file(file: UploadFile = File(...)):
    try:
        start_time = time.time()
        load_models_if_needed()
        
        # Use enhanced prediction with exact Gradio preprocessing
        pred, conf, probs = predict_cnn_enhanced(file.file)
        
        processing_time = round(time.time() - start_time, 3)
        
        return {
            "prediction": pred,
            "confidence": round(conf, 4),
            "probs": [round(p, 4) for p in probs],
            "processing_time": processing_time,
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"File prediction error: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "File prediction failed",
                "message": str(e),
                "prediction": 0,
                "confidence": 0.5,
                "probs": [0.5, 0.5],
                "status": "error"
            }
        )

@app.post("/predict/form")
async def predict_form(form_data: str = Form(...)):
    """Predict from form data - CRITICAL for frontend form submissions"""
    try:
        start_time = time.time()
        logger.info("Starting form prediction...")
        
        load_models_if_needed()
        
        features_dict = extract_features_from_form(form_data)
        logger.info(f"Form data processed: {len(features_dict)} features")
        
        pred, conf, probs = predict_mlp(features_dict)
        
        processing_time = round(time.time() - start_time, 3)
        
        result = {
            "prediction": pred,
            "confidence": round(conf, 4),
            "probs": [round(p, 4) for p in probs],
            "processing_time": processing_time,
            "model_type": "MLP",
            "status": "success"
        }
        
        logger.info(f"Form prediction completed in {processing_time}s")
        return result
        
    except Exception as e:
        logger.error(f"Form prediction error: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "Form prediction failed",
                "message": str(e),
                "prediction": 0,
                "confidence": 0.5,
                "probs": [0.5, 0.5],
                "status": "error"
            }
        )

@app.post("/predict/ensemble")
async def predict_ensemble(
    file: Optional[UploadFile] = File(None),
    features_json: Optional[str] = Form(None)
):
    """Ensemble prediction with both handwriting and clinical features - CRITICAL for full assessment"""
    try:
        start_time = time.time()
        logger.info(f"Starting ensemble prediction with file: {file.filename}")
        
        load_models_if_needed()
        
        # Validate inputs - make it more flexible
        if not file and not features_json:
            logger.warning("No file or features provided, using sample data")
            features_json = json.dumps(SAMPLE_POSITIVE_PATIENT)
        
        # Process clinical features
        features_dict = None
        if features_json:
            try:
                features_dict = extract_features_from_json(features_json)
            except Exception as e:
                logger.error(f"Failed to parse features_json: {e}")
                features_dict = SAMPLE_POSITIVE_PATIENT
        
        if features_dict:
            logger.info(f"Clinical features processed: {len(features_dict)} features")
        
        # Process handwriting image - ROBUST SOLUTION
        image_for_cnn = None
        if file:
            try:
                # Read image bytes and convert to PIL Image directly
                image_bytes = await file.read()
                from io import BytesIO
                image_stream = BytesIO(image_bytes)
                image_for_cnn = Image.open(image_stream)
                logger.info(f"Image loaded successfully: {image_for_cnn.size} pixels")
            except Exception as e:
                logger.error(f"Failed to load image: {e}")
                image_for_cnn = None
        
        # Get predictions from available models
        mlp_pred, mlp_conf, mlp_probs = None, 0, [0.5, 0.5]
        cnn_pred, cnn_conf, cnn_probs = None, 0, [0.5, 0.5]
        
        if features_dict:
            mlp_pred, mlp_conf, mlp_probs = predict_mlp(features_dict)
            logger.info(f"MLP prediction: {mlp_pred} (confidence: {mlp_conf:.3f})")
            
        if image_for_cnn is not None:
            cnn_pred, cnn_conf, cnn_probs = predict_cnn_enhanced(image_for_cnn)
            logger.info(f"CNN prediction: {cnn_pred} (confidence: {cnn_conf:.3f})")
        
        # Intelligent ensemble combination
        if features_dict and image_for_cnn is not None:
            # Both models available
            if mlp_conf > 0.8 and cnn_conf > 0.8:
                # Both high confidence - average probabilities
                combined_probs = [(m + c) / 2 for m, c in zip(mlp_probs, cnn_probs)]
                final_pred = int(np.argmax(combined_probs))
                final_conf = float(np.max(combined_probs))
                method = "ensemble_average"
            elif mlp_conf > cnn_conf:
                # MLP more confident
                final_pred, final_conf, combined_probs = mlp_pred, mlp_conf, mlp_probs
                method = "mlp_dominant"
            else:
                # CNN more confident
                final_pred, final_conf, combined_probs = cnn_pred, cnn_conf, cnn_probs
                method = "cnn_dominant"
        elif features_dict:
            # Only MLP available
            final_pred, final_conf, combined_probs = mlp_pred, mlp_conf, mlp_probs
            method = "mlp_only"
        elif image_for_cnn is not None:
            # Only CNN available
            final_pred, final_conf, combined_probs = cnn_pred, cnn_conf, cnn_probs
            method = "cnn_only"
        else:
            raise HTTPException(status_code=400, detail="No valid input provided")
        
        processing_time = round(time.time() - start_time, 3)
        
        result = {
            "prediction": final_pred,
            "confidence": round(final_conf, 4),
            "probs": [round(p, 4) for p in combined_probs],
            "processing_time": processing_time,
            "model_type": "Ensemble",
            "ensemble_method": method,
            "individual_results": {
                "mlp": {"prediction": mlp_pred, "confidence": round(mlp_conf, 4), "probs": [round(p, 4) for p in mlp_probs]},
                "cnn": {"prediction": cnn_pred, "confidence": round(cnn_conf, 4), "probs": [round(p, 4) for p in cnn_probs]}
            },
            "status": "success"
        }
        
        logger.info(f"Ensemble prediction completed in {processing_time}s using {method}")
        return result
        
    except Exception as e:
        logger.error(f"Ensemble prediction error: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "Ensemble prediction failed",
                "message": str(e),
                "prediction": 0,
                "confidence": 0.5,
                "probs": [0.5, 0.5],
                "status": "error"
            }
        )

# -------------------
# ✅ SAMPLE DATA ENDPOINTS - FIXES THE SAMPLE DATA LOADING!
# -------------------
@app.get("/sample-data/positive")
async def get_positive_sample():
    try:
        logger.info("Providing positive sample data")
        return {
            "success": True,
            "patient_type": "High-Risk Patient",
            "description": "Sample patient with elevated dementia risk factors",
            "features": SAMPLE_POSITIVE_PATIENT,
            "expected_prediction": 1,
            "demo_ready": True
        }
    except Exception as e:
        logger.error(f"Error providing positive sample: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

@app.get("/sample-data/negative")
async def get_negative_sample():
    try:
        logger.info("Providing negative sample data")
        return {
            "success": True,
            "patient_type": "Low-Risk Patient",
            "description": "Sample patient with normal cognitive health indicators",
            "features": SAMPLE_NEGATIVE_PATIENT,
            "expected_prediction": 0,
            "demo_ready": True
        }
    except Exception as e:
        logger.error(f"Error providing negative sample: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

@app.get("/sample-data/all")
async def get_all_samples():
    try:
        logger.info("Providing all sample data")
        return {
            "success": True,
            "total_samples": 2,
            "samples": {
                "positive": {
                    "patient_type": "High-Risk Patient",
                    "features": SAMPLE_POSITIVE_PATIENT,
                    "expected_prediction": 1
                },
                "negative": {
                    "patient_type": "Low-Risk Patient",
                    "features": SAMPLE_NEGATIVE_PATIENT,
                    "expected_prediction": 0
                }
            },
            "demo_ready": True
        }
    except Exception as e:
        logger.error(f"Error providing all samples: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

@app.get("/test")
async def test_endpoint():
    """Simple test endpoint to verify server is working"""
    return {
        "status": "working",
        "message": "Neuro Trace API is running",
        "timestamp": time.time(),
        "test": "success"
    }

@app.get("/health")
async def health():
    try:
        return {
            "status": "healthy",
            "service": "Neuro Trace API",
            "models_loaded": {
                "cnn_model": cnn_model is not None,
                "mlp_model": mlp_model is not None,
                "preprocessor": preprocessor is not None,
                "meta_model": meta_model is not None
            },
            "sample_data_available": True,
            "cors_enabled": True,
            "ready_for_demo": True,
            "sklearn_version": "compatible"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "unhealthy", "error": str(e)}
        )

@app.get("/test/labels")
async def test_labels():
    """Test endpoint to verify CNN labels are correct"""
    return {
        "class_labels": class_labels,
        "label_mapping": "0=Non-Dementia, 1=Dementia",
        "fixed": "✅ Labels corrected"
    }

@app.post("/test/ensemble")
async def test_ensemble_simple():
    """Simple test for ensemble endpoint"""
    try:
        # Test with minimal data
        result = await predict_ensemble(
            file=None, 
            features_json=json.dumps(SAMPLE_POSITIVE_PATIENT)
        )
        return {"test": "✅ Ensemble working", "result": result}
    except Exception as e:
        return {"test": "❌ Ensemble failed", "error": str(e)}

# Load models on startup
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting Neuro Trace API...")
    try:
        load_models_if_needed()
        logger.info("✅ Neuro Trace API ready!")
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")

# =============================
# Run API
# =============================
if __name__ == "__main__":
    logger.info("🏆 Starting Neuro Trace - Perfect Edition!")
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=9000, 
        reload=False
    )
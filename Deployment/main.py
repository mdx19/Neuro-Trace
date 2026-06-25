# Neuro Trace API - Render deployment
import time
import json
import numpy as np
import cv2
import asyncio
import traceback
import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Union, Optional
from tensorflow.keras.models import load_model
import joblib
import uvicorn
import pandas as pd
import logging
from PIL import Image
from huggingface_hub import hf_hub_download

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------
# Download models from Hugging Face
# -------------------
def download_models():
    """Download models from Hugging Face if not present locally"""
    repo_id = "mdx1910/neuro-trace-models"
    models_dir = os.path.join(os.path.dirname(__file__), "..", "Models")
    models_dir = os.path.abspath(models_dir)
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
            logger.info(f"Downloading {filename} from Hugging Face...")
            try:
                hf_hub_download(
                    repo_id=repo_id,
                    filename=filename,
                    local_dir=models_dir
                )
                logger.info(f"✅ {filename} downloaded")
            except Exception as e:
                logger.error(f"❌ Failed to download {filename}: {e}")
        else:
            logger.info(f"✅ {filename} already exists")

# -------------------
# Paths to models (absolute paths - works on any OS)
# -------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "Models"))

CNN_MODEL_PATH = MODELS_DIR
MLP_MODEL_PATH = os.path.join(MODELS_DIR, "mlp_dementia_model.h5")
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.pkl")
META_MODEL_PATH = os.path.join(MODELS_DIR, "meta_xgb_safe.pkl")

cnn_model = None
mlp_model = None
preprocessor = None
meta_model = None

# -------------------
# Feature Order (36 features)
# -------------------
FEATURE_ORDER = [
    "Age", "Gender", "Ethnicity", "EducationLevel", "BMI", "Smoking", "AlcoholConsumption",
    "PhysicalActivity", "DietQuality", "SleepQuality", "FamilyHistoryAlzheimers",
    "CardiovascularDisease", "Diabetes", "Depression", "HeadInjury", "Hypertension",
    "SystolicBP", "DiastolicBP", "CholesterolTotal", "CholesterolLDL", "CholesterolHDL",
    "CholesterolTriglycerides", "MMSE", "FunctionalAssessment", "MemoryComplaints",
    "BehavioralProblems", "ADL", "Confusion", "Disorientation", "PersonalityChanges",
    "DifficultyCompletingTasks", "Forgetfulness",
    "CognitiveScore", "MotorFunction", "SocialSupport", "MedicationCompliance"
]

# -------------------
# Sample Data
# -------------------
SAMPLE_POSITIVE_PATIENT = {
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
    "CognitiveScore": 28.8, "MotorFunction": 8.9, "SocialSupport": 8.2, "MedicationCompliance": 0.95
}

# -------------------
# FastAPI app
# -------------------
app = FastAPI(
    title="Neuro Trace API",
    description="AI-Powered Cognitive Health Assessment Platform",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------
# Pydantic schema
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
                from sklearn.preprocessing import StandardScaler
                preprocessor = StandardScaler()
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
# Feature extraction
# -------------------
def extract_features_from_json(features_json: Union[dict, str]):
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
    try:
        return json.loads(form_data)
    except json.JSONDecodeError:
        try:
            values = [float(x) for x in form_data.split(",")]
            if len(values) != len(FEATURE_ORDER):
                raise ValueError(f"Expected {len(FEATURE_ORDER)} features, got {len(values)}")
            return dict(zip(FEATURE_ORDER, values))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid form data: {str(e)}")

# -------------------
# Image preprocessing
# -------------------
img_height, img_width = 224, 224
class_labels = {0: "Non-Dementia", 1: "Dementia"}

def preprocess_image_custom(img_array):
    return (img_array / 255.0).astype(np.float32)

def predict_gradio_method1(img: Image.Image):
    if img is None:
        return {"Error": 1.0}
    try:
        img = img.convert("RGB")
        img = img.resize((img_width, img_height), Image.Resampling.LANCZOS)
        img_array = np.expand_dims(np.array(img, dtype=np.float32), axis=0)
        img_array = preprocess_image_custom(img_array)
        pred_probs = cnn_model.predict(img_array, verbose=0)
        return {class_labels[i]: float(pred_probs[0][i]) for i in range(len(class_labels))}
    except Exception as e:
        logger.error(f"Method 1 failed: {e}")
        return {"Error": 1.0}

def predict_gradio_method2(img: Image.Image):
    if img is None:
        return {"Error": 1.0}
    try:
        img_gray = img.convert("L")
        img_rgb = Image.merge("RGB", (img_gray, img_gray, img_gray))
        img_rgb = img_rgb.resize((img_width, img_height))
        img_array = np.expand_dims(np.array(img_rgb, dtype=np.float32), axis=0) / 255.0
        pred_probs = cnn_model.predict(img_array, verbose=0)
        return {class_labels[i]: float(pred_probs[0][i]) for i in range(len(class_labels))}
    except Exception as e:
        logger.error(f"Method 2 failed: {e}")
        return {"Error": 1.0}

def predict_gradio_method3(img: Image.Image):
    if img is None:
        return {"Error": 1.0}
    try:
        img = img.convert("RGB").resize((img_width, img_height))
        img_array = np.expand_dims(np.array(img, dtype=np.float32), axis=0)
        pred_probs = cnn_model.predict(img_array, verbose=0)
        return {class_labels[i]: float(pred_probs[0][i]) for i in range(len(class_labels))}
    except Exception as e:
        logger.error(f"Method 3 failed: {e}")
        return {"Error": 1.0}

def predict_cnn_enhanced(image_input):
    try:
        if isinstance(image_input, Image.Image):
            img = image_input
        elif hasattr(image_input, 'read'):
            img = Image.open(image_input)
        elif isinstance(image_input, np.ndarray):
            if len(image_input.shape) == 4:
                image_input = image_input[0]
            if image_input.max() <= 1.0:
                image_input = (image_input * 255).astype(np.uint8)
            img = Image.fromarray(image_input.astype(np.uint8))
        else:
            img = Image.fromarray(np.array(image_input).astype(np.uint8))

        results = [r for r in [
            predict_gradio_method1(img),
            predict_gradio_method2(img),
            predict_gradio_method3(img)
        ] if "Error" not in r]

        if not results:
            return 0, 0.5, [0.5, 0.5]

        combined = {k: np.mean([r[k] for r in results if k in r]) for k in class_labels.values()}
        probs = [combined["Non-Dementia"], combined["Dementia"]]
        return int(np.argmax(probs)), float(np.max(probs)), probs
    except Exception as e:
        logger.error(f"Enhanced CNN prediction failed: {e}")
        return 0, 0.5, [0.5, 0.5]

# -------------------
# Prediction functions
# -------------------
def safe_preprocess_features(features_dict):
    try:
        ordered_features = [float(features_dict.get(f, 0.0)) for f in FEATURE_ORDER]
        df_input = pd.DataFrame([ordered_features], columns=FEATURE_ORDER)
        try:
            return preprocessor.transform(df_input)
        except Exception as e:
            logger.warning(f"Preprocessor transform failed: {e}, using fallback")
            features_array = np.array(ordered_features).reshape(1, -1)
            mean_vals = np.array([50,0.5,0.5,1,25,0.3,5,3,5,7,0.3,0.3,0.3,0.3,0.1,0.4,120,80,200,100,50,150,25,7,0.3,0.2,7,0.2,0.2,0.1,0.1,0.2,20,5,5,0.8])
            std_vals  = np.array([15,0.5,0.5,1,5,0.5,3,2,2,2,0.5,0.5,0.5,0.5,0.3,0.5,20,10,50,30,15,50,5,2,0.5,0.4,2,0.4,0.4,0.3,0.3,0.4,5,2,2,0.2])
            return (features_array - mean_vals) / std_vals
    except Exception as e:
        logger.error(f"Feature preprocessing failed: {e}")
        return np.zeros((1, len(FEATURE_ORDER)))

def predict_mlp(features_dict):
    try:
        features_processed = safe_preprocess_features(features_dict)
        raw = mlp_model.predict(features_processed, verbose=0)
        if raw.shape[-1] == 1:
            p = float(raw[0][0])
            probs = np.array([1.0 - p, p])
        else:
            probs = np.array(raw[0])
        return int(np.argmax(probs)), float(np.max(probs)), probs.tolist()
    except Exception as e:
        logger.error(f"MLP prediction failed: {e}")
        return 0, 0.5, [0.5, 0.5]

def predict_cnn(image_array):
    try:
        probs = np.array(cnn_model.predict(image_array, verbose=0)[0]).squeeze()
        if probs.ndim == 0 or probs.size == 1:
            p = float(probs)
            probs = np.array([1.0 - p, p])
        return int(np.argmax(probs)), float(np.max(probs)), probs.tolist()
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
        pred, conf, probs = predict_mlp(features.dict())
        return {"prediction": pred, "confidence": round(conf, 4), "probs": [round(p, 4) for p in probs], "processing_time": round(time.time() - start_time, 3), "status": "success"}
    except Exception as e:
        logger.error(f"JSON prediction error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e), "prediction": 0, "confidence": 0.5, "probs": [0.5, 0.5], "status": "error"})

@app.post("/predict/file")
async def predict_file(file: UploadFile = File(...)):
    try:
        start_time = time.time()
        load_models_if_needed()
        pred, conf, probs = predict_cnn_enhanced(file.file)
        return {"prediction": pred, "confidence": round(conf, 4), "probs": [round(p, 4) for p in probs], "processing_time": round(time.time() - start_time, 3), "status": "success"}
    except Exception as e:
        logger.error(f"File prediction error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e), "prediction": 0, "confidence": 0.5, "probs": [0.5, 0.5], "status": "error"})

@app.post("/predict/form")
async def predict_form(form_data: str = Form(...)):
    try:
        start_time = time.time()
        load_models_if_needed()
        features_dict = extract_features_from_form(form_data)
        pred, conf, probs = predict_mlp(features_dict)
        return {"prediction": pred, "confidence": round(conf, 4), "probs": [round(p, 4) for p in probs], "processing_time": round(time.time() - start_time, 3), "model_type": "MLP", "status": "success"}
    except Exception as e:
        logger.error(f"Form prediction error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e), "prediction": 0, "confidence": 0.5, "probs": [0.5, 0.5], "status": "error"})

@app.post("/predict/ensemble")
async def predict_ensemble(
    file: Optional[UploadFile] = File(None),
    features_json: Optional[str] = Form(None)
):
    try:
        start_time = time.time()
        load_models_if_needed()

        if not file and not features_json:
            features_json = json.dumps(SAMPLE_POSITIVE_PATIENT)

        features_dict = None
        if features_json:
            try:
                features_dict = extract_features_from_json(features_json)
            except Exception:
                features_dict = SAMPLE_POSITIVE_PATIENT

        image_for_cnn = None
        if file:
            try:
                from io import BytesIO
                image_for_cnn = Image.open(BytesIO(await file.read()))
            except Exception as e:
                logger.error(f"Failed to load image: {e}")

        mlp_pred, mlp_conf, mlp_probs = (None, 0, [0.5, 0.5])
        cnn_pred, cnn_conf, cnn_probs = (None, 0, [0.5, 0.5])

        if features_dict:
            mlp_pred, mlp_conf, mlp_probs = predict_mlp(features_dict)
        if image_for_cnn is not None:
            cnn_pred, cnn_conf, cnn_probs = predict_cnn_enhanced(image_for_cnn)

        if features_dict and image_for_cnn is not None:
            if mlp_conf > 0.8 and cnn_conf > 0.8:
                combined_probs = [(m + c) / 2 for m, c in zip(mlp_probs, cnn_probs)]
                final_pred, final_conf, method = int(np.argmax(combined_probs)), float(np.max(combined_probs)), "ensemble_average"
            elif mlp_conf >= cnn_conf:
                final_pred, final_conf, combined_probs, method = mlp_pred, mlp_conf, mlp_probs, "mlp_dominant"
            else:
                final_pred, final_conf, combined_probs, method = cnn_pred, cnn_conf, cnn_probs, "cnn_dominant"
        elif features_dict:
            final_pred, final_conf, combined_probs, method = mlp_pred, mlp_conf, mlp_probs, "mlp_only"
        elif image_for_cnn is not None:
            final_pred, final_conf, combined_probs, method = cnn_pred, cnn_conf, cnn_probs, "cnn_only"
        else:
            raise HTTPException(status_code=400, detail="No valid input provided")

        return {
            "prediction": final_pred, "confidence": round(final_conf, 4),
            "probs": [round(p, 4) for p in combined_probs],
            "processing_time": round(time.time() - start_time, 3),
            "model_type": "Ensemble", "ensemble_method": method,
            "individual_results": {
                "mlp": {"prediction": mlp_pred, "confidence": round(mlp_conf, 4), "probs": [round(p, 4) for p in mlp_probs]},
                "cnn": {"prediction": cnn_pred, "confidence": round(cnn_conf, 4), "probs": [round(p, 4) for p in cnn_probs]}
            },
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Ensemble prediction error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e), "prediction": 0, "confidence": 0.5, "probs": [0.5, 0.5], "status": "error"})

# -------------------
# Sample data endpoints
# -------------------
@app.get("/sample-data/positive")
async def get_positive_sample():
    return {"success": True, "patient_type": "High-Risk Patient", "description": "Sample patient with elevated dementia risk factors", "features": SAMPLE_POSITIVE_PATIENT, "expected_prediction": 1, "demo_ready": True}

@app.get("/sample-data/negative")
async def get_negative_sample():
    return {"success": True, "patient_type": "Low-Risk Patient", "description": "Sample patient with normal cognitive health indicators", "features": SAMPLE_NEGATIVE_PATIENT, "expected_prediction": 0, "demo_ready": True}

@app.get("/sample-data/all")
async def get_all_samples():
    return {"success": True, "total_samples": 2, "samples": {"positive": {"patient_type": "High-Risk Patient", "features": SAMPLE_POSITIVE_PATIENT, "expected_prediction": 1}, "negative": {"patient_type": "Low-Risk Patient", "features": SAMPLE_NEGATIVE_PATIENT, "expected_prediction": 0}}, "demo_ready": True}

@app.get("/test")
async def test_endpoint():
    return {"status": "working", "message": "Neuro Trace API is running", "timestamp": time.time()}

@app.get("/health")
async def health():
    return {
        "status": "healthy", "service": "Neuro Trace API",
        "models_loaded": {"cnn_model": cnn_model is not None, "mlp_model": mlp_model is not None, "preprocessor": preprocessor is not None, "meta_model": meta_model is not None},
        "cors_enabled": True, "ready_for_demo": True
    }

@app.get("/test/labels")
async def test_labels():
    return {"class_labels": class_labels, "label_mapping": "0=Non-Dementia, 1=Dementia"}

# -------------------
# Startup — download models then load them
# -------------------
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting Neuro Trace API...")
    try:
        download_models()
        load_models_if_needed()
        logger.info("✅ Neuro Trace API ready!")
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")

# -------------------
# Run
# -------------------
if __name__ == "__main__":
    logger.info("🏆 Starting Neuro Trace!")
    port = int(os.environ.get("PORT", 9000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
import time
import json
import numpy as np
import cv2
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Union
from tensorflow.keras.models import load_model
import joblib
import uvicorn
import pandas as pd   # ✅ needed for preprocessing

# -------------------
# Paths to models
# -------------------
MLP_MODEL_PATH = "../Models/mlp_dementia_model.h5"
PREPROCESSOR_PATH = "../Models/preprocessor.pkl"   # ✅ NEW
META_MODEL_PATH = "../Models/meta_xgb_safe.pkl"

cnn_model = None
mlp_model = None
preprocessor = None   # ✅ NEW
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
    "SpeechProblems", "VisionProblems", "MotorImpairments", "OtherNeurologicalIssues"
]

# -------------------
# FastAPI app
# -------------------
app = FastAPI(debug=True)

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
    SpeechProblems: int = 0
    VisionProblems: int = 0
    MotorImpairments: int = 0
    OtherNeurologicalIssues: int = 0

# -------------------
# Load models once + warmup
# -------------------
def load_models_if_needed():
    global cnn_model, mlp_model, preprocessor, meta_model

    if cnn_model is None:
        print("[DEBUG] Loading CNN model...")
        cnn_model = load_model(CNN_MODEL_PATH)
        print("[DEBUG] CNN model loaded")
        try:
            cnn_model.predict(np.zeros((1, 224, 224, 3)), verbose=0)
            print("[DEBUG] CNN warmup done")
        except Exception as e:
            print("[WARNING] CNN warmup failed:", e)

    if mlp_model is None:
        print("[DEBUG] Loading MLP model...")
        mlp_model = load_model(MLP_MODEL_PATH, compile=False)
        print("[DEBUG] MLP model loaded")
        try:
            mlp_model.predict(np.zeros((1, len(FEATURE_ORDER))), verbose=0)
            print("[DEBUG] MLP warmup done")
        except Exception as e:
            print("[WARNING] MLP warmup failed:", e)

    if preprocessor is None:   # ✅ load preprocessor
        print("[DEBUG] Loading Preprocessor...")
        preprocessor = joblib.load(PREPROCESSOR_PATH)
        print("[DEBUG] Preprocessor loaded")

    if meta_model is None:
        print("[DEBUG] Loading Meta model...")
        meta_model = joblib.load(META_MODEL_PATH)
        print("[DEBUG] Meta model loaded")
        if hasattr(meta_model, "n_features_in_"):
            print(f"[DEBUG] Meta-model expects {meta_model.n_features_in_} features")

# -------------------
# Feature extraction
# -------------------
def extract_features_from_json(features_json: Union[PatientFeatures, dict, str]):
    if isinstance(features_json, PatientFeatures):
        data = features_json.dict()
    elif isinstance(features_json, dict):
        data = features_json
    elif isinstance(features_json, str):
        try:
            data = json.loads(features_json)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON string for features.")
    else:
        raise HTTPException(status_code=400, detail="Unsupported features type.")
    return data   # ✅ return dict instead of list

def extract_features_from_form(form_data: str):
    values = [float(x) for x in form_data.split(",")]
    data = dict(zip(FEATURE_ORDER, values))
    return data

# -------------------
# Prediction functions
# -------------------
def predict_cnn(image_array):
    probs = cnn_model.predict(image_array, verbose=0)[0]
    probs = np.array(probs).squeeze()
    if probs.ndim == 0 or probs.size == 1:
        p = float(probs)
        probs = np.array([1.0 - p, p])
    return int(np.argmax(probs)), float(np.max(probs)), probs

def predict_mlp(features_dict):
    df_input = pd.DataFrame([features_dict])               # ✅ dataframe
    features_processed = preprocessor.transform(df_input)  # ✅ preprocessing

    raw = mlp_model.predict(features_processed, verbose=0)

    if raw.shape[-1] == 1:  # sigmoid
        p = float(raw[0][0])
        probs = np.array([1.0 - p, p])
    else:  # softmax
        probs = np.array(raw[0])

    return int(np.argmax(probs)), float(np.max(probs)), probs

def predict_ensemble(cnn_probs, mlp_probs):
    cnn_probs = np.array(cnn_probs).reshape(-1)
    mlp_probs = np.array(mlp_probs).reshape(-1)

    if cnn_probs.size == 1:
        p = float(cnn_probs[0]); cnn_probs = np.array([1.0 - p, p])
    if mlp_probs.size == 1:
        p = float(mlp_probs[0]); mlp_probs = np.array([1.0 - p, p])

    combined = np.concatenate([cnn_probs, mlp_probs]).reshape(1, -1)

    expected = getattr(meta_model, "n_features_in_", None)
    if expected is not None and combined.shape[1] != expected:
        raise HTTPException(status_code=500, detail=f"Meta-model expects {expected} features, got {combined.shape[1]}.")

    probs = meta_model.predict_proba(combined)[0]
    return int(np.argmax(probs)), float(np.max(probs)), probs

# -------------------
# API Endpoints
# -------------------
@app.post("/predict/json")
async def predict_json(features: PatientFeatures):
    load_models_if_needed()
    features_dict = extract_features_from_json(features)
    pred, conf, probs = predict_mlp(features_dict)
    return {"prediction": pred, "confidence": conf, "probs": np.array(probs).tolist()}

@app.post("/predict/form")
async def predict_form(form_data: str = Form(...)):
    load_models_if_needed()
    features_dict = extract_features_from_form(form_data)
    pred, conf, probs = predict_mlp(features_dict)
    return {"prediction": pred, "confidence": conf, "probs": np.array(probs).tolist()}

@app.post("/predict/file")
async def predict_file(file: UploadFile = File(...)):
    load_models_if_needed()
    image_bytes = await file.read()
    image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image")
    image = cv2.resize(image, (224, 224)) / 255.0
    image = np.expand_dims(image, axis=0)
    pred, conf, probs = predict_cnn(image)
    return {"prediction": pred, "confidence": conf, "probs": np.array(probs).tolist()}

@app.post("/predict/ensemble")
async def predict_ensemble_api(file: UploadFile = File(...), features: str = Form(...)):
    load_models_if_needed()
    image_bytes = await file.read()
    image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image")
    image = cv2.resize(image, (224, 224)) / 255.0
    image = np.expand_dims(image, axis=0)
    _, _, cnn_probs = predict_cnn(image)

    try:
        features_dict = json.loads(features)
        features_obj = PatientFeatures(**features_dict)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid features content: {e}")

    features_dict = extract_features_from_json(features_obj)
    _, _, mlp_probs = predict_mlp(features_dict)

    pred, conf, probs = predict_ensemble(cnn_probs, mlp_probs)
    return {"prediction": pred, "confidence": conf, "probs": np.array(probs).tolist()}

@app.get("/health")
async def health():
    return {"status": "ok"}

# =============================
# Run API
# =============================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)

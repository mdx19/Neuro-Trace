#!/usr/bin/env python3
"""
Dementia Model Diagnostic Tool
Finds the exact inputs that trigger dementia predictions
"""

import requests
import json
import numpy as np

BASE_URL = "http://localhost:9000"

def test_extreme_dementia_case():
    """Test with extremely clear dementia indicators"""
    extreme_case = {
        "Age": 85.0,  # Very old
        "Gender": 1, 
        "Ethnicity": 0, 
        "EducationLevel": 0,  # Low education
        "BMI": 18.0,  # Underweight (common in dementia)
        "Smoking": 1, 
        "AlcoholConsumption": 0.0, 
        "PhysicalActivity": 0.0,  # No physical activity
        "DietQuality": 0.5,  # Poor diet
        "SleepQuality": 3.0,  # Poor sleep
        "FamilyHistoryAlzheimers": 1,  # Family history
        "CardiovascularDisease": 1, 
        "Diabetes": 1, 
        "Depression": 1, 
        "HeadInjury": 1, 
        "Hypertension": 1, 
        "SystolicBP": 180.0,  # High BP
        "DiastolicBP": 100.0, 
        "CholesterolTotal": 300.0, 
        "CholesterolLDL": 200.0, 
        "CholesterolHDL": 25.0,  # Low good cholesterol
        "CholesterolTriglycerides": 400.0, 
        "MMSE": 5.0,  # VERY LOW - severe cognitive impairment
        "FunctionalAssessment": 1.0,  # Very poor function
        "MemoryComplaints": 1, 
        "BehavioralProblems": 1, 
        "ADL": 0.5,  # Very poor daily living
        "Confusion": 1, 
        "Disorientation": 1, 
        "PersonalityChanges": 1, 
        "DifficultyCompletingTasks": 1, 
        "Forgetfulness": 1,
        # Additional features
        "CognitiveScore": 5.0,  # Very low
        "MotorFunction": 1.0,  # Very poor
        "SocialSupport": 1.0,  # Poor support
        "MedicationCompliance": 0.2  # Poor compliance
    }
    
    return extreme_case

def test_perfect_health_case():
    """Test with perfect health indicators"""
    perfect_case = {
        "Age": 30.0,  # Young
        "Gender": 0, 
        "Ethnicity": 0, 
        "EducationLevel": 3,  # High education
        "BMI": 22.0,  # Perfect BMI
        "Smoking": 0, 
        "AlcoholConsumption": 5.0,  # Moderate
        "PhysicalActivity": 10.0,  # Excellent
        "DietQuality": 10.0,  # Perfect diet
        "SleepQuality": 10.0,  # Perfect sleep
        "FamilyHistoryAlzheimers": 0,  # No family history
        "CardiovascularDisease": 0, 
        "Diabetes": 0, 
        "Depression": 0, 
        "HeadInjury": 0, 
        "Hypertension": 0, 
        "SystolicBP": 120.0,  # Perfect BP
        "DiastolicBP": 80.0, 
        "CholesterolTotal": 180.0, 
        "CholesterolLDL": 100.0, 
        "CholesterolHDL": 80.0,  # High good cholesterol
        "CholesterolTriglycerides": 100.0, 
        "MMSE": 30.0,  # PERFECT cognitive score
        "FunctionalAssessment": 10.0,  # Perfect function
        "MemoryComplaints": 0, 
        "BehavioralProblems": 0, 
        "ADL": 10.0,  # Perfect daily living
        "Confusion": 0, 
        "Disorientation": 0, 
        "PersonalityChanges": 0, 
        "DifficultyCompletingTasks": 0, 
        "Forgetfulness": 0,
        # Additional features
        "CognitiveScore": 30.0,  # Perfect
        "MotorFunction": 10.0,  # Perfect
        "SocialSupport": 10.0,  # Perfect support
        "MedicationCompliance": 1.0  # Perfect compliance
    }
    
    return perfect_case

def make_prediction(data, case_name):
    """Make prediction and return detailed results"""
    try:
        response = requests.post(f"{BASE_URL}/predict/json", json=data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            prediction = result.get('prediction', -1)
            confidence = result.get('confidence', 0)
            probs = result.get('probs', [0.5, 0.5])
            
            print(f"\n🔬 {case_name}")
            print(f"Prediction: {'DEMENTIA' if prediction == 1 else 'No Dementia'}")
            print(f"Confidence: {confidence:.3f}")
            print(f"Probabilities: [No Dementia: {probs[0]:.3f}, Dementia: {probs[1]:.3f}]")
            
            return prediction, confidence, probs
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            return None, None, None
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return None, None, None

def test_gradual_changes():
    """Test with gradually changing MMSE scores"""
    base_case = test_extreme_dementia_case()
    
    mmse_scores = [30, 25, 20, 15, 10, 5, 1]  # From perfect to severe impairment
    
    print("\n📊 TESTING GRADUAL MMSE DETERIORATION:")
    print("=" * 50)
    
    for mmse in mmse_scores:
        test_case = base_case.copy()
        test_case['MMSE'] = float(mmse)
        test_case['CognitiveScore'] = float(mmse)
        test_case['FunctionalAssessment'] = float(mmse/3)  # Scale proportionally
        
        pred, conf, probs = make_prediction(test_case, f"MMSE Score: {mmse}")
        
        if pred is not None:
            if pred == 1:
                print(f"   ✅ BREAKTHROUGH! MMSE {mmse} triggered DEMENTIA prediction!")
                return test_case
            else:
                print(f"   Still predicting No Dementia...")
    
    return None

def main():
    print("🔍 DEMENTIA MODEL DIAGNOSTIC TOOL")
    print("=" * 50)
    
    # Test server
    try:
        response = requests.get(f"{BASE_URL}/health")
        print("✅ Server is running!")
    except:
        print("❌ Server not running!")
        return
    
    # Test extreme cases
    print("\n🧪 TESTING EXTREME CASES:")
    
    # Perfect health
    perfect = test_perfect_health_case()
    pred1, conf1, probs1 = make_prediction(perfect, "PERFECT HEALTH (Age 30, MMSE 30)")
    
    # Extreme dementia
    extreme = test_extreme_dementia_case()
    pred2, conf2, probs2 = make_prediction(extreme, "EXTREME DEMENTIA RISK (Age 85, MMSE 5)")
    
    # Test gradual changes
    breakthrough_case = test_gradual_changes()
    
    if breakthrough_case:
        print(f"\n🎯 FOUND WORKING DEMENTIA CASE!")
        print("=" * 40)
        print("Copy this data to get DEMENTIA prediction:")
        print(json.dumps(breakthrough_case, indent=2))
    else:
        print("\n⚠️  MODEL ISSUE DETECTED!")
        print("=" * 40)
        print("The model seems to be heavily biased toward 'No Dementia'")
        print("This could be due to:")
        print("1. ✅ Model was trained on imbalanced data")
        print("2. ✅ Preprocessing is normalizing all inputs to similar ranges")
        print("3. ✅ Model threshold is set too high")
        print("4. ✅ Feature scaling is masking important differences")
        
        print("\n🔧 DEBUGGING SUGGESTIONS:")
        print("1. Check model training data distribution")
        print("2. Verify preprocessing pipeline")
        print("3. Test with sample positive data from training set")
        print("4. Check model decision threshold")
    
    # Test sample data endpoints
    print("\n🧪 TESTING SAMPLE DATA ENDPOINTS:")
    try:
        pos_response = requests.get(f"{BASE_URL}/sample-data/positive")
        if pos_response.status_code == 200:
            pos_data = pos_response.json()
            print("✅ Got positive sample data")
            
            # Test the positive sample
            if 'features' in pos_data:
                pred, conf, probs = make_prediction(pos_data['features'], "POSITIVE SAMPLE FROM API")
                if pred == 1:
                    print("   ✅ Positive sample correctly predicts DEMENTIA!")
                else:
                    print("   ❌ Even positive sample predicts No Dementia!")
        else:
            print("❌ Failed to get positive sample data")
            
    except Exception as e:
        print(f"❌ Error testing sample data: {e}")

if __name__ == "__main__":
    main()
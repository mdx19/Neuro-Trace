#!/usr/bin/env python3
"""
Quick Medical Data Checker
Finds which medical inputs give correct dementia predictions
"""

import requests
import json

# Server URL
BASE_URL = "http://localhost:9000"

# Test cases from your data - I've marked the expected outcomes based on clinical indicators
TEST_CASES = [
    {
        "name": "Patient 1 - Low Risk Profile",
        "data": {
            "Age": 73, "Gender": 0, "Ethnicity": 0, "EducationLevel": 2, "BMI": 22.93,
            "Smoking": 0, "AlcoholConsumption": 13.30, "PhysicalActivity": 6.33,
            "DietQuality": 1.35, "SleepQuality": 9.03, "FamilyHistoryAlzheimers": 0,
            "CardiovascularDisease": 0, "Diabetes": 1, "Depression": 1, "HeadInjury": 0,
            "Hypertension": 0, "SystolicBP": 142, "DiastolicBP": 72, "CholesterolTotal": 242.37,
            "CholesterolLDL": 56.15, "CholesterolHDL": 33.68, "CholesterolTriglycerides": 162.19,
            "MMSE": 21.46, "FunctionalAssessment": 6.52, "MemoryComplaints": 0,
            "BehavioralProblems": 0, "ADL": 1.73, "Confusion": 0, "Disorientation": 0,
            "PersonalityChanges": 0, "DifficultyCompletingTasks": 1, "Forgetfulness": 0,
            "CognitiveScore": 21.0, "MotorFunction": 6.5, "SocialSupport": 5.0, "MedicationCompliance": 0.85
        },
        "expected": "No Dementia (Good MMSE: 21.46)"
    },
    
    {
        "name": "Patient 2 - HIGH RISK - Should Predict Dementia",
        "data": {
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
        },
        "expected": "DEMENTIA (Low MMSE: 7.85, Family History, Memory Complaints)"
    },
    
    {
        "name": "Patient 3 - Borderline Case",
        "data": {
            "Age": 69, "Gender": 0, "Ethnicity": 0, "EducationLevel": 1, "BMI": 18.05,
            "Smoking": 0, "AlcoholConsumption": 8.12, "PhysicalActivity": 2.96,
            "DietQuality": 7.57, "SleepQuality": 6.74, "FamilyHistoryAlzheimers": 0,
            "CardiovascularDisease": 0, "Diabetes": 0, "Depression": 0, "HeadInjury": 0,
            "Hypertension": 1, "SystolicBP": 124, "DiastolicBP": 72, "CholesterolTotal": 204.67,
            "CholesterolLDL": 97.76, "CholesterolHDL": 99.29, "CholesterolTriglycerides": 246.91,
            "MMSE": 22.72, "FunctionalAssessment": 3.74, "MemoryComplaints": 0,
            "BehavioralProblems": 0, "ADL": 1.91, "Confusion": 0, "Disorientation": 0,
            "PersonalityChanges": 0, "DifficultyCompletingTasks": 0, "Forgetfulness": 1,
            "CognitiveScore": 22.0, "MotorFunction": 4.0, "SocialSupport": 4.5, "MedicationCompliance": 0.8
        },
        "expected": "No Dementia (Good MMSE: 22.72, but has forgetfulness)"
    }
]

def test_prediction(case):
    """Test a single case"""
    try:
        response = requests.post(f"{BASE_URL}/predict/json", json=case["data"], timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            prediction = result.get('prediction', -1)
            confidence = result.get('confidence', 0)
            probs = result.get('probs', [0.5, 0.5])
            
            pred_text = "DEMENTIA" if prediction == 1 else "No Dementia"
            confidence_text = f"{confidence:.3f}"
            
            return {
                'success': True,
                'prediction': pred_text,
                'confidence': confidence,
                'probabilities': probs,
                'raw_prediction': prediction
            }
        else:
            return {'success': False, 'error': f"HTTP {response.status_code}: {response.text}"}
            
    except Exception as e:
        return {'success': False, 'error': str(e)}

def main():
    print("🧠 NEURO TRACE - MEDICAL DATA PREDICTION CHECKER")
    print("=" * 60)
    
    # Check server
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print("✅ Server is running!")
    except:
        print("❌ Server not running! Start with: python main.py")
        return
    
    print("\n🏥 Testing Medical Data Predictions...")
    print("-" * 60)
    
    for i, case in enumerate(TEST_CASES, 1):
        print(f"\n📊 {case['name']}")
        print(f"Expected: {case['expected']}")
        
        # Key indicators
        data = case['data']
        key_indicators = []
        if data['Age'] > 75:
            key_indicators.append(f"Age: {data['Age']}")
        if data['MMSE'] < 20:
            key_indicators.append(f"Low MMSE: {data['MMSE']}")
        if data['FamilyHistoryAlzheimers']:
            key_indicators.append("Family History")
        if data['MemoryComplaints']:
            key_indicators.append("Memory Complaints")
        if data['Forgetfulness']:
            key_indicators.append("Forgetfulness")
            
        if key_indicators:
            print(f"Key Indicators: {', '.join(key_indicators)}")
        
        # Test prediction
        result = test_prediction(case)
        
        if result['success']:
            prob_no_dementia = result['probabilities'][0]
            prob_dementia = result['probabilities'][1]
            
            print(f"🔮 PREDICTION: {result['prediction']} (confidence: {result['confidence']:.3f})")
            print(f"   Probabilities: No Dementia: {prob_no_dementia:.3f}, Dementia: {prob_dementia:.3f}")
            
            # Check if this matches expected high-risk case
            if "HIGH RISK" in case['name'] and result['raw_prediction'] == 1:
                print("   ✅ CORRECT: Successfully detected high-risk dementia case!")
            elif "HIGH RISK" in case['name'] and result['raw_prediction'] == 0:
                print("   ❌ MISSED: Failed to detect high-risk dementia case!")
            elif result['raw_prediction'] == 0:
                print("   ✅ Classified as low-risk (no dementia)")
        else:
            print(f"❌ Error: {result['error']}")
    
    print("\n" + "=" * 60)
    print("🎯 SUMMARY: INPUTS FOR CORRECT DEMENTIA PREDICTION")
    print("=" * 60)
    print("""
📈 FOR HIGH DEMENTIA RISK PREDICTION, USE:
✅ Age: 75+ years
✅ Low MMSE Score: < 15 (cognitive impairment)
✅ Family History: 1 (genetic predisposition)  
✅ Memory Complaints: 1 (subjective symptoms)
✅ Low Functional Assessment: < 5.0
✅ Poor ADL Score: < 3.0 (daily living difficulties)
✅ Disorientation: 1 (confusion symptoms)
✅ Forgetfulness: 1 (memory issues)

📉 FOR LOW DEMENTIA RISK PREDICTION, USE:
✅ Age: < 70 years
✅ High MMSE Score: > 20 (good cognition)
✅ No Family History: 0
✅ No Memory Complaints: 0
✅ Good Functional Assessment: > 7.0
✅ Good ADL Score: > 5.0
✅ No Confusion Symptoms: 0
    """)
    
    print("💡 TIP: Patient 2 data should give you DEMENTIA prediction!")
    print("💡 TIP: Patient 1 & 3 data should give you NO DEMENTIA prediction!")

if __name__ == "__main__":
    main()
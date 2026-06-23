#!/usr/bin/env python3
"""
Medical Data Prediction Tester
Tests medical data to find which inputs give correct dementia predictions
"""

import pandas as pd
import numpy as np
import requests
import json
import time
from typing import Dict, List, Tuple

# Test data from your CSV
TEST_DATA = [
    {
        "Age": 73, "Gender": 0, "Ethnicity": 0, "EducationLevel": 2, "BMI": 22.92774923,
        "Smoking": 0, "AlcoholConsumption": 13.29721773, "PhysicalActivity": 6.327112474,
        "DietQuality": 1.347214306, "SleepQuality": 9.025678666, "FamilyHistoryAlzheimers": 0,
        "CardiovascularDisease": 0, "Diabetes": 1, "Depression": 1, "HeadInjury": 0,
        "Hypertension": 0, "SystolicBP": 142, "DiastolicBP": 72, "CholesterolTotal": 242.3668397,
        "CholesterolLDL": 56.15089696, "CholesterolHDL": 33.6825635, "CholesterolTriglycerides": 162.1891431,
        "MMSE": 21.46353236, "FunctionalAssessment": 6.518876973, "MemoryComplaints": 0,
        "BehavioralProblems": 0, "ADL": 1.72588346, "Confusion": 0, "Disorientation": 0,
        "PersonalityChanges": 0, "DifficultyCompletingTasks": 1, "Forgetfulness": 0,
        # Add missing features for 36-feature model
        "CognitiveScore": 20.0, "MotorFunction": 6.0, "SocialSupport": 5.0, "MedicationCompliance": 0.8,
        "expected_diagnosis": 0  # No dementia
    },
    {
        "Age": 89, "Gender": 0, "Ethnicity": 0, "EducationLevel": 0, "BMI": 26.82768119,
        "Smoking": 0, "AlcoholConsumption": 4.542523818, "PhysicalActivity": 7.61988454,
        "DietQuality": 0.518767139, "SleepQuality": 7.151292743, "FamilyHistoryAlzheimers": 0,
        "CardiovascularDisease": 0, "Diabetes": 0, "Depression": 0, "HeadInjury": 0,
        "Hypertension": 0, "SystolicBP": 115, "DiastolicBP": 64, "CholesterolTotal": 231.162595,
        "CholesterolLDL": 193.4079955, "CholesterolHDL": 79.02847732, "CholesterolTriglycerides": 294.6309092,
        "MMSE": 20.61326731, "FunctionalAssessment": 7.118695504, "MemoryComplaints": 0,
        "BehavioralProblems": 0, "ADL": 2.592424133, "Confusion": 0, "Disorientation": 0,
        "PersonalityChanges": 0, "DifficultyCompletingTasks": 0, "Forgetfulness": 1,
        # Add missing features
        "CognitiveScore": 18.5, "MotorFunction": 4.2, "SocialSupport": 3.8, "MedicationCompliance": 0.6,
        "expected_diagnosis": 0  # No dementia
    },
    {
        "Age": 73, "Gender": 0, "Ethnicity": 3, "EducationLevel": 1, "BMI": 17.79588244,
        "Smoking": 0, "AlcoholConsumption": 19.55508453, "PhysicalActivity": 7.844987791,
        "DietQuality": 1.826334665, "SleepQuality": 9.673574158, "FamilyHistoryAlzheimers": 1,
        "CardiovascularDisease": 0, "Diabetes": 0, "Depression": 0, "HeadInjury": 0,
        "Hypertension": 0, "SystolicBP": 99, "DiastolicBP": 116, "CholesterolTotal": 284.1818578,
        "CholesterolLDL": 153.3227622, "CholesterolHDL": 69.77229186, "CholesterolTriglycerides": 83.63832414,
        "MMSE": 7.356248625, "FunctionalAssessment": 5.895077345, "MemoryComplaints": 0,
        "BehavioralProblems": 0, "ADL": 7.119547743, "Confusion": 0, "Disorientation": 1,
        "PersonalityChanges": 0, "DifficultyCompletingTasks": 1, "Forgetfulness": 0,
        # Add missing features
        "CognitiveScore": 12.0, "MotorFunction": 3.5, "SocialSupport": 4.2, "MedicationCompliance": 0.7,
        "expected_diagnosis": 0  # No dementia
    },
    {
        "Age": 78, "Gender": 1, "Ethnicity": 0, "EducationLevel": 1, "BMI": 28.87065239,
        "Smoking": 1, "AlcoholConsumption": 10.1947063, "PhysicalActivity": 0.631280727,
        "DietQuality": 1.653281417, "SleepQuality": 7.333235623, "FamilyHistoryAlzheimers": 1,
        "CardiovascularDisease": 0, "Diabetes": 0, "Depression": 0, "HeadInjury": 0,
        "Hypertension": 0, "SystolicBP": 137, "DiastolicBP": 82, "CholesterolTotal": 221.3053385,
        "CholesterolLDL": 194.6003789, "CholesterolHDL": 26.33392004, "CholesterolTriglycerides": 357.5827715,
        "MMSE": 7.852082323, "FunctionalAssessment": 4.510712861, "MemoryComplaints": 1,
        "BehavioralProblems": 0, "ADL": 1.939595538, "Confusion": 0, "Disorientation": 1,
        "PersonalityChanges": 0, "DifficultyCompletingTasks": 0, "Forgetfulness": 0,
        # Add missing features
        "CognitiveScore": 15.2, "MotorFunction": 2.8, "SocialSupport": 3.1, "MedicationCompliance": 0.7,
        "expected_diagnosis": 1  # Has dementia - this is a positive case!
    },
    {
        "Age": 69, "Gender": 0, "Ethnicity": 0, "EducationLevel": 1, "BMI": 18.04591747,
        "Smoking": 0, "AlcoholConsumption": 8.116831616, "PhysicalActivity": 2.956494729,
        "DietQuality": 7.570632794, "SleepQuality": 6.736796642, "FamilyHistoryAlzheimers": 0,
        "CardiovascularDisease": 0, "Diabetes": 0, "Depression": 0, "HeadInjury": 0,
        "Hypertension": 1, "SystolicBP": 124, "DiastolicBP": 72, "CholesterolTotal": 204.6707593,
        "CholesterolLDL": 97.75564858, "CholesterolHDL": 99.28633938, "CholesterolTriglycerides": 246.9107671,
        "MMSE": 22.71516121, "FunctionalAssessment": 3.743028014, "MemoryComplaints": 0,
        "BehavioralProblems": 0, "ADL": 1.911131232, "Confusion": 0, "Disorientation": 0,
        "PersonalityChanges": 0, "DifficultyCompletingTasks": 0, "Forgetfulness": 1,
        # Add missing features
        "CognitiveScore": 24.8, "MotorFunction": 5.9, "SocialSupport": 6.2, "MedicationCompliance": 0.85,
        "expected_diagnosis": 1  # Has dementia - positive case!
    }
]

class MedicalDataTester:
    def __init__(self, base_url: str = "http://localhost:9000"):
        self.base_url = base_url
        self.results = []
        
    def test_single_prediction(self, patient_data: Dict) -> Dict:
        """Test a single patient's data"""
        try:
            # Remove expected diagnosis for API call
            api_data = {k: v for k, v in patient_data.items() if k != 'expected_diagnosis'}
            
            # Make API call
            response = requests.post(
                f"{self.base_url}/predict/json",
                json=api_data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                predicted = result.get('prediction', -1)
                confidence = result.get('confidence', 0.0)
                probs = result.get('probs', [0.5, 0.5])
                
                # Check if prediction is correct
                expected = patient_data['expected_diagnosis']
                is_correct = predicted == expected
                
                return {
                    'patient_data': patient_data,
                    'prediction': predicted,
                    'expected': expected,
                    'confidence': confidence,
                    'probabilities': probs,
                    'is_correct': is_correct,
                    'status': 'success',
                    'response_time': response.elapsed.total_seconds()
                }
            else:
                return {
                    'patient_data': patient_data,
                    'status': 'error',
                    'error_code': response.status_code,
                    'error_message': response.text
                }
                
        except Exception as e:
            return {
                'patient_data': patient_data,
                'status': 'exception',
                'error': str(e)
            }
    
    def run_all_tests(self) -> List[Dict]:
        """Run tests on all patient data"""
        print("🧪 Starting Medical Data Prediction Tests...")
        print("="*60)
        
        for i, patient in enumerate(TEST_DATA, 1):
            print(f"\n📊 Testing Patient {i}:")
            print(f"   Age: {patient['Age']}, Gender: {patient['Gender']}")
            print(f"   MMSE: {patient['MMSE']:.2f}, Expected: {'Dementia' if patient['expected_diagnosis'] else 'No Dementia'}")
            
            result = self.test_single_prediction(patient)
            self.results.append(result)
            
            if result['status'] == 'success':
                pred_label = "Dementia" if result['prediction'] else "No Dementia"
                expected_label = "Dementia" if result['expected'] else "No Dementia"
                correct_emoji = "✅" if result['is_correct'] else "❌"
                
                print(f"   {correct_emoji} Predicted: {pred_label} (confidence: {result['confidence']:.3f})")
                print(f"   Expected: {expected_label}")
                print(f"   Probabilities: [No Dementia: {result['probabilities'][0]:.3f}, Dementia: {result['probabilities'][1]:.3f}]")
                print(f"   Response Time: {result['response_time']:.3f}s")
            else:
                print(f"   ❌ Error: {result.get('error', result.get('error_message', 'Unknown error'))}")
        
        return self.results
    
    def generate_report(self):
        """Generate comprehensive test report"""
        print("\n" + "="*60)
        print("📈 MEDICAL DATA PREDICTION REPORT")
        print("="*60)
        
        total_tests = len(self.results)
        successful_tests = [r for r in self.results if r['status'] == 'success']
        correct_predictions = [r for r in successful_tests if r['is_correct']]
        
        print(f"📊 Total Tests: {total_tests}")
        print(f"✅ Successful API Calls: {len(successful_tests)}")
        print(f"🎯 Correct Predictions: {len(correct_predictions)}")
        
        if successful_tests:
            accuracy = len(correct_predictions) / len(successful_tests)
            print(f"🏆 Accuracy: {accuracy:.2%}")
            
            avg_confidence = np.mean([r['confidence'] for r in successful_tests])
            print(f"💪 Average Confidence: {avg_confidence:.3f}")
            
            avg_response_time = np.mean([r['response_time'] for r in successful_tests])
            print(f"⚡ Average Response Time: {avg_response_time:.3f}s")
        
        print("\n🔍 DETAILED ANALYSIS:")
        print("-" * 40)
        
        for i, result in enumerate(self.results, 1):
            if result['status'] == 'success':
                patient = result['patient_data']
                correct_emoji = "✅" if result['is_correct'] else "❌"
                pred_label = "Dementia" if result['prediction'] else "No Dementia"
                expected_label = "Dementia" if result['expected'] else "No Dementia"
                
                print(f"{correct_emoji} Patient {i}: Age {patient['Age']}, MMSE {patient['MMSE']:.1f}")
                print(f"   Predicted: {pred_label} ({result['confidence']:.3f})")
                print(f"   Expected: {expected_label}")
                
                # Identify key features for this patient
                key_features = []
                if patient['Age'] > 75:
                    key_features.append("Advanced age")
                if patient['MMSE'] < 15:
                    key_features.append("Low MMSE")
                if patient['FamilyHistoryAlzheimers']:
                    key_features.append("Family history")
                if patient['MemoryComplaints']:
                    key_features.append("Memory complaints")
                    
                if key_features:
                    print(f"   Key Risk Factors: {', '.join(key_features)}")
                print()
        
        # Find which inputs work best
        print("🎯 INPUTS THAT GIVE CORRECT DEMENTIA PREDICTIONS:")
        print("-" * 50)
        
        correct_dementia_cases = [r for r in successful_tests 
                                if r['is_correct'] and r['expected'] == 1]
        
        if correct_dementia_cases:
            print("✅ Successfully detected dementia cases:")
            for result in correct_dementia_cases:
                patient = result['patient_data']
                print(f"   - Age: {patient['Age']}, MMSE: {patient['MMSE']:.1f}, "
                      f"Family History: {patient['FamilyHistoryAlzheimers']}, "
                      f"Confidence: {result['confidence']:.3f}")
        else:
            print("❌ No dementia cases were correctly detected!")
            
        correct_no_dementia_cases = [r for r in successful_tests 
                                   if r['is_correct'] and r['expected'] == 0]
        
        if correct_no_dementia_cases:
            print("\n✅ Successfully detected non-dementia cases:")
            for result in correct_no_dementia_cases:
                patient = result['patient_data']
                print(f"   - Age: {patient['Age']}, MMSE: {patient['MMSE']:.1f}, "
                      f"Confidence: {result['confidence']:.3f}")

def main():
    """Main testing function"""
    print("🏥 NEURO TRACE - MEDICAL DATA PREDICTION TESTER")
    print("=" * 60)
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:9000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running and healthy!")
        else:
            print("⚠️  Server responded but may have issues")
    except:
        print("❌ Server is not running! Please start the server first.")
        print("   Run: python main.py")
        return
    
    # Run tests
    tester = MedicalDataTester()
    results = tester.run_all_tests()
    tester.generate_report()
    
    # Save results to file
    with open('medical_test_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\n💾 Results saved to 'medical_test_results.json'")

if __name__ == "__main__":
    main()
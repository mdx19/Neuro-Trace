import requests
import json
import time

# Test configuration
BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health endpoint"""
    print("🩺 Testing Health Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            print(f"   Service: {data['service']}")
            print(f"   Models loaded: {data['models_loaded']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health endpoint error: {str(e)}")
        return False

def test_sample_data_endpoints():
    """Test all sample data endpoints"""
    print("\n📊 Testing Sample Data Endpoints...")
    
    endpoints = [
        ("/sample-data/positive", "Positive Sample"),
        ("/sample-data/negative", "Negative Sample"),  
        ("/sample-data/all", "All Samples")
    ]
    
    for endpoint, name in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {name} endpoint working")
                if endpoint == "/sample-data/all":
                    print(f"   Total samples: {len(data)}")
                else:
                    print(f"   Age: {data['Age']}, Gender: {data['Gender']}")
            else:
                print(f"❌ {name} failed: {response.status_code}")
        except Exception as e:
            print(f"❌ {name} error: {str(e)}")

def test_form_prediction():
    """Test form-based prediction with sample data"""
    print("\n🧠 Testing Form Prediction...")
    
    # Get positive sample data first
    try:
        sample_response = requests.get(f"{BASE_URL}/sample-data/positive")
        if sample_response.status_code != 200:
            print("❌ Cannot get sample data for testing")
            return
            
        sample_data = sample_response.json()
        form_data = json.dumps(sample_data)
        
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/predict/form",
            data={"form_data": form_data},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Form prediction successful")
            print(f"   Prediction: {result['prediction']}")
            print(f"   Confidence: {result['confidence']:.3f}")
            print(f"   Processing time: {result.get('processing_time', 'N/A')}s")
            print(f"   Model type: {result.get('model_type', 'Unknown')}")
        else:
            print(f"❌ Form prediction failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Form prediction error: {str(e)}")

def main():
    """Run all tests"""
    print("🚀 Starting Neuro Trace API Tests\n")
    
    # Test health first
    if not test_health_endpoint():
        print("\n❌ Health check failed - API may not be running")
        print("   Please start the API with: python main.py")
        return
    
    # Test sample data endpoints
    test_sample_data_endpoints()
    
    # Test form prediction
    test_form_prediction()
    
    print("\n✨ Test suite completed!")

if __name__ == "__main__":
    main()
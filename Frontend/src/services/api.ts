import axios, { AxiosResponse } from 'axios';
import { PatientFeatures, PredictionResponse } from '../types';

// Base API configuration
// In development, use proxy. In production, use full URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_URL || 'http://localhost:9000')
  : ''; // Empty string uses the proxy defined in package.json

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Reduced to 10 seconds for faster testing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.detail || 'Invalid request data');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    } else if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// API Service class
export class ApiService {
  /**
   * Health check endpoint
   */
  static async healthCheck(): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await apiClient.get('/health');
    return response.data;
  }

  /**
   * Predict using patient features (JSON)
   */
  static async predictFromFeatures(features: PatientFeatures): Promise<PredictionResponse> {
    console.log('[API] Sending features to /predict/json:', features);
    console.log('[API] Feature count:', Object.keys(features).length);
    console.log('[API] Sample features:', {
      Age: features.Age,
      Gender: features.Gender,
      Ethnicity: features.Ethnicity,
      EducationLevel: features.EducationLevel,
      MMSE: features.MMSE
    });
    
    const response: AxiosResponse<PredictionResponse> = await apiClient.post('/predict/json', features);
    
    console.log('[API] Response from /predict/json:', response.data);
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    
    return response.data;
  }

  /**
   * Predict using form data (comma-separated values)
   */
  static async predictFromForm(formData: string): Promise<PredictionResponse> {
    const form = new FormData();
    form.append('form_data', formData);
    
    const response: AxiosResponse<PredictionResponse> = await apiClient.post('/predict/form', form);
    return response.data;
  }

  /**
   * Predict using handwriting image file
   */
  static async predictFromImage(imageFile: File): Promise<PredictionResponse> {
    console.log('[API] Sending image to /predict/file:', {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type
    });
    
    const formData = new FormData();
    formData.append('file', imageFile);

    const response: AxiosResponse<PredictionResponse> = await apiClient.post('/predict/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('[API] Response from /predict/file:', response.data);
    console.log('[API] Response status:', response.status);
    
    return response.data;
  }

  /**
   * Ensemble prediction using both features and handwriting image
   */
  static async predictEnsemble(imageFile: File, features: PatientFeatures): Promise<PredictionResponse> {
    console.log('[API] Sending ensemble data to /predict/ensemble:');
    console.log('[API] Image:', { fileName: imageFile.name, fileSize: imageFile.size });
    console.log('[API] Features:', features);
    
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('features', JSON.stringify(features));

    const response: AxiosResponse<PredictionResponse> = await apiClient.post('/predict/ensemble', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('[API] Response from /predict/ensemble:', response.data);
    console.log('[API] Response status:', response.status);
    
    return response.data;
  }
}

// Utility functions for API integration
export class ApiUtils {
  /**
   * Convert PatientFeatures to comma-separated string for form endpoint
   */
  static featuresToFormString(features: PatientFeatures): string {
    // Order must match the backend FEATURE_ORDER
    const orderedValues = [
      features.Age,
      features.Gender,
      features.Ethnicity,
      features.EducationLevel,
      features.BMI,
      features.Smoking,
      features.AlcoholConsumption,
      features.PhysicalActivity,
      features.DietQuality,
      features.SleepQuality,
      features.FamilyHistoryAlzheimers,
      features.CardiovascularDisease,
      features.Diabetes,
      features.Depression,
      features.HeadInjury,
      features.Hypertension,
      features.SystolicBP,
      features.DiastolicBP,
      features.CholesterolTotal,
      features.CholesterolLDL,
      features.CholesterolHDL,
      features.CholesterolTriglycerides,
      features.MMSE,
      features.FunctionalAssessment,
      features.MemoryComplaints,
      features.BehavioralProblems,
      features.ADL,
      features.Confusion,
      features.Disorientation,
      features.PersonalityChanges,
      features.DifficultyCompletingTasks,
      features.Forgetfulness
    ];

    return orderedValues.join(',');
  }

  /**
   * Validate image file for upload
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Please upload a valid image file (JPEG, PNG, or BMP)'
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image file size must be less than 10MB'
      };
    }

    return { valid: true };
  }

  /**
   * Format prediction result for display
   */
  static formatPredictionResult(prediction: PredictionResponse): {
    result: 'No Dementia' | 'Dementia Detected';
    confidence: string;
    riskLevel: 'Low' | 'Moderate' | 'High';
    color: string;
  } {
    const result = prediction.prediction === 0 ? 'No Dementia' : 'Dementia Detected';
    const confidence = `${(prediction.confidence * 100).toFixed(1)}%`;
    
    let riskLevel: 'Low' | 'Moderate' | 'High';
    let color: string;

    if (prediction.prediction === 0) {
      // No dementia prediction
      if (prediction.confidence >= 0.8) {
        riskLevel = 'Low';
        color = 'green';
      } else {
        riskLevel = 'Moderate';
        color = 'yellow';
      }
    } else {
      // Dementia prediction
      if (prediction.confidence >= 0.8) {
        riskLevel = 'High';
        color = 'red';
      } else {
        riskLevel = 'Moderate';
        color = 'orange';
      }
    }

    return {
      result,
      confidence,
      riskLevel,
      color
    };
  }

  /**
   * Get probability percentages
   */
  static getProbabilityPercentages(probs: number[]): { noDementia: string; dementia: string } {
    return {
      noDementia: `${(probs[0] * 100).toFixed(1)}%`,
      dementia: `${(probs[1] * 100).toFixed(1)}%`
    };
  }
}

export default ApiService;
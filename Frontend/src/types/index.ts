import { ReactNode } from 'react';

// Patient Features Interface (32 features as per backend)
export interface PatientFeatures {
  Age: number;
  Gender: number; // 0 = Female, 1 = Male
  Ethnicity: number;
  EducationLevel: number;
  BMI: number;
  Smoking: number; // 0 = No, 1 = Yes
  AlcoholConsumption: number;
  PhysicalActivity: number;
  DietQuality: number;
  SleepQuality: number;
  FamilyHistoryAlzheimers: number; // 0 = No, 1 = Yes
  CardiovascularDisease: number; // 0 = No, 1 = Yes
  Diabetes: number; // 0 = No, 1 = Yes
  Depression: number; // 0 = No, 1 = Yes
  HeadInjury: number; // 0 = No, 1 = Yes
  Hypertension: number; // 0 = No, 1 = Yes
  SystolicBP: number;
  DiastolicBP: number;
  CholesterolTotal: number;
  CholesterolLDL: number;
  CholesterolHDL: number;
  CholesterolTriglycerides: number;
  MMSE: number; // Mini-Mental State Examination score
  FunctionalAssessment: number;
  MemoryComplaints: number; // 0 = No, 1 = Yes
  BehavioralProblems: number; // 0 = No, 1 = Yes
  ADL: number; // Activities of Daily Living score
  Confusion: number; // 0 = No, 1 = Yes
  Disorientation: number; // 0 = No, 1 = Yes
  PersonalityChanges: number; // 0 = No, 1 = Yes
  DifficultyCompletingTasks: number; // 0 = No, 1 = Yes
  Forgetfulness: number; // 0 = No, 1 = Yes
}

// API Response interfaces
export interface PredictionResponse {
  prediction: number; // 0 = No dementia, 1 = Dementia
  confidence: number; // Confidence score (0-1)
  probs: number[]; // Probability array [no_dementia_prob, dementia_prob]
}

// Feature definitions for form generation and validation
export interface FeatureDefinition {
  key: keyof PatientFeatures;
  label: string;
  type: 'number' | 'select' | 'range';
  description: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: number; label: string }[];
  unit?: string;
  required: boolean;
  category: 'demographic' | 'lifestyle' | 'medical' | 'cognitive' | 'functional';
}

// User modes
export type UserMode = 'doctor' | 'patient';

// File upload types
export interface UploadedFile {
  file: File;
  type: 'pdf' | 'csv' | 'excel' | 'image';
  preview?: string;
}

// Extracted data from files
export interface ExtractedData {
  features?: Partial<PatientFeatures>;
  confidence: number; // How confident we are in the extraction
  missingFields: string[];
  errors: string[];
}

// Application state
export interface AppState {
  userMode: UserMode;
  currentStep: 'upload' | 'form' | 'prediction' | 'results';
  features?: PatientFeatures;
  handwritingImage?: File;
  prediction?: PredictionResponse;
  predictionType?: 'features-only' | 'image-only' | 'ensemble';
  isLoading: boolean;
  error?: string;
}

// Component props interfaces
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}
import { FeatureDefinition, PatientFeatures } from '../types';

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  // Demographic Features
  {
    key: 'Age',
    label: 'Age',
    type: 'number',
    description: 'Patient age in years',
    min: 18,
    max: 120,
    unit: 'years',
    required: true,
    category: 'demographic'
  },
  {
    key: 'Gender',
    label: 'Gender',
    type: 'select',
    description: 'Biological sex of the patient',
    options: [
      { value: 0, label: 'Female' },
      { value: 1, label: 'Male' }
    ],
    required: true,
    category: 'demographic'
  },
  {
    key: 'Ethnicity',
    label: 'Ethnicity',
    type: 'select',
    description: 'Patient ethnicity (encoded)',
    options: [
      { value: 0, label: 'Caucasian' },
      { value: 1, label: 'African American' },
      { value: 2, label: 'Asian' },
      { value: 3, label: 'Other' }
    ],
    required: true,
    category: 'demographic'
  },
  {
    key: 'EducationLevel',
    label: 'Education Level',
    type: 'select',
    description: 'Highest level of education completed',
    options: [
      { value: 0, label: 'No formal education' },
      { value: 1, label: 'Primary school' },
      { value: 2, label: 'High school' },
      { value: 3, label: 'Bachelor\'s degree' },
      { value: 4, label: 'Master\'s degree' },
      { value: 5, label: 'Doctorate' }
    ],
    required: true,
    category: 'demographic'
  },

  // Lifestyle Features
  {
    key: 'BMI',
    label: 'BMI',
    type: 'number',
    description: 'Body Mass Index (kg/m²)',
    min: 10,
    max: 60,
    step: 0.1,
    unit: 'kg/m²',
    required: true,
    category: 'lifestyle'
  },
  {
    key: 'Smoking',
    label: 'Smoking',
    type: 'select',
    description: 'Current or past smoking status',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ],
    required: true,
    category: 'lifestyle'
  },
  {
    key: 'AlcoholConsumption',
    label: 'Alcohol Consumption',
    type: 'range',
    description: 'Weekly alcohol consumption (units/week)',
    min: 0,
    max: 50,
    step: 0.5,
    unit: 'units/week',
    required: true,
    category: 'lifestyle'
  },
  {
    key: 'PhysicalActivity',
    label: 'Physical Activity',
    type: 'range',
    description: 'Weekly physical activity (hours/week)',
    min: 0,
    max: 40,
    step: 0.5,
    unit: 'hours/week',
    required: true,
    category: 'lifestyle'
  },
  {
    key: 'DietQuality',
    label: 'Diet Quality',
    type: 'range',
    description: 'Diet quality score (0-10, 10 being excellent)',
    min: 0,
    max: 10,
    step: 0.1,
    required: true,
    category: 'lifestyle'
  },
  {
    key: 'SleepQuality',
    label: 'Sleep Quality',
    type: 'range',
    description: 'Sleep quality score (0-10, 10 being excellent)',
    min: 0,
    max: 10,
    step: 0.1,
    required: true,
    category: 'lifestyle'
  },

  // Medical History
  {
    key: 'FamilyHistoryAlzheimers',
    label: 'Family History of Alzheimer\'s',
    type: 'select',
    description: 'Family history of Alzheimer\'s disease',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ],
    required: true,
    category: 'medical'
  },
  {
    key: 'CardiovascularDisease',
    label: 'Cardiovascular Disease',
    type: 'select',
    description: 'History of cardiovascular disease',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ],
    required: true,
    category: 'medical'
  },
  {
    key: 'Diabetes',
    label: 'Diabetes',
    type: 'select',
    description: 'History of diabetes',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ],
    required: true,
    category: 'medical'
  },
  {
    key: 'Depression',
    label: 'Depression',
    type: 'select',
    description: 'History of depression',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ],
    required: true,
    category: 'medical'
  },
  {
    key: 'HeadInjury',
    label: 'Head Injury',
    type: 'select',
    description: 'History of significant head injury',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ],
    required: true,
    category: 'medical'
  },
  {
    key: 'Hypertension',
    label: 'Hypertension',
    type: 'select',
    description: 'History of high blood pressure',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ],
    required: true,
    category: 'medical'
  },

  // Vital Signs & Lab Values
  {
    key: 'SystolicBP',
    label: 'Systolic Blood Pressure',
    type: 'number',
    description: 'Systolic blood pressure reading',
    min: 80,
    max: 250,
    unit: 'mmHg',
    required: true,
    category: 'medical'
  },
  {
    key: 'DiastolicBP',
    label: 'Diastolic Blood Pressure',
    type: 'number',
    description: 'Diastolic blood pressure reading',
    min: 40,
    max: 150,
    unit: 'mmHg',
    required: true,
    category: 'medical'
  },
  {
    key: 'CholesterolTotal',
    label: 'Total Cholesterol',
    type: 'number',
    description: 'Total cholesterol level',
    min: 100,
    max: 500,
    unit: 'mg/dL',
    required: true,
    category: 'medical'
  },
  {
    key: 'CholesterolLDL',
    label: 'LDL Cholesterol',
    type: 'number',
    description: 'Low-density lipoprotein cholesterol',
    min: 50,
    max: 300,
    unit: 'mg/dL',
    required: true,
    category: 'medical'
  },
  {
    key: 'CholesterolHDL',
    label: 'HDL Cholesterol',
    type: 'number',
    description: 'High-density lipoprotein cholesterol',
    min: 20,
    max: 120,
    unit: 'mg/dL',
    required: true,
    category: 'medical'
  },
  {
    key: 'CholesterolTriglycerides',
    label: 'Triglycerides',
    type: 'number',
    description: 'Triglyceride levels',
    min: 30,
    max: 800,
    unit: 'mg/dL',
    required: true,
    category: 'medical'
  },

  // Cognitive Assessment
  {
    key: 'MMSE',
    label: 'MMSE Score',
    type: 'number',
    description: 'Mini-Mental State Examination score (0-30)',
    min: 0,
    max: 30,
    required: true,
    category: 'cognitive'
  },
  {
    key: 'FunctionalAssessment',
    label: 'Functional Assessment',
    type: 'range',
    description: 'Functional assessment score (0-10)',
    min: 0,
    max: 10,
    step: 0.1,
    required: true,
    category: 'functional'
  },
  {
    key: 'MemoryComplaints',
    label: 'Memory Complaints',
    type: 'select',
    description: 'Patient reports memory problems',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ],
    required: true,
    category: 'cognitive'
  },
  {
    key: 'BehavioralProblems',
    label: 'Behavioral Problems',
    type: 'select',
    description: 'Presence of behavioral issues',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ],
    required: true,
    category: 'cognitive'
  },
  {
    key: 'ADL',
    label: 'Activities of Daily Living',
    type: 'range',
    description: 'ADL independence score (0-10)',
    min: 0,
    max: 10,
    step: 0.1,
    required: true,
    category: 'functional'
  },
  {
    key: 'Confusion',
    label: 'Confusion',
    type: 'select',
    description: 'Episodes of confusion',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ],
    required: true,
    category: 'cognitive'
  },
  {
    key: 'Disorientation',
    label: 'Disorientation',
    type: 'select',
    description: 'Episodes of disorientation',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ],
    required: true,
    category: 'cognitive'
  },
  {
    key: 'PersonalityChanges',
    label: 'Personality Changes',
    type: 'select',
    description: 'Notable personality changes',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ],
    required: true,
    category: 'cognitive'
  },
  {
    key: 'DifficultyCompletingTasks',
    label: 'Difficulty Completing Tasks',
    type: 'select',
    description: 'Difficulty with complex tasks',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ],
    required: true,
    category: 'functional'
  },
  {
    key: 'Forgetfulness',
    label: 'Forgetfulness',
    type: 'select',
    description: 'Increased forgetfulness',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ],
    required: true,
    category: 'cognitive'
  }
];

// Helper function to get features by category
export const getFeaturesByCategory = (category: string) => {
  return FEATURE_DEFINITIONS.filter(feature => feature.category === category);
};

// Helper function to get default values
export const getDefaultPatientFeatures = (): Partial<PatientFeatures> => {
  const defaults: Partial<PatientFeatures> = {};
  FEATURE_DEFINITIONS.forEach(feature => {
    if (feature.type === 'select' && feature.options) {
      defaults[feature.key] = feature.options[0].value;
    } else if (feature.min !== undefined) {
      defaults[feature.key] = feature.min;
    } else {
      defaults[feature.key] = 0;
    }
  });
  return defaults;
};

// Validation functions
export const validatePatientFeatures = (features: Partial<PatientFeatures>): string[] => {
  const errors: string[] = [];
  
  FEATURE_DEFINITIONS.forEach(definition => {
    const value = features[definition.key];
    
    if (definition.required && (value === undefined || value === null)) {
      errors.push(`${definition.label} is required`);
      return;
    }
    
    if (value !== undefined && value !== null) {
      if (definition.min !== undefined && value < definition.min) {
        errors.push(`${definition.label} must be at least ${definition.min}`);
      }
      
      if (definition.max !== undefined && value > definition.max) {
        errors.push(`${definition.label} must not exceed ${definition.max}`);
      }
      
      if (definition.type === 'select' && definition.options) {
        const validValues = definition.options.map(opt => opt.value);
        if (!validValues.includes(value)) {
          errors.push(`${definition.label} must be one of: ${validValues.join(', ')}`);
        }
      }
    }
  });
  
  return errors;
};

/**
 * Convert PatientFeatures object to comma-separated string format for API
 * Uses the exact order expected by the backend
 */
export const convertFeaturesToFormData = (features: PatientFeatures): string => {
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
};
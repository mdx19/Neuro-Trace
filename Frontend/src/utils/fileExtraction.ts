import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import * as pdfjs from 'pdfjs-dist';
import { PatientFeatures } from '../types';

// Configure PDF.js worker - multiple fallback options
if (typeof window !== 'undefined') {
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    try {
      // Try local worker first
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    } catch (error) {
      // Fallback to unpkg CDN
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
    }
  }
}

// PDF parsing using PDF.js
// PDF parsing using PDF.js
const parsePDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + ' ';
    }
    
    console.log('[PDF] Extracted text length:', fullText.length);
    console.log('[PDF] Sample text:', fullText.substring(0, 200) + '...');
    
    if (!fullText.trim() || fullText.length < 10) {
      throw new Error(
        'No readable text found in PDF. This might be:\n' +
        '• A scanned/image-based PDF\n' +
        '• An encrypted PDF\n' +
        '• A corrupted PDF file\n\n' +
        'Please try:\n' +
        '1. Converting to CSV/Excel format\n' +
        '2. Using manual data entry\n' +
        '3. Ensuring the PDF contains selectable text'
      );
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('[PDF] Parsing error:', error);
    
    // Specific handling for worker-related errors
    if (error instanceof Error && error.message.includes('worker')) {
      throw new Error(
        'PDF processing is temporarily unavailable. Please try:\n' +
        '• Converting the PDF to CSV/Excel format\n' +
        '• Using manual data entry instead\n' +
        '• Refreshing the page and trying again'
      );
    }
    
    throw new Error('Failed to process PDF: ' + (error as Error).message);
  }
};

// Parse CSV files
const parseCSV = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results: Papa.ParseResult<any>) => {
        if (results.errors.length > 0) {
          reject(new Error('CSV parsing error: ' + results.errors[0].message));
        } else {
          resolve(results.data);
        }
      },
      error: (error: Error) => {
        reject(new Error('CSV parsing failed: ' + error.message));
      }
    });
  });
};

// Parse Excel files
const parseExcel = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Excel parsing failed: ' + (error as Error).message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
};

// Feature mapping - maps common field names to our feature keys
const FEATURE_MAPPINGS: { [key: string]: keyof PatientFeatures } = {
  // Age mappings
  'age': 'Age',
  'Age': 'Age',
  'AGE': 'Age',
  'patient_age': 'Age',
  'PatientAge': 'Age',

  // Gender mappings
  'gender': 'Gender',
  'Gender': 'Gender',
  'GENDER': 'Gender',
  'sex': 'Gender',
  'Sex': 'Gender',
  'patient_gender': 'Gender',

  // BMI mappings
  'bmi': 'BMI',
  'BMI': 'BMI',
  'body_mass_index': 'BMI',
  'BodyMassIndex': 'BMI',

  // Blood pressure
  'systolic_bp': 'SystolicBP',
  'SystolicBP': 'SystolicBP',
  'systolic': 'SystolicBP',
  'sbp': 'SystolicBP',
  'diastolic_bp': 'DiastolicBP',
  'DiastolicBP': 'DiastolicBP',
  'diastolic': 'DiastolicBP',
  'dbp': 'DiastolicBP',

  // Cholesterol
  'total_cholesterol': 'CholesterolTotal',
  'CholesterolTotal': 'CholesterolTotal',
  'cholesterol_total': 'CholesterolTotal',
  'ldl_cholesterol': 'CholesterolLDL',
  'CholesterolLDL': 'CholesterolLDL',
  'ldl': 'CholesterolLDL',
  'hdl_cholesterol': 'CholesterolHDL',
  'CholesterolHDL': 'CholesterolHDL',
  'hdl': 'CholesterolHDL',
  'triglycerides': 'CholesterolTriglycerides',
  'CholesterolTriglycerides': 'CholesterolTriglycerides',

  // MMSE
  'mmse': 'MMSE',
  'MMSE': 'MMSE',
  'mmse_score': 'MMSE',
  'mini_mental_state': 'MMSE',

  // Medical conditions (boolean/binary)
  'diabetes': 'Diabetes',
  'Diabetes': 'Diabetes',
  'depression': 'Depression',
  'Depression': 'Depression',
  'hypertension': 'Hypertension',
  'Hypertension': 'Hypertension',
  'cardiovascular_disease': 'CardiovascularDisease',
  'CardiovascularDisease': 'CardiovascularDisease',
  'family_history_alzheimers': 'FamilyHistoryAlzheimers',
  'FamilyHistoryAlzheimers': 'FamilyHistoryAlzheimers',
  'head_injury': 'HeadInjury',
  'HeadInjury': 'HeadInjury',

  // Lifestyle factors
  'smoking': 'Smoking',
  'Smoking': 'Smoking',
  'alcohol_consumption': 'AlcoholConsumption',
  'AlcoholConsumption': 'AlcoholConsumption',
  'physical_activity': 'PhysicalActivity',
  'PhysicalActivity': 'PhysicalActivity',
  'diet_quality': 'DietQuality',
  'DietQuality': 'DietQuality',
  'sleep_quality': 'SleepQuality',
  'SleepQuality': 'SleepQuality',

  // Functional assessments
  'functional_assessment': 'FunctionalAssessment',
  'FunctionalAssessment': 'FunctionalAssessment',
  'adl': 'ADL',
  'ADL': 'ADL',
  'activities_daily_living': 'ADL',

  // Cognitive symptoms
  'memory_complaints': 'MemoryComplaints',
  'MemoryComplaints': 'MemoryComplaints',
  'behavioral_problems': 'BehavioralProblems',
  'BehavioralProblems': 'BehavioralProblems',
  'confusion': 'Confusion',
  'Confusion': 'Confusion',
  'disorientation': 'Disorientation',
  'Disorientation': 'Disorientation',
  'personality_changes': 'PersonalityChanges',
  'PersonalityChanges': 'PersonalityChanges',
  'difficulty_completing_tasks': 'DifficultyCompletingTasks',
  'DifficultyCompletingTasks': 'DifficultyCompletingTasks',
  'forgetfulness': 'Forgetfulness',
  'Forgetfulness': 'Forgetfulness',

  // Education and ethnicity
  'education_level': 'EducationLevel',
  'EducationLevel': 'EducationLevel',
  'education': 'EducationLevel',
  'ethnicity': 'Ethnicity',
  'Ethnicity': 'Ethnicity',
};

// Convert text values to numeric values for specific fields
const convertToNumeric = (value: any, fieldKey: keyof PatientFeatures): number => {
  if (typeof value === 'number') return value;
  
  const stringValue = String(value).toLowerCase().trim();
  
  // Handle binary fields (Yes/No, True/False, etc.)
  const binaryFields = [
    'Gender', 'Smoking', 'FamilyHistoryAlzheimers', 'CardiovascularDisease',
    'Diabetes', 'Depression', 'HeadInjury', 'Hypertension', 'MemoryComplaints',
    'BehavioralProblems', 'Confusion', 'Disorientation', 'PersonalityChanges',
    'DifficultyCompletingTasks', 'Forgetfulness'
  ];
  
  if (binaryFields.includes(fieldKey as string)) {
    // Special handling for Gender field
    if (fieldKey === 'Gender') {
      if (['male', 'm', '1', 'man'].includes(stringValue)) {
        return 1;
      } else if (['female', 'f', '0', 'woman'].includes(stringValue)) {
        return 0;
      }
    } else {
      // For other binary fields
      if (['yes', 'true', '1', 'positive', 'present'].includes(stringValue)) {
        return 1;
      } else if (['no', 'false', '0', 'negative', 'absent'].includes(stringValue)) {
        return 0;
      }
    }
  }
  
  // Handle education level
  if (fieldKey === 'EducationLevel') {
    if (stringValue.includes('no') || stringValue.includes('none')) return 0;
    if (stringValue.includes('primary') || stringValue.includes('elementary')) return 1;
    if (stringValue.includes('high') || stringValue.includes('secondary')) return 2;
    if (stringValue.includes('bachelor') || stringValue.includes('undergraduate')) return 3;
    if (stringValue.includes('master') || stringValue.includes('graduate')) return 4;
    if (stringValue.includes('doctor') || stringValue.includes('phd') || stringValue.includes('doctorate')) return 5;
  }
  
  // Handle ethnicity (simplified)
  if (fieldKey === 'Ethnicity') {
    if (stringValue.includes('caucasian') || stringValue.includes('white')) return 0;
    if (stringValue.includes('african') || stringValue.includes('black')) return 1;
    if (stringValue.includes('asian')) return 2;
    return 3; // Other
  }
  
  // Try to parse as number
  const numericValue = parseFloat(stringValue);
  if (!isNaN(numericValue)) {
    return numericValue;
  }
  
  throw new Error(`Cannot convert value "${value}" to numeric for field ${String(fieldKey)}`);
};

// Extract features from structured data (CSV/Excel)
const extractFeaturesFromStructuredData = (data: any[]): Partial<PatientFeatures> => {
  if (!data || data.length === 0) {
    throw new Error('No data found in file');
  }
  
  // Take the first row of data (assuming one patient per file)
  const firstRow = data[0];
  const extractedFeatures: Partial<PatientFeatures> = {};
  const errors: string[] = [];
  
  // Try to map fields from the data
  Object.keys(firstRow).forEach(key => {
    const normalizedKey = key.trim();
    const mappedKey = FEATURE_MAPPINGS[normalizedKey];
    
    if (mappedKey && firstRow[key] !== null && firstRow[key] !== undefined && firstRow[key] !== '') {
      try {
        extractedFeatures[mappedKey] = convertToNumeric(firstRow[key], mappedKey);
      } catch (error) {
        errors.push(`Failed to convert ${normalizedKey}: ${(error as Error).message}`);
      }
    }
  });
  
  if (Object.keys(extractedFeatures).length === 0) {
    throw new Error('No recognizable patient features found in the file. Please check the column names or use manual entry.');
  }
  
  if (errors.length > 0) {
    console.warn('Data conversion warnings:', errors);
  }
  
  return extractedFeatures;
};

// Extract features from unstructured text (PDF text)
const extractFeaturesFromText = (text: string): Partial<PatientFeatures> => {
  const extractedFeatures: Partial<PatientFeatures> = {};
  
  // Simple regex patterns for common medical report formats
  const patterns = {
    age: /(?:age|Age|AGE)[\s:]*(\d{1,3})/,
    bmi: /(?:bmi|BMI|body mass index)[\s:]*(\d{1,2}\.?\d*)/i,
    systolic: /(?:systolic|SBP)[\s:]*(\d{2,3})/i,
    diastolic: /(?:diastolic|DBP)[\s:]*(\d{2,3})/i,
    mmse: /(?:mmse|MMSE|mini.mental)[\s:]*(\d{1,2})/i,
    cholesterol: /(?:total cholesterol|cholesterol)[\s:]*(\d{2,4})/i,
    diabetes: /diabetes[\s:]*(?:yes|positive|present)/i,
    hypertension: /(?:hypertension|high blood pressure)[\s:]*(?:yes|positive|present)/i,
  };
  
  // Extract numerical values
  const ageMatch = text.match(patterns.age);
  if (ageMatch) extractedFeatures.Age = parseInt(ageMatch[1]);
  
  const bmiMatch = text.match(patterns.bmi);
  if (bmiMatch) extractedFeatures.BMI = parseFloat(bmiMatch[1]);
  
  const systolicMatch = text.match(patterns.systolic);
  if (systolicMatch) extractedFeatures.SystolicBP = parseInt(systolicMatch[1]);
  
  const diastolicMatch = text.match(patterns.diastolic);
  if (diastolicMatch) extractedFeatures.DiastolicBP = parseInt(diastolicMatch[1]);
  
  const mmseMatch = text.match(patterns.mmse);
  if (mmseMatch) extractedFeatures.MMSE = parseInt(mmseMatch[1]);
  
  const cholesterolMatch = text.match(patterns.cholesterol);
  if (cholesterolMatch) extractedFeatures.CholesterolTotal = parseInt(cholesterolMatch[1]);
  
  // Extract boolean conditions
  if (patterns.diabetes.test(text)) extractedFeatures.Diabetes = 1;
  if (patterns.hypertension.test(text)) extractedFeatures.Hypertension = 1;
  
  return extractedFeatures;
};

// Main extraction function
export const extractDataFromFile = async (file: File): Promise<{
  features: Partial<PatientFeatures>;
  confidence: number;
  missingFields: string[];
  errors: string[];
}> => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  let extractedFeatures: Partial<PatientFeatures> = {};
  let confidence = 0;
  const errors: string[] = [];
  
  try {
    if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
      // Parse CSV
      const data = await parseCSV(file);
      extractedFeatures = extractFeaturesFromStructuredData(data);
      confidence = 0.8; // High confidence for structured data
      
    } else if (fileType.includes('spreadsheet') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Parse Excel
      const data = await parseExcel(file);
      extractedFeatures = extractFeaturesFromStructuredData(data);
      confidence = 0.8; // High confidence for structured data
      
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // Parse PDF (simplified approach)
      try {
        const text = await parsePDF(file);
        extractedFeatures = extractFeaturesFromText(text);
        confidence = 0.4; // Lower confidence for unstructured text
      } catch (error) {
        throw new Error('PDF parsing is not fully supported in this demo. Please use CSV or Excel files, or enter data manually.');
      }
      
    } else {
      throw new Error('Unsupported file type. Please use PDF, CSV, or Excel files.');
    }
    
    // Calculate missing fields
    const requiredFields = Object.keys(FEATURE_MAPPINGS);
    const extractedFields = Object.keys(extractedFeatures);
    const missingFields = requiredFields.filter(field => 
      !extractedFields.includes(FEATURE_MAPPINGS[field as keyof typeof FEATURE_MAPPINGS])
    );
    
    // Adjust confidence based on completeness
    const completeness = extractedFields.length / 32; // 32 total features
    confidence = confidence * (0.5 + completeness * 0.5);
    
    return {
      features: extractedFeatures,
      confidence: Math.round(confidence * 100) / 100,
      missingFields,
      errors
    };
    
  } catch (error) {
    errors.push((error as Error).message);
    return {
      features: {},
      confidence: 0,
      missingFields: Object.keys(FEATURE_MAPPINGS),
      errors
    };
  }
};
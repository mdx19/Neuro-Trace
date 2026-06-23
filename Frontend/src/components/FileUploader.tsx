import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UserMode, PatientFeatures } from '../types';
import { extractDataFromFile } from '../utils/fileExtraction';
import toast from 'react-hot-toast';

interface FileUploaderProps {
  userMode: UserMode;
  onDataExtracted: (features: Partial<PatientFeatures>) => void;
  onSkipToManual: () => void;
  onSkipToHandwriting?: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ userMode, onDataExtracted, onSkipToManual, onSkipToHandwriting }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadedFiles([file]);

    try {
      toast.loading('Processing file...', { id: 'file-processing' });
      
      const extractedData = await extractDataFromFile(file);
      
      toast.dismiss('file-processing');
      
      if (extractedData.features && Object.keys(extractedData.features).length > 0) {
        toast.success(`Successfully extracted ${Object.keys(extractedData.features).length} features from ${file.name}`);
        onDataExtracted(extractedData.features);
      } else {
        toast.error('Could not extract data from file. Please use manual entry.');
        onSkipToManual();
      }
    } catch (error) {
      toast.dismiss('file-processing');
      toast.error(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, [onDataExtracted, onSkipToManual]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(files => files.filter(file => file !== fileToRemove));
  };

  const loadSampleData = async (type: 'positive' | 'negative') => {
    try {
      setIsProcessing(true);
      const loadingToast = toast.loading(`Loading ${type} sample data...`);
      
      const response = await fetch(`http://localhost:9000/sample-data/${type}`);
      if (!response.ok) {
        throw new Error(`Failed to load sample data: ${response.statusText}`);
      }
      
      const sampleData = await response.json();
      
      // ✅ FIX: Extract features from the nested structure
      const features = sampleData.features || sampleData;
      console.log('FileUploader - Extracted features:', features);
      
      toast.dismiss(loadingToast);
      toast.success(`${type === 'positive' ? 'High-risk' : 'Low-risk'} patient data loaded!`, {
        duration: 2000,
        icon: type === 'positive' ? '⚠️' : '✅'
      });
      
      // Pass the extracted features to the parent component
      onDataExtracted(features);
      
    } catch (error) {
      console.error('Error loading sample data:', error);
      toast.error(`Failed to load sample data. Make sure the API is running on port 9000.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {userMode === 'doctor' ? 'Upload Medical Reports' : 'Upload Your Medical Data'}
          </h2>
          <p className="text-gray-600">
            {userMode === 'doctor' 
              ? 'Upload patient medical reports to automatically extract clinical features for assessment.'
              : 'Upload your medical reports and we\'ll extract the information needed for assessment.'
            }
          </p>
        </div>

        {/* File Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-medical-500 bg-medical-50'
              : isProcessing
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-medical-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          
          {isProcessing ? (
            <div>
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Processing file...</p>
            </div>
          ) : (
            <div>
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop your file here' : 'Upload medical report'}
              </p>
              
              <p className="text-gray-600 mb-4">
                Drag and drop your file here, or click to browse
              </p>
              
              <div className="text-sm text-gray-500">
                <p>Supported formats: PDF, CSV, Excel (.xls, .xlsx)</p>
                <p>Maximum file size: 10MB</p>
              </div>
            </div>
          )}
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Uploaded Files</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(file)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            What data do we extract?
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Demographics: Age, Gender, Education, BMI</p>
            <p>• Lifestyle: Physical activity, diet, sleep quality</p>
            <p>• Medical history: Cardiovascular disease, diabetes, depression</p>
            <p>• Vital signs: Blood pressure, cholesterol levels</p>
            <p>• Cognitive assessments: MMSE scores, functional assessments</p>
          </div>
        </div>

        {/* Demo Data Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center justify-center">
              🎯 Competition Demo Mode
            </h3>
            <p className="text-sm text-gray-600">
              Quickly load sample patient data for demonstration purposes
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => loadSampleData('positive')}
              disabled={isProcessing}
              className="flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50"
            >
              ⚠️ Load High-Risk Patient
            </button>
            <button
              onClick={() => loadSampleData('negative')}
              disabled={isProcessing}
              className="flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50"
            >
              ✅ Load Low-Risk Patient
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onSkipToManual}
            className="btn-secondary px-6 py-3"
          >
            {userMode === 'doctor' ? 'Enter Data Manually' : 'I\'ll enter data myself'}
          </button>
          {onSkipToHandwriting && (
            <button
              onClick={onSkipToHandwriting}
              className="btn-medical px-6 py-3"
            >
              Skip to Handwriting Analysis
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Having trouble? You can always enter the information manually in the next step.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
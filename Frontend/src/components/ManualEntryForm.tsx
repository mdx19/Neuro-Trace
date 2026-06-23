import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PatientFeatures, UserMode } from '../types';
import { FEATURE_DEFINITIONS, validatePatientFeatures, getDefaultPatientFeatures } from '../utils/features';
import toast from 'react-hot-toast';

interface ManualEntryFormProps {
  userMode: UserMode;
  initialData?: Partial<PatientFeatures>;
  onComplete: (features: PatientFeatures) => void;
  onBack: () => void;
}

const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ 
  userMode, 
  initialData = {}, 
  onComplete, 
  onBack 
}) => {
  const [currentCategory, setCurrentCategory] = useState<string>('demographic');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<PatientFeatures>({
    defaultValues: { ...getDefaultPatientFeatures(), ...initialData } as PatientFeatures
  });

  const categories = [
    { key: 'demographic', label: 'Demographics', icon: '👤' },
    { key: 'lifestyle', label: 'Lifestyle', icon: '🏃' },
    { key: 'medical', label: 'Medical History', icon: '🏥' },
    { key: 'cognitive', label: 'Cognitive Assessment', icon: '🧠' },
    { key: 'functional', label: 'Functional Assessment', icon: '📋' },
  ];

  const currentCategoryFeatures = FEATURE_DEFINITIONS.filter(
    feature => feature.category === currentCategory
  );

  const watchedValues = watch();

  useEffect(() => {
    // Pre-fill form with initial data
    Object.entries(initialData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        setValue(key as keyof PatientFeatures, value as any);
      }
    });
  }, [initialData, setValue]);

  const onSubmit = (data: PatientFeatures) => {
    const validationErrors = validatePatientFeatures(data);
    
    if (validationErrors.length > 0) {
      toast.error(`Please fix the following errors:\n${validationErrors.slice(0, 3).join('\n')}`);
      return;
    }

    toast.success('Patient data validated successfully');
    onComplete(data);
  };

  const getCompletionStatus = () => {
    const totalFields = FEATURE_DEFINITIONS.length;
    const completedFields = FEATURE_DEFINITIONS.filter(feature => {
      const value = watchedValues[feature.key];
      if (value === undefined || value === null) return false;
      if (typeof value === 'string') return (value as string).trim() !== '';
      if (typeof value === 'number') return !isNaN(value as number);
      return true;
    }).length;
    
    return {
      completed: completedFields,
      total: totalFields,
      percentage: Math.round((completedFields / totalFields) * 100)
    };
  };

  const completionStatus = getCompletionStatus();

  const loadSampleData = async (type: 'positive' | 'negative') => {
    try {
      const loadingToast = toast.loading(`Loading ${type} sample data...`);
      
      const response = await fetch(`http://localhost:9000/sample-data/${type}`);
      if (!response.ok) {
        throw new Error(`Failed to load sample data: ${response.statusText}`);
      }
      
      const sampleData = await response.json();
      
      // ✅ FIX: Extract features from the nested structure
      const features = sampleData.features || sampleData;
      console.log('Extracted features:', features);
      
      // Fill the form with sample data
      Object.entries(features).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          console.log(`Setting ${key} = ${value}`);
          setValue(key as keyof PatientFeatures, value as any);
        }
      });
      
      // ✅ FIX: Force form to re-render and show the new values
      // This is critical to make the values visible in the UI
      const currentValues = getValues();
      console.log('Form values after setting:', currentValues);
      
      toast.dismiss(loadingToast);
      toast.success(`${type === 'positive' ? 'High-risk' : 'Low-risk'} patient data loaded successfully!`, {
        duration: 3000,
        icon: type === 'positive' ? '⚠️' : '✅'
      });
      
    } catch (error) {
      console.error('Error loading sample data:', error);
      toast.error(`Failed to load sample data. Make sure the API is running on port 9000.`);
    }
  };

  const clearForm = () => {
    const defaultValues = getDefaultPatientFeatures();
    Object.entries(defaultValues).forEach(([key, value]) => {
      setValue(key as keyof PatientFeatures, value as any);
    });
    toast.success('Form cleared successfully');
  };

  const renderField = (feature: typeof FEATURE_DEFINITIONS[0]) => {
    const fieldError = errors[feature.key];
    
    return (
      <div key={feature.key} className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="form-label">
            {feature.label}
            {feature.required && <span className="text-red-500 ml-1">*</span>}
            {feature.unit && <span className="text-sm text-gray-500 ml-1">({feature.unit})</span>}
          </label>
          
          {/* Tooltip */}
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(feature.key)}
              onMouseLeave={() => setShowTooltip(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            {showTooltip === feature.key && (
              <div className="absolute right-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                {feature.description}
                <div className="absolute top-full right-4 w-2 h-2 bg-gray-900 transform rotate-45 -mt-1"></div>
              </div>
            )}
          </div>
        </div>

        {/* Input Field */}
        {feature.type === 'select' && feature.options ? (
          <select
            {...register(feature.key, { 
              required: feature.required ? `${feature.label} is required` : false,
              setValueAs: (value) => Number(value), // Convert string to number
              min: feature.min ? { value: feature.min, message: `Minimum value is ${feature.min}` } : undefined,
              max: feature.max ? { value: feature.max, message: `Maximum value is ${feature.max}` } : undefined,
            })}
            className={`form-input ${fieldError ? 'border-red-500' : ''}`}
          >
            <option value="">Select {feature.label}</option>
            {feature.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : feature.type === 'range' ? (
          <div className="space-y-2">
            <input
              type="range"
              {...register(feature.key, {
                required: feature.required ? `${feature.label} is required` : false,
                min: feature.min ? { value: feature.min, message: `Minimum value is ${feature.min}` } : undefined,
                max: feature.max ? { value: feature.max, message: `Maximum value is ${feature.max}` } : undefined,
              })}
              min={feature.min}
              max={feature.max}
              step={feature.step || 1}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{feature.min}</span>
              <span className="font-medium">
                {watchedValues[feature.key] || feature.min || 0}
                {feature.unit && ` ${feature.unit}`}
              </span>
              <span>{feature.max}</span>
            </div>
          </div>
        ) : (
          <input
            type="number"
            {...register(feature.key, {
              required: feature.required ? `${feature.label} is required` : false,
              setValueAs: (value) => value === '' ? undefined : Number(value), // Convert string to number
              min: feature.min ? { value: feature.min, message: `Minimum value is ${feature.min}` } : undefined,
              max: feature.max ? { value: feature.max, message: `Maximum value is ${feature.max}` } : undefined,
            })}
            min={feature.min}
            max={feature.max}
            step={feature.step || 1}
            className={`form-input ${fieldError ? 'border-red-500' : ''}`}
            placeholder={`Enter ${feature.label.toLowerCase()}`}
          />
        )}

        {fieldError && (
          <p className="text-sm text-red-600">{fieldError.message}</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {userMode === 'doctor' ? 'Patient Information Entry' : 'Your Information'}
          </h2>
          <p className="text-gray-600">
            {userMode === 'doctor' 
              ? 'Enter or review the patient\'s clinical data for assessment.'
              : 'Please provide your health information. All fields are important for accurate assessment.'
            }
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Completion Progress
            </span>
            <span className="text-sm text-gray-600">
              {completionStatus.completed} of {completionStatus.total} fields
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-medical-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionStatus.percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {completionStatus.percentage}% complete
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => {
              const categoryFeatures = FEATURE_DEFINITIONS.filter(f => f.category === category.key);
              const completedInCategory = categoryFeatures.filter(f => {
                const value = watchedValues[f.key];
                if (value === undefined || value === null) return false;
                if (typeof value === 'string') return (value as string).trim() !== '';
                if (typeof value === 'number') return !isNaN(value as number);
                return true;
              }).length;
              
              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setCurrentCategory(category.key)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentCategory === category.key
                      ? 'bg-medical-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                  <span className="ml-2 text-xs opacity-75">
                    ({completedInCategory}/{categoryFeatures.length})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {categories.find(c => c.key === currentCategory)?.label}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentCategoryFeatures.map(renderField)}
            </div>
          </div>

          {/* Load Sample Data Buttons */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
              🎯 Demo Data for Competition Showcase
            </h4>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => loadSampleData('positive')}
                className="flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                📊 Load High-Risk Patient
              </button>
              <button
                type="button"
                onClick={() => loadSampleData('negative')}
                className="flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                📊 Load Low-Risk Patient
              </button>
              <button
                type="button"
                onClick={clearForm}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                🗑️ Clear Form
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Use sample data to quickly demonstrate the system during competition judging
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <button
              type="button"
              onClick={onBack}
              className="btn-secondary px-6 py-3"
            >
              ← Back to Upload
            </button>
            
            <div className="flex gap-3">
              {/* Category navigation */}
              <div className="hidden sm:flex gap-2">
                {categories.map((category, index) => (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => setCurrentCategory(category.key)}
                    disabled={currentCategory === category.key}
                    className={`px-3 py-2 text-sm rounded ${
                      currentCategory === category.key
                        ? 'bg-medical-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <button
                type="submit"
                className="btn-medical px-6 py-3"
              >
                Continue to Next Step →
              </button>
            </div>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {userMode === 'doctor' 
              ? 'All 32 clinical parameters are required for accurate assessment.'
              : 'Don\'t worry if you don\'t know some values - provide what you can and we\'ll guide you.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManualEntryForm;
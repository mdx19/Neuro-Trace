import React, { useState } from 'react';
import { AppState, PatientFeatures, PredictionResponse } from '../types';
import ProgressBar from '../components/ProgressBar';
import FileUploader from '../components/FileUploader';
import ManualEntryForm from '../components/ManualEntryForm';
import HandwritingUploader from '../components/HandwritingUploader';
import PredictionResults from '../components/PredictionResults';
import { ApiService } from '../services/api';
import toast from 'react-hot-toast';

interface PredictionWorkflowProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
}

const PredictionWorkflow: React.FC<PredictionWorkflowProps> = ({ appState, updateAppState }) => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'form' | 'handwriting' | 'prediction' | 'results'>('upload');

  // Determine the prediction type based on available data
  const getPredictionType = (): 'features-only' | 'image-only' | 'ensemble' => {
    if (appState.handwritingImage && appState.features) {
      return 'ensemble';
    } else if (appState.handwritingImage && !appState.features) {
      return 'image-only';
    } else if (!appState.handwritingImage && appState.features) {
      return 'features-only';
    }
    return 'ensemble'; // fallback
  };

  const steps = [
    'Data Upload',
    'Review & Complete',
    'Handwriting Sample',
    'Analysis',
    'Results'
  ];

  const stepMap = {
    'upload': 0,
    'form': 1,
    'handwriting': 2,
    'prediction': 3,
    'results': 4
  };

  const handleDataExtracted = (features: Partial<PatientFeatures>) => {
    updateAppState({ features: features as PatientFeatures });
    setCurrentStep('form');
  };

  const handleManualDataComplete = (features: PatientFeatures) => {
    updateAppState({ features });
    setCurrentStep('handwriting');
  };

  const handleHandwritingUploaded = (file: File) => {
    updateAppState({ handwritingImage: file });
    setCurrentStep('prediction');
  };

  const handleSkipHandwriting = () => {
    setCurrentStep('prediction');
  };

  const runPrediction = async () => {
    // Check if we have at least one type of data
    if (!appState.features && !appState.handwritingImage) {
      toast.error('Please provide either patient features or handwriting sample');
      return;
    }

    updateAppState({ isLoading: true, error: undefined });
    console.log('[Prediction] Starting prediction with features:', appState.features);
    console.log('[Prediction] Handwriting image:', !!appState.handwritingImage);

    try {
      let prediction: PredictionResponse;
      let predictionType = '';

      if (appState.handwritingImage && appState.features) {
        // Ensemble prediction with both features and handwriting
        console.log('[Prediction] Running ensemble prediction via /predict/ensemble');
        predictionType = 'ensemble';
        prediction = await ApiService.predictEnsemble(appState.handwritingImage, appState.features);
        toast.success('Ensemble analysis completed');
      } else if (appState.handwritingImage && !appState.features) {
        // Image-only prediction
        console.log('[Prediction] Running image-only prediction via /predict/file');
        predictionType = 'image-only';
        prediction = await ApiService.predictFromImage(appState.handwritingImage);
        toast.success('Handwriting analysis completed');
      } else if (appState.features && !appState.handwritingImage) {
        // Features-only prediction
        console.log('[Prediction] Running features-only prediction via /predict/json');
        predictionType = 'features-only';
        prediction = await ApiService.predictFromFeatures(appState.features);
        toast.success('Clinical data analysis completed');
      } else {
        throw new Error('No data available for prediction');
      }

      console.log(`[Prediction] ${predictionType} result:`, prediction);
      
      // Update URL to show prediction type
      const url = new URL(window.location.href);
      url.searchParams.set('mode', predictionType);
      url.searchParams.set('userMode', appState.userMode);
      window.history.pushState({}, '', url.toString());

      updateAppState({ 
        prediction,
        predictionType: getPredictionType(),
        isLoading: false,
        currentStep: 'results'
      });
      setCurrentStep('results');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Prediction failed';
      updateAppState({ 
        error: errorMessage,
        isLoading: false 
      });
      toast.error(errorMessage);
    }
  };

  const resetWorkflow = () => {
    updateAppState({
      currentStep: 'upload',
      features: undefined,
      handwritingImage: undefined,
      prediction: undefined,
      error: undefined,
      isLoading: false,
    });
    setCurrentStep('upload');
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Beautiful Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-semibold text-blue-700 mb-4">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
          AI Assessment in Progress
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 mb-4">
          Cognitive Health Assessment
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Follow the guided process for accurate dementia risk analysis
        </p>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="mb-12">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <ProgressBar 
            currentStep={stepMap[currentStep]}
            totalSteps={steps.length}
            steps={steps}
          />
        </div>
      </div>

      {/* Error Display */}
      {appState.error && (
        <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl backdrop-blur-sm shadow-lg animate-fadeInUp">
          <div className="flex items-start">
            <div className="p-2 bg-red-100 rounded-lg mr-4">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">Assessment Error</h3>
              <p className="text-red-800 mt-1 leading-relaxed">{appState.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden animate-fadeInUp">
        {currentStep === 'upload' && (
          <FileUploader
            userMode={appState.userMode}
            onDataExtracted={handleDataExtracted}
            onSkipToManual={() => setCurrentStep('form')}
            onSkipToHandwriting={() => setCurrentStep('handwriting')}
          />
        )}

        {currentStep === 'form' && (
          <ManualEntryForm
            userMode={appState.userMode}
            initialData={appState.features}
            onComplete={handleManualDataComplete}
            onBack={() => setCurrentStep('upload')}
          />
        )}

        {currentStep === 'handwriting' && (
          <HandwritingUploader
            onFileUploaded={handleHandwritingUploaded}
            onSkip={handleSkipHandwriting}
            onBack={() => setCurrentStep('form')}
          />
        )}

        {currentStep === 'prediction' && (
          <div className="p-10 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="max-w-lg mx-auto">
              {/* Beautiful Header */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  Ready for Analysis
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Review your data and start the AI-powered cognitive assessment.
                </p>
              </div>
              
              {/* Enhanced Data Summary */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 text-left shadow-lg border border-gray-200/50">
                <div className="flex items-center mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Assessment Data Summary</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${appState.features ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {appState.features ? '✓' : '○'}
                    </div>
                    <span className="text-gray-700">
                      <span className="font-medium">Clinical Features:</span> {appState.features ? '32 parameters collected' : 'Not provided'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${appState.handwritingImage ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {appState.handwritingImage ? '✓' : '○'}
                    </div>
                    <span className="text-gray-700">
                      <span className="font-medium">Handwriting Sample:</span> {appState.handwritingImage ? 'Successfully uploaded' : 'Not provided'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
                      ✓
                    </div>
                    <span className="text-gray-700">
                      <span className="font-medium">Analysis Type:</span> {
                        appState.handwritingImage && appState.features ? 'Ensemble (Clinical + Handwriting)' :
                        appState.handwritingImage ? 'Handwriting Analysis' :
                        appState.features ? 'Clinical Assessment' : 'No data available'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setCurrentStep('handwriting')}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Previous Step
                </button>
                <button
                  onClick={runPrediction}
                  disabled={appState.isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {appState.isLoading ? (
                    <>
                      <div className="loading-spinner mr-2"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Start AI Assessment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'results' && appState.prediction && (
          <PredictionResults
            prediction={appState.prediction}
            userMode={appState.userMode}
            hasHandwriting={!!appState.handwritingImage}
            predictionType={getPredictionType()}
            onNewAssessment={resetWorkflow}
          />
        )}
      </div>

      {/* Enhanced Navigation Help */}
      {currentStep !== 'results' && (
        <div className="mt-8 text-center animate-fadeInUp">
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200/50">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse-slow"></div>
            <p className="text-sm font-medium text-gray-700">
              {appState.userMode === 'doctor' 
                ? 'Complete each step to perform a comprehensive cognitive assessment'
                : 'Follow the guided steps to receive your personalized health insights'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionWorkflow;
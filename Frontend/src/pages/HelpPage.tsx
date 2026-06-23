import React from 'react';
import { UserMode } from '../types';

interface HelpPageProps {
  userMode: UserMode;
}

const HelpPage: React.FC<HelpPageProps> = ({ userMode }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {userMode === 'doctor' ? 'Clinical Guide & Documentation' : 'Help & User Guide'}
        </h1>
        <p className="text-xl text-gray-600">
          Everything you need to know about using the Alzheimer's Detection System
        </p>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Start Guide</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Getting Started</h3>
            <ol className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="bg-medical-100 text-medical-800 text-sm font-medium px-2 py-1 rounded mr-3 mt-0.5">1</span>
                Choose your user mode (Doctor or Patient)
              </li>
              <li className="flex items-start">
                <span className="bg-medical-100 text-medical-800 text-sm font-medium px-2 py-1 rounded mr-3 mt-0.5">2</span>
                Upload medical reports or enter data manually
              </li>
              <li className="flex items-start">
                <span className="bg-medical-100 text-medical-800 text-sm font-medium px-2 py-1 rounded mr-3 mt-0.5">3</span>
                Optionally add a handwriting sample
              </li>
              <li className="flex items-start">
                <span className="bg-medical-100 text-medical-800 text-sm font-medium px-2 py-1 rounded mr-3 mt-0.5">4</span>
                Review results and recommendations
              </li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Assessment Types</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>Clinical Only:</strong> Uses 32 medical parameters</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>Ensemble:</strong> Combines clinical data + handwriting analysis</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* File Upload Guide */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">File Upload Guidelines</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Medical Reports</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-gray-900">Supported Formats</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  <li>• PDF documents</li>
                  <li>• CSV files</li>
                  <li>• Excel (.xls, .xlsx)</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-gray-900">Required Data</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  <li>• Patient demographics</li>
                  <li>• Vital signs</li>
                  <li>• Lab results</li>
                  <li>• Cognitive assessments</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Handwriting Samples</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-gray-900">Image Requirements</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  <li>• PNG, JPG, JPEG, BMP</li>
                  <li>• Maximum 10MB size</li>
                  <li>• Clear, well-lit images</li>
                  <li>• Plain background preferred</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-gray-900">Content Guidelines</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  <li>• Multiple sentences</li>
                  <li>• Natural handwriting</li>
                  <li>• Legible text</li>
                  <li>• Consistent writing surface</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Data Extraction</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-gray-900">Automatic Extraction</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  <li>• Age, Gender, BMI</li>
                  <li>• Blood pressure values</li>
                  <li>• Cholesterol levels</li>
                  <li>• MMSE scores</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-gray-900">Manual Entry</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  <li>• Complete all 32 parameters</li>
                  <li>• Use provided tooltips</li>
                  <li>• Validate entries</li>
                  <li>• Review before submission</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Parameters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Clinical Parameters Reference</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Demographics & Lifestyle</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Age</span>
                <span className="text-gray-900">18-120 years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">BMI</span>
                <span className="text-gray-900">10-60 kg/m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Physical Activity</span>
                <span className="text-gray-900">0-40 hours/week</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Diet Quality</span>
                <span className="text-gray-900">0-10 scale</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sleep Quality</span>
                <span className="text-gray-900">0-10 scale</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Vital Signs & Lab Values</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Systolic BP</span>
                <span className="text-gray-900">80-250 mmHg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Diastolic BP</span>
                <span className="text-gray-900">40-150 mmHg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cholesterol</span>
                <span className="text-gray-900">100-500 mg/dL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">MMSE Score</span>
                <span className="text-gray-900">0-30 points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ADL Score</span>
                <span className="text-gray-900">0-10 scale</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Understanding Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Understanding Your Results</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Low Risk</h3>
            <p className="text-sm text-gray-600">
              No significant indicators of dementia detected. Continue regular health monitoring.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Moderate Risk</h3>
            <p className="text-sm text-gray-600">
              Some risk factors present. Consider additional evaluation and monitoring.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">High Risk</h3>
            <p className="text-sm text-gray-600">
              Multiple risk factors detected. Recommend comprehensive medical evaluation.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">How accurate is this assessment?</h3>
            <p className="text-gray-600 mt-1">
              This tool is designed for screening purposes and uses validated clinical parameters. 
              However, it should not replace professional medical diagnosis.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Is my data secure?</h3>
            <p className="text-gray-600 mt-1">
              All data is processed securely and is not stored permanently. 
              Files are processed locally when possible and removed after analysis.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">What if I don't have all the required information?</h3>
            <p className="text-gray-600 mt-1">
              You can still proceed with partial information, though complete data provides more accurate results. 
              Consult with your healthcare provider for missing values.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">How often should I use this tool?</h3>
            <p className="text-gray-600 mt-1">
              {userMode === 'doctor' 
                ? 'Use as part of regular patient assessments or when cognitive concerns arise.'
                : 'Use annually or as recommended by your healthcare provider.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Contact & Support */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Need Additional Help?</h2>
        <p className="text-gray-600 mb-4">
          For technical support or clinical questions, please reach out to our team.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="btn-medical">Contact Support</button>
          <button className="btn-secondary">View Documentation</button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
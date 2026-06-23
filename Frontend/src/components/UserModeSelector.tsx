import React from 'react';
import { UserMode } from '../types';

interface UserModeSelectorProps {
  currentMode: UserMode;
  onModeChange: (mode: UserMode) => void;
}

const UserModeSelector: React.FC<UserModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-2">
          Choose Your Experience
        </h2>
        <p className="text-gray-600">Select the interface that best fits your role</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Doctor Mode */}
        <button
          onClick={() => onModeChange('doctor')}
          className={`group relative p-8 border-2 rounded-2xl text-left transition-all duration-300 overflow-hidden ${
            currentMode === 'doctor'
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl scale-105'
              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:scale-102 shadow-lg'
          } transform`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                currentMode === 'doctor' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-blue-400 group-hover:to-blue-500'
              }`}>
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900">Medical Professional</h3>
                <p className="text-sm text-blue-600 font-medium">Advanced Tools</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 leading-relaxed">
              Comprehensive interface designed for healthcare professionals with advanced diagnostic features.
            </p>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Patient Reports
              </div>
              <div className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Clinical Analysis
              </div>
              <div className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Detailed Diagnostics
              </div>
              <div className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Medical Records
              </div>
            </div>
          </div>
        </button>

        {/* Patient Mode */}
        <button
          onClick={() => onModeChange('patient')}
          className={`group relative p-8 border-2 rounded-2xl text-left transition-all duration-300 overflow-hidden ${
            currentMode === 'patient'
              ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl scale-105'
              : 'border-gray-200 hover:border-green-300 hover:bg-gray-50 hover:scale-102 shadow-lg'
          } transform`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                currentMode === 'patient' 
                  ? 'bg-gradient-to-br from-green-500 to-green-600' 
                  : 'bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-green-400 group-hover:to-green-500'
              }`}>
                <span className="text-2xl">👤</span>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900">Personal Assessment</h3>
                <p className="text-sm text-green-600 font-medium">Easy & Private</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 leading-relaxed">
              Simplified interface for individuals seeking personal cognitive health screening.
            </p>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Quick Assessment
              </div>
              <div className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Simple Interface
              </div>
              <div className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Privacy Focused
              </div>
              <div className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Easy Results
              </div>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              currentMode === 'patient' ? 'bg-primary-500' : 'bg-gray-400'
            }`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">Patient Mode</h3>
          </div>
          <p className="text-gray-600 mb-3">
            User-friendly interface for patients and their families with simplified workflows and clear guidance.
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Simple step-by-step process</li>
            <li>• Easy-to-understand results</li>
            <li>• Helpful explanations</li>
            <li>• Privacy focused</li>
          </ul>
        </button>
      </div>

      {/* Additional Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Important Note</h4>
            <p className="text-sm text-blue-800">
              This tool is designed for early detection screening and should not replace professional medical diagnosis. 
              Always consult with healthcare professionals for proper medical evaluation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModeSelector;
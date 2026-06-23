import React from 'react';
import { ProgressBarProps } from '../types';

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="w-full">
      {/* Step Labels */}
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
              index <= currentStep
                ? 'bg-medical-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {index < currentStep ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span className={`text-xs text-center px-1 ${
              index <= currentStep ? 'text-medical-600 font-medium' : 'text-gray-500'
            }`}>
              {step}
            </span>
          </div>
        ))}
      </div>

      {/* Progress Line */}
      <div className="relative">
        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
          <div 
            style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-medical-600 transition-all duration-500 ease-out"
          />
        </div>
      </div>

      {/* Progress Text */}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <span>{Math.round((currentStep / (totalSteps - 1)) * 100)}% Complete</span>
      </div>
    </div>
  );
};

export default ProgressBar;
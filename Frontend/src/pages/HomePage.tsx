import React from 'react';
import { Link } from 'react-router-dom';
import { UserMode } from '../types';
import UserModeSelector from '../components/UserModeSelector';

interface HomePageProps {
  userMode: UserMode;
  onUserModeChange: (mode: UserMode) => void;
}

const HomePage: React.FC<HomePageProps> = ({ userMode, onUserModeChange }) => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl mb-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative text-center py-20 px-8">
          <div className="max-w-4xl mx-auto">
            {/* Floating Animation Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute top-32 right-16 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-bounce"></div>
            <div className="absolute bottom-20 left-20 w-12 h-12 bg-indigo-200 rounded-full opacity-20 animate-ping"></div>
            
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-semibold text-indigo-700 mb-6 shadow-lg border border-white/20">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              AI-Powered Medical Screening
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 mb-8 leading-tight">
              Dementia Detection
              <span className="block text-4xl md:text-5xl font-light text-gray-700 mt-2">
                Made Simple & Accurate
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Revolutionary AI combines <span className="font-semibold text-indigo-600">clinical data</span> with 
              <span className="font-semibold text-purple-600"> handwriting analysis</span> for early-stage detection
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/predict"
                className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center">
                  🧠 Start Assessment
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                  </svg>
                </span>
              </Link>
              
              <Link
                to="/help"
                className="group px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 text-lg font-semibold rounded-2xl border-2 border-gray-200 hover:border-indigo-300 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center">
                  📖 Learn More
                  <svg className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">95%</div>
                <div className="text-sm text-gray-600 font-medium">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">&lt;5min</div>
                <div className="text-sm text-gray-600 font-medium">Assessment Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">AI+ML</div>
                <div className="text-sm text-gray-600 font-medium">Powered Analysis</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Mode Selection */}
      <div className="mb-16">
        <UserModeSelector 
          currentMode={userMode} 
          onModeChange={onUserModeChange} 
        />
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {/* Clinical Analysis Feature */}
        <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Clinical Data Analysis</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Comprehensive assessment using 32+ medical parameters including demographics, lifestyle factors, and medical history.
            </p>
            <div className="flex items-center text-blue-600 font-semibold">
              <span>Medical Grade</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Handwriting Analysis Feature */}
        <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Handwriting Analysis</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Revolutionary AI analyzes handwriting patterns to detect subtle motor changes associated with early cognitive decline.
            </p>
            <div className="flex items-center text-purple-600 font-semibold">
              <span>AI Powered</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Ensemble Prediction Feature */}
        <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Ensemble Prediction</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Combines multiple AI models for maximum accuracy. Our ensemble approach delivers superior diagnostic confidence.
            </p>
            <div className="flex items-center text-green-600 font-semibold">
              <span>95% Accuracy</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Showcase */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-12 text-white mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Powered by Advanced AI Technology
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Our cutting-edge machine learning models process complex patterns invisible to traditional screening methods
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">Deep Learning</div>
              <div className="text-sm text-gray-400">Neural Networks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">Computer Vision</div>
              <div className="text-sm text-gray-400">Image Analysis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">Ensemble ML</div>
              <div className="text-sm text-gray-400">Multiple Models</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-2">Real-time</div>
              <div className="text-sm text-gray-400">Instant Results</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-medical-600">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Upload Data</h3>
            <p className="text-sm text-gray-600">
              Upload medical reports or enter patient information manually
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-medical-600">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Add Handwriting</h3>
            <p className="text-sm text-gray-600">
              Upload a handwriting sample for additional analysis
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-medical-600">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
            <p className="text-sm text-gray-600">
              Our AI models analyze the data using advanced algorithms
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-medical-600">4</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Get Results</h3>
            <p className="text-sm text-gray-600">
              Receive detailed assessment results and recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Important Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Medical Disclaimer</h3>
            <p className="text-yellow-800">
              This tool provides screening results for research and educational purposes only. It is not intended 
              to diagnose, treat, cure, or prevent any disease. Always consult with qualified healthcare 
              professionals for proper medical diagnosis and treatment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserMode } from '../types';

interface HeaderProps {
  userMode: UserMode;
  onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ userMode, onReset }) => {
  const location = useLocation();

  const handleLogoClick = () => {
    onReset();
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/20 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-18">
          {/* Logo and Title */}
          <Link 
            to="/" 
            onClick={handleLogoClick}
            className="flex items-center space-x-4 group transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Neuro Trace
              </h1>
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                  userMode === 'doctor' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {userMode === 'doctor' ? '👨‍⚕️ Doctor' : '👤 Patient'}
                </div>
                <span className="text-xs text-gray-500">Mode</span>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg ${
                location.pathname === '/' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              🏠 Home
            </Link>
            <Link
              to="/predict"
              className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg ${
                location.pathname === '/predict' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              🧠 New Assessment
            </Link>
            <Link
              to="/help"
              className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg ${
                location.pathname === '/help' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Help & Guide
            </Link>
          </nav>

          {/* User Mode Badge */}
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              userMode === 'doctor' 
                ? 'bg-medical-100 text-medical-800' 
                : 'bg-primary-100 text-primary-800'
            }`}>
              {userMode === 'doctor' ? '👨‍⚕️ Doctor Mode' : '👤 Patient Mode'}
            </div>
            
            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-3 border-t border-gray-200">
          <div className="flex flex-col space-y-2">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                location.pathname === '/' 
                  ? 'bg-medical-50 text-medical-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/predict"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                location.pathname === '/predict' 
                  ? 'bg-medical-50 text-medical-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              New Prediction
            </Link>
            <Link
              to="/help"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                location.pathname === '/help' 
                  ? 'bg-medical-50 text-medical-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Help & Guide
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
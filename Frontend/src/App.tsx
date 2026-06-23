import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PredictionWorkflow from './pages/PredictionWorkflow';
import HelpPage from './pages/HelpPage';
import { UserMode, AppState } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>({
    userMode: 'patient',
    currentStep: 'upload',
    isLoading: false,
  });

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  const handleUserModeChange = (mode: UserMode) => {
    setAppState(prev => ({
      ...prev,
      userMode: mode,
      currentStep: 'upload',
      features: undefined,
      handwritingImage: undefined,
      prediction: undefined,
      error: undefined,
    }));
  };

  const resetWorkflow = () => {
    setAppState(prev => ({
      ...prev,
      currentStep: 'upload',
      features: undefined,
      handwritingImage: undefined,
      prediction: undefined,
      error: undefined,
      isLoading: false,
    }));
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header 
          userMode={appState.userMode}
          onReset={resetWorkflow}
        />
        
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  userMode={appState.userMode}
                  onUserModeChange={handleUserModeChange}
                />
              } 
            />
            <Route 
              path="/predict" 
              element={
                <PredictionWorkflow 
                  appState={appState}
                  updateAppState={updateAppState}
                />
              } 
            />
            <Route 
              path="/help" 
              element={<HelpPage userMode={appState.userMode} />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
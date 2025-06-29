import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { VoiceProvider }  from './contexts/VoiceContext';
import AuthGuard from './components/auth/AuthGuard';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PatientCall from './pages/PatientCall';
import ProviderDashboard from './pages/ProviderDashboard';
import PatientPortal from './pages/PatientPortal';
import Login from './pages/Login';
import Profile from './pages/Profile';

function App() {
  return (
    <VoiceProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          <Routes>
            <Route 
              path="/login" 
              element={
                <AuthGuard requireAuth={false}>
                  <Login />
                </AuthGuard>
              } 
            />
            <Route 
              path="/" 
              element={
                <AuthGuard requireAuth={true}>
                  <Layout />
                </AuthGuard>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="patient-call" element={<PatientCall />} />
              <Route path="provider-dashboard" element={<ProviderDashboard />} />
              <Route path="patient-portal" element={<PatientPortal />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </VoiceProvider>
  );
}

export default App;
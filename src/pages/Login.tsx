import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Github, Chrome, Globe, Loader2, UserCheck } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';
import { authService } from '../services/authService';
import ModernButton from '../components/ui/ModernButton';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { speak, voiceState, setLanguage } = useVoice();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      // Check for guest user
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        navigate('/');
        return;
      }

      // Check Firebase auth
      const user = authService.getCurrentUser();
      if (user) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Start sign-in immediately to avoid popup blocking
      const userProfile = await authService.signInWithGoogle();
      
      // Speak after successful sign-in
      speak('Signing in with Google');
      toast.success(`Welcome ${userProfile.displayName}!`);
      speak(`Welcome ${userProfile.displayName}! You're now signed in.`);
      
      navigate('/');
    } catch (error) {
      console.error('Google sign in failed:', error);
      toast.error('Failed to sign in with Google');
      speak('Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    try {
      // Start sign-in immediately to avoid popup blocking
      const userProfile = await authService.signInWithGithub();
      
      // Speak after successful sign-in
      speak('Signing in with GitHub');
      toast.success(`Welcome ${userProfile.displayName}!`);
      speak(`Welcome ${userProfile.displayName}! You're now signed in.`);
      
      navigate('/');
    } catch (error) {
      console.error('GitHub sign in failed:', error);
      toast.error('Failed to sign in with GitHub');
      speak('Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = async () => {
    setIsLoading(true);
    try {
      speak('Entering guest mode');
      
      // Create a guest user session
      const guestUser = {
        uid: 'guest-' + Date.now(),
        displayName: 'Guest User',
        email: 'guest@sehatai.com',
        role: 'guest',
        isGuest: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      // Store guest session
      localStorage.setItem('guestUser', JSON.stringify(guestUser));
      
      // Set guest user in auth service
      await authService.signInAsGuest();
      
      toast.success('Welcome, Guest User!');
      speak('Welcome! You are now in guest mode.');
      
      navigate('/');
    } catch (error) {
      console.error('Guest mode failed:', error);
      toast.error('Failed to enter guest mode');
      speak('Guest mode failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceLogin = async () => {
    await speak('Voice authentication is not yet available. Please use Google or GitHub sign in for now.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Heart className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Sehat AI
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Post-Operative Care Assistant</p>
          <p className="text-sm text-gray-500 mt-1">Voice-First Healthcare Platform</p>
        </motion.div>

        {/* Language Selection */}
        <motion.div 
          className="flex justify-center space-x-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button
            onClick={() => setLanguage('en-US')}
            data-voice-command="switch to english"
            className={`px-6 py-3 rounded-xl border-2 transition-all duration-200 flex items-center space-x-2 ${
              voiceState.language === 'en-US'
                ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-md'
                : 'bg-white border-gray-300 text-gray-600 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <Globe className="w-5 h-5" />
            <span className="font-medium">English</span>
          </button>
          <button
            onClick={() => setLanguage('hi-IN')}
            data-voice-command="switch to hindi"
            className={`px-6 py-3 rounded-xl border-2 transition-all duration-200 flex items-center space-x-2 ${
              voiceState.language === 'hi-IN'
                ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-md'
                : 'bg-white border-gray-300 text-gray-600 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <Globe className="w-5 h-5" />
            <span className="font-medium">हिंदी</span>
          </button>
        </motion.div>

        {/* Main Authentication Card */}
        <motion.div 
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to continue your recovery journey</p>
            </div>

            {/* Guest Mode - Featured */}
            <ModernButton
              onClick={handleGuestMode}
              disabled={isLoading}
              fullWidth
              variant="primary"
              size="lg"
              icon={UserCheck}
              voiceCommand="continue as guest"
              className="!justify-start !pl-6"
            >
              Continue as Guest
            </ModernButton>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or sign in with</span>
              </div>
            </div>

            {/* Authentication Buttons */}
            <div className="space-y-4">
              <ModernButton
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                fullWidth
                variant="secondary"
                size="lg"
                icon={isLoading ? Loader2 : Chrome}
                voiceCommand="sign in with google"
                className="!justify-start !pl-6"
              >
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </ModernButton>

              <ModernButton
                onClick={handleGithubSignIn}
                disabled={isLoading}
                fullWidth
                variant="secondary"
                size="lg"
                icon={Github}
                voiceCommand="sign in with github"
                className="!justify-start !pl-6"
              >
                Continue with GitHub
              </ModernButton>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Coming Soon</span>
              </div>
            </div>

            <ModernButton
              onClick={handleVoiceLogin}
              disabled={true}
              fullWidth
              variant="ghost"
              size="lg"
              voiceCommand="voice authentication"
              className="!justify-start !pl-6 opacity-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-300 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
                    <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H10.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                  </svg>
                </div>
                <span>Voice Authentication</span>
              </div>
            </ModernButton>
          </div>
        </motion.div>

        {/* Features Highlight */}
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-600 font-medium">Secure</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="text-gray-600 font-medium">HIPAA Compliant</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
                  <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H10.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                </svg>
              </div>
              <span className="text-gray-600 font-medium">Voice-First</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Built for accessibility and ease of use. Your recovery journey, powered by AI.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
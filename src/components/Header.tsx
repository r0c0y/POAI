import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Stethoscope, User, Bell, Settings, Globe, LogOut } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';
import { authService } from '../services/authService';
import ModernButton from './ui/ModernButton';
import VoiceIndicator from './ui/VoiceIndicator';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { voiceState, setLanguage, updateScreenContext } = useVoice();
  const userProfile = authService.getUserProfile();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Heart, voiceCommand: 'open dashboard' },
    { name: 'Patient Call', href: '/patient-call', icon: Stethoscope, voiceCommand: 'patient call' },
    { name: 'Provider Dashboard', href: '/provider-dashboard', icon: User, voiceCommand: 'provider dashboard' },
    { name: 'Patient Portal', href: '/patient-portal', icon: Bell, voiceCommand: 'patient portal' },
    { name: 'Profile', href: '/profile', icon: User, voiceCommand: 'open profile' },
  ];

  React.useEffect(() => {
    // Update voice context when route changes
    const currentRoute = navigation.find(nav => nav.href === location.pathname);
    if (currentRoute) {
      const availableActions = navigation.map(nav => nav.voiceCommand);
      updateScreenContext(currentRoute.name.toLowerCase().replace(' ', '-'), availableActions);
    }
  }, [location.pathname, updateScreenContext]);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <>
      <VoiceIndicator />
      
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Sehat AI
                </h1>
                <p className="text-sm text-gray-600 font-medium">Post-Op Care Assistant</p>
              </div>
            </motion.div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navigation.map(({ name, href, icon: Icon, voiceCommand }, index) => {
                const isActive = location.pathname === href;
                return (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      to={href}
                      data-voice-command={voiceCommand}
                      className={`group relative px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : ''
                      }`} />
                      <span>{name}</span>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* User Profile */}
              {userProfile && (
                <div className="hidden md:flex items-center space-x-3 bg-gray-50 rounded-xl px-3 py-2">
                  {userProfile.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {userProfile.displayName?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {userProfile.displayName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {userProfile.role}
                    </p>
                  </div>
                </div>
              )}

              {/* Language Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setLanguage('en-US')}
                  data-voice-command="switch to english"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-1 ${
                    voiceState.language === 'en-US'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>EN</span>
                </button>
                <button
                  onClick={() => setLanguage('hi-IN')}
                  data-voice-command="switch to hindi"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-1 ${
                    voiceState.language === 'hi-IN'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>हिं</span>
                </button>
              </div>

              {/* Voice Status Badge */}
              <div className="hidden md:flex items-center space-x-2 bg-gray-50 rounded-xl px-3 py-2">
                <div className={`w-2 h-2 rounded-full ${
                  voiceState.isListening ? 'bg-green-500 animate-pulse' : 
                  voiceState.isInitialized ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
                <span className="text-sm font-medium text-gray-700">
                  {voiceState.isListening ? 'Listening' : 
                   voiceState.isInitialized ? 'Voice Ready' : 'Voice Off'}
                </span>
              </div>

              {/* Settings & Sign Out */}
              <div className="flex items-center space-x-2">
                <ModernButton
                  variant="ghost"
                  size="sm"
                  icon={Settings}
                  voiceCommand="open settings"
                  className="!p-3"
                />
                <ModernButton
                  variant="ghost"
                  size="sm"
                  icon={LogOut}
                  onClick={handleSignOut}
                  voiceCommand="sign out"
                  className="!p-3 !text-red-600 hover:!bg-red-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-gray-100 px-4 py-2">
          <div className="flex items-center justify-between space-x-2">
            {navigation.map(({ name, href, icon: Icon, voiceCommand }) => {
              const isActive = location.pathname === href;
              return (
                <Link
                  key={name}
                  to={href}
                  data-voice-command={voiceCommand}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{name.split(' ')[0]}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
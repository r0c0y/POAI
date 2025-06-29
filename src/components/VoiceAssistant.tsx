import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Settings, HelpCircle } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';
import ModernButton from './ui/ModernButton';
import ModernCard from './ui/ModernCard';
import toast from 'react-hot-toast';

const VoiceAssistant: React.FC = () => {
  const { voiceState, startListening, stopListening, speak, isVoiceReady } = useVoice();
  const [isMuted, setIsMuted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleListening = async () => {
    try {
      if (voiceState.isListening) {
        stopListening();
        toast.success('Voice assistant stopped');
      } else {
        await startListening();
        toast.success('Voice assistant activated');
      }
    } catch (error) {
      toast.error('Failed to toggle voice assistant');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel();
      toast.success('Voice output muted');
    } else {
      toast.success('Voice output unmuted');
    }
  };

  const showVoiceHelp = async () => {
    setShowHelp(true);
    if (!isMuted) {
      await speak(`Available voice commands: 
        Navigation - Say "open dashboard", "patient call", "provider dashboard", or "patient portal".
        Interaction - Say "click" followed by a button name, or "complete [task name]" to mark a task as done.
        Information - Say "read screen" or "what's on screen".
        Medical - Report pain by saying "my pain level is" followed by a number.
        General - Say "help" for this menu or "go back" to return.",`);
    }
  };

  if (!voiceState.isSupported || !isVoiceReady) {
    return null;
  }

  return (
    <>
      {/* Main Voice Assistant Panel */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="mb-4"
            >
              <ModernCard className="w-80 bg-white/95 backdrop-blur-md">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Voice Assistant</h3>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  {/* Voice Status */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-3 h-3 rounded-full ${
                      voiceState.isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                    }`} />
                    <span className="text-sm text-gray-700">
                      {voiceState.isListening ? 'Listening for commands...' : 'Ready to listen'}
                    </span>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <ModernButton
                      size="sm"
                      variant="ghost"
                      icon={voiceState.isListening ? MicOff : Mic}
                      onClick={toggleListening}
                      voiceCommand="toggle listening"
                    >
                      {voiceState.isListening ? 'Stop' : 'Listen'}
                    </ModernButton>

                    <ModernButton
                      size="sm"
                      variant="ghost"
                      icon={isMuted ? VolumeX : Volume2}
                      onClick={toggleMute}
                      voiceCommand="toggle mute"
                    >
                      {isMuted ? 'Unmute' : 'Mute'}
                    </ModernButton>
                  </div>

                  {/* Help Section */}
                  <div className="pt-3 border-t border-gray-200">
                    <ModernButton
                      size="sm"
                      variant="ghost"
                      icon={HelpCircle}
                      onClick={showVoiceHelp}
                      fullWidth
                      voiceCommand="show help"
                    >
                      Voice Commands Help
                    </ModernButton>
                  </div>
                </div>
              </ModernCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Voice Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ModernCard 
            className="p-4 cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-2xl"
            onClick={() => setIsExpanded(!isExpanded)}
            hover={false}
          >
            <div className="flex items-center space-x-3">
              {/* Main Voice Icon */}
              <div className="relative">
                {voiceState.isListening ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-8 h-8 flex items-center justify-center"
                  >
                    <Mic className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <Mic className="w-6 h-6" />
                )}
                
                {/* Status Indicator */}
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                  voiceState.isListening ? 'bg-green-400 animate-pulse' : 'bg-gray-300'
                }`} />
              </div>

              {/* Status Text */}
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {voiceState.isListening ? 'Listening' : 'Voice AI'}
                </span>
                <span className="text-xs opacity-80">
                  {voiceState.isListening ? 'Speak now...' : 'Click to expand'}
                </span>
              </div>
            </div>
          </ModernCard>
        </motion.div>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Voice Commands</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Navigation</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• "Open dashboard"</li>
                    <li>• "Patient call"</li>
                    <li>• "Provider dashboard"</li>
                    <li>• "Patient portal"</li>
                    <li>• "Go back"</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Interaction</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• "Click [button name]"</li>
                    <li>• "Read screen"</li>
                    <li>• "What's on screen?"</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Medical</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• "My pain level is [1-10]"</li>
                    <li>• "I need help"</li>
                    <li>• "Emergency"</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <ModernButton
                  onClick={() => setShowHelp(false)}
                  variant="primary"
                  fullWidth
                >
                  Got it!
                </ModernButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;
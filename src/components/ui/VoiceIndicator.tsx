import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useVoice } from '../../contexts/VoiceContext';

const VoiceIndicator: React.FC = () => {
  const { voiceState, isVoiceReady } = useVoice();

  if (!voiceState.isSupported || !isVoiceReady) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-3"
        >
          <div className="flex items-center space-x-3">
            {/* Voice Status Icon */}
            <div className={`relative p-2 rounded-xl ${
              voiceState.isListening 
                ? 'bg-green-100 text-green-600' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              {voiceState.isListening ? (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Mic className="w-5 h-5" />
                </motion.div>
              ) : (
                <MicOff className="w-5 h-5" />
              )}
              
              {/* Listening Animation */}
              {voiceState.isListening && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-green-400"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}
            </div>

            {/* Status Text */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {voiceState.isListening ? 'Listening...' : 'Voice Ready'}
              </span>
              <span className="text-xs text-gray-500">
                {voiceState.language === 'hi-IN' ? 'हिंदी' : 'English'}
              </span>
            </div>

            {/* Voice Waves Animation */}
            {voiceState.isListening && (
              <div className="flex items-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-green-500 rounded-full"
                    animate={{
                      height: [8, 16, 8],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default VoiceIndicator;
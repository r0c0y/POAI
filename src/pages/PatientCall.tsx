import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Camera, 
  MessageSquare,
  User,
  Heart,
  AlertTriangle,
  Clock,
  Activity,
  Brain,
  Shield,
  Zap
} from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';
import { omnidimensionService } from '../services/omnidimensionService';
import { dataService } from '../services/dataService';

import { emergencyIntelligenceService } from '../services/emergencyIntelligenceService';
import { healthIntelligenceService } from '../services/healthIntelligenceService';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';
import toast from 'react-hot-toast';

interface Patient {
  id: string;
  name: string;
  age: number;
  surgery: string;
  surgeryDate: string;
  riskLevel: 'low' | 'medium' | 'high';
  lastCall: string;
  medicalInfo: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    bloodType: string;
  };
}

interface CallSession {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  status: 'active' | 'paused' | 'ended';
  transcript: string[];
  analysis: any[];
  emergencyDetected: boolean;
}

const PatientCall: React.FC = () => {
  const { voiceState, startListening, stopListening, speak, isVoiceReady } = useVoice();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [currentPatient] = useState<Patient>({
    id: '1',
    name: 'Mrs. Priya Sharma',
    age: 45,
    surgery: 'Knee Replacement',
    surgeryDate: '2024-01-15',
    riskLevel: 'medium',
    lastCall: '2 days ago',
    medicalInfo: {
      allergies: ['Penicillin', 'Shellfish'],
      medications: ['Lisinopril 10mg', 'Metformin 500mg'],
      conditions: ['Hypertension', 'Post-surgical recovery'],
      bloodType: 'O+'
    }
  });
  
  const [conversation, setConversation] = useState<Array<{
    id: number;
    speaker: 'ai' | 'patient';
    text: string;
    timestamp: Date;
    analysis?: any;
  }>>([]);
  
  const [currentSymptoms, setCurrentSymptoms] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<'green' | 'yellow' | 'red'>('green');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  // Initialize call system
  useEffect(() => {
    if (isVoiceReady) {
      initializeCallSystem();
    }
    
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (isCallActive) {
        endCall();
      }
    };
  }, [isVoiceReady]);

  // Auto-scroll conversation
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  // Listen for voice transcripts
  useEffect(() => {
    if (voiceState.transcript && isCallActive && voiceState.transcript.trim()) {
      handlePatientVoiceInput(voiceState.transcript);
    }
  }, [voiceState.transcript, isCallActive]);

  const initializeCallSystem = async () => {
    try {
      // Initialize OmniDimension for call
      await omnidimensionService.initializeSession({
        patientId: currentPatient.id,
        callMode: true,
        medicalContext: currentPatient.medicalInfo
      });
      
      console.log('✅ Call system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize call system:', error);
      toast.error('Failed to initialize call system');
    }
  };

  const startCall = async () => {
    try {
      if (!isVoiceReady) {
        toast.error('Voice system not ready. Please wait...');
        return;
      }

      setIsCallActive(true);
      setConversation([]);
      setCurrentSymptoms([]);
      setPainLevel(null);
      setRiskAssessment('green');

      // Create call session
      const session: CallSession = {
        sessionId: `call-${Date.now()}`,
        startTime: new Date(),
        duration: 0,
        status: 'active',
        transcript: [],
        analysis: [],
        emergencyDetected: false
      };
      setCallSession(session);

      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallSession(prev => prev ? {
          ...prev,
          duration: Math.floor((Date.now() - prev.startTime.getTime()) / 1000)
        } : null);
      }, 1000);

      // Start voice listening
      await startListening();
      
      // Initial AI greeting
      const greeting = voiceState.language === 'hi-IN' ? 
        `नमस्ते ${currentPatient.name}। मैं सेहत हूं, आपका रिकवरी असिस्टेंट। आपका ${currentPatient.surgery} ऑपरेशन के बाद आज आप कैसा महसूस कर रहे हैं?` :
        `Hello ${currentPatient.name}. This is Sehat, your recovery assistant. How are you feeling today after your ${currentPatient.surgery.toLowerCase()}?`;
      
      await speak(greeting);
      
      addToConversation('ai', greeting);
      
      toast.success('Call started successfully');
      
    } catch (error) {
      console.error('Failed to start call:', error);
      toast.error('Failed to start call');
      setIsCallActive(false);
    }
  };

  const endCall = async () => {
    try {
      setIsCallActive(false);
      
      // Stop voice listening
      await stopListening();
      
      // Clear timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }

      // Update call session
      if (callSession) {
        const endedSession = {
          ...callSession,
          endTime: new Date(),
          status: 'ended' as const
        };
        setCallSession(endedSession);
        
        // Generate call summary
        await generateCallSummary(endedSession);
      }

      // Final AI message
      const farewell = voiceState.language === 'hi-IN' ? 
        'कॉल के लिए धन्यवाद। अपना ख्याल रखें और अपनी रिकवरी प्लान का पालन करते रहें। जरूरत पड़ने पर कभी भी कॉल करें।' :
        'Thank you for the call. Take care and remember to follow your recovery plan. Call me anytime if you need help.';
      
      await speak(farewell);
      addToConversation('ai', farewell);
      
      toast.success('Call ended successfully');
      
    } catch (error) {
      console.error('Failed to end call:', error);
      toast.error('Failed to end call properly');
    }
  };

  const toggleVoiceMute = () => {
    setIsVoiceMuted(!isVoiceMuted);
    if (!isVoiceMuted) {
      window.speechSynthesis.cancel();
      toast.success('Voice output muted');
    } else {
      toast.success('Voice output unmuted');
    }
  };

  const handlePatientVoiceInput = async (transcript: string) => {
    if (isProcessingVoice || !transcript.trim()) return;
    
    setIsProcessingVoice(true);
    
    try {
      // Add patient message to conversation
      addToConversation('patient', transcript);
      
      // Update call session transcript
      if (callSession) {
        setCallSession(prev => prev ? {
          ...prev,
          transcript: [...prev.transcript, `Patient: ${transcript}`]
        } : null);
      }

      // Process with multiple AI services
      await processPatientInput(transcript);
      
    } catch (error) {
      console.error('Error processing patient voice input:', error);
      const errorMessage = voiceState.language === 'hi-IN' ? 
        'माफ करें, मुझे आपकी बात समझने में समस्या हुई। कृपया फिर से कहें।' :
        'I apologize, I had trouble understanding. Could you please repeat that?';
      
      await speak(errorMessage);
      addToConversation('ai', errorMessage);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const processPatientInput = async (transcript: string) => {
    // 1. Emergency Detection (Highest Priority)
    const emergencyResponse = await emergencyIntelligenceService.analyzeEmergencyVoiceInput(
      transcript,
      currentPatient.id
    );
    
    if (emergencyResponse) {
      setRiskAssessment('red');
      if (callSession) {
        setCallSession(prev => prev ? { ...prev, emergencyDetected: true } : null);
      }
      
      await speak(emergencyResponse.message);
      addToConversation('ai', emergencyResponse.message, { 
        type: 'emergency', 
        severity: emergencyResponse.severity 
      });
      return;
    }

    // 2. Health Intelligence Analysis
    const healthResponse = await healthIntelligenceService.processHealthVoiceCommand(
      transcript,
      currentPatient.id
    );

    // 3. Symptom and Pain Analysis
    await analyzePatientSymptoms(transcript);

    // 4. Generate contextual AI response using OmniDimension
    let aiResponse = '';
    try {
      if (omnidimensionService.generateContextualResponse) {
        aiResponse = omnidimensionService.generateContextualResponse(transcript);
      } else {
        aiResponse = healthResponse;
      }
    } catch (error) {
      aiResponse = healthResponse;
    }

    // 5. Speak response (if not muted)
    if (!isVoiceMuted && aiResponse) {
      await speak(aiResponse);
      addToConversation('ai', aiResponse);
    }

    // 6. Update call session analysis
    if (callSession) {
      setCallSession(prev => prev ? {
        ...prev,
        analysis: [...prev.analysis, {
          timestamp: new Date(),
          patientInput: transcript,
          aiResponse,
          symptoms: currentSymptoms,
          painLevel,
          riskLevel: riskAssessment
        }]
      } : null);
    }
  };

  const analyzePatientSymptoms = async (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    // Pain level detection
    const painMatch = lowerTranscript.match(/(?:pain.*?level.*?(\d+)|level.*?(\d+).*?pain|(\d+).*?pain)/);
    if (painMatch) {
      const level = parseInt(painMatch[1] || painMatch[2] || painMatch[3]);
      setPainLevel(level);
      
      if (level >= 8) {
        setRiskAssessment('red');
      } else if (level >= 6) {
        setRiskAssessment('yellow');
      }
    }
    
    // Symptom detection
    const symptoms = [];
    const symptomKeywords = {
      'swelling': ['swelling', 'swollen', 'puffiness'],
      'fever': ['fever', 'temperature', 'hot', 'burning up'],
      'bleeding': ['bleeding', 'blood', 'hemorrhage'],
      'nausea': ['nausea', 'vomiting', 'sick', 'queasy'],
      'dizziness': ['dizzy', 'lightheaded', 'vertigo'],
      'infection': ['infection', 'pus', 'discharge', 'red streaks']
    };

    for (const [symptom, keywords] of Object.entries(symptomKeywords)) {
      if (keywords.some(keyword => lowerTranscript.includes(keyword))) {
        symptoms.push(symptom);
      }
    }
    
    if (symptoms.length > 0) {
      setCurrentSymptoms(prev => [...new Set([...prev, ...symptoms])]);
      
      // Check for critical symptoms
      if (symptoms.includes('fever') || symptoms.includes('bleeding') || symptoms.includes('infection')) {
        setRiskAssessment('red');
      } else if (symptoms.length > 2) {
        setRiskAssessment('yellow');
      }
    }
  };

  const addToConversation = (speaker: 'ai' | 'patient', text: string, analysis?: any) => {
    const message = {
      id: Date.now() + Math.random(),
      speaker,
      text,
      timestamp: new Date(),
      analysis
    };
    
    setConversation(prev => [...prev, message]);
  };

  const generateCallSummary = async (session: CallSession) => {
    try {
      const summary = {
        sessionId: session.sessionId,
        duration: session.duration,
        patientId: currentPatient.id,
        symptoms: currentSymptoms,
        painLevel,
        riskLevel: riskAssessment,
        emergencyDetected: session.emergencyDetected,
        transcript: session.transcript,
        analysis: session.analysis,
        recommendations: generateRecommendations(),
        followUpRequired: riskAssessment !== 'green' || session.emergencyDetected,
        timestamp: new Date()
      };
      
      console.log('📋 Call Summary Generated:', summary);
      
      // Save to database
      await dataService.saveConversation({
        patientId: currentPatient.id,
        sessionId: session.sessionId,
        transcript: session.transcript.join('\n'),
        analysis: {
          symptoms: currentSymptoms,
          painLevel: painLevel || 0,
          riskLevel: riskAssessment === 'red' ? 'high' : (riskAssessment === 'yellow' ? 'medium' : 'low'),
          recommendations: generateRecommendations(),
          sentiment: 'neutral' // Placeholder, could be derived from AI analysis
        },
        duration: session.duration,
        timestamp: session.startTime,
        providerId: 'AI', // Or actual provider ID if applicable
        followUpRequired: riskAssessment !== 'green' || session.emergencyDetected
      });
      
      toast.success('Call summary generated and saved!');
      
    } catch (error) {
      console.error('Failed to generate call summary:', error);
    }
  };

  const generateRecommendations = (): string[] => {
    const recommendations = [];
    
    if (painLevel && painLevel >= 7) {
      recommendations.push('Contact healthcare provider about high pain levels');
      recommendations.push('Take prescribed pain medication as directed');
    }
    
    if (currentSymptoms.includes('fever')) {
      recommendations.push('Monitor temperature and contact doctor if fever persists');
    }
    
    if (currentSymptoms.includes('infection')) {
      recommendations.push('Seek immediate medical attention for possible infection');
    }
    
    if (riskAssessment === 'red') {
      recommendations.push('Schedule urgent follow-up appointment');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Continue following your recovery plan');
      recommendations.push('Take medications as prescribed');
      recommendations.push('Attend scheduled follow-up appointments');
    }
    
    return recommendations;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (riskAssessment) {
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (riskAssessment) {
      case 'red': return voiceState.language === 'hi-IN' ? 'उच्च जोखिम - अलर्ट भेजा गया' : 'High Risk - Alert Sent';
      case 'yellow': return voiceState.language === 'hi-IN' ? 'मध्यम जोखिम - निगरानी करें' : 'Medium Risk - Monitor Closely';
      case 'green': return voiceState.language === 'hi-IN' ? 'सामान्य रिकवरी' : 'Normal Recovery';
      default: return voiceState.language === 'hi-IN' ? 'स्थिति अज्ञात' : 'Status Unknown';
    }
  };

  if (!isVoiceReady) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing voice system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
          Voice Patient Consultation
        </h1>
        <p className="text-gray-600 text-lg">AI-powered post-operative care call with OmniDimension</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Information Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ModernCard>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="w-6 h-6 text-blue-600" />
              <span>Patient Information</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-lg font-semibold text-gray-900">{currentPatient.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Age</label>
                  <p className="text-gray-900">{currentPatient.age} years</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Blood Type</label>
                  <p className="text-gray-900">{currentPatient.medicalInfo.bloodType}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Surgery</label>
                <p className="text-gray-900">{currentPatient.surgery}</p>
                <p className="text-sm text-gray-500">
                  {new Date(currentPatient.surgeryDate).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Allergies</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentPatient.medicalInfo.allergies.map(allergy => (
                    <span key={allergy} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Current Medications</label>
                <div className="space-y-1 mt-1">
                  {currentPatient.medicalInfo.medications.map(med => (
                    <p key={med} className="text-sm text-gray-700">• {med}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Assessment */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span>Current Assessment</span>
              </h3>
              
              {/* Call Status */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Call Status</span>
                  <div className={`w-3 h-3 rounded-full ${isCallActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                </div>
                <p className="text-sm text-gray-700">
                  {isCallActive ? `Active - ${callSession ? formatDuration(callSession.duration) : '00:00'}` : 'Not Connected'}
                </p>
              </div>

              {/* Risk Assessment */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Risk Assessment</span>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
                </div>
                <p className="text-sm text-gray-700">{getStatusText()}</p>
              </div>
              
              {/* Pain Level */}
              {painLevel !== null && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-600">Pain Level</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          painLevel >= 8 ? 'bg-red-500' :
                          painLevel >= 5 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(painLevel / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{painLevel}/10</span>
                  </div>
                </div>
              )}
              
              {/* Current Symptoms */}
              {currentSymptoms.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Reported Symptoms</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentSymptoms.map(symptom => (
                      <span key={symptom} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ModernCard>
        </motion.div>

        {/* Call Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Call Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ModernCard>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <Brain className="w-6 h-6 text-purple-600" />
                    <span>OmniDimension Voice Interface</span>
                  </h2>
                  {callSession && (
                    <p className="text-gray-600">
                      {isCallActive ? `Duration: ${formatDuration(callSession.duration)}` : 'Call Ended'}
                    </p>
                  )}
                </div>
                
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  riskAssessment === 'red' ? 'bg-red-100 text-red-800' :
                  riskAssessment === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {getStatusText()}
                </div>
              </div>

              {/* Main Call Controls */}
              <div className="flex items-center justify-center space-x-6 mb-6">
                {!isCallActive ? (
                  <ModernButton
                    onClick={startCall}
                    variant="primary"
                    size="xl"
                    className="!w-20 !h-20 !rounded-full !p-0"
                    disabled={!isVoiceReady}
                  >
                    <Phone className="w-10 h-10" />
                  </ModernButton>
                ) : (
                  <ModernButton
                    onClick={endCall}
                    variant="danger"
                    size="xl"
                    className="!w-20 !h-20 !rounded-full !p-0"
                  >
                    <PhoneOff className="w-10 h-10" />
                  </ModernButton>
                )}
                
                <ModernButton
                  onClick={toggleVoiceMute}
                  variant="ghost"
                  size="lg"
                  className="!w-16 !h-16 !rounded-full !p-0"
                  disabled={!isCallActive}
                >
                  {isVoiceMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </ModernButton>
                
                <ModernButton
                  variant="ghost"
                  size="lg"
                  className="!w-16 !h-16 !rounded-full !p-0"
                  disabled={!isCallActive}
                >
                  <Camera className="w-6 h-6" />
                </ModernButton>
              </div>

              {/* Voice Status */}
              <div className="text-center">
                <AnimatePresence>
                  {isCallActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full ${
                        voiceState.isListening ? 'bg-green-100 text-green-800' : 
                        isProcessingVoice ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        voiceState.isListening ? 'bg-green-500 animate-pulse' : 
                        isProcessingVoice ? 'bg-blue-500 animate-spin' :
                        'bg-gray-400'
                      }`} />
                      <span className="text-sm font-medium">
                        {voiceState.isListening ? 
                          (voiceState.language === 'hi-IN' ? 'मरीज़ की बात सुन रहा हूं...' : 'Listening to patient...') :
                         isProcessingVoice ? 
                          (voiceState.language === 'hi-IN' ? 'AI विश्लेषण कर रहा है...' : 'AI analyzing response...') :
                          (voiceState.language === 'hi-IN' ? 'कॉल शुरू करने के लिए तैयार' : 'Ready to start call')
                        }
                      </span>
                      {voiceState.isListening && (
                        <div className="flex space-x-1">
                          {[0, 1, 2].map(i => (
                            <motion.div
                              key={i}
                              className="w-1 bg-green-500 rounded-full"
                              animate={{ height: [8, 16, 8] }}
                              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ModernCard>
          </motion.div>

          {/* Conversation History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <ModernCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>Conversation History</span>
                </h3>
                {conversation.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {conversation.length} messages
                  </span>
                )}
              </div>
              
              <div 
                ref={conversationRef}
                className="max-h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-xl"
              >
                {conversation.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {voiceState.language === 'hi-IN' ? 
                        'बातचीत शुरू करने के लिए कॉल शुरू करें' : 
                        'Start a call to begin conversation'
                      }
                    </p>
                  </div>
                ) : (
                  conversation.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.speaker === 'ai' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.speaker === 'ai'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-green-100 text-green-900'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          {message.speaker === 'ai' ? (
                            <Brain className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                          <span className="text-xs font-medium">
                            {message.speaker === 'ai' ? 'Sehat AI' : currentPatient.name}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                          {message.analysis?.type === 'emergency' && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ModernCard>
          </motion.div>

          {/* Call Summary */}
          {callSession && callSession.status === 'ended' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <ModernCard>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Call Summary</span>
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatDuration(callSession.duration)}
                    </div>
                    <div className="text-sm text-gray-600">Duration</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {conversation.length}
                    </div>
                    <div className="text-sm text-gray-600">Messages</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentSymptoms.length}
                    </div>
                    <div className="text-sm text-gray-600">Symptoms</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      riskAssessment === 'red' ? 'text-red-600' :
                      riskAssessment === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {riskAssessment.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600">Risk Level</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Recommendations:</h4>
                  <div className="space-y-2">
                    {generateRecommendations().map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ModernCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientCall;
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { omnidimensionService } from '../services/omnidimensionService';
import { healthIntelligenceService } from '../services/healthIntelligenceService';
import { emergencyIntelligenceService } from '../services/emergencyIntelligenceService';
import { enhancedAIAnalysisService } from '../services/enhancedAIAnalysisService';
import toast from 'react-hot-toast';

interface VoiceState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
  language: 'en-US' | 'hi-IN';
  isInitialized: boolean;
  sessionId: string | null;
  currentScreen: string;
  conversationHistory: any[];
}

interface VoiceContextType {
  voiceState: VoiceState;
  startListening: () => Promise<void>;
  stopListening: () => void;
  speak: (text: string, options?: any) => Promise<void>;
  setLanguage: (lang: 'en-US' | 'hi-IN') => void;
  initializeVoice: (patientContext?: any) => Promise<void>;
  updateScreenContext: (screenName: string, availableActions: string[]) => void;
  queryKnowledgeBase: (query: string, context?: any) => Promise<any>;
  getConversationHistory: () => any[];
  isVoiceReady: boolean;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};

interface VoiceProviderProps {
  children: ReactNode;
}

export const VoiceProvider: React.FC<VoiceProviderProps> = ({ children }) => {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSupported: true,
    transcript: '',
    confidence: 0,
    language: 'en-US',
    isInitialized: false,
    sessionId: null,
    currentScreen: 'dashboard',
    conversationHistory: []
  });

  const [isVoiceReady, setIsVoiceReady] = useState(false);

  // Initialize voice service on mount
  useEffect(() => {
    initializeVoice();
    setupEventListeners();
    
    // Cleanup on unmount
    return () => {
      omnidimensionService.cleanup();
    };
  }, []);

  // Setup enhanced event listeners
  const setupEventListeners = () => {
    // Ready event
    omnidimensionService.on('ready', (data: any) => {
      console.log('🎉 OmniDimension ready:', data);
      setIsVoiceReady(true);
      setVoiceState(prev => ({ ...prev, isInitialized: true }));
      toast.success('Voice assistant ready!');
    });

    // Session events
    omnidimensionService.on('sessionInitialized', (data: any) => {
      setVoiceState(prev => ({ 
        ...prev, 
        sessionId: data.sessionId,
        isInitialized: true 
      }));
    });

    // Listening events
    omnidimensionService.on('listeningStarted', () => {
      setVoiceState(prev => ({ ...prev, isListening: true }));
    });

    omnidimensionService.on('listeningStopped', () => {
      setVoiceState(prev => ({ ...prev, isListening: false }));
    });

    // Enhanced transcript events with AI processing
    omnidimensionService.on('transcript', async (data: any) => {
      setVoiceState(prev => ({
        ...prev,
        transcript: data.transcript,
        confidence: data.confidence
      }));

      // Process with enhanced AI services
      await processEnhancedVoiceCommand(data.transcript, data.confidence);
    });

    // Command processed events
    omnidimensionService.on('commandProcessed', (data: any) => {
      console.log('🎯 Command processed:', data);
      updateConversationHistory();
    });

    // Error events
    omnidimensionService.on('error', (error: any) => {
      console.error('🚨 OmniDimension error:', error);
      toast.error('Voice assistant error occurred');
    });

    // Enhanced emergency events
    window.addEventListener('emergency-911-call', (event: any) => {
      const { detail } = event;
      toast.error('🚨 EMERGENCY: 911 has been contacted!');
      console.log('Emergency 911 call initiated:', detail);
    });

    window.addEventListener('emergency-doctor-contact', (event: any) => {
      const { detail } = event;
      toast.success(`📞 Contacting ${detail.contact.name}`);
      console.log('Doctor contact initiated:', detail);
    });

    window.addEventListener('emergency-contact-alert', (event: any) => {
      const { detail } = event;
      toast.success(`📱 Alerting ${detail.contact.name}`);
      console.log('Emergency contact alert:', detail);
    });

    // Voice navigation events
    window.addEventListener('voice-navigate', (event: any) => {
      const { path } = event.detail;
      console.log('🧭 Voice navigation:', path);
      // Navigation will be handled by the router
    });

    // Voice task completion event
    window.addEventListener('voice-complete-task', (event: any) => {
      const { taskName } = event.detail;
      console.log('✅ Voice complete task:', taskName);
      toast.success(`Task '${taskName}' completed via voice.`);
    });
  };

  // Enhanced voice command processing with multiple AI services
  const processEnhancedVoiceCommand = async (transcript: string, confidence: number) => {
    try {
      const patientId = 'demo-patient'; // In real app, get from auth context
      
      // 1. Emergency Intelligence - Highest Priority
      const emergencyResponse = await emergencyIntelligenceService.analyzeEmergencyVoiceInput(
        transcript,
        patientId
      );
      
      if (emergencyResponse) {
        await speak(emergencyResponse.message);
        return;
      }

      // 2. Task Completion - Specific command
      const taskCompletionMatch = isTaskCompletionQuery(transcript);
      if (taskCompletionMatch) {
        window.dispatchEvent(new CustomEvent('voice-complete-task', { detail: { taskName: taskCompletionMatch } }));
        await speak(`Okay, marking '${taskCompletionMatch}' as complete.`);
        return;
      }

      // 3. Health Intelligence - Health-related queries
      if (isHealthQuery(transcript)) {
        const healthResponse = await healthIntelligenceService.processHealthVoiceCommand(
          transcript,
          patientId
        );
        await speak(healthResponse);
        return;
      }

      // 4. AI Analysis - Photo and report analysis
      if (isAnalysisQuery(transcript)) {
        const analysisResponse = await enhancedAIAnalysisService.processAnalysisVoiceCommand(
          transcript,
          patientId
        );
        await speak(analysisResponse);
        return;
      }

      // 5. General OmniDimension processing
      const generalResponse = await omnidimensionService.queryKnowledgeBase(transcript, {
        patientId,
        currentScreen: voiceState.currentScreen,
        language: voiceState.language
      });

      if (generalResponse.confidence > 0.7) {
        await speak(generalResponse.answer);
      } else {
        await speak(getDefaultResponse(transcript));
      }

    } catch (error) {
      console.error('Enhanced voice command processing failed:', error);
      await speak('I apologize, but I encountered an error. Please try again or contact support if the issue persists.');
    }
  };

  // Helper functions to categorize voice commands
  const isHealthQuery = (transcript: string): boolean => {
    const healthKeywords = [
      'health score', 'pain trends', 'risk', 'health issues', 'symptoms',
      'medication', 'exercise', 'recovery', 'progress', 'healing'
    ];
    const lowerTranscript = transcript.toLowerCase();
    return healthKeywords.some(keyword => lowerTranscript.includes(keyword));
  };

  const isAnalysisQuery = (transcript: string): boolean => {
    const analysisKeywords = [
      'analyze', 'photo', 'image', 'wound', 'infection', 'healing progress',
      'compare', 'report', 'results', 'findings'
    ];
    const lowerTranscript = transcript.toLowerCase();
    return analysisKeywords.some(keyword => lowerTranscript.includes(keyword));
  };

  const isTaskCompletionQuery = (transcript: string): string | null => {
    const lowerTranscript = transcript.toLowerCase();
    const taskPrefixes = ['complete', 'i have completed', 'mark as complete'];

    for (const prefix of taskPrefixes) {
      if (lowerTranscript.startsWith(prefix)) {
        const taskName = lowerTranscript.substring(prefix.length).trim();
        // Simple check to ensure there's a task name after the prefix
        if (taskName.length > 0) {
          return taskName;
        }
      }
    }
    return null;
  };

  const getDefaultResponse = (transcript: string): string => {
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes('hello') || lowerTranscript.includes('hi')) {
      return voiceState.language === 'hi-IN' ?
        'नमस्ते! मैं सेहत हूं, आपका AI स्वास्थ्य सहायक। मैं आपकी रिकवरी में कैसे मदद कर सकता हूं?' :
        'Hello! I\'m Sehat, your AI health assistant. How can I help with your recovery today?';
    }
    
    if (lowerTranscript.includes('help')) {
      return voiceState.language === 'hi-IN' ?
        'मैं आपकी मदद कर सकता हूं: लक्षण ट्रैक करना, दवा रिमाइंडर, व्यायाम गाइड, और आपातकालीन सहायता। आप क्या चाहते हैं?' :
        'I can help you with: tracking symptoms, medication reminders, exercise guidance, emergency assistance, and navigating the app. What would you like help with?';
    }
    
    return voiceState.language === 'hi-IN' ?
      'मुझे समझ नहीं आया। कृपया फिर से कोशिश करें या "मदद" कहें।' :
      'I didn\'t understand that. Please try again or say "help" for assistance.';
  };

  // Initialize voice service
  const initializeVoice = async (patientContext?: any) => {
    try {
      console.log('🚀 Initializing enhanced voice service...');
      
      const sessionId = await omnidimensionService.initializeSession(patientContext);
      
      setVoiceState(prev => ({
        ...prev,
        isInitialized: true,
        sessionId
      }));
      
      console.log('✅ Enhanced voice service initialized with session:', sessionId);
      await speak(voiceState.language === 'hi-IN' ? 'नमस्ते! मैं सेहत हूं, आपका AI स्वास्थ्य सहायक।' : 'Hello! I\'m Sehat, your AI health assistant.');
    } catch (error) {
      console.error('❌ Failed to initialize voice service:', error);
      toast.error('Failed to initialize voice assistant');
    }
  };

  // Start listening
  const startListening = async () => {
    try {
      if (!voiceState.isInitialized) {
        await initializeVoice();
      }

      await omnidimensionService.startListening();
      
    } catch (error) {
      console.error('Failed to start listening:', error);
      toast.error('Failed to start voice recognition');
    }
  };

  // Stop listening
  const stopListening = () => {
    omnidimensionService.stopListening();
  };

  // Enhanced speak function with language support
  const speak = async (text: string, options?: any) => {
    try {
      const speechOptions = {
        language: voiceState.language,
        rate: voiceState.language === 'hi-IN' ? 0.8 : 0.9, // Slower for Hindi
        ...options
      };

      await omnidimensionService.speak(text, speechOptions);
    } catch (error) {
      console.error('Failed to speak:', error);
      toast.error('Failed to speak text');
    }
  };

  // Enhanced language setting with immediate effect
  const setLanguage = async (lang: 'en-US' | 'hi-IN') => {
    setVoiceState(prev => ({ ...prev, language: lang }));
    
    // Update OmniDimension configuration
    omnidimensionService.config.language = lang;
    
    // Reinitialize with new language
    await initializeVoice();
    
    // Announce language change
    const announcement = lang === 'hi-IN' ? 
      'भाषा हिंदी में बदल गई है। मैं अब हिंदी में बात करूंगा।' :
      'Language changed to English. I will now speak in English.';
    
    await speak(announcement);
    
    toast.success(lang === 'hi-IN' ? 'भाषा हिंदी में बदली गई' : 'Language changed to English');
  };

  // Update screen context for better voice assistance
  const updateScreenContext = (screenName: string, availableActions: string[]) => {
    setVoiceState(prev => ({ ...prev, currentScreen: screenName }));
    omnidimensionService.updateScreenContext(screenName, availableActions);
  };

  // Query knowledge base
  const queryKnowledgeBase = async (query: string, context?: any) => {
    try {
      return await omnidimensionService.queryKnowledgeBase(query, context);
    } catch (error) {
      console.error('Knowledge base query failed:', error);
      throw error;
    }
  };

  // Get conversation history
  const getConversationHistory = () => {
    return omnidimensionService.getConversationHistory();
  };

  // Update conversation history in state
  const updateConversationHistory = () => {
    const history = omnidimensionService.getConversationHistory();
    setVoiceState(prev => ({ ...prev, conversationHistory: history }));
  };

  const contextValue: VoiceContextType = {
    voiceState,
    startListening,
    stopListening,
    speak,
    setLanguage,
    initializeVoice,
    updateScreenContext,
    queryKnowledgeBase,
    getConversationHistory,
    isVoiceReady
  };

  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
};
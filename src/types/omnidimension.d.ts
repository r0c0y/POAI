// OmniDimension API Types
declare namespace OmniDimension {
  interface VoiceConfig {
    language: 'en-US' | 'hi-IN' | 'en-IN';
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  }

  interface ConversationContext {
    patientId?: string;
    sessionId?: string;
    medicalHistory?: any;
    currentSymptoms?: string[];
    conversationHistory?: ConversationMessage[];
    currentScreen?: string;
    availableActions?: string[];
  }

  interface ConversationMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
      confidence?: number;
      intent?: string;
      entities?: any[];
    };
  }

  interface CallSession {
    sessionId: string;
    status: 'active' | 'paused' | 'ended';
    startTime: Date;
    duration: number;
    participantId?: string;
  }

  interface VoiceAnalysis {
    transcript: string;
    confidence: number;
    intent: string;
    entities: {
      type: string;
      value: string;
      confidence: number;
    }[];
    sentiment: {
      score: number;
      label: 'positive' | 'negative' | 'neutral';
    };
    medicalConcepts?: {
      symptoms: string[];
      painLevel?: number;
      urgency: 'low' | 'medium' | 'high';
    };
  }

  interface OmniDimensionAPI {
    // Initialize the API
    initialize(apiKey: string, config?: VoiceConfig): Promise<void>;
    
    // Voice Recognition
    startListening(config?: VoiceConfig): Promise<void>;
    stopListening(): Promise<void>;
    
    // Text-to-Speech
    speak(text: string, config?: VoiceConfig): Promise<void>;
    stopSpeaking(): Promise<void>;
    
    // Conversation Management
    startConversation(context?: ConversationContext): Promise<CallSession>;
    sendMessage(message: string, sessionId: string): Promise<ConversationMessage>;
    endConversation(sessionId: string): Promise<void>;
    
    // Voice Analysis
    analyzeVoice(audioData: Blob): Promise<VoiceAnalysis>;
    
    // Medical Intelligence
    analyzeMedicalContent(text: string): Promise<{
      symptoms: string[];
      riskLevel: 'low' | 'medium' | 'high';
      recommendations: string[];
      urgentCare: boolean;
    }>;
    
    // Events
    on(event: 'transcript' | 'error' | 'end', callback: (data: any) => void): void;
    off(event: string, callback: (data: any) => void): void;
  }
}

// Global OmniDimension object
declare const OmniDimension: OmniDimension.OmniDimensionAPI;

// Module declaration for imports
declare module 'omnidimension-sdk' {
  export = OmniDimension;
}

// Web Speech API extensions for better typing
interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  maxAlternatives?: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechSynthesisUtteranceOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
}
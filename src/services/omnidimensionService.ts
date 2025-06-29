// Enhanced OmniDimension Voice AI Service - Pure Integration
interface OmniDimensionConfig {
  secretKey: string;
  mode: 'voice-only' | 'chat-widget';
  language: 'en-US' | 'hi-IN';
  voiceSettings: {
    rate: number;
    pitch: number;
    volume: number;
    autoStart: boolean;
    continuous: boolean;
  };
  knowledgeBase: {
    enabled: boolean;
    webSearch: boolean;
    customData: any[];
  };
}

interface VoiceSession {
  sessionId: string;
  isActive: boolean;
  startTime: Date;
  conversationHistory: ConversationMessage[];
  patientContext?: any;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    intent?: string;
    entities?: any[];
    medicalAnalysis?: any;
  };
}

interface MedicalAnalysis {
  symptoms: string[];
  painLevel?: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  urgentCare: boolean;
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  followUpNeeded: boolean;
}

class OmniDimensionService {
  private config: OmniDimensionConfig;
  private session: VoiceSession | null = null;
  private isInitialized: boolean = false;
  private isListening: boolean = false;
  private currentScreen: string = 'dashboard';
  private availableActions: string[] = [];
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: OmniDimensionConfig) {
    this.config = config;
    this.initializeOmniDimension();
  }

  private async initializeOmniDimension() {
    try {
      // Wait for OmniDimension widget to load
      await this.waitForOmniDimension();
      
      // Initialize with configuration
      if (window.OmniDimension) {
        await window.OmniDimension.initialize({
          secretKey: this.config.secretKey,
          mode: this.config.mode,
          language: this.config.language,
          voiceSettings: this.config.voiceSettings,
          knowledgeBase: this.config.knowledgeBase
        });

        // Set up event listeners
        this.setupEventListeners();
        this.isInitialized = true;
        
        console.log('✅ OmniDimension initialized successfully');
        this.emit('ready', { status: 'initialized' });
      }
    } catch (error) {
      console.error('❌ OmniDimension initialization failed:', error);
      this.emit('error', { error: 'Initialization failed' });
    }
  }

  private waitForOmniDimension(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 10 seconds max wait
      
      const checkOmniDimension = () => {
        if (window.OmniDimension && window.OmniDimension.isReady) {
          resolve();
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkOmniDimension, 200);
        } else {
          reject(new Error('OmniDimension widget failed to load'));
        }
      };
      
      checkOmniDimension();
    });
  }

  private setupEventListeners() {
    if (!window.OmniDimension) return;

    // Transcript events
    window.OmniDimension.on('transcript', (data: any) => {
      this.handleTranscript(data);
    });

    // Error events
    window.OmniDimension.on('error', (error: any) => {
      console.error('OmniDimension error:', error);
      this.emit('error', error);
    });

    // Session events
    window.OmniDimension.on('sessionStart', (data: any) => {
      console.log('Session started:', data);
      this.emit('sessionStart', data);
    });

    window.OmniDimension.on('sessionEnd', (data: any) => {
      console.log('Session ended:', data);
      this.emit('sessionEnd', data);
    });
  }

  // Initialize session with patient context
  async initializeSession(patientContext?: any): Promise<string> {
    try {
      if (!this.isInitialized) {
        await this.initializeOmniDimension();
      }

      let sessionId: string;
      
      if (window.OmniDimension && window.OmniDimension.startConversation) {
        const result = await window.OmniDimension.startConversation({
          patientContext,
          currentScreen: this.currentScreen,
          availableActions: this.availableActions,
          language: this.config.language
        });
        sessionId = result.sessionId;
      } else {
        // Fallback session ID
        sessionId = `session-${Date.now()}`;
      }

      this.session = {
        sessionId,
        isActive: true,
        startTime: new Date(),
        conversationHistory: [],
        patientContext
      };

      console.log('🎯 Voice session initialized:', sessionId);
      this.emit('sessionInitialized', { sessionId });
      
      return sessionId;
    } catch (error) {
      console.error('Failed to initialize session:', error);
      // Always provide fallback
      const fallbackSessionId = `fallback-${Date.now()}`;
      this.session = {
        sessionId: fallbackSessionId,
        isActive: true,
        startTime: new Date(),
        conversationHistory: [],
        patientContext
      };
      return fallbackSessionId;
    }
  }

  // Start voice listening
  async startListening(): Promise<void> {
    try {
      if (!this.session) {
        await this.initializeSession();
      }

      if (window.OmniDimension && window.OmniDimension.startListening) {
        await window.OmniDimension.startListening({
          language: this.config.language,
          continuous: this.config.voiceSettings.continuous,
          context: {
            currentScreen: this.currentScreen,
            availableActions: this.availableActions,
            sessionId: this.session?.sessionId
          }
        });
      }

      this.isListening = true;
      console.log('🎤 Started listening');
      this.emit('listeningStarted', { sessionId: this.session?.sessionId });

      // Announce voice readiness
      await this.speak('Voice assistant activated. I\'m listening for your commands.');
      
    } catch (error) {
      console.error('Failed to start listening:', error);
      this.emit('error', { error: 'Failed to start listening' });
    }
  }

  // Stop voice listening
  async stopListening(): Promise<void> {
    try {
      if (window.OmniDimension && window.OmniDimension.stopListening) {
        await window.OmniDimension.stopListening();
      }

      this.isListening = false;
      console.log('🛑 Stopped listening');
      this.emit('listeningStopped', { sessionId: this.session?.sessionId });
      
    } catch (error) {
      console.error('Failed to stop listening:', error);
    }
  }

  // Enhanced text-to-speech using OmniDimension
  async speak(text: string, options?: any): Promise<void> {
    try {
      if (window.OmniDimension && window.OmniDimension.speak) {
        await window.OmniDimension.speak(text, {
          language: this.config.language,
          rate: options?.rate || this.config.voiceSettings.rate,
          pitch: options?.pitch || this.config.voiceSettings.pitch,
          volume: options?.volume || this.config.voiceSettings.volume,
          ...options
        });
      } else {
        // Fallback to Web Speech API
        return new Promise((resolve) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = this.config.language;
          utterance.rate = this.config.voiceSettings.rate;
          utterance.pitch = this.config.voiceSettings.pitch;
          utterance.volume = this.config.voiceSettings.volume;
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          window.speechSynthesis.speak(utterance);
        });
      }

      // Add to conversation history
      this.addToConversationHistory('assistant', text);
      
    } catch (error) {
      console.error('Failed to speak:', error);
    }
  }

  // Handle transcript from OmniDimension
  private async handleTranscript(data: any) {
    const { transcript, confidence, isFinal } = data;
    
    if (isFinal && confidence > 0.6) {
      console.log('📝 Transcript:', transcript);
      
      // Add to conversation history
      this.addToConversationHistory('user', transcript, {
        confidence,
        timestamp: new Date()
      });

      // Process the command
      await this.processVoiceCommand(transcript, confidence);
      
      this.emit('transcript', { transcript, confidence });
    }
  }

  // Enhanced voice command processing
  private async processVoiceCommand(transcript: string, confidence: number) {
    try {
      // Get response from OmniDimension
      let response = '';
      let medicalAnalysis: MedicalAnalysis | null = null;

      if (window.OmniDimension) {
        // Use OmniDimension's contextual response
        if (window.OmniDimension.generateContextualResponse) {
          response = window.OmniDimension.generateContextualResponse(transcript);
        }

        // Get medical analysis
        if (window.OmniDimension.analyzeMedicalContent) {
          medicalAnalysis = await window.OmniDimension.analyzeMedicalContent(transcript);
        }

        // Query knowledge base for medical information
        if (window.OmniDimension.queryKnowledgeBase) {
          const knowledgeResponse = await window.OmniDimension.queryKnowledgeBase(transcript, {
            patientContext: this.session?.patientContext,
            currentScreen: this.currentScreen,
            conversationHistory: this.session?.conversationHistory
          });
          
          if (knowledgeResponse.confidence > 0.8) {
            response = knowledgeResponse.answer;
          }
        }
      }

      // Handle navigation commands
      if (this.isNavigationCommand(transcript)) {
        await this.handleNavigationCommand(transcript);
        return;
      }

      // Handle medical alerts
      if (medicalAnalysis && medicalAnalysis.urgentCare) {
        await this.handleMedicalAlert(medicalAnalysis);
        return;
      }

      // Speak the response
      if (response) {
        await this.speak(response);
        this.addToConversationHistory('assistant', response, {
          medicalAnalysis,
          intent: this.determineIntent(transcript),
          confidence
        });
      }

      // Emit command processed event
      this.emit('commandProcessed', {
        transcript,
        response,
        medicalAnalysis,
        confidence
      });

    } catch (error) {
      console.error('Failed to process voice command:', error);
      await this.speak('I apologize, but I encountered an error processing your request. Please try again.');
    }
  }

  // Enhanced navigation command handling
  private isNavigationCommand(transcript: string): boolean {
    const lowerTranscript = transcript.toLowerCase();
    const navigationKeywords = [
      'open', 'go to', 'navigate', 'show', 'display', 'switch to',
      'dashboard', 'patient call', 'provider dashboard', 'patient portal',
      'start call', 'begin consultation', 'open portal'
    ];
    
    return navigationKeywords.some(keyword => lowerTranscript.includes(keyword));
  }

  private async handleNavigationCommand(transcript: string) {
    const lowerTranscript = transcript.toLowerCase();
    
    const navigationMap = {
      'dashboard': { path: '/', message: 'Opening dashboard' },
      'patient call': { path: '/patient-call', message: 'Starting patient call interface' },
      'provider dashboard': { path: '/provider-dashboard', message: 'Opening provider dashboard' },
      'patient portal': { path: '/patient-portal', message: 'Opening patient portal' }
    };

    for (const [key, nav] of Object.entries(navigationMap)) {
      if (lowerTranscript.includes(key)) {
        await this.speak(nav.message);
        window.dispatchEvent(new CustomEvent('voice-navigate', { 
          detail: { path: nav.path } 
        }));
        return;
      }
    }

    // Fallback for unrecognized navigation
    await this.speak('I\'m not sure which page you want to navigate to. Please try saying "open dashboard", "patient call", "provider dashboard", or "patient portal".');
  }

  // Handle medical alerts
  private async handleMedicalAlert(analysis: MedicalAnalysis) {
    const alertMessage = `This requires immediate medical attention. I'm alerting your healthcare team right away.`;
    
    await this.speak(alertMessage);
    
    // Trigger medical alert event
    window.dispatchEvent(new CustomEvent('medical-alert', {
      detail: {
        analysis,
        timestamp: new Date(),
        sessionId: this.session?.sessionId,
        urgent: true
      }
    }));

    console.log('🚨 Medical alert triggered:', analysis);
  }

  // Determine intent from transcript
  private determineIntent(transcript: string): string {
    const lowerTranscript = transcript.toLowerCase();
    
    const intentMap = {
      'navigation': ['open', 'go to', 'navigate', 'show'],
      'medical_report': ['pain', 'hurt', 'symptom', 'feel', 'ache'],
      'medication': ['medicine', 'medication', 'pill', 'dose'],
      'appointment': ['appointment', 'schedule', 'book', 'meeting'],
      'exercise': ['exercise', 'therapy', 'movement', 'stretch'],
      'help': ['help', 'assist', 'what can', 'how do'],
      'emergency': ['emergency', 'urgent', 'help me', 'call doctor']
    };

    for (const [intent, keywords] of Object.entries(intentMap)) {
      if (keywords.some(keyword => lowerTranscript.includes(keyword))) {
        return intent;
      }
    }

    return 'general';
  }

  // Add message to conversation history
  private addToConversationHistory(role: 'user' | 'assistant', content: string, metadata?: any) {
    if (!this.session) return;

    const message: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
      metadata
    };

    this.session.conversationHistory.push(message);
    
    // Keep only last 50 messages to prevent memory issues
    if (this.session.conversationHistory.length > 50) {
      this.session.conversationHistory = this.session.conversationHistory.slice(-50);
    }
  }

  // Update screen context for better assistance
  updateScreenContext(screenName: string, availableActions: string[]) {
    this.currentScreen = screenName;
    this.availableActions = availableActions;
    
    console.log('📱 Screen context updated:', { screenName, availableActions });
  }

  // Get conversation history
  getConversationHistory(): ConversationMessage[] {
    return this.session?.conversationHistory || [];
  }

  // Get session info
  getSessionInfo() {
    return {
      sessionId: this.session?.sessionId,
      isActive: this.session?.isActive,
      isListening: this.isListening,
      isInitialized: this.isInitialized,
      currentScreen: this.currentScreen,
      availableActions: this.availableActions,
      conversationCount: this.session?.conversationHistory.length || 0
    };
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Enhanced knowledge base query
  async queryKnowledgeBase(query: string, context?: any): Promise<any> {
    try {
      if (window.OmniDimension && window.OmniDimension.queryKnowledgeBase) {
        return await window.OmniDimension.queryKnowledgeBase(query, {
          ...context,
          patientContext: this.session?.patientContext,
          conversationHistory: this.session?.conversationHistory,
          currentScreen: this.currentScreen
        });
      }
      
      // Fallback to local knowledge base
      return this.localKnowledgeBase(query);
    } catch (error) {
      console.error('Knowledge base query failed:', error);
      return this.localKnowledgeBase(query);
    }
  }

  // Enhanced local knowledge base
  private localKnowledgeBase(query: string) {
    const lowerQuery = query.toLowerCase();
    
    const knowledgeBase = {
      'pain management': {
        answer: 'For post-operative pain management, follow your prescribed medication schedule. Apply ice packs for 15-20 minutes every 2-3 hours. Elevate the affected area when possible. Rate your pain from 1-10 and report levels above 7 immediately.',
        sources: ['Post-Op Care Guidelines', 'Pain Management Protocol'],
        confidence: 0.9
      },
      'wound care': {
        answer: 'Keep your incision clean and dry. Change dressings as instructed. Watch for signs of infection: increased redness, swelling, warmth, or unusual discharge. Take photos daily to track healing progress.',
        sources: ['Wound Care Manual', 'Surgical Recovery Guidelines'],
        confidence: 0.9
      },
      'exercise': {
        answer: 'Start with gentle range-of-motion exercises as recommended. Gradually increase activity based on your recovery progress. Avoid high-impact activities until cleared by your surgeon. Listen to your body.',
        sources: ['Physical Therapy Guidelines', 'Recovery Exercise Manual'],
        confidence: 0.9
      },
      'medication': {
        answer: 'Take medications exactly as prescribed. Set reminders to avoid missed doses. Report side effects immediately. Never stop medications early without consulting your doctor.',
        sources: ['Medication Guidelines', 'Patient Safety Manual'],
        confidence: 0.9
      },
      'appointment': {
        answer: 'Keep all follow-up appointments. Prepare questions in advance. Bring your medication list and any photos of your incision. Contact us if you need to reschedule.',
        sources: ['Appointment Guidelines', 'Patient Care Manual'],
        confidence: 0.9
      }
    };

    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (lowerQuery.includes(key.replace(' ', ''))) {
        return value;
      }
    }

    return {
      answer: 'I understand your concern. For specific medical questions, please consult with your healthcare provider. I can help with general recovery information and guide you through the app.',
      sources: ['General Guidelines'],
      confidence: 0.7
    };
  }

  // Cleanup
  async cleanup() {
    try {
      await this.stopListening();
      
      if (this.session) {
        this.session.isActive = false;
      }
      
      if (window.OmniDimension && window.OmniDimension.endConversation && this.session) {
        await window.OmniDimension.endConversation(this.session.sessionId);
      }
      
      this.eventListeners.clear();
      this.session = null;
      this.isInitialized = false;
      
      console.log('🧹 OmniDimension service cleaned up');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Enhanced configuration
const omnidimensionConfig: OmniDimensionConfig = {
  secretKey: '4152605ca8b8d2c63d9ea6bfb691059f',
  mode: 'voice-only',
  language: 'en-US',
  voiceSettings: {
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
    autoStart: false,
    continuous: true
  },
  knowledgeBase: {
    enabled: true,
    webSearch: true,
    customData: []
  }
};

// Export singleton instance
export const omnidimensionService = new OmniDimensionService(omnidimensionConfig);
export default omnidimensionService;
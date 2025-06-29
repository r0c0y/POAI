// Emergency Intelligence Service with Smart Detection and Response
interface EmergencyPattern {
  keywords: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  responseType: 'alert' | 'escalate' | 'emergency_call' | 'immediate_response';
  medicalCondition?: string;
  requiredActions: string[];
}

interface EmergencyResponse {
  severity: 'low' | 'medium' | 'high' | 'critical';
  responseType: 'alert' | 'escalate' | 'emergency_call' | 'immediate_response';
  message: string;
  actions: EmergencyAction[];
  estimatedResponseTime: number; // in seconds
  emergencyContacts: EmergencyContact[];
  medicalInfo: MedicalEmergencyInfo;
}

interface EmergencyAction {
  type: 'call_911' | 'contact_doctor' | 'contact_family' | 'provide_instructions' | 'alert_caregivers';
  priority: number;
  description: string;
  automated: boolean;
  completed: boolean;
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  priority: number;
  contactMethod: 'call' | 'sms' | 'email' | 'all';
  availability: {
    timezone: string;
    preferredHours: { start: string; end: string };
  };
}

interface MedicalEmergencyInfo {
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  emergencyInstructions: string[];
  bloodType?: string;
  emergencyMedications: Array<{
    name: string;
    location: string;
    instructions: string;
  }>;
}

interface VoiceEmergencyAnalysis {
  isEmergency: boolean;
  confidence: number;
  detectedConditions: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: string[];
  voiceCharacteristics: {
    stressLevel: number;
    breathingPattern: 'normal' | 'labored' | 'rapid' | 'irregular';
    speechClarity: number;
    panicIndicators: string[];
  };
}

class EmergencyIntelligenceService {
  private emergencyPatterns: EmergencyPattern[] = [];
  private activeEmergencies: Map<string, EmergencyResponse> = new Map();
  private patientMedicalInfo: Map<string, MedicalEmergencyInfo> = new Map();
  private emergencyContacts: Map<string, EmergencyContact[]> = new Map();

  constructor() {
    this.initializeEmergencyPatterns();
    this.initializeMockData();
  }

  private initializeEmergencyPatterns() {
    this.emergencyPatterns = [
      // Critical Emergency Patterns
      {
        keywords: ['can\'t breathe', 'cannot breathe', 'difficulty breathing', 'shortness of breath', 'choking'],
        severity: 'critical',
        responseType: 'immediate_response',
        medicalCondition: 'respiratory_distress',
        requiredActions: ['call_911', 'provide_breathing_instructions', 'contact_emergency_contacts']
      },
      {
        keywords: ['chest pain', 'heart attack', 'heart pain', 'crushing pain', 'pressure in chest'],
        severity: 'critical',
        responseType: 'immediate_response',
        medicalCondition: 'cardiac_event',
        requiredActions: ['call_911', 'provide_cardiac_instructions', 'contact_emergency_contacts']
      },
      {
        keywords: ['stroke', 'can\'t move', 'face drooping', 'slurred speech', 'sudden weakness'],
        severity: 'critical',
        responseType: 'immediate_response',
        medicalCondition: 'stroke',
        requiredActions: ['call_911', 'provide_stroke_instructions', 'contact_emergency_contacts']
      },
      {
        keywords: ['severe bleeding', 'blood everywhere', 'won\'t stop bleeding', 'hemorrhaging'],
        severity: 'critical',
        responseType: 'immediate_response',
        medicalCondition: 'severe_bleeding',
        requiredActions: ['call_911', 'provide_bleeding_instructions', 'contact_emergency_contacts']
      },
      {
        keywords: ['unconscious', 'passed out', 'not responding', 'unresponsive'],
        severity: 'critical',
        responseType: 'immediate_response',
        medicalCondition: 'unconsciousness',
        requiredActions: ['call_911', 'provide_unconscious_instructions', 'contact_emergency_contacts']
      },
      {
        keywords: ['fallen', 'fell down', 'can\'t get up', 'hurt from fall'],
        severity: 'high',
        responseType: 'emergency_call',
        medicalCondition: 'fall_injury',
        requiredActions: ['assess_injury', 'call_911_if_needed', 'contact_emergency_contacts']
      },
      {
        keywords: ['severe pain', 'excruciating pain', 'pain level 10', 'unbearable pain'],
        severity: 'high',
        responseType: 'escalate',
        medicalCondition: 'severe_pain',
        requiredActions: ['contact_doctor', 'provide_pain_instructions', 'monitor_condition']
      },
      {
        keywords: ['allergic reaction', 'swelling', 'hives', 'anaphylaxis', 'epipen'],
        severity: 'critical',
        responseType: 'immediate_response',
        medicalCondition: 'allergic_reaction',
        requiredActions: ['call_911', 'epipen_instructions', 'contact_emergency_contacts']
      },
      {
        keywords: ['diabetic emergency', 'blood sugar', 'hypoglycemic', 'diabetic shock'],
        severity: 'high',
        responseType: 'emergency_call',
        medicalCondition: 'diabetic_emergency',
        requiredActions: ['provide_diabetic_instructions', 'call_911_if_needed', 'contact_doctor']
      },
      {
        keywords: ['seizure', 'convulsions', 'shaking uncontrollably', 'epileptic'],
        severity: 'critical',
        responseType: 'immediate_response',
        medicalCondition: 'seizure',
        requiredActions: ['call_911', 'provide_seizure_instructions', 'contact_emergency_contacts']
      },
      // Medium Priority Patterns
      {
        keywords: ['high fever', 'temperature', 'burning up', 'very hot'],
        severity: 'medium',
        responseType: 'escalate',
        medicalCondition: 'high_fever',
        requiredActions: ['contact_doctor', 'provide_fever_instructions', 'monitor_temperature']
      },
      {
        keywords: ['infection', 'wound infected', 'pus', 'red streaks'],
        severity: 'medium',
        responseType: 'escalate',
        medicalCondition: 'infection',
        requiredActions: ['contact_doctor', 'provide_infection_instructions', 'schedule_urgent_appointment']
      },
      // General Emergency Keywords
      {
        keywords: ['emergency', 'help me', 'urgent', 'call 911', 'need help now'],
        severity: 'high',
        responseType: 'emergency_call',
        requiredActions: ['assess_situation', 'provide_emergency_options', 'contact_emergency_contacts']
      }
    ];
  }

  private initializeMockData() {
    // Mock medical info for demo
    const mockMedicalInfo: MedicalEmergencyInfo = {
      allergies: ['Penicillin', 'Shellfish'],
      medications: ['Lisinopril 10mg', 'Metformin 500mg', 'Aspirin 81mg'],
      medicalConditions: ['Hypertension', 'Type 2 Diabetes', 'Post-surgical recovery'],
      emergencyInstructions: [
        'Patient is recovering from knee replacement surgery',
        'Contact Dr. Smith at (555) 123-4567 for surgical concerns',
        'Patient uses walker for mobility'
      ],
      bloodType: 'O+',
      emergencyMedications: [
        {
          name: 'Nitroglycerin',
          location: 'Bedroom nightstand',
          instructions: 'Under tongue for chest pain'
        },
        {
          name: 'Glucose tablets',
          location: 'Kitchen counter',
          instructions: 'For low blood sugar episodes'
        }
      ]
    };

    const mockEmergencyContacts: EmergencyContact[] = [
      {
        id: 'contact-1',
        name: 'Dr. Sarah Smith',
        relationship: 'Primary Surgeon',
        phone: '(555) 123-4567',
        email: 'dr.smith@hospital.com',
        priority: 1,
        contactMethod: 'call',
        availability: {
          timezone: 'America/New_York',
          preferredHours: { start: '08:00', end: '18:00' }
        }
      },
      {
        id: 'contact-2',
        name: 'John Doe',
        relationship: 'Spouse',
        phone: '(555) 987-6543',
        email: 'john.doe@email.com',
        priority: 2,
        contactMethod: 'all',
        availability: {
          timezone: 'America/New_York',
          preferredHours: { start: '00:00', end: '23:59' }
        }
      },
      {
        id: 'contact-3',
        name: 'Emergency Services',
        relationship: 'Emergency',
        phone: '911',
        priority: 0,
        contactMethod: 'call',
        availability: {
          timezone: 'America/New_York',
          preferredHours: { start: '00:00', end: '23:59' }
        }
      }
    ];

    // Set mock data for demo patient
    this.patientMedicalInfo.set('demo-patient', mockMedicalInfo);
    this.emergencyContacts.set('demo-patient', mockEmergencyContacts);
  }

  // Main emergency detection and response
  async analyzeEmergencyVoiceInput(
    voiceInput: string, 
    patientId: string,
    voiceCharacteristics?: any
  ): Promise<EmergencyResponse | null> {
    try {
      const analysis = await this.analyzeVoiceForEmergency(voiceInput, voiceCharacteristics);
      
      if (!analysis.isEmergency && analysis.urgencyLevel === 'low') {
        return null;
      }

      const matchedPattern = this.findBestMatchingPattern(voiceInput, analysis);
      
      if (!matchedPattern) {
        return null;
      }

      const emergencyResponse = await this.createEmergencyResponse(
        matchedPattern,
        analysis,
        patientId,
        voiceInput
      );

      // Execute immediate actions
      await this.executeEmergencyActions(emergencyResponse, patientId);

      // Store active emergency
      this.activeEmergencies.set(patientId, emergencyResponse);

      return emergencyResponse;
    } catch (error) {
      console.error('Error analyzing emergency voice input:', error);
      // In case of error, assume emergency and provide basic response
      return this.createBasicEmergencyResponse(patientId);
    }
  }

  private async analyzeVoiceForEmergency(
    voiceInput: string,
    voiceCharacteristics?: any
  ): Promise<VoiceEmergencyAnalysis> {
    const lowerInput = voiceInput.toLowerCase();
    
    // Detect emergency keywords
    const emergencyKeywords = [
      'emergency', 'help', 'urgent', '911', 'ambulance', 'hospital',
      'pain', 'hurt', 'bleeding', 'breathe', 'chest', 'heart',
      'stroke', 'seizure', 'unconscious', 'fallen', 'allergic'
    ];

    const detectedKeywords = emergencyKeywords.filter(keyword => 
      lowerInput.includes(keyword)
    );

    // Analyze voice characteristics (mock implementation)
    const stressLevel = this.detectStressInVoice(voiceInput, voiceCharacteristics);
    const breathingPattern = this.analyzeBreathingPattern(voiceInput);
    const speechClarity = this.analyzeSpeechClarity(voiceInput);
    const panicIndicators = this.detectPanicIndicators(voiceInput);

    // Determine if this is an emergency
    const isEmergency = detectedKeywords.length > 0 || 
                       stressLevel > 7 || 
                       panicIndicators.length > 0 ||
                       breathingPattern !== 'normal';

    // Calculate confidence
    let confidence = 0;
    confidence += detectedKeywords.length * 0.2;
    confidence += (stressLevel / 10) * 0.3;
    confidence += panicIndicators.length * 0.15;
    confidence += breathingPattern !== 'normal' ? 0.2 : 0;
    confidence += speechClarity < 0.7 ? 0.15 : 0;
    confidence = Math.min(1, confidence);

    // Determine urgency level
    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (confidence > 0.8 || stressLevel > 8) urgencyLevel = 'critical';
    else if (confidence > 0.6 || stressLevel > 6) urgencyLevel = 'high';
    else if (confidence > 0.4 || stressLevel > 4) urgencyLevel = 'medium';

    return {
      isEmergency,
      confidence,
      detectedConditions: this.identifyMedicalConditions(lowerInput),
      urgencyLevel,
      recommendedActions: this.generateRecommendedActions(detectedKeywords, urgencyLevel),
      voiceCharacteristics: {
        stressLevel,
        breathingPattern,
        speechClarity,
        panicIndicators
      }
    };
  }

  private detectStressInVoice(voiceInput: string, characteristics?: any): number {
    // Mock stress detection based on text analysis
    const stressWords = ['help', 'urgent', 'emergency', 'pain', 'can\'t', 'please', 'hurry'];
    const stressCount = stressWords.filter(word => 
      voiceInput.toLowerCase().includes(word)
    ).length;
    
    // Simulate voice characteristics analysis
    let stressLevel = Math.min(10, stressCount * 2);
    
    if (characteristics) {
      // In real implementation, analyze pitch, speed, tremor, etc.
      stressLevel += characteristics.pitchVariation || 0;
      stressLevel += characteristics.speechRate > 1.5 ? 2 : 0;
    }
    
    return Math.min(10, stressLevel);
  }

  private analyzeBreathingPattern(voiceInput: string): 'normal' | 'labored' | 'rapid' | 'irregular' {
    const breathingIndicators = {
      labored: ['can\'t breathe', 'hard to breathe', 'gasping'],
      rapid: ['breathing fast', 'hyperventilating', 'out of breath'],
      irregular: ['irregular breathing', 'breathing weird']
    };

    const lowerInput = voiceInput.toLowerCase();
    
    for (const [pattern, indicators] of Object.entries(breathingIndicators)) {
      if (indicators.some(indicator => lowerInput.includes(indicator))) {
        return pattern as 'labored' | 'rapid' | 'irregular';
      }
    }
    
    return 'normal';
  }

  private analyzeSpeechClarity(voiceInput: string): number {
    // Mock speech clarity analysis
    // In real implementation, analyze audio quality, slurring, etc.
    const clarityIndicators = ['slurred', 'mumbling', 'unclear', 'garbled'];
    const hasClarityIssues = clarityIndicators.some(indicator => 
      voiceInput.toLowerCase().includes(indicator)
    );
    
    return hasClarityIssues ? 0.3 : 0.9;
  }

  private detectPanicIndicators(voiceInput: string): string[] {
    const panicPhrases = [
      'oh my god', 'oh no', 'what do i do', 'i don\'t know what to do',
      'please help', 'somebody help', 'i\'m scared', 'i\'m dying'
    ];
    
    const lowerInput = voiceInput.toLowerCase();
    return panicPhrases.filter(phrase => lowerInput.includes(phrase));
  }

  private identifyMedicalConditions(lowerInput: string): string[] {
    const conditionKeywords = {
      'cardiac_event': ['chest pain', 'heart attack', 'heart pain'],
      'respiratory_distress': ['can\'t breathe', 'breathing', 'choking'],
      'stroke': ['stroke', 'face drooping', 'slurred speech'],
      'fall_injury': ['fallen', 'fell', 'can\'t get up'],
      'severe_bleeding': ['bleeding', 'blood'],
      'allergic_reaction': ['allergic', 'swelling', 'hives'],
      'diabetic_emergency': ['blood sugar', 'diabetic', 'hypoglycemic'],
      'seizure': ['seizure', 'convulsions', 'shaking']
    };

    const detectedConditions: string[] = [];
    
    for (const [condition, keywords] of Object.entries(conditionKeywords)) {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        detectedConditions.push(condition);
      }
    }
    
    return detectedConditions;
  }

  private generateRecommendedActions(keywords: string[], urgencyLevel: string): string[] {
    const actions: string[] = [];
    
    if (urgencyLevel === 'critical') {
      actions.push('Call 911 immediately');
      actions.push('Stay on the line with emergency services');
    } else if (urgencyLevel === 'high') {
      actions.push('Contact your healthcare provider');
      actions.push('Consider going to emergency room');
    } else if (urgencyLevel === 'medium') {
      actions.push('Contact your doctor');
      actions.push('Monitor symptoms closely');
    }
    
    actions.push('Stay calm and follow emergency instructions');
    actions.push('Have someone stay with you if possible');
    
    return actions;
  }

  private findBestMatchingPattern(voiceInput: string, analysis: VoiceEmergencyAnalysis): EmergencyPattern | null {
    const lowerInput = voiceInput.toLowerCase();
    let bestMatch: EmergencyPattern | null = null;
    let highestScore = 0;

    for (const pattern of this.emergencyPatterns) {
      let score = 0;
      
      // Check keyword matches
      const matchedKeywords = pattern.keywords.filter(keyword => 
        lowerInput.includes(keyword.toLowerCase())
      );
      score += matchedKeywords.length * 2;
      
      // Check medical condition matches
      if (pattern.medicalCondition && analysis.detectedConditions.includes(pattern.medicalCondition)) {
        score += 3;
      }
      
      // Adjust score based on urgency level match
      if (pattern.severity === analysis.urgencyLevel) {
        score += 2;
      }
      
      if (score > highestScore && score > 0) {
        highestScore = score;
        bestMatch = pattern;
      }
    }

    return bestMatch;
  }

  private async createEmergencyResponse(
    pattern: EmergencyPattern,
    analysis: VoiceEmergencyAnalysis,
    patientId: string,
    originalInput: string
  ): Promise<EmergencyResponse> {
    const medicalInfo = this.patientMedicalInfo.get(patientId) || this.getDefaultMedicalInfo();
    const emergencyContacts = this.emergencyContacts.get(patientId) || [];

    const actions = await this.createEmergencyActions(pattern, analysis, medicalInfo);
    const message = this.generateEmergencyMessage(pattern, analysis, originalInput);
    const estimatedResponseTime = this.calculateResponseTime(pattern.severity);

    return {
      severity: pattern.severity,
      responseType: pattern.responseType,
      message,
      actions,
      estimatedResponseTime,
      emergencyContacts,
      medicalInfo
    };
  }

  private async createEmergencyActions(
    pattern: EmergencyPattern,
    analysis: VoiceEmergencyAnalysis,
    medicalInfo: MedicalEmergencyInfo
  ): Promise<EmergencyAction[]> {
    const actions: EmergencyAction[] = [];

    if (pattern.requiredActions.includes('call_911')) {
      actions.push({
        type: 'call_911',
        priority: 1,
        description: 'Calling 911 emergency services',
        automated: true,
        completed: false
      });
    }

    if (pattern.requiredActions.includes('contact_doctor')) {
      actions.push({
        type: 'contact_doctor',
        priority: 2,
        description: 'Contacting your healthcare provider',
        automated: true,
        completed: false
      });
    }

    if (pattern.requiredActions.includes('contact_emergency_contacts')) {
      actions.push({
        type: 'contact_family',
        priority: 3,
        description: 'Notifying emergency contacts',
        automated: true,
        completed: false
      });
    }

    if (pattern.requiredActions.includes('provide_instructions') || 
        pattern.requiredActions.includes('provide_breathing_instructions') ||
        pattern.requiredActions.includes('provide_cardiac_instructions')) {
      actions.push({
        type: 'provide_instructions',
        priority: 1,
        description: 'Providing emergency medical instructions',
        automated: false,
        completed: false
      });
    }

    return actions.sort((a, b) => a.priority - b.priority);
  }

  private generateEmergencyMessage(
    pattern: EmergencyPattern,
    analysis: VoiceEmergencyAnalysis,
    originalInput: string
  ): string {
    const baseMessages = {
      critical: 'This appears to be a medical emergency. I am taking immediate action to get you help.',
      high: 'This situation requires urgent medical attention. I am contacting your healthcare providers.',
      medium: 'I understand you need medical assistance. Let me help you get the care you need.',
      low: 'I\'m here to help. Let me assess your situation and provide appropriate guidance.'
    };

    let message = baseMessages[pattern.severity];

    // Add specific condition guidance
    if (pattern.medicalCondition) {
      const conditionMessages = {
        respiratory_distress: ' Try to stay calm and breathe slowly. Help is on the way.',
        cardiac_event: ' Sit down and try to stay calm. Do not take aspirin unless prescribed.',
        stroke: ' Do not move unnecessarily. Note the time symptoms started.',
        severe_bleeding: ' Apply direct pressure to the wound if possible.',
        fall_injury: ' Do not try to move if you suspect a serious injury.',
        allergic_reaction: ' If you have an EpiPen, use it now.',
        diabetic_emergency: ' If conscious, try to consume glucose if available.',
        seizure: ' Clear the area of dangerous objects. Do not restrain.'
      };

      if (conditionMessages[pattern.medicalCondition as keyof typeof conditionMessages]) {
        message += conditionMessages[pattern.medicalCondition as keyof typeof conditionMessages];
      }
    }

    return message;
  }

  private calculateResponseTime(severity: string): number {
    // Estimated response times in seconds
    switch (severity) {
      case 'critical': return 30; // 30 seconds for critical
      case 'high': return 120; // 2 minutes for high
      case 'medium': return 300; // 5 minutes for medium
      case 'low': return 600; // 10 minutes for low
      default: return 300;
    }
  }

  private async executeEmergencyActions(response: EmergencyResponse, patientId: string): Promise<void> {
    for (const action of response.actions) {
      if (action.automated) {
        try {
          await this.executeAutomatedAction(action, response, patientId);
          action.completed = true;
        } catch (error) {
          console.error(`Failed to execute emergency action ${action.type}:`, error);
        }
      }
    }
  }

  private async executeAutomatedAction(
    action: EmergencyAction,
    response: EmergencyResponse,
    patientId: string
  ): Promise<void> {
    switch (action.type) {
      case 'call_911':
        await this.initiate911Call(response, patientId);
        break;
      case 'contact_doctor':
        await this.contactHealthcareProvider(response, patientId);
        break;
      case 'contact_family':
        await this.contactEmergencyContacts(response, patientId);
        break;
      case 'alert_caregivers':
        await this.alertCaregivers(response, patientId);
        break;
    }
  }

  private async initiate911Call(response: EmergencyResponse, patientId: string): Promise<void> {
    // In a real implementation, this would integrate with emergency services
    console.log('🚨 EMERGENCY: Initiating 911 call');
    
    // Simulate emergency call
    const emergencyInfo = {
      patientId,
      location: 'Patient location would be determined via GPS',
      medicalInfo: response.medicalInfo,
      emergencyType: response.severity,
      timestamp: new Date()
    };

    // Trigger emergency call event
    window.dispatchEvent(new CustomEvent('emergency-911-call', {
      detail: emergencyInfo
    }));

    // In real implementation:
    // - Get GPS location
    // - Call emergency services API
    // - Provide medical information
    // - Stay on line until help arrives
  }

  private async contactHealthcareProvider(response: EmergencyResponse, patientId: string): Promise<void> {
    const doctorContact = response.emergencyContacts.find(c => c.relationship.includes('Doctor'));
    
    if (doctorContact) {
      console.log(`📞 Contacting healthcare provider: ${doctorContact.name} at ${doctorContact.phone}`);
      
      // Trigger doctor contact event
      window.dispatchEvent(new CustomEvent('emergency-doctor-contact', {
        detail: {
          contact: doctorContact,
          emergency: response,
          patientId
        }
      }));
    }
  }

  private async contactEmergencyContacts(response: EmergencyResponse, patientId: string): Promise<void> {
    const familyContacts = response.emergencyContacts.filter(c => 
      c.relationship !== 'Emergency' && !c.relationship.includes('Doctor')
    );

    for (const contact of familyContacts) {
      console.log(`📱 Contacting emergency contact: ${contact.name} at ${contact.phone}`);
      
      // Trigger emergency contact event
      window.dispatchEvent(new CustomEvent('emergency-contact-alert', {
        detail: {
          contact,
          emergency: response,
          patientId
        }
      }));
    }
  }

  private async alertCaregivers(response: EmergencyResponse, patientId: string): Promise<void> {
    // Alert any connected caregivers or monitoring services
    console.log('🔔 Alerting caregivers and monitoring services');
    
    window.dispatchEvent(new CustomEvent('emergency-caregiver-alert', {
      detail: {
        emergency: response,
        patientId,
        timestamp: new Date()
      }
    }));
  }

  private createBasicEmergencyResponse(patientId: string): EmergencyResponse {
    const medicalInfo = this.patientMedicalInfo.get(patientId) || this.getDefaultMedicalInfo();
    const emergencyContacts = this.emergencyContacts.get(patientId) || [];

    return {
      severity: 'high',
      responseType: 'emergency_call',
      message: 'I detected you may need emergency assistance. I am getting help for you right away.',
      actions: [
        {
          type: 'call_911',
          priority: 1,
          description: 'Calling emergency services',
          automated: true,
          completed: false
        },
        {
          type: 'contact_family',
          priority: 2,
          description: 'Contacting emergency contacts',
          automated: true,
          completed: false
        }
      ],
      estimatedResponseTime: 120,
      emergencyContacts,
      medicalInfo
    };
  }

  private getDefaultMedicalInfo(): MedicalEmergencyInfo {
    return {
      allergies: [],
      medications: [],
      medicalConditions: [],
      emergencyInstructions: ['Contact emergency services if needed'],
      emergencyMedications: []
    };
  }

  // Voice command processing for emergency system
  async processEmergencyVoiceCommand(command: string, patientId: string): Promise<string> {
    const emergencyResponse = await this.analyzeEmergencyVoiceInput(command, patientId);
    
    if (emergencyResponse) {
      // This is an emergency - return the emergency message
      return emergencyResponse.message;
    }

    // Not an emergency, provide helpful response
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('emergency contact') || lowerCommand.includes('who to call')) {
      const contacts = this.emergencyContacts.get(patientId) || [];
      const primaryContact = contacts.find(c => c.priority === 2); // Skip 911
      if (primaryContact) {
        return `Your primary emergency contact is ${primaryContact.name} at ${primaryContact.phone}. I can call them for you if needed.`;
      }
      return 'You can set up emergency contacts in your profile settings.';
    }

    if (lowerCommand.includes('medical information') || lowerCommand.includes('medical id')) {
      const medicalInfo = this.patientMedicalInfo.get(patientId);
      if (medicalInfo) {
        return `Your medical information includes: ${medicalInfo.medicalConditions.join(', ')}. Allergies: ${medicalInfo.allergies.join(', ')}. Blood type: ${medicalInfo.bloodType || 'Not specified'}.`;
      }
      return 'Please update your medical information in your profile for emergency situations.';
    }

    return 'I\'m here to help in emergencies. Say "emergency" or "help me" if you need immediate assistance.';
  }

  // Get active emergency for a patient
  getActiveEmergency(patientId: string): EmergencyResponse | null {
    return this.activeEmergencies.get(patientId) || null;
  }

  // Resolve emergency
  resolveEmergency(patientId: string): void {
    this.activeEmergencies.delete(patientId);
  }

  // Update emergency contacts
  updateEmergencyContacts(patientId: string, contacts: EmergencyContact[]): void {
    this.emergencyContacts.set(patientId, contacts);
  }

  // Update medical information
  updateMedicalInfo(patientId: string, medicalInfo: MedicalEmergencyInfo): void {
    this.patientMedicalInfo.set(patientId, medicalInfo);
  }
}

export const emergencyIntelligenceService = new EmergencyIntelligenceService();
export default emergencyIntelligenceService;
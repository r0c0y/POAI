// WhatsApp Integration Service for Healthcare Updates
interface WhatsAppConfig {
  apiKey: string;
  phoneNumber: string;
  verified: boolean;
  businessAccountId: string;
}

interface WhatsAppMessage {
  id: string;
  to: string;
  type: 'text' | 'template' | 'media' | 'interactive';
  content: string;
  templateName?: string;
  templateParams?: string[];
  mediaUrl?: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface HealthUpdate {
  patientId: string;
  type: 'medication_reminder' | 'exercise_reminder' | 'appointment_reminder' | 'health_tip' | 'emergency_alert';
  message: string;
  scheduledTime: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiresResponse: boolean;
  responseOptions?: string[];
}

interface PatientWhatsAppProfile {
  patientId: string;
  phoneNumber: string;
  verified: boolean;
  verificationCode?: string;
  verificationExpiry?: Date;
  preferences: {
    medicationReminders: boolean;
    exerciseReminders: boolean;
    appointmentReminders: boolean;
    healthTips: boolean;
    emergencyAlerts: boolean;
    language: 'en' | 'hi';
    quietHours: {
      start: string; // HH:MM format
      end: string;   // HH:MM format
    };
  };
  lastMessageTime?: Date;
  messageHistory: WhatsAppMessage[];
}

class WhatsAppService {
  private config: WhatsAppConfig | null = null;
  private patientProfiles: Map<string, PatientWhatsAppProfile> = new Map();
  private scheduledMessages: Map<string, HealthUpdate> = new Map();
  private messageTemplates: Map<string, any> = new Map();

  constructor() {
    this.initializeTemplates();
    this.loadPatientProfiles();
  }

  private initializeTemplates() {
    // Medication reminder templates
    this.messageTemplates.set('medication_reminder_en', {
      name: 'medication_reminder',
      language: 'en',
      text: `🏥 *Sehat AI Reminder*

Hi {{patient_name}}, it's time for your medication:

💊 *{{medication_name}}*
⏰ Time: {{time}}
📋 Dosage: {{dosage}}

Reply with:
✅ TAKEN - if you've taken it
⏰ DELAY - if you need more time
❓ HELP - if you have questions

_Your health is our priority!_`
    });

    this.messageTemplates.set('medication_reminder_hi', {
      name: 'medication_reminder',
      language: 'hi',
      text: `🏥 *सेहत AI रिमाइंडर*

नमस्ते {{patient_name}}, आपकी दवा का समय हो गया है:

💊 *{{medication_name}}*
⏰ समय: {{time}}
📋 खुराक: {{dosage}}

जवाब दें:
✅ TAKEN - अगर आपने ली है
⏰ DELAY - अगर आपको और समय चाहिए
❓ HELP - अगर आपका कोई सवाल है

_आपका स्वास्थ्य हमारी प्राथमिकता है!_`
    });

    // Exercise reminder templates
    this.messageTemplates.set('exercise_reminder_en', {
      name: 'exercise_reminder',
      language: 'en',
      text: `🏃‍♀️ *Sehat AI Exercise Reminder*

Hi {{patient_name}}, time for your recovery exercises:

🎯 *{{exercise_name}}*
⏱️ Duration: {{duration}} minutes
🔄 Repetitions: {{repetitions}}

📱 Open the app for voice-guided session
📸 Take a progress photo after completion

Reply DONE when finished!

_Every step counts towards your recovery!_`
    });

    // Appointment reminder templates
    this.messageTemplates.set('appointment_reminder_en', {
      name: 'appointment_reminder',
      language: 'en',
      text: `📅 *Appointment Reminder*

Hi {{patient_name}}, you have an upcoming appointment:

👨‍⚕️ *Dr. {{doctor_name}}*
📅 Date: {{date}}
⏰ Time: {{time}}
📍 Location: {{location}}

📋 Prepare your questions
📱 Bring your medication list
📸 Bring progress photos

Reply CONFIRM to confirm attendance.

_See you soon!_`
    });

    // Emergency alert templates
    this.messageTemplates.set('emergency_alert_en', {
      name: 'emergency_alert',
      language: 'en',
      text: `🚨 *EMERGENCY ALERT*

{{patient_name}} may need immediate medical attention.

⚠️ *Alert Details:*
{{emergency_details}}

🏥 *Actions Taken:*
• Emergency services contacted
• Healthcare provider notified
• Family members alerted

📞 *Emergency Contacts:*
{{emergency_contacts}}

_This is an automated alert from Sehat AI_`
    });

    // Health tips templates
    this.messageTemplates.set('health_tip_en', {
      name: 'health_tip',
      language: 'en',
      text: `💡 *Daily Health Tip*

Hi {{patient_name}}, here's your personalized tip:

{{health_tip}}

🎯 *Today's Goal:* {{daily_goal}}

📊 Your recovery progress: {{progress}}%

Keep up the great work! 💪

_Sehat AI is with you every step of the way_`
    });
  }

  private loadPatientProfiles() {
    // Load from localStorage for demo
    const stored = localStorage.getItem('whatsapp_patient_profiles');
    if (stored) {
      try {
        const profiles = JSON.parse(stored);
        Object.entries(profiles).forEach(([patientId, profile]) => {
          this.patientProfiles.set(patientId, profile as PatientWhatsAppProfile);
        });
      } catch (error) {
        console.error('Error loading WhatsApp profiles:', error);
      }
    }
  }

  private savePatientProfiles() {
    const profiles = Object.fromEntries(this.patientProfiles);
    localStorage.setItem('whatsapp_patient_profiles', JSON.stringify(profiles));
  }

  // Initialize WhatsApp for a patient
  async initializePatientWhatsApp(patientId: string, phoneNumber: string): Promise<{ success: boolean; verificationCode?: string; message: string }> {
    try {
      // Validate phone number format (Indian numbers)
      const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
      if (!indianPhoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
        return {
          success: false,
          message: 'Please enter a valid Indian mobile number'
        };
      }

      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create patient profile
      const profile: PatientWhatsAppProfile = {
        patientId,
        phoneNumber: phoneNumber.replace(/\s+/g, ''),
        verified: false,
        verificationCode,
        verificationExpiry,
        preferences: {
          medicationReminders: true,
          exerciseReminders: true,
          appointmentReminders: true,
          healthTips: true,
          emergencyAlerts: true,
          language: 'en',
          quietHours: {
            start: '22:00',
            end: '07:00'
          }
        },
        messageHistory: []
      };

      this.patientProfiles.set(patientId, profile);
      this.savePatientProfiles();

      // Send verification message (simulated)
      await this.sendVerificationMessage(phoneNumber, verificationCode);

      return {
        success: true,
        verificationCode, // In production, don't return this
        message: 'Verification code sent to your WhatsApp. Please verify to enable notifications.'
      };

    } catch (error) {
      console.error('Error initializing WhatsApp:', error);
      return {
        success: false,
        message: 'Failed to initialize WhatsApp. Please try again.'
      };
    }
  }

  // Verify WhatsApp number with OTP
  async verifyWhatsAppNumber(patientId: string, verificationCode: string): Promise<{ success: boolean; message: string }> {
    try {
      const profile = this.patientProfiles.get(patientId);
      if (!profile) {
        return {
          success: false,
          message: 'Patient profile not found. Please initialize WhatsApp first.'
        };
      }

      if (profile.verified) {
        return {
          success: true,
          message: 'WhatsApp number is already verified.'
        };
      }

      if (!profile.verificationCode || !profile.verificationExpiry) {
        return {
          success: false,
          message: 'No verification code found. Please request a new code.'
        };
      }

      if (new Date() > profile.verificationExpiry) {
        return {
          success: false,
          message: 'Verification code has expired. Please request a new code.'
        };
      }

      if (profile.verificationCode !== verificationCode) {
        return {
          success: false,
          message: 'Invalid verification code. Please check and try again.'
        };
      }

      // Verify the number
      profile.verified = true;
      profile.verificationCode = undefined;
      profile.verificationExpiry = undefined;
      
      this.patientProfiles.set(patientId, profile);
      this.savePatientProfiles();

      // Send welcome message
      await this.sendWelcomeMessage(patientId);

      return {
        success: true,
        message: 'WhatsApp number verified successfully! You will now receive health updates.'
      };

    } catch (error) {
      console.error('Error verifying WhatsApp number:', error);
      return {
        success: false,
        message: 'Verification failed. Please try again.'
      };
    }
  }

  // Send verification message
  private async sendVerificationMessage(phoneNumber: string, code: string): Promise<void> {
    // Simulate sending WhatsApp message
    console.log(`📱 WhatsApp Verification Message sent to ${phoneNumber}:`);
    console.log(`🏥 Sehat AI Verification

Your verification code is: *${code}*

This code will expire in 10 minutes.

Enter this code in the app to enable WhatsApp notifications for your health updates.

_Welcome to Sehat AI!_`);

    // In production, integrate with WhatsApp Business API
    // await this.whatsappAPI.sendMessage(phoneNumber, verificationMessage);
  }

  // Send welcome message after verification
  private async sendWelcomeMessage(patientId: string): Promise<void> {
    const profile = this.patientProfiles.get(patientId);
    if (!profile) return;

    const welcomeMessage = `🎉 *Welcome to Sehat AI WhatsApp!*

Hi there! Your WhatsApp is now connected to Sehat AI.

🔔 *You'll receive:*
• Medication reminders
• Exercise notifications
• Appointment alerts
• Daily health tips
• Emergency notifications

⚙️ *Manage Settings:*
Reply SETTINGS to customize your preferences

❓ *Need Help:*
Reply HELP anytime for assistance

_Your health journey just got smarter!_`;

    await this.sendMessage(patientId, 'text', welcomeMessage);
  }

  // Send health update message
  async sendHealthUpdate(update: HealthUpdate): Promise<{ success: boolean; messageId?: string; message: string }> {
    try {
      const profile = this.patientProfiles.get(update.patientId);
      if (!profile || !profile.verified) {
        return {
          success: false,
          message: 'Patient WhatsApp not verified'
        };
      }

      // Check quiet hours
      if (this.isQuietHours(profile.preferences.quietHours) && update.priority !== 'urgent') {
        // Schedule for later
        return this.scheduleMessage(update);
      }

      // Get appropriate template
      const templateKey = `${update.type}_${profile.preferences.language}`;
      const template = this.messageTemplates.get(templateKey) || this.messageTemplates.get(`${update.type}_en`);

      let message = update.message;
      if (template) {
        message = this.formatTemplate(template.text, update, profile);
      }

      const messageId = await this.sendMessage(update.patientId, 'text', message);

      return {
        success: true,
        messageId,
        message: 'Health update sent successfully'
      };

    } catch (error) {
      console.error('Error sending health update:', error);
      return {
        success: false,
        message: 'Failed to send health update'
      };
    }
  }

  // Send emergency alert to family members
  async sendEmergencyAlert(patientId: string, emergencyDetails: string, familyContacts: string[]): Promise<void> {
    try {
      const profile = this.patientProfiles.get(patientId);
      if (!profile) return;

      const template = this.messageTemplates.get('emergency_alert_en');
      if (!template) return;

      const alertMessage = this.formatTemplate(template.text, {
        patient_name: 'Patient', // Get from patient profile
        emergency_details: emergencyDetails,
        emergency_contacts: familyContacts.join('\n')
      });

      // Send to all family contacts
      for (const contact of familyContacts) {
        await this.sendDirectMessage(contact, alertMessage);
      }

      console.log(`🚨 Emergency alerts sent to ${familyContacts.length} family members`);

    } catch (error) {
      console.error('Error sending emergency alerts:', error);
    }
  }

  // Send daily health summary
  async sendDailyHealthSummary(patientId: string, healthData: any): Promise<void> {
    try {
      const profile = this.patientProfiles.get(patientId);
      if (!profile || !profile.verified) return;

      const summaryMessage = `📊 *Daily Health Summary*

Hi! Here's your health summary for today:

💊 *Medications:* ${healthData.medicationsTaken}/${healthData.totalMedications} taken
🏃‍♀️ *Exercises:* ${healthData.exercisesCompleted}/${healthData.totalExercises} completed
😊 *Pain Level:* ${healthData.painLevel}/10
📈 *Recovery Progress:* ${healthData.recoveryProgress}%

${healthData.recoveryProgress >= 80 ? '🎉 Excellent progress!' : 
  healthData.recoveryProgress >= 60 ? '👍 Good progress!' : 
  '💪 Keep going, you\'re doing great!'}

📱 Open the app for detailed insights.

_Sehat AI - Your health companion_`;

      await this.sendMessage(patientId, 'text', summaryMessage);

    } catch (error) {
      console.error('Error sending daily summary:', error);
    }
  }

  // Handle incoming WhatsApp messages
  async handleIncomingMessage(phoneNumber: string, message: string): Promise<{ response?: string; action?: string }> {
    try {
      // Find patient by phone number
      const patientProfile = Array.from(this.patientProfiles.values())
        .find(profile => profile.phoneNumber === phoneNumber);

      if (!patientProfile) {
        return {
          response: 'Phone number not registered with Sehat AI. Please register through the app first.'
        };
      }

      const lowerMessage = message.toLowerCase().trim();

      // Handle common responses
      switch (lowerMessage) {
        case 'taken':
          await this.handleMedicationTaken(patientProfile.patientId);
          return {
            response: '✅ Great! Medication marked as taken. Keep up the good work!',
            action: 'medication_taken'
          };

        case 'delay':
          return {
            response: '⏰ No problem! I\'ll remind you again in 30 minutes. Take care!',
            action: 'medication_delayed'
          };

        case 'done':
          await this.handleExerciseCompleted(patientProfile.patientId);
          return {
            response: '🎉 Excellent! Exercise marked as completed. Your recovery is on track!',
            action: 'exercise_completed'
          };

        case 'help':
          return {
            response: this.getHelpMessage(patientProfile.preferences.language),
            action: 'help_requested'
          };

        case 'settings':
          return {
            response: this.getSettingsMessage(patientProfile.preferences.language),
            action: 'settings_requested'
          };

        case 'confirm':
          return {
            response: '✅ Appointment confirmed! We\'ll send you a reminder before your visit.',
            action: 'appointment_confirmed'
          };

        case 'stop':
          await this.disableNotifications(patientProfile.patientId);
          return {
            response: '🔕 WhatsApp notifications disabled. You can re-enable them in the app anytime.',
            action: 'notifications_disabled'
          };

        default:
          // Handle pain level reports
          const painMatch = message.match(/pain\s+(\d+)/i);
          if (painMatch) {
            const painLevel = parseInt(painMatch[1]);
            await this.handlePainReport(patientProfile.patientId, painLevel);
            return {
              response: `📝 Pain level ${painLevel} recorded. ${painLevel >= 7 ? 'High pain detected - consider contacting your doctor.' : 'Thank you for the update!'}`,
              action: 'pain_reported'
            };
          }

          // Default response
          return {
            response: `Thank you for your message. I'm Sehat AI assistant. 

Reply with:
• TAKEN - for medication
• DONE - for exercises  
• HELP - for assistance
• SETTINGS - for preferences

Or describe your symptoms and I'll help!`,
            action: 'general_response'
          };
      }

    } catch (error) {
      console.error('Error handling incoming message:', error);
      return {
        response: 'Sorry, I encountered an error. Please try again or contact support.'
      };
    }
  }

  // Private helper methods
  private async sendMessage(patientId: string, type: string, content: string): Promise<string> {
    const profile = this.patientProfiles.get(patientId);
    if (!profile) throw new Error('Patient profile not found');

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const message: WhatsAppMessage = {
      id: messageId,
      to: profile.phoneNumber,
      type: type as any,
      content,
      timestamp: new Date(),
      status: 'sent'
    };

    // Add to message history
    profile.messageHistory.push(message);
    profile.lastMessageTime = new Date();
    
    this.patientProfiles.set(patientId, profile);
    this.savePatientProfiles();

    // Simulate sending message
    console.log(`📱 WhatsApp Message sent to ${profile.phoneNumber}:`);
    console.log(content);
    console.log('---');

    return messageId;
  }

  private async sendDirectMessage(phoneNumber: string, content: string): Promise<void> {
    // Simulate sending direct message
    console.log(`📱 Emergency WhatsApp Message sent to ${phoneNumber}:`);
    console.log(content);
    console.log('---');
  }

  private formatTemplate(template: string, data: any, profile?: PatientWhatsAppProfile): string {
    let formatted = template;
    
    // Replace placeholders
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      formatted = formatted.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return formatted;
  }

  private isQuietHours(quietHours: { start: string; end: string }): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return currentTime >= quietHours.start || currentTime <= quietHours.end;
  }

  private async scheduleMessage(update: HealthUpdate): Promise<{ success: boolean; messageId?: string; message: string }> {
    const messageId = `scheduled_${Date.now()}`;
    this.scheduledMessages.set(messageId, update);
    
    return {
      success: true,
      messageId,
      message: 'Message scheduled for after quiet hours'
    };
  }

  private async handleMedicationTaken(patientId: string): Promise<void> {
    // Update medication tracking
    console.log(`✅ Medication taken recorded for patient ${patientId}`);
  }

  private async handleExerciseCompleted(patientId: string): Promise<void> {
    // Update exercise tracking
    console.log(`🏃‍♀️ Exercise completed recorded for patient ${patientId}`);
  }

  private async handlePainReport(patientId: string, painLevel: number): Promise<void> {
    // Update pain tracking
    console.log(`📝 Pain level ${painLevel} recorded for patient ${patientId}`);
    
    if (painLevel >= 8) {
      // Trigger high pain alert
      console.log(`🚨 High pain alert triggered for patient ${patientId}`);
    }
  }

  private async disableNotifications(patientId: string): Promise<void> {
    const profile = this.patientProfiles.get(patientId);
    if (profile) {
      profile.preferences = {
        ...profile.preferences,
        medicationReminders: false,
        exerciseReminders: false,
        appointmentReminders: false,
        healthTips: false
      };
      this.patientProfiles.set(patientId, profile);
      this.savePatientProfiles();
    }
  }

  private getHelpMessage(language: string): string {
    if (language === 'hi') {
      return `🆘 *सेहत AI सहायता*

आप इन कमांड्स का उपयोग कर सकते हैं:

💊 *TAKEN* - दवा लेने के बाद
🏃‍♀️ *DONE* - व्यायाम पूरा करने के बाद
📅 *CONFIRM* - अपॉइंटमेंट कन्फर्म करने के लिए
⚙️ *SETTINGS* - सेटिंग्स बदलने के लिए
🔕 *STOP* - नोटिफिकेशन बंद करने के लिए

आप अपने लक्षणों के बारे में भी बता सकते हैं।

_हम आपकी मदद के लिए यहाँ हैं!_`;
    }

    return `🆘 *Sehat AI Help*

You can use these commands:

💊 *TAKEN* - after taking medication
🏃‍♀️ *DONE* - after completing exercise
📅 *CONFIRM* - to confirm appointments
⚙️ *SETTINGS* - to change preferences
🔕 *STOP* - to disable notifications

You can also describe your symptoms.

_We're here to help!_`;
  }

  private getSettingsMessage(language: string): string {
    if (language === 'hi') {
      return `⚙️ *सेटिंग्स*

अपनी प्राथमिकताएं बदलने के लिए ऐप खोलें:

🔔 नोटिफिकेशन सेटिंग्स
🕐 शांत घंटे
🌐 भाषा प्राथमिकता
👨‍⚕️ डॉक्टर संपर्क

या इन कमांड्स का उपयोग करें:
• *HINDI* - हिंदी में बदलें
• *ENGLISH* - अंग्रेजी में बदलें

_ऐप में अधिक विकल्प उपलब्ध हैं_`;
    }

    return `⚙️ *Settings*

Open the app to change your preferences:

🔔 Notification settings
🕐 Quiet hours
🌐 Language preference
👨‍⚕️ Doctor contacts

Or use these commands:
• *HINDI* - switch to Hindi
• *ENGLISH* - switch to English

_More options available in the app_`;
  }

  // Public methods for getting patient data
  getPatientProfile(patientId: string): PatientWhatsAppProfile | undefined {
    return this.patientProfiles.get(patientId);
  }

  isPatientVerified(patientId: string): boolean {
    const profile = this.patientProfiles.get(patientId);
    return profile?.verified || false;
  }

  getMessageHistory(patientId: string): WhatsAppMessage[] {
    const profile = this.patientProfiles.get(patientId);
    return profile?.messageHistory || [];
  }

  // Update patient preferences
  async updatePatientPreferences(patientId: string, preferences: Partial<PatientWhatsAppProfile['preferences']>): Promise<void> {
    const profile = this.patientProfiles.get(patientId);
    if (profile) {
      profile.preferences = { ...profile.preferences, ...preferences };
      this.patientProfiles.set(patientId, profile);
      this.savePatientProfiles();
    }
  }
}

export const whatsappService = new WhatsAppService();
export default whatsappService;
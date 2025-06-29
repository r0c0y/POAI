// Emergency Contact Management Service for India
interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  priority: number; // 1 = highest priority
  contactMethods: ('call' | 'sms' | 'whatsapp' | 'email')[];
  availability: {
    timezone: string;
    preferredHours: {
      start: string; // HH:MM
      end: string;   // HH:MM
    };
    daysAvailable: string[]; // ['monday', 'tuesday', etc.]
  };
  medicalAuthorization: boolean; // Can make medical decisions
  isVerified: boolean;
  lastContacted?: Date;
  responseHistory: Array<{
    timestamp: Date;
    method: string;
    responded: boolean;
    responseTime?: number; // in minutes
  }>;
}

interface IndianEmergencyService {
  name: string;
  number: string;
  type: 'police' | 'fire' | 'medical' | 'disaster' | 'women' | 'child' | 'senior';
  coverage: 'national' | 'state' | 'city';
  location?: string; // state/city name for local services
  description: string;
  languages: string[];
}

interface HospitalContact {
  id: string;
  name: string;
  type: 'government' | 'private' | 'specialty';
  phone: string;
  emergencyPhone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  specialties: string[];
  hasEmergencyRoom: boolean;
  distance?: number; // in km from patient
  rating?: number;
  acceptsInsurance: string[];
}

class EmergencyContactService {
  private patientContacts: Map<string, EmergencyContact[]> = new Map();
  private indianEmergencyServices: IndianEmergencyService[] = [];
  private nearbyHospitals: Map<string, HospitalContact[]> = new Map(); // keyed by city/pincode

  constructor() {
    this.initializeIndianEmergencyServices();
    this.initializeHospitalDatabase();
    this.loadPatientContacts();
  }

  private initializeIndianEmergencyServices() {
    this.indianEmergencyServices = [
      // National Emergency Numbers
      {
        name: 'Emergency Services (All)',
        number: '112',
        type: 'medical',
        coverage: 'national',
        description: 'Single emergency number for Police, Fire, Medical emergencies',
        languages: ['Hindi', 'English', 'Regional Languages']
      },
      {
        name: 'Police',
        number: '100',
        type: 'police',
        coverage: 'national',
        description: 'Police emergency services',
        languages: ['Hindi', 'English', 'Regional Languages']
      },
      {
        name: 'Fire Brigade',
        number: '101',
        type: 'fire',
        coverage: 'national',
        description: 'Fire emergency services',
        languages: ['Hindi', 'English', 'Regional Languages']
      },
      {
        name: 'Ambulance',
        number: '102',
        type: 'medical',
        coverage: 'national',
        description: 'Medical emergency and ambulance services',
        languages: ['Hindi', 'English', 'Regional Languages']
      },
      {
        name: 'Disaster Management',
        number: '108',
        type: 'disaster',
        coverage: 'national',
        description: 'Emergency response for disasters and medical emergencies',
        languages: ['Hindi', 'English', 'Regional Languages']
      },
      {
        name: 'Women Helpline',
        number: '1091',
        type: 'women',
        coverage: 'national',
        description: 'Women in distress helpline',
        languages: ['Hindi', 'English', 'Regional Languages']
      },
      {
        name: 'Child Helpline',
        number: '1098',
        type: 'child',
        coverage: 'national',
        description: 'Child helpline for children in need',
        languages: ['Hindi', 'English', 'Regional Languages']
      },
      {
        name: 'Senior Citizen Helpline',
        number: '14567',
        type: 'senior',
        coverage: 'national',
        description: 'Helpline for senior citizens',
        languages: ['Hindi', 'English', 'Regional Languages']
      },
      // State-specific services (examples)
      {
        name: 'Delhi Police',
        number: '011-23490000',
        type: 'police',
        coverage: 'state',
        location: 'Delhi',
        description: 'Delhi Police control room',
        languages: ['Hindi', 'English', 'Punjabi']
      },
      {
        name: 'Mumbai Police',
        number: '022-22621855',
        type: 'police',
        coverage: 'city',
        location: 'Mumbai',
        description: 'Mumbai Police control room',
        languages: ['Hindi', 'English', 'Marathi']
      },
      {
        name: 'Bangalore Medical Emergency',
        number: '080-22221100',
        type: 'medical',
        coverage: 'city',
        location: 'Bangalore',
        description: 'Bangalore medical emergency services',
        languages: ['Hindi', 'English', 'Kannada']
      }
    ];
  }

  private initializeHospitalDatabase() {
    // Sample hospital data for major Indian cities
    const delhiHospitals: HospitalContact[] = [
      {
        id: 'aiims-delhi',
        name: 'All India Institute of Medical Sciences (AIIMS)',
        type: 'government',
        phone: '011-26588500',
        emergencyPhone: '011-26588700',
        address: {
          street: 'Sri Aurobindo Marg, Ansari Nagar',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110029'
        },
        specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Emergency Medicine'],
        hasEmergencyRoom: true,
        rating: 4.8,
        acceptsInsurance: ['CGHS', 'ESIC', 'Ayushman Bharat']
      },
      {
        id: 'fortis-delhi',
        name: 'Fortis Hospital Shalimar Bagh',
        type: 'private',
        phone: '011-47135000',
        emergencyPhone: '011-47135911',
        address: {
          street: 'A Block, Shalimar Bagh',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110088'
        },
        specialties: ['Cardiology', 'Orthopedics', 'Neurology', 'Emergency Medicine'],
        hasEmergencyRoom: true,
        rating: 4.5,
        acceptsInsurance: ['Star Health', 'HDFC ERGO', 'ICICI Lombard']
      }
    ];

    const mumbaiHospitals: HospitalContact[] = [
      {
        id: 'kh-mumbai',
        name: 'King Edward Memorial Hospital',
        type: 'government',
        phone: '022-24136051',
        emergencyPhone: '022-24136000',
        address: {
          street: 'Acharya Donde Marg, Parel',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400012'
        },
        specialties: ['Emergency Medicine', 'Trauma Care', 'General Medicine'],
        hasEmergencyRoom: true,
        rating: 4.2,
        acceptsInsurance: ['ESIC', 'Ayushman Bharat']
      },
      {
        id: 'lilavati-mumbai',
        name: 'Lilavati Hospital and Research Centre',
        type: 'private',
        phone: '022-26567777',
        emergencyPhone: '022-26567911',
        address: {
          street: 'A-791, Bandra Reclamation',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050'
        },
        specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Emergency Medicine'],
        hasEmergencyRoom: true,
        rating: 4.6,
        acceptsInsurance: ['Star Health', 'HDFC ERGO', 'Max Bupa']
      }
    ];

    this.nearbyHospitals.set('Delhi', delhiHospitals);
    this.nearbyHospitals.set('Mumbai', mumbaiHospitals);
  }

  private loadPatientContacts() {
    const stored = localStorage.getItem('emergency_contacts');
    if (stored) {
      try {
        const contacts = JSON.parse(stored);
        Object.entries(contacts).forEach(([patientId, contactList]) => {
          this.patientContacts.set(patientId, contactList as EmergencyContact[]);
        });
      } catch (error) {
        console.error('Error loading emergency contacts:', error);
      }
    }
  }

  private savePatientContacts() {
    const contacts = Object.fromEntries(this.patientContacts);
    localStorage.setItem('emergency_contacts', JSON.stringify(contacts));
  }

  // Add emergency contact for patient
  async addEmergencyContact(patientId: string, contact: Omit<EmergencyContact, 'id' | 'isVerified' | 'responseHistory'>): Promise<{ success: boolean; contactId?: string; message: string }> {
    try {
      // Validate Indian phone number
      const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
      if (!indianPhoneRegex.test(contact.phone.replace(/\s+/g, ''))) {
        return {
          success: false,
          message: 'Please enter a valid Indian mobile number'
        };
      }

      const contactId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newContact: EmergencyContact = {
        ...contact,
        id: contactId,
        phone: contact.phone.replace(/\s+/g, ''),
        isVerified: false,
        responseHistory: []
      };

      const existingContacts = this.patientContacts.get(patientId) || [];
      existingContacts.push(newContact);
      
      // Sort by priority
      existingContacts.sort((a, b) => a.priority - b.priority);
      
      this.patientContacts.set(patientId, existingContacts);
      this.savePatientContacts();

      // Send verification message if WhatsApp is enabled
      if (contact.contactMethods.includes('whatsapp')) {
        await this.sendContactVerification(newContact);
      }

      return {
        success: true,
        contactId,
        message: 'Emergency contact added successfully'
      };

    } catch (error) {
      console.error('Error adding emergency contact:', error);
      return {
        success: false,
        message: 'Failed to add emergency contact'
      };
    }
  }

  // Update emergency contact
  async updateEmergencyContact(patientId: string, contactId: string, updates: Partial<EmergencyContact>): Promise<{ success: boolean; message: string }> {
    try {
      const contacts = this.patientContacts.get(patientId) || [];
      const contactIndex = contacts.findIndex(c => c.id === contactId);
      
      if (contactIndex === -1) {
        return {
          success: false,
          message: 'Emergency contact not found'
        };
      }

      contacts[contactIndex] = { ...contacts[contactIndex], ...updates };
      
      // Re-sort by priority if priority was updated
      if (updates.priority !== undefined) {
        contacts.sort((a, b) => a.priority - b.priority);
      }
      
      this.patientContacts.set(patientId, contacts);
      this.savePatientContacts();

      return {
        success: true,
        message: 'Emergency contact updated successfully'
      };

    } catch (error) {
      console.error('Error updating emergency contact:', error);
      return {
        success: false,
        message: 'Failed to update emergency contact'
      };
    }
  }

  // Remove emergency contact
  async removeEmergencyContact(patientId: string, contactId: string): Promise<{ success: boolean; message: string }> {
    try {
      const contacts = this.patientContacts.get(patientId) || [];
      const filteredContacts = contacts.filter(c => c.id !== contactId);
      
      if (filteredContacts.length === contacts.length) {
        return {
          success: false,
          message: 'Emergency contact not found'
        };
      }

      this.patientContacts.set(patientId, filteredContacts);
      this.savePatientContacts();

      return {
        success: true,
        message: 'Emergency contact removed successfully'
      };

    } catch (error) {
      console.error('Error removing emergency contact:', error);
      return {
        success: false,
        message: 'Failed to remove emergency contact'
      };
    }
  }

  // Get all emergency contacts for patient
  getEmergencyContacts(patientId: string): EmergencyContact[] {
    return this.patientContacts.get(patientId) || [];
  }

  // Get emergency services for location
  getEmergencyServices(location?: { city?: string; state?: string }): IndianEmergencyService[] {
    let services = this.indianEmergencyServices.filter(service => service.coverage === 'national');
    
    if (location?.state) {
      const stateServices = this.indianEmergencyServices.filter(
        service => service.coverage === 'state' && service.location === location.state
      );
      services = [...services, ...stateServices];
    }
    
    if (location?.city) {
      const cityServices = this.indianEmergencyServices.filter(
        service => service.coverage === 'city' && service.location === location.city
      );
      services = [...services, ...cityServices];
    }
    
    return services;
  }

  // Get nearby hospitals
  getNearbyHospitals(location: { city: string; state: string }): HospitalContact[] {
    return this.nearbyHospitals.get(location.city) || [];
  }

  // Trigger emergency alert
  async triggerEmergencyAlert(patientId: string, emergencyType: string, details: string, location?: any): Promise<{ success: boolean; contactsAlerted: number; servicesContacted: string[]; message: string }> {
    try {
      const contacts = this.getEmergencyContacts(patientId);
      const emergencyServices = this.getEmergencyServices(location);
      
      let contactsAlerted = 0;
      const servicesContacted: string[] = [];

      // Contact emergency services first
      if (emergencyType === 'medical' || emergencyType === 'critical') {
        // Call 112 (unified emergency number)
        await this.contactEmergencyService('112', emergencyType, details, location);
        servicesContacted.push('112 - Emergency Services');
        
        // Also call 102 for ambulance
        await this.contactEmergencyService('102', emergencyType, details, location);
        servicesContacted.push('102 - Ambulance');
      }

      // Contact family/friends in priority order
      const sortedContacts = contacts.sort((a, b) => a.priority - b.priority);
      
      for (const contact of sortedContacts.slice(0, 5)) { // Contact top 5 priority contacts
        const contacted = await this.contactEmergencyContact(contact, emergencyType, details, patientId);
        if (contacted) {
          contactsAlerted++;
        }
      }

      // Log the emergency
      console.log(`🚨 EMERGENCY ALERT TRIGGERED`);
      console.log(`Patient: ${patientId}`);
      console.log(`Type: ${emergencyType}`);
      console.log(`Details: ${details}`);
      console.log(`Contacts Alerted: ${contactsAlerted}`);
      console.log(`Services Contacted: ${servicesContacted.join(', ')}`);

      return {
        success: true,
        contactsAlerted,
        servicesContacted,
        message: `Emergency alert sent successfully. ${contactsAlerted} contacts alerted, ${servicesContacted.length} emergency services contacted.`
      };

    } catch (error) {
      console.error('Error triggering emergency alert:', error);
      return {
        success: false,
        contactsAlerted: 0,
        servicesContacted: [],
        message: 'Failed to trigger emergency alert'
      };
    }
  }

  // Contact emergency service
  private async contactEmergencyService(number: string, emergencyType: string, details: string, location?: any): Promise<void> {
    // In production, this would integrate with actual emergency services
    console.log(`📞 CALLING EMERGENCY SERVICE: ${number}`);
    console.log(`Emergency Type: ${emergencyType}`);
    console.log(`Details: ${details}`);
    console.log(`Location: ${location ? JSON.stringify(location) : 'Not provided'}`);
    console.log('---');
    
    // Simulate emergency call
    // In real implementation:
    // - Use VoIP/telephony API to place actual call
    // - Send location data
    // - Provide medical information
    // - Stay on line until help arrives
  }

  // Contact emergency contact
  private async contactEmergencyContact(contact: EmergencyContact, emergencyType: string, details: string, patientId: string): Promise<boolean> {
    try {
      const emergencyMessage = this.formatEmergencyMessage(contact, emergencyType, details, patientId);
      
      // Try contact methods in order of preference
      for (const method of contact.contactMethods) {
        try {
          switch (method) {
            case 'call':
              await this.makeEmergencyCall(contact.phone, emergencyMessage);
              break;
            case 'whatsapp':
              await this.sendWhatsAppEmergencyAlert(contact.phone, emergencyMessage);
              break;
            case 'sms':
              await this.sendEmergencySMS(contact.phone, emergencyMessage);
              break;
            case 'email':
              if (contact.email) {
                await this.sendEmergencyEmail(contact.email, emergencyMessage);
              }
              break;
          }
          
          // Record contact attempt
          contact.responseHistory.push({
            timestamp: new Date(),
            method,
            responded: false // Will be updated when they respond
          });
          
          contact.lastContacted = new Date();
          
          console.log(`📱 Emergency contact sent to ${contact.name} (${contact.phone}) via ${method}`);
          return true;
          
        } catch (error) {
          console.error(`Failed to contact ${contact.name} via ${method}:`, error);
          continue;
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('Error contacting emergency contact:', error);
      return false;
    }
  }

  private formatEmergencyMessage(contact: EmergencyContact, emergencyType: string, details: string, patientId: string): string {
    return `🚨 MEDICAL EMERGENCY ALERT

${contact.name}, this is an urgent message from Sehat AI.

A patient in your emergency contact list may need immediate medical attention.

⚠️ Emergency Type: ${emergencyType.toUpperCase()}
📝 Details: ${details}
⏰ Time: ${new Date().toLocaleString('en-IN')}

🏥 ACTIONS TAKEN:
• Emergency services (112) contacted
• Ambulance (102) dispatched
• Healthcare provider notified

📞 WHAT YOU CAN DO:
• Call the patient immediately
• Go to their location if nearby
• Contact other family members
• Meet at the hospital

This is an automated alert from Sehat AI Emergency System.`;
  }

  private async makeEmergencyCall(phoneNumber: string, message: string): Promise<void> {
    // Simulate emergency call
    console.log(`📞 EMERGENCY CALL to ${phoneNumber}`);
    console.log('Message would be delivered via voice call');
    console.log(message);
    console.log('---');
  }

  private async sendWhatsAppEmergencyAlert(phoneNumber: string, message: string): Promise<void> {
    // Simulate WhatsApp emergency message
    console.log(`📱 EMERGENCY WHATSAPP to ${phoneNumber}`);
    console.log(message);
    console.log('---');
  }

  private async sendEmergencySMS(phoneNumber: string, message: string): Promise<void> {
    // Simulate SMS
    console.log(`📨 EMERGENCY SMS to ${phoneNumber}`);
    console.log(message);
    console.log('---');
  }

  private async sendEmergencyEmail(email: string, message: string): Promise<void> {
    // Simulate email
    console.log(`📧 EMERGENCY EMAIL to ${email}`);
    console.log(message);
    console.log('---');
  }

  private async sendContactVerification(contact: EmergencyContact): Promise<void> {
    const verificationMessage = `🏥 Sehat AI Emergency Contact Verification

Hi ${contact.name},

You have been added as an emergency contact for a Sehat AI patient.

In case of medical emergencies, you may receive urgent alerts via:
${contact.contactMethods.map(method => `• ${method.toUpperCase()}`).join('\n')}

Reply CONFIRM to verify this contact information.

Thank you for being a trusted emergency contact.`;

    if (contact.contactMethods.includes('whatsapp')) {
      await this.sendWhatsAppEmergencyAlert(contact.phone, verificationMessage);
    }
  }

  // Verify emergency contact response
  async verifyContactResponse(patientId: string, contactPhone: string, responseTime: number): Promise<void> {
    const contacts = this.patientContacts.get(patientId) || [];
    const contact = contacts.find(c => c.phone === contactPhone);
    
    if (contact && contact.responseHistory.length > 0) {
      const lastResponse = contact.responseHistory[contact.responseHistory.length - 1];
      lastResponse.responded = true;
      lastResponse.responseTime = responseTime;
      
      this.patientContacts.set(patientId, contacts);
      this.savePatientContacts();
    }
  }

  // Get emergency contact statistics
  getEmergencyContactStats(patientId: string): {
    totalContacts: number;
    verifiedContacts: number;
    averageResponseTime: number;
    lastEmergencyAlert?: Date;
  } {
    const contacts = this.getEmergencyContacts(patientId);
    const verifiedContacts = contacts.filter(c => c.isVerified).length;
    
    const allResponses = contacts.flatMap(c => c.responseHistory.filter(r => r.responded && r.responseTime));
    const averageResponseTime = allResponses.length > 0 
      ? allResponses.reduce((sum, r) => sum + (r.responseTime || 0), 0) / allResponses.length 
      : 0;
    
    const lastEmergencyAlert = contacts
      .map(c => c.lastContacted)
      .filter(Boolean)
      .sort((a, b) => (b?.getTime() || 0) - (a?.getTime() || 0))[0];

    return {
      totalContacts: contacts.length,
      verifiedContacts,
      averageResponseTime: Math.round(averageResponseTime),
      lastEmergencyAlert
    };
  }
}

export const emergencyContactService = new EmergencyContactService();
export default emergencyContactService;
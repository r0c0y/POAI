import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface PatientRecord {
  id?: string;
  patientId: string;
  personalInfo: {
    name: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  medicalInfo: {
    surgeryType: string;
    surgeryDate: Date;
    surgeon: string;
    hospital: string;
    complications: string[];
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      startDate: Date;
      endDate?: Date;
    }>;
    allergies: string[];
  };
  recoveryPlan: {
    exercises: Array<{
      name: string;
      description: string;
      frequency: string;
      duration: string;
    }>;
    restrictions: string[];
    followUpDates: Date[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  surgery: string;
  daysSinceSurgery: number;
  riskLevel: 'high' | 'medium' | 'low';
  lastContact: string;
  painLevel: number;
  recoveryProgress: number;
}

export interface ConversationRecord {
  id?: string;
  patientId: string;
  sessionId: string;
  transcript: string;
  analysis: {
    symptoms: string[];
    painLevel?: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
  };
  duration: number;
  timestamp: Date;
  providerId?: string;
  followUpRequired: boolean;
}

export interface Appointment {
  id?: string;
  patientId: string;
  providerId: string;
  type: 'consultation' | 'follow-up' | 'therapy' | 'check-up';
  scheduledDate: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  createdAt: Date;
}

export interface ProgressReport {
  id?: string;
  patientId: string;
  date: Date;
  painLevel: number;
  mobilityScore: number;
  exerciseCompliance: number;
  medicationAdherence: number;
  photos?: string[]; // URLs to uploaded images
  notes: string;
  providerId?: string;
}

export interface MedicalReport {
  id?: string;
  patientId: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  uploadDate: Date;
  analysisDate: Date;
  originalFile: string; // base64 or URL
  extractedText: string;
  aiAnalysis: {
    summary: string;
    symptoms: string[];
    diagnosis: string[];
    recommendations: string[];
    medications: string[];
    testResults: Array<{
      test: string;
      value: string;
      normalRange: string;
      status: 'normal' | 'abnormal' | 'borderline';
    }>;
    followUpRequired: boolean;
    urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
    estimatedRecoveryTime: string;
    doctorNotes: string[];
  };
  formattedReport: string;
  saved: boolean;
}

// Helper function to convert Firestore data with Timestamps to proper Date objects
function convertTimestampsToDate(data: any): any {
  if (!data) return data;
  
  const converted = { ...data };
  
  // Convert common timestamp fields
  if (converted.scheduledDate?.toDate) {
    converted.scheduledDate = converted.scheduledDate.toDate();
  } else if (converted.scheduledDate === undefined || converted.scheduledDate === null) {
    converted.scheduledDate = new Date();
  }
  
  if (converted.createdAt?.toDate) {
    converted.createdAt = converted.createdAt.toDate();
  } else if (converted.createdAt === undefined || converted.createdAt === null) {
    converted.createdAt = new Date();
  }
  
  if (converted.updatedAt?.toDate) {
    converted.updatedAt = converted.updatedAt.toDate();
  } else if (converted.updatedAt === undefined || converted.updatedAt === null) {
    converted.updatedAt = new Date();
  }
  
  if (converted.timestamp?.toDate) {
    converted.timestamp = converted.timestamp.toDate();
  } else if (converted.timestamp === undefined || converted.timestamp === null) {
    converted.timestamp = new Date();
  }
  
  if (converted.date?.toDate) {
    converted.date = converted.date.toDate();
  } else if (converted.date === undefined || converted.date === null) {
    converted.date = new Date();
  }
  
  // Handle nested medical info dates
  if (converted.medicalInfo) {
    if (converted.medicalInfo.surgeryDate?.toDate) {
      converted.medicalInfo.surgeryDate = converted.medicalInfo.surgeryDate.toDate();
    } else if (converted.medicalInfo.surgeryDate === undefined || converted.medicalInfo.surgeryDate === null) {
      converted.medicalInfo.surgeryDate = new Date();
    }
    
    // Handle medications dates
    if (converted.medicalInfo.medications) {
      converted.medicalInfo.medications = converted.medicalInfo.medications.map((med: any) => ({
        ...med,
        startDate: med.startDate?.toDate ? med.startDate.toDate() : (med.startDate || new Date()),
        endDate: med.endDate?.toDate ? med.endDate.toDate() : med.endDate
      }));
    }
  }
  
  // Handle recovery plan follow-up dates
  if (converted.recoveryPlan?.followUpDates) {
    converted.recoveryPlan.followUpDates = converted.recoveryPlan.followUpDates.map((date: any) => 
      date?.toDate ? date.toDate() : (date || new Date())
    );
  }
  
  return converted;
}

class DataService {
  // Patient Records
  async createPatientRecord(record: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'patients'), {
        ...record,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating patient record:', error);
      throw new Error('Failed to create patient record');
    }
  }

  async getPatientRecord(patientId: string): Promise<PatientRecord | null> {
    try {
      const q = query(collection(db, 'patients'), where('patientId', '==', patientId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = convertTimestampsToDate(doc.data());
        return { id: doc.id, ...data } as PatientRecord;
      }
      return null;
    } catch (error) {
      console.error('Error getting patient record:', error);
      throw new Error('Failed to get patient record');
    }
  }

  async updatePatientRecord(id: string, updates: Partial<PatientRecord>): Promise<void> {
    try {
      const docRef = doc(db, 'patients', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating patient record:', error);
      throw new Error('Failed to update patient record');
    }
  }

  // Conversation Records
  async saveConversation(conversation: Omit<ConversationRecord, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'conversations'), conversation);
      return docRef.id;
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw new Error('Failed to save conversation');
    }
  }

  async getConversationHistory(patientId: string, limitCount: number = 10): Promise<ConversationRecord[]> {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('patientId', '==', patientId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = convertTimestampsToDate(doc.data());
        return {
          id: doc.id,
          ...data
        };
      }) as ConversationRecord[];
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw new Error('Failed to get conversation history');
    }
  }

  // Appointments
  async scheduleAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        ...appointment,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      throw new Error('Failed to schedule appointment');
    }
  }

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    try {
      const q = query(
        collection(db, 'appointments'),
        where('patientId', '==', patientId),
        orderBy('scheduledDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = convertTimestampsToDate(doc.data());
        return {
          id: doc.id,
          ...data
        };
      }) as Appointment[];
    } catch (error) {
      console.error('Error getting appointments:', error);
      throw new Error('Failed to get appointments');
    }
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<void> {
    try {
      const docRef = doc(db, 'appointments', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw new Error('Failed to update appointment');
    }
  }

  // Progress Reports
  async saveProgressReport(report: Omit<ProgressReport, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'progress'), report);
      return docRef.id;
    } catch (error) {
      console.error('Error saving progress report:', error);
      throw new Error('Failed to save progress report');
    }
  }

  async getProgressHistory(patientId: string, days: number = 30): Promise<ProgressReport[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const q = query(
        collection(db, 'progress'),
        where('patientId', '==', patientId),
        where('date', '>=', startDate),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = convertTimestampsToDate(doc.data());
        return {
          id: doc.id,
          ...data
        };
      }) as ProgressReport[];
    } catch (error) {
      console.error('Error getting progress history:', error);
      throw new Error('Failed to get progress history');
    }
  }

  // Real-time listeners
  subscribeToPatientUpdates(patientId: string, callback: (record: PatientRecord | null) => void) {
    const q = query(collection(db, 'patients'), where('patientId', '==', patientId));
    
    return onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = convertTimestampsToDate(doc.data());
        callback({ id: doc.id, ...data } as PatientRecord);
      } else {
        callback(null);
      }
    });
  }

  subscribeToConversations(patientId: string, callback: (conversations: ConversationRecord[]) => void) {
    const q = query(
      collection(db, 'conversations'),
      where('patientId', '==', patientId),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const conversations = querySnapshot.docs.map(doc => {
        const data = convertTimestampsToDate(doc.data());
        return {
          id: doc.id,
          ...data
        };
      }) as ConversationRecord[];
      callback(conversations);
    });
  }

  // Analytics and Reports
  async getPatientAnalytics(patientId: string): Promise<{
    totalConversations: number;
    averagePainLevel: number;
    riskTrend: string;
    complianceScore: number;
  }> {
    try {
      // Get recent conversations
      const conversations = await this.getConversationHistory(patientId, 30);
      
      // Get recent progress reports
      const progress = await this.getProgressHistory(patientId, 30);
      
      // Calculate analytics
      const totalConversations = conversations.length;
      const painLevels = conversations
        .map(c => c.analysis.painLevel)
        .filter(p => p !== undefined) as number[];
      
      const averagePainLevel = painLevels.length > 0 
        ? painLevels.reduce((sum, level) => sum + level, 0) / painLevels.length 
        : 0;
      
      const highRiskCount = conversations.filter(c => c.analysis.riskLevel === 'high').length;
      const riskTrend = highRiskCount > totalConversations * 0.3 ? 'increasing' : 'stable';
      
      const complianceScores = progress.map(p => 
        (p.exerciseCompliance + p.medicationAdherence) / 2
      );
      const complianceScore = complianceScores.length > 0
        ? complianceScores.reduce((sum, score) => sum + score, 0) / complianceScores.length
        : 0;
      
      return {
        totalConversations,
        averagePainLevel,
        riskTrend,
        complianceScore
      };
    } catch (error) {
      console.error('Error getting patient analytics:', error);
      throw new Error('Failed to get patient analytics');
    }
  }

  // Medical Reports
  async saveMedicalReport(report: Omit<MedicalReport, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'medical_reports'), report);
      return docRef.id;
    } catch (error) {
      console.error('Error saving medical report:', error);
      throw new Error('Failed to save medical report');
    }
  }

  async getMedicalReports(patientId: string): Promise<MedicalReport[]> {
    try {
      const q = query(
        collection(db, 'medical_reports'),
        where('patientId', '==', patientId),
        orderBy('analysisDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = convertTimestampsToDate(doc.data());
        return {
          id: doc.id,
          ...data
        };
      }) as MedicalReport[];
    } catch (error) {
      console.error('Error getting medical reports:', error);
      throw new Error('Failed to get medical reports');
    }
  }
}

// Export singleton instance
export const dataService = new DataService();
export default dataService;
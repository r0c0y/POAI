import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Camera, 
  Pill, 
  Activity, 
  MessageCircle, 
  Phone, 
  Upload, 
  CheckCircle,
  TrendingUp,
  Clock,
  AlertCircle,
  Heart,
  Target,
  Award,
  Zap,
  Brain,
  FileText,
  Video,
  Image as ImageIcon,
  Shield,
  BarChart3,
  Stethoscope,
  Plus,
  X,
  Send
} from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import { enhancedAIAnalysisService } from '../services/enhancedAIAnalysisService';
import { exerciseService } from '../services/exerciseService';
import { healthIntelligenceService } from '../services/healthIntelligenceService';
import { emergencyIntelligenceService } from '../services/emergencyIntelligenceService';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';
import EnhancedCalendar from '../components/ui/EnhancedCalendar';
import CameraCapture from '../components/ui/CameraCapture';
import HealthDashboard from '../components/ui/HealthDashboard';
import ReportAnalyzer from '../components/ui/ReportAnalyzer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

const PatientPortal: React.FC = () => {
  const { speak, updateScreenContext, queryKnowledgeBase } = useVoice();
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'health-dashboard' | 'progress' | 'calendar' | 'reports' | 'exercises'>('overview');
  const [progressData, setProgressData] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [exerciseProgress, setExerciseProgress] = useState<any[]>([]);
  const [emergencyInfo, setEmergencyInfo] = useState<any>(null);
  const [showEmergencyOptions, setShowEmergencyOptions] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ sender: 'user' | 'ai'; message: string; recommendations?: string[] }>>([]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [todayTasks, setTodayTasks] = useState([
    { id: 1, task: 'Take morning medication', completed: false, time: '8:00 AM', type: 'medication' },
    { id: 2, task: 'Gentle knee exercises (5 reps)', completed: false, time: '10:00 AM', type: 'exercise' },
    { id: 3, task: 'Apply ice pack for 15 minutes', completed: false, time: '2:00 PM', type: 'therapy' },
    { id: 4, task: 'Evening medication', completed: false, time: '8:00 PM', type: 'medication' },
    { id: 5, task: 'Progress photo', completed: false, time: 'Anytime', type: 'documentation' }
  ]);
  
  const userProfile = authService.getUserProfile();
  const patientData = {
    name: userProfile?.displayName || 'Patient',
    surgery: 'Knee Replacement',
    surgeryDate: '2024-01-15',
    daysSinceSurgery: 5,
    nextCall: 'Tomorrow at 2:00 PM',
    recoveryProgress: 65
  };

  // Helper function to generate simulated progress data
  const generateSimulatedProgressData = (days: number) => {
    const data = [];
    let pain = 8;
    let mobility = 20;
    let compliance = 60;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));

      // Simulate improvement with some fluctuations
      pain = Math.max(1, pain - Math.random() * 0.5 + Math.random() * 0.2);
      mobility = Math.min(100, mobility + Math.random() * 2 - Math.random() * 0.5);
      compliance = Math.min(100, compliance + Math.random() * 1.5 - Math.random() * 0.3);

      data.push({
        date: date.toLocaleDateString(),
        pain: Math.round(pain),
        mobility: Math.round(mobility),
        compliance: Math.round(compliance)
      });
    }
    return data;
  };

  // Helper function to generate simulated exercise progress
  const generateSimulatedExerciseProgress = (numExercises: number) => {
    const data = [];
    for (let i = 1; i <= numExercises; i++) {
      data.push({
        exerciseId: `Exercise ${i}`,
        consistency: Math.round(50 + Math.random() * 50),
        improvementScore: Math.round(30 + Math.random() * 70)
      });
    }
    return data;
  };

  useEffect(() => {
    updateScreenContext('patient-portal', [
      'take photo',
      'view calendar',
      'check progress',
      'call sehat',
      'view reports',
      'schedule appointment',
      'start exercises',
      'analyze report',
      'health dashboard',
      'emergency help',
      'ask ai',
      ...todayTasks.filter(task => !task.completed).map(task => `complete ${task.task.toLowerCase()}`)
    ]);

    const handleVoiceCompleteTask = (event: Event) => {
      const customEvent = event as CustomEvent;
      const taskName = customEvent.detail.taskName;
      const taskToComplete = todayTasks.find(task => task.task.toLowerCase() === taskName.toLowerCase());
      if (taskToComplete) {
        completeTask(taskToComplete.id);
      }
    };

    window.addEventListener('voice-complete-task', handleVoiceCompleteTask);

    loadPatientData();
    loadExercises();
    loadEmergencyInfo();

    // Set initial simulated data
    setProgressData(generateSimulatedProgressData(30));
    setExerciseProgress(generateSimulatedExerciseProgress(5));

    return () => {
      window.removeEventListener('voice-complete-task', handleVoiceCompleteTask);
    };
  }, [updateScreenContext, todayTasks]);

  const loadPatientData = async () => {
    try {
      if (userProfile?.uid) {
        // Load progress data
        const progress = await dataService.getProgressHistory(userProfile.uid, 30);
        setProgressData(progress.map(p => ({
          date: p.date.toLocaleDateString(),
          pain: p.painLevel,
          mobility: p.mobilityScore,
          compliance: (p.exerciseCompliance + p.medicationAdherence) / 2
        })));

        // Load appointments
        const appts = await dataService.getPatientAppointments(userProfile.uid);
        setAppointments(appts);

        // Load conversation history
        const conversations = await dataService.getConversationHistory(userProfile.uid, 10);
        setConversationHistory(conversations);
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  const loadExercises = () => {
    const personalizedExercises = exerciseService.getPersonalizedPlan({
      surgeryType: 'knee-replacement',
      daysSinceSurgery: patientData.daysSinceSurgery,
      painLevel: 4,
      mobilityLevel: 70
    });
    setExercises(personalizedExercises);

    if (userProfile?.uid) {
      const progress = exerciseService.getExerciseProgress(userProfile.uid);
      setExerciseProgress(progress);
    }
  };

  const loadEmergencyInfo = () => {
    // Load emergency information
    const emergencyData = {
      emergencyContacts: [
        { name: 'Dr. Sarah Smith', phone: '+15551234567', relationship: 'Primary Surgeon' },
        { name: 'John Doe', phone: '+15559876543', relationship: 'Spouse' },
      ],
      medicalInfo: {
        allergies: ['Penicillin', 'Shellfish'],
        medications: ['Lisinopril 10mg', 'Metformin 500mg'],
        conditions: ['Hypertension', 'Post-surgical recovery'],
        bloodType: 'O+'
      },
      emergencyNumbers: {
        ambulance: '911',
        hospital: '+15551112222',
        poisonControl: '+18002221222'
      }
    };
    setEmergencyInfo(emergencyData);
  };

  const recentMessages = [
    { id: 1, from: 'Sehat AI', message: 'Great progress on your recovery! Keep following the plan.', time: '2 hours ago', type: 'ai' },
    { id: 2, from: 'Dr. Kumar', message: 'Your latest photos show excellent healing.', time: '1 day ago', type: 'doctor' },
    { id: 3, from: 'Sehat AI', message: 'Reminder: Take your evening medication.', time: '2 days ago', type: 'ai' }
  ];

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotoPreview(result);
        analyzePhoto(result);
      };
      reader.readAsDataURL(file);
      speak('Photo selected. I will analyze your wound using multiple AI models for the most accurate assessment.');
    }
  };

  const handleCameraCapture = (imageSrc: string) => {
    setPhotoPreview(imageSrc);
    speak('Photo captured successfully. Analyzing with multiple AI models for comprehensive assessment.');
    analyzePhoto(imageSrc);
  };

  const analyzePhoto = async (imageData: string) => {
    setIsAnalyzing(true);
    try {
      const results = await enhancedAIAnalysisService.analyzeImage(imageData, {
        patientId: userProfile?.uid,
        surgeryType: patientData.surgery,
        daysSinceSurgery: patientData.daysSinceSurgery
      });

      setAnalysisResults([results]);

      toast.success('Photo analyzed successfully using multiple AI models!');
      
      const analysisText = `Analysis complete using ${results.individualResults.length} AI models. Consensus findings: ${results.analysis.medicalFindings.join(', ')}. Risk level: ${results.analysis.riskAssessment}. Confidence: ${Math.round(results.confidence * 100)}%. ${results.analysis.recommendations[0] || 'Continue following your recovery plan.'}`;
      speak(analysisText);

      // Save analysis to conversation history
      if (userProfile?.uid) {
        await dataService.saveConversation({
          patientId: userProfile.uid,
          sessionId: `photo-analysis-${Date.now()}`,
          transcript: `Multi-AI photo analysis: ${results.analysis.medicalFindings.join(', ')}`,
          analysis: results.analysis,
          duration: results.processingTime,
          timestamp: new Date(),
          followUpRequired: results.analysis.followUpRequired
        });
      }

    } catch (error) {
      console.error('Photo analysis failed:', error);
      toast.error('Photo analysis failed. Please try again.');
      speak('Photo analysis failed. Please try again or contact your healthcare provider.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVoiceAction = async (action: string) => {
    await speak(`${action} activated`);
    
    switch (action.toLowerCase()) {
      case 'call sehat ai':
        window.dispatchEvent(new CustomEvent('voice-navigate', { detail: { path: '/patient-call' } }));
        break;
      case 'take photo':
        setShowCamera(true);
        break;
      case 'view calendar':
        setSelectedTab('calendar');
        break;
      case 'check progress':
        setSelectedTab('progress');
        break;
      case 'view reports':
        setSelectedTab('reports');
        break;
      case 'start exercises':
        setSelectedTab('exercises');
        break;
      case 'health dashboard':
        setSelectedTab('health-dashboard');
        break;
      case 'emergency help':
        await handleEmergencyHelp();
        break;
      case 'ask ai':
        setShowAIChat(true);
        await speak('Opening AI chat. How can I help you today?');
        break;
    }
  };

  const handleEmergencyHelp = async () => {
    setShowEmergencyOptions(true);
    await speak('Emergency options displayed. Please select who you would like to contact.');
  };

  const handleCallEmergency = async (type: 'ambulance' | 'family' | 'doctor', contactInfo?: any) => {
    setShowEmergencyOptions(false);
    let message = '';
    let phoneNumber = '';
    let location = 'Unknown Location';

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          location = `Lat: ${position.coords.latitude}, Lon: ${position.coords.longitude}`;
          toast.success(`Location acquired: ${location}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get current location.');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    switch (type) {
      case 'ambulance':
        phoneNumber = emergencyInfo?.emergencyNumbers?.ambulance || '911';
        message = `Calling ambulance at ${phoneNumber}.`;
        await speak(`Calling ambulance. Your location is ${location}.`);
        // Simulate call
        window.open(`tel:${phoneNumber}`);
        break;
      case 'family':
        if (emergencyInfo?.emergencyContacts && emergencyInfo.emergencyContacts.length > 0) {
          const familyContact = emergencyInfo.emergencyContacts[1]; // Assuming second contact is family
          phoneNumber = familyContact.phone;
          message = `Calling ${familyContact.name} at ${phoneNumber}. Sending emergency alert with location.`;
          await speak(`Calling ${familyContact.name}. Sending emergency alert with your location: ${location}.`);
          // Simulate call
          window.open(`tel:${phoneNumber}`);
          // Simulate sending message
          await emergencyIntelligenceService.sendEmergencyAlert({
            patientId: userProfile?.uid || 'demo-patient',
            contact: familyContact,
            message: `Emergency! ${patientData.name} needs help. Current location: ${location}. Please call immediately.`,
            location: location
          });
        } else {
          message = 'No family contact found.';
          await speak(message);
        }
        break;
      case 'doctor':
        if (emergencyInfo?.emergencyContacts && emergencyInfo.emergencyContacts.length > 0) {
          const doctorContact = emergencyInfo.emergencyContacts[0]; // Assuming first contact is doctor
          phoneNumber = doctorContact.phone;
          message = `Calling ${doctorContact.name} at ${phoneNumber}.`;
          await speak(`Calling your doctor, ${doctorContact.name}.`);
          // Simulate call
          window.open(`tel:${phoneNumber}`);
        } else {
          message = 'No doctor contact found.';
          await speak(message);
        }
        break;
    }
    toast.success(message);
  };

  const completeTask = async (taskId: number) => {
    setTodayTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    const task = todayTasks.find(t => t.id === taskId);
    if (task) {
      if (!task.completed) {
        toast.success(`'${task.task}' marked as complete!`);
        await speak(`Great job! '${task.task}' has been marked as complete.`);
      } else {
        toast.info(`'${task.task}' marked as incomplete.`);
        await speak(`Okay, '${task.task}' is now marked as incomplete.`);
      }
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'medication': return Pill;
      case 'exercise': return Activity;
      case 'therapy': return Heart;
      case 'documentation': return Camera;
      default: return CheckCircle;
    }
  };

  const getCompletionRate = () => {
    const completed = todayTasks.filter(t => t.completed).length;
    return Math.round((completed / todayTasks.length) * 100);
  };

  const startExerciseSession = async (exercise: any) => {
    try {
      await speak(`Starting ${exercise.name}. ${exercise.description}`);
      
      // Start voice-guided session
      await exerciseService.startVoiceGuidedSession([exercise], { speak });
      
      // Record completion
      if (userProfile?.uid) {
        await exerciseService.recordExerciseCompletion({
          patientId: userProfile.uid,
          exerciseId: exercise.id,
          completed: true,
          notes: 'Completed with voice guidance'
        });
      }
      
      toast.success('Exercise session completed!');
    } catch (error) {
      console.error('Exercise session failed:', error);
      toast.error('Exercise session failed');
    }
  };

  const handleReportAnalysis = async (reportText: string) => {
    setIsAnalyzing(true);
    try {
      const results = await enhancedAIAnalysisService.analyzeText(reportText, {
        patientId: userProfile?.uid,
        surgeryType: patientData.surgery,
        daysSinceSurgery: patientData.daysSinceSurgery
      });

      setAnalysisResults([results]);

      const analysisText = `Report analysis complete using ${results.individualResults.length} AI models. Consensus findings: ${results.analysis.medicalFindings.join(', ')}. Risk assessment: ${results.analysis.riskAssessment}. Confidence: ${Math.round(results.confidence * 100)}%. Recommendations: ${results.analysis.recommendations.join(' ')}`;
      speak(analysisText);

      toast.success('Report analyzed successfully using multiple AI models!');
    } catch (error) {
      console.error('Report analysis failed:', error);
      toast.error('Report analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createAppointment = async (appointmentData: any) => {
    try {
      const newAppointment = {
        ...appointmentData,
        patientId: userProfile?.uid || 'demo-patient',
        status: 'scheduled' as const,
        reminderSet: false,
        createdAt: new Date()
      };
      const appointmentId = await dataService.scheduleAppointment(newAppointment);
      setAppointments(prev => [...prev, { ...newAppointment, id: appointmentId }]);
      toast.success('Appointment created successfully!');
      speak('Appointment has been scheduled successfully.');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment.');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await dataService.deleteAppointment(appointmentId);
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      toast.success('Appointment deleted successfully!');
      speak('Appointment has been deleted.');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment.');
    }
  };

  const handleUpdateAppointment = async (appointmentId: string, updates: any) => {
    try {
      await dataService.updateAppointment(appointmentId, updates);
      setAppointments(prev => prev.map(apt => apt.id === appointmentId ? { ...apt, ...updates } : apt));
      toast.success('Appointment updated successfully!');
      speak('Appointment has been updated.');
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment.');
    }
  };

  const handleRescheduleCall = () => {
    const nextCallAppointment = appointments.find(apt => apt.title === 'Next Scheduled Call');
    if (nextCallAppointment) {
      setSelectedTab('calendar');
      // This will open the form with the existing event data
      // The EnhancedCalendar component will handle setting editingEvent
      // based on the event passed to onEventClick
      // For now, we'll just simulate clicking the event
      // In a real scenario, you'd pass the event object to EnhancedCalendar's state
      // or a dedicated reschedule function.
      toast.info('Please select the appointment on the calendar to reschedule.');
      speak('Please select the appointment on the calendar to reschedule.');
    } else {
      toast.error('No scheduled call found to reschedule.');
      speak('No scheduled call found to reschedule.');
    }
  };

  const handleAIChatSubmit = async (query: string) => {
    if (!query.trim()) return;

    const userMessage = { sender: 'user' as const, message: query };
    setAiChatHistory(prev => [...prev, userMessage]);
    setAiChatInput('');

    try {
      const aiResponse = await enhancedAIAnalysisService.analyzeText(query, {
        patientId: userProfile?.uid,
        context: aiChatHistory.map(msg => `${msg.sender}: ${msg.message}`).join('\n')
      });

      const aiMessage = { 
        sender: 'ai' as const, 
        message: aiResponse.analysis.medicalFindings.join(' ') || 'I am here to help.',
        recommendations: aiResponse.analysis.recommendations
      };
      setAiChatHistory(prev => [...prev, aiMessage]);
      speak(aiMessage.message);

    } catch (error) {
      console.error('AI chat failed:', error);
      const errorMessage = 'Sorry, I could not process your request at the moment.';
      setAiChatHistory(prev => [...prev, { sender: 'ai', message: errorMessage }]);
      speak(errorMessage);
    }
  };

  const saveRecommendationAsTask = (recommendation: string) => {
    const newTask = {
      id: todayTasks.length + 1,
      task: recommendation,
      completed: false,
      time: 'Anytime',
      type: 'recommendation'
    };
    setTodayTasks(prev => [...prev, newTask]);
    toast.success('Recommendation saved as a task!');
    speak('Recommendation added to your tasks.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Patient Portal
          </h1>
          <p className="text-gray-600 text-lg">Your comprehensive AI-powered recovery dashboard</p>
        </motion.div>

        {/* Patient Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ModernCard className="bg-gradient-to-r from-blue-500 to-green-500 text-white mb-8" padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">{patientData.name}</h2>
                <p className="text-blue-100 mb-1 text-lg">{patientData.surgery}</p>
                <p className="text-blue-100">Surgery Date: {new Date(patientData.surgeryDate).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold mb-2">{patientData.daysSinceSurgery}</div>
                <p className="text-blue-100 text-lg">Days Post-Surgery</p>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-blue-100 text-lg">Recovery Progress</span>
                <span className="font-bold text-xl">{patientData.recoveryProgress}%</span>
              </div>
              <div className="w-full bg-blue-400 rounded-full h-4">
                <motion.div
                  className="bg-white h-4 rounded-full transition-all duration-1000"
                  initial={{ width: 0 }}
                  animate={{ width: `${patientData.recoveryProgress}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                />
              </div>
            </div>
          </ModernCard>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex space-x-2 bg-white rounded-2xl p-2 shadow-lg border border-gray-100 overflow-x-auto">
            {[{
              id: 'overview',
              name: 'Overview',
              icon: Heart
            }, {
              id: 'health-dashboard',
              name: 'Health AI',
              icon: Brain
            }, {
              id: 'progress',
              name: 'Progress',
              icon: TrendingUp
            }, {
              id: 'calendar',
              name: 'Calendar',
              icon: CalendarIcon
            }, {
              id: 'exercises',
              name: 'Exercises',
              icon: Activity
            }, {
              id: 'reports',
              name: 'Reports',
              icon: FileText
            }].map(({
              id,
              name,
              icon: Icon
            }) => (
              <button
                key={id}
                onClick={() => setSelectedTab(id as any)}
                data-voice-command={`view ${name.toLowerCase()}`}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 whitespace-nowrap ${
                  selectedTab === id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {selectedTab === 'overview' && (
            <>
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <ModernCard>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                      <Target className="w-6 h-6 text-blue-600" />
                      <span>Quick Actions</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <ModernButton
                        onClick={() => handleVoiceAction('Call Sehat AI')}
                        variant="ghost"
                        className="!bg-blue-50 !text-blue-600 hover:!bg-blue-100 !p-6 !flex-col !h-auto"
                        voiceCommand="call sehat"
                      >
                        <Phone className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Call Sehat</span>
                      </ModernButton>
                      
                      <ModernButton
                        onClick={() => handleVoiceAction('Take Photo')}
                        variant="ghost"
                        className="!bg-green-50 !text-green-600 hover:!bg-green-100 !p-6 !flex-col !h-auto"
                        voiceCommand="take photo"
                      >
                        <Camera className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">AI Photo Analysis</span>
                      </ModernButton>
                      
                      <ModernButton
                        onClick={() => handleVoiceAction('Health Dashboard')}
                        variant="ghost"
                        className="!bg-purple-50 !text-purple-600 hover:!bg-purple-100 !p-6 !flex-col !h-auto"
                        voiceCommand="health dashboard"
                      >
                        <Brain className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Health AI</span>
                      </ModernButton>
                      
                      <ModernButton
                        onClick={() => handleVoiceAction('Emergency Help')}
                        variant="ghost"
                        className="!bg-red-50 !text-red-600 hover:!bg-red-100 !p-6 !flex-col !h-auto"
                        voiceCommand="emergency help"
                      >
                        <Shield className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Emergency</span>
                      </ModernButton>
                    </div>
                  </ModernCard>
                </motion.div>

                {/* AI-Powered Photo Analysis */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <ModernCard>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                      <Brain className="w-6 h-6 text-green-600" />
                      <span>Multi-AI Wound Analysis</span>
                    </h3>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors">
                      {photoPreview ? (
                        <div className="space-y-4">
                          <img
                            src={photoPreview}
                            alt="Wound photo"
                            className="mx-auto max-w-xs rounded-xl shadow-lg"
                          />
                          
                          {isAnalyzing ? (
                            <div className="bg-blue-50 p-4 rounded-xl">
                              <div className="flex items-center justify-center space-x-2 mb-2">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-blue-800 font-medium">Multi-AI Analysis in Progress...</p>
                              </div>
                              <p className="text-blue-600 text-sm">Using GPT-4V, Gemini Pro Vision, Claude 3.5 Sonnet, and Groq Llama Vision for consensus analysis.</p>
                            </div>
                          ) : analysisResults.length > 0 && (
                            <div className="bg-green-50 p-4 rounded-xl text-left">
                              <h4 className="font-semibold text-green-800 mb-2">Consensus Analysis Results</h4>
                              {analysisResults.map((result, index) => (
                                <div key={index} className="space-y-2">
                                  <p className="text-sm text-green-700">
                                    <strong>AI Models Used:</strong> {result.individualResults?.length || 1} models
                                  </p>
                                  <p className="text-sm text-green-700">
                                    <strong>Consensus Confidence:</strong> {Math.round(result.confidence * 100)}%
                                  </p>
                                  <p className="text-sm text-green-700">
                                    <strong>Risk Assessment:</strong> {result.analysis.riskAssessment}
                                  </p>
                                  <p className="text-sm text-green-700">
                                    <strong>Findings:</strong> {result.analysis.medicalFindings.join(', ')}
                                  </p>
                                  <p className="text-sm text-green-700">
                                    <strong>Recommendations:</strong> {result.analysis.recommendations.join(', ')}
                                  </p>
                                  {result.analysis.urgentCare && (
                                    <div className="bg-red-100 border border-red-300 rounded-lg p-2 mt-2">
                                      <p className="text-red-800 text-sm font-medium">⚠️ Urgent care recommended</p>
                                    </div>
                                  )}
                                  {result.consensusMetrics && (
                                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-2 mt-2">
                                      <p className="text-blue-800 text-sm">
                                        <strong>AI Agreement Level:</strong> {Math.round(result.consensusMetrics.agreementLevel * 100)}%
                                      </p>
                                      <p className="text-blue-800 text-sm">
                                        <strong>Processing Time:</strong> {result.processingTime}ms
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2 text-lg font-medium">Multi-AI Powered Wound Analysis</p>
                          <p className="text-sm text-gray-500 mb-6">Upload a photo for instant analysis using multiple AI models (GPT-4V, Gemini Pro Vision, Claude 3.5 Sonnet, Groq Llama Vision)</p>
                          <div className="flex justify-center space-x-4">
                            <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 cursor-pointer transition-colors shadow-lg">
                              <Camera className="w-5 h-5 mr-2" />
                              Take Photo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                capture="environment"
                              />
                            </label>
                            <ModernButton
                              onClick={() => setShowCamera(true)}
                              variant="secondary"
                              icon={Camera}
                              voiceCommand="open camera"
                            >
                              Use Camera
                            </ModernButton>
                          </div>
                        </div>
                      )}
                    </div>
                  </ModernCard>
                </motion.div>

                {/* Recent Messages */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <ModernCard>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                      <MessageCircle className="w-6 h-6 text-purple-600" />
                      <span>Recent Messages</span>
                    </h3>
                    
                    <div className="space-y-4">
                      {recentMessages.map((message) => (
                        <div key={message.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                message.type === 'ai' ? 'bg-blue-100' : 'bg-green-100'
                              }`}>
                                {message.type === 'ai' ? (
                                  <Brain className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Activity className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              <span className="font-medium text-gray-900">{message.from}</span>
                            </div>
                            <span className="text-xs text-gray-500">{message.time}</span>
                          </div>
                          <p className="text-gray-600 ml-10">{message.message}</p>
                        </div>
                      ))}
                    </div>
                  </ModernCard>
                </motion.div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-8">
                {/* Next Call */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <ModernCard>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>Next Scheduled Call</span>
                    </h3>
                    
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <CalendarIcon className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                      <p className="font-semibold text-gray-900 text-lg">{patientData.nextCall}</p>
                      <p className="text-sm text-gray-600 mt-1">Sehat AI will call to check your progress</p>
                      
                      <ModernButton
                        className="mt-4 !w-full"
                        variant="primary"
                        voiceCommand="reschedule call"
                        onClick={handleRescheduleCall}
                      >
                        Reschedule Call
                      </ModernButton>
                    </div>
                  </ModernCard>
                </motion.div>

                {/* Today's Tasks */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <ModernCard>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <Award className="w-5 h-5 text-green-600" />
                      <span>Today's Recovery Tasks</span>
                    </h3>
                    
                    <div className="space-y-3">
                      {todayTasks.map((task) => {
                        const TaskIcon = getTaskIcon(task.type);
                        return (
                          <motion.div
                            key={task.id}
                            className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all ${
                              task.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                            onClick={() => completeTask(task.id)}
                            whileHover={{ scale: task.completed ? 1 : 1.02 }}
                            whileTap={{ scale: task.completed ? 1 : 0.98 }}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              task.completed ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              {task.completed ? (
                                <CheckCircle className="w-5 h-5 text-white" />
                              ) : (
                                <TaskIcon className="w-4 h-4 text-gray-600" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <p className={`font-medium ${task.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                                {task.task}
                              </p>
                              <p className="text-xs text-gray-500">{task.time}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Daily Completion Rate</span>
                        <span className="font-semibold text-gray-900">{getCompletionRate()}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${getCompletionRate()}%` }}
                        />
                      </div>
                    </div>
                  </ModernCard>
                </motion.div>

                {/* Emergency Contact */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <ModernCard className="!bg-red-50 !border-red-200">
                    <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>Emergency Contact</span>
                    </h3>
                    
                    <p className="text-red-600 text-sm mb-4">
                      If you experience severe pain, fever, excessive bleeding, or any concerning symptoms
                    </p>
                    
                    <ModernButton
                      onClick={() => handleVoiceAction('Emergency Help')}
                      variant="danger"
                      fullWidth
                      voiceCommand="emergency call"
                      className="!font-semibold"
                    >
                      Call Emergency Line
                    </ModernButton>
                  </ModernCard>
                </motion.div>
              </div>
            </>
          )}

          {selectedTab === 'health-dashboard' && (
            <div className="lg:col-span-3">
              <HealthDashboard patientId={userProfile?.uid || 'demo-patient'} />
            </div>
          )}

          {selectedTab === 'progress' && (
            <div className="lg:col-span-3 space-y-8">
              <ModernCard>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recovery Progress Analytics</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="pain" stroke="#ef4444" strokeWidth={2} name="Pain Level" />
                      <Line type="monotone" dataKey="mobility" stroke="#3b82f6" strokeWidth={2} name="Mobility Score" />
                      <Line type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={2} name="Compliance" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ModernCard>

              {/* Exercise Progress */}
              <ModernCard>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Exercise Progress</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={exerciseProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="exerciseId" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="consistency" fill="#8884d8" name="Consistency %" />
                      <Bar dataKey="improvementScore" fill="#82ca9d" name="Improvement Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ModernCard>
            </div>
          )}

          {selectedTab === 'calendar' && (
            <div className="lg:col-span-3">
              <EnhancedCalendar
                events={appointments.map(apt => ({
                  id: apt.id,
                  title: apt.type,
                  date: apt.scheduledDate || new Date(),
                  startTime: apt.scheduledDate?.toLocaleTimeString() || '09:00',
                  endTime: apt.scheduledDate?.toLocaleTimeString() || '10:00',
                  type: apt.type,
                  provider: apt.providerId,
                  status: apt.status,
                  priority: 'medium' as const
                }))}
                onDateSelect={(date) => console.log('Date selected:', date)}
                onEventClick={(event) => console.log('Event clicked:', event)}
                onEventCreate={createAppointment}
                onEventUpdate={handleUpdateAppointment}
                onEventDelete={handleDeleteAppointment}
                canCreateEvents={true}
              />
            </div>
          )}

          {selectedTab === 'exercises' && (
            <div className="lg:col-span-3 space-y-8">
              <ModernCard>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Personalized Exercise Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {exercises.map((exercise) => (
                    <div key={exercise.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{exercise.name}</h4>
                          <p className="text-gray-600 text-sm mt-1">{exercise.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {exercise.difficulty}
                        </span>
                      </div>

                      {exercise.videoUrl ? (
                        <iframe
                          width="100%"
                          height="180"
                          src={exercise.videoUrl}
                          title={exercise.name}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-lg mb-4"
                        ></iframe>
                      ) : exercise.images && exercise.images.length > 0 ? (
                        <img
                          src={exercise.images[0]}
                          alt={exercise.name}
                          className="w-full h-32 object-cover rounded-lg mb-4"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500">
                          No Image/Video Available
                        </div>
                      )}

                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Duration:</strong> {exercise.duration} minutes
                        </p>
                        {exercise.repetitions && (
                          <p className="text-sm text-gray-600">
                            <strong>Repetitions:</strong> {exercise.repetitions} x {exercise.sets} sets
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          <strong>Benefits:</strong> {exercise.benefits.slice(0, 2).join(', ')}
                        </p>
                      </div>

                      <ModernButton
                        onClick={() => startExerciseSession(exercise)}
                        variant="primary"
                        size="sm"
                        fullWidth
                        icon={Video}
                        voiceCommand={`start ${exercise.name.toLowerCase()}`}
                      >
                        Start Voice-Guided Session
                      </ModernButton>
                    </div>
                  ))}
                </div>
              </ModernCard>
            </div>
          )}

          {selectedTab === 'reports' && (
            <div className="lg:col-span-3">
              <ReportAnalyzer 
                patientId={userProfile?.uid || 'demo-patient'}
                onReportSaved={(report) => {
                  toast.success('Medical report saved successfully!');
                  speak('Your medical report has been analyzed and saved for future reference.');
                }}
              />
            </div>
          )}
        </div>

        {/* Camera Modal */}
        <CameraCapture
          isOpen={showCamera}
          onClose={() => setShowCamera(false)}
          onCapture={handleCameraCapture}
        />

        {/* Emergency Options Modal */}
        <AnimatePresence>
          {showEmergencyOptions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowEmergencyOptions(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Emergency Options</h2>
                  <button
                    onClick={() => setShowEmergencyOptions(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <ModernButton
                    onClick={() => handleCallEmergency('ambulance')}
                    variant="danger"
                    fullWidth
                    icon={Phone}
                  >
                    Call Ambulance (911)
                  </ModernButton>
                  
                  {emergencyInfo?.emergencyContacts?.map((contact: any, index: number) => (
                    <ModernButton
                      key={index}
                      onClick={() => handleCallEmergency(contact.relationship === 'Spouse' ? 'family' : 'doctor', contact)}
                      variant="secondary"
                      fullWidth
                      icon={Phone}
                    >
                      Call {contact.name} ({contact.relationship})
                    </ModernButton>
                  ))}

                  {emergencyInfo?.emergencyNumbers?.hospital && (
                    <ModernButton
                      onClick={() => handleCallEmergency('doctor', { name: 'Hospital', phone: emergencyInfo.emergencyNumbers.hospital })}
                      variant="secondary"
                      fullWidth
                      icon={Phone}
                    >
                      Call Hospital ({emergencyInfo.emergencyNumbers.hospital})
                    </ModernButton>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-600">
                    Your current location will be shared with emergency contacts.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Chat Modal */}
        <AnimatePresence>
          {showAIChat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAIChat(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 flex flex-col h-[80vh]"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Ask AI</h2>
                  <button
                    onClick={() => setShowAIChat(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 p-2 mb-4 border rounded-xl bg-gray-50">
                  {aiChatHistory.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                      <Brain className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                      <p>Ask me anything about your health!</p>
                    </div>
                  ) : (
                    aiChatHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-3 rounded-xl ${
                          msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                          {msg.recommendations && msg.recommendations.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-300">
                              <p className="text-xs font-semibold mb-1">Recommendations:</p>
                              {msg.recommendations.map((rec, recIndex) => (
                                <div key={recIndex} className="flex items-center justify-between text-xs mb-1">
                                  <span>• {rec}</span>
                                  <ModernButton
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => saveRecommendationAsTask(rec)}
                                  >
                                    Save as Task
                                  </ModernButton>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your question..."
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAIChatSubmit(aiChatInput);
                      }
                    }}
                  />
                  <ModernButton
                    onClick={() => handleAIChatSubmit(aiChatInput)}
                    icon={Send}
                    variant="primary"
                  >
                    Send
                  </ModernButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PatientPortal;
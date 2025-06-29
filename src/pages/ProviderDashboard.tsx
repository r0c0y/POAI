import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, Phone, MessageSquare, TrendingUp, Users, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { dataService, MedicalReport, Patient, ConversationRecord } from '../services/dataService';
import ModernCard from '../components/ui/ModernCard';
import ModernButton from '../components/ui/ModernButton';

interface Alert {
  id: string;
  patientName: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  timestamp: Date;
  status: 'open' | 'acknowledged' | 'resolved';
}

const ProviderDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'alerts' | 'patients' | 'analytics' | 'reports' | 'callHistory'>('alerts');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientReports, setPatientReports] = useState<MedicalReport[]>([]);
  const [showCallHistory, setShowCallHistory] = useState(false);

  const alerts: Alert[] = [
    {
      id: '1',
      patientName: 'Mrs. Priya Sharma',
      severity: 'high',
      message: 'Reported pain level 8/10 with swelling at incision site',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'open'
    },
    {
      id: '2',
      patientName: 'Mr. Rajesh Patel',
      severity: 'medium',
      message: 'Missed medication dose, requested guidance',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'acknowledged'
    },
    {
      id: '3',
      patientName: 'Mrs. Sunita Singh',
      severity: 'low',
      message: 'Questions about exercise routine',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'resolved'
    }
  ];

  const patients: Patient[] = [
    {
      id: 'patient-1',
      name: 'Mrs. Priya Sharma',
      age: 45,
      surgery: 'Knee Replacement',
      daysSinceSurgery: 5,
      riskLevel: 'high',
      lastContact: '5 min ago',
      painLevel: 8,
      recoveryProgress: 35
    },
    {
      id: 'patient-2',
      name: 'Mr. Rajesh Patel',
      age: 62,
      surgery: 'Hip Replacement',
      daysSinceSurgery: 12,
      riskLevel: 'medium',
      lastContact: '2 hours ago',
      painLevel: 4,
      recoveryProgress: 65
    },
    {
      id: 'patient-3',
      name: 'Mrs. Sunita Singh',
      age: 38,
      surgery: 'Arthroscopy',
      daysSinceSurgery: 18,
      riskLevel: 'low',
      lastContact: '1 day ago',
      painLevel: 2,
      recoveryProgress: 85
    },
    {
      id: 'patient-4',
      name: 'Mr. Anil Kumar',
      age: 55,
      surgery: 'Spinal Fusion',
      daysSinceSurgery: 25,
      riskLevel: 'medium',
      lastContact: '3 days ago',
      painLevel: 5,
      recoveryProgress: 70
    },
    {
      id: 'patient-5',
      name: 'Ms. Pooja Devi',
      age: 29,
      surgery: 'ACL Repair',
      daysSinceSurgery: 8,
      riskLevel: 'low',
      lastContact: '1 hour ago',
      painLevel: 3,
      recoveryProgress: 40
    }
  ];

  const dummyReports: MedicalReport[] = [
    {
      id: 'report-1',
      patientId: 'patient-1',
      fileName: 'Priya_Sharma_Knee_XRay.pdf',
      fileType: 'pdf',
      uploadDate: new Date('2024-06-20T10:00:00Z'),
      analysisDate: new Date('2024-06-20T10:05:00Z'),
      originalFile: 'base64pdfdata1',
      extractedText: 'X-ray of left knee shows mild effusion. No signs of fracture or dislocation. Post-operative changes noted.',
      aiAnalysis: {
        summary: 'Mild effusion in left knee, consistent with post-operative recovery. No acute findings.',
        symptoms: ['effusion'],
        diagnosis: ['Post-operative effusion'],
        recommendations: ['Continue RICE therapy', 'Monitor swelling'],
        medications: [],
        testResults: [],
        followUpRequired: false,
        urgencyLevel: 'low',
        estimatedRecoveryTime: '2 weeks',
        doctorNotes: ['Patient tolerating therapy well.']
      },
      formattedReport: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Times+New+Roman:wght@400;700&display=swap');
                body { font-family: 'Courier Prime', 'Times New Roman', serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; background: #fefefe; color: #2c2c2c; }
                .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 20px; margin-bottom: 30px; }
                .title { font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
                .subtitle { font-size: 16px; color: #666; font-style: italic; }
                .section { margin: 25px 0; padding: 15px 0; }
                .section-title { font-size: 18px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 15px; letter-spacing: 1px; }
                .content { font-size: 14px; text-align: justify; }
                .list-item { margin: 8px 0; padding-left: 20px; position: relative; }
                .list-item:before { content: "▸"; position: absolute; left: 0; font-weight: bold; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">Medical Report Analysis</div>
                <div class="subtitle">AI-Powered Comprehensive Health Assessment</div>
                <div style="margin-top: 15px; font-size: 14px;">
                    <strong>Report Date:</strong> ${new Date().toLocaleDateString()}<br>
                    <strong>Source File:</strong> Priya_Sharma_Knee_XRay.pdf<br>
                    <strong>Analysis ID:</strong> REPORT-PS-001
                </div>
            </div>
            <div class="section">
                <div class="section-title">Executive Summary</div>
                <div class="content">Mild effusion in left knee, consistent with post-operative recovery. No acute findings.</div>
            </div>
            <div class="section">
                <div class="section-title">Reported Symptoms</div>
                <div class="content"><div class="list-item">effusion</div></div>
            </div>
            <div class="section">
                <div class="section-title">Diagnosis & Conditions</div>
                <div class="content"><div class="list-item">Post-operative effusion</div></div>
            </div>
            <div class="section">
                <div class="section-title">Medical Recommendations</div>
                <div class="content"><div class="list-item">Continue RICE therapy</div><div class="list-item">Monitor swelling</div></div>
            </div>
            <div class="footer">
                <p><strong>DISCLAIMER:</strong> This analysis is generated by AI and is for informational purposes only. It should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions.</p>
                <p>Generated by Sehat AI Healthcare Platform | ${new Date().toLocaleDateString()}</p>
            </div>
        </body>
        </html>
      `,
      saved: true
    },
    {
      id: 'report-2',
      patientId: 'patient-1',
      fileName: 'Priya_Sharma_Blood_Test.pdf',
      fileType: 'pdf',
      uploadDate: new Date('2024-06-15T09:00:00Z'),
      analysisDate: new Date('2024-06-15T09:05:00Z'),
      originalFile: 'base64pdfdata2',
      extractedText: 'Complete blood count within normal limits. CRP slightly elevated.',
      aiAnalysis: {
        summary: 'Blood tests are largely normal, with a minor elevation in CRP indicating some inflammation.',
        symptoms: [],
        diagnosis: ['Mild inflammation'],
        recommendations: ['Follow up with physician if CRP remains elevated'],
        medications: [],
        testResults: [
          { test: 'CRP', value: '8.5', normalRange: '<5', status: 'abnormal' },
          { test: 'WBC', value: '7.2', normalRange: '4.0-10.0', status: 'normal' }
        ],
        followUpRequired: true,
        urgencyLevel: 'medium',
        estimatedRecoveryTime: 'N/A',
        doctorNotes: ['Discuss CRP with patient.']
      },
      formattedReport: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Times+New+Roman:wght@400;700&display=swap');
                body { font-family: 'Courier Prime', 'Times New Roman', serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; background: #fefefe; color: #2c2c2c; }
                .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 20px; margin-bottom: 30px; }
                .title { font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
                .subtitle { font-size: 16px; color: #666; font-style: italic; }
                .section { margin: 25px 0; padding: 15px 0; }
                .section-title { font-size: 18px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 15px; letter-spacing: 1px; }
                .content { font-size: 14px; text-align: justify; }
                .list-item { margin: 8px 0; padding-left: 20px; position: relative; }
                .list-item:before { content: "▸"; position: absolute; left: 0; font-weight: bold; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 12px; color: #666; }
                .test-result { display: flex; justify-content: space-between; padding: 8px; margin: 5px 0; background: #f8f9fa; border-radius: 4px; }
                .status-normal { border-left: 4px solid #28a745; }
                .status-abnormal { border-left: 4px solid #dc3545; }
                .status-borderline { border-left: 4px solid #ffc107; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">Medical Report Analysis</div>
                <div class="subtitle">AI-Powered Comprehensive Health Assessment</div>
                <div style="margin-top: 15px; font-size: 14px;">
                    <strong>Report Date:</strong> ${new Date().toLocaleDateString()}<br>
                    <strong>Source File:</strong> Priya_Sharma_Blood_Test.pdf<br>
                    <strong>Analysis ID:</strong> REPORT-PS-002
                </div>
            </div>
            <div class="section">
                <div class="section-title">Executive Summary</div>
                <div class="content">Blood tests are largely normal, with a minor elevation in CRP indicating some inflammation.</div>
            </div>
            <div class="section">
                <div class="section-title">Laboratory Results</div>
                <div class="content">
                    <div class="test-result status-abnormal"><span><strong>CRP:</strong> 8.5</span><span>Normal: <5</span><span class="highlight">ABNORMAL</span></div>
                    <div class="test-result status-normal"><span><strong>WBC:</strong> 7.2</span><span>Normal: 4.0-10.0</span><span class="highlight">NORMAL</span></div>
                </div>
            </div>
            <div class="section">
                <div class="section-title">Medical Recommendations</div>
                <div class="content"><div class="list-item">Follow up with physician if CRP remains elevated</div></div>
            </div>
            <div class="footer">
                <p><strong>DISCLAIMER:</strong> This analysis is generated by AI and is for informational purposes only. It should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions.</p>
                <p>Generated by Sehat AI Healthcare Platform | ${new Date().toLocaleDateString()}</p>
            </div>
        </body>
        </html>
      `,
      saved: true
    },
    {
      id: 'report-3',
      patientId: 'patient-2',
      fileName: 'Rajesh_Patel_MRI_Hip.pdf',
      fileType: 'pdf',
      uploadDate: new Date('2024-06-10T14:00:00Z'),
      analysisDate: new Date('2024-06-10T14:05:00Z'),
      originalFile: 'base64pdfdata3',
      aiAnalysis: {
        summary: 'MRI of right hip shows expected post-surgical changes. No new abnormalities.',
        symptoms: [],
        diagnosis: ['Post-surgical hip changes'],
        recommendations: ['Continue physical therapy', 'Gradual increase in activity'],
        medications: [],
        testResults: [],
        followUpRequired: false,
        urgencyLevel: 'low',
        estimatedRecoveryTime: '4 weeks',
        doctorNotes: ['Patient progressing well.']
      },
      formattedReport: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Times+New+Roman:wght@400;700&display=swap');
                body { font-family: 'Courier Prime', 'Times New Roman', serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; background: #fefefe; color: #2c2c2c; }
                .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 20px; margin-bottom: 30px; }
                .title { font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
                .subtitle { font-size: 16px; color: #666; font-style: italic; }
                .section { margin: 25px 0; padding: 15px 0; }
                .section-title { font-size: 18px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 15px; letter-spacing: 1px; }
                .content { font-size: 14px; text-align: justify; }
                .list-item { margin: 8px 0; padding-left: 20px; position: relative; }
                .list-item:before { content: "▸"; position: absolute; left: 0; font-weight: bold; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">Medical Report Analysis</div>
                <div class="subtitle">AI-Powered Comprehensive Health Assessment</div>
                <div style="margin-top: 15px; font-size: 14px;">
                    <strong>Report Date:</strong> ${new Date().toLocaleDateString()}<br>
                    <strong>Source File:</strong> Rajesh_Patel_MRI_Hip.pdf<br>
                    <strong>Analysis ID:</strong> REPORT-RP-001
                </div>
            </div>
            <div class="section">
                <div class="section-title">Executive Summary</div>
                <div class="content">MRI of right hip shows expected post-surgical changes. No new abnormalities.</div>
            </div>
            <div class="section">
                <div class="section-title">Diagnosis & Conditions</div>
                <div class="content"><div class="list-item">Post-surgical hip changes</div></div>
            </div>
            <div class="section">
                <div class="section-title">Medical Recommendations</div>
                <div class="content"><div class="list-item">Continue physical therapy</div><div class="list-item">Gradual increase in activity</div></div>
            </div>
            <div class="footer">
                <p><strong>DISCLAIMER:</strong> This analysis is generated by AI and is for informational purposes only. It should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions.</p>
                <p>Generated by Sehat AI Healthcare Platform | ${new Date().toLocaleDateString()}</p>
            </div>
        </body>
        </html>
      `,
      saved: true
    }
  ];

  const dummyCallHistory: ConversationRecord[] = [
    {
      id: 'call-1',
      patientId: 'patient-1',
      sessionId: 'session-1',
      transcript: 'Patient reported pain level 7. AI recommended ice and rest.',
      analysis: {
        symptoms: ['pain'],
        painLevel: 7,
        riskLevel: 'medium',
        recommendations: ['ice', 'rest'],
        sentiment: 'negative'
      },
      duration: 120,
      timestamp: new Date('2024-06-28T10:00:00Z'),
      providerId: 'AI',
      followUpRequired: false
    },
    {
      id: 'call-2',
      patientId: 'patient-2',
      sessionId: 'session-2',
      transcript: 'Patient asked about medication side effects. AI provided information.',
      analysis: {
        symptoms: [],
        painLevel: 2,
        riskLevel: 'low',
        recommendations: ['continue medication'],
        sentiment: 'neutral'
      },
      duration: 300,
      timestamp: new Date('2024-06-27T14:30:00Z'),
      providerId: 'AI',
      followUpRequired: false
    },
    {
      id: 'call-3',
      patientId: 'patient-1',
      sessionId: 'session-3',
      transcript: 'Patient reported fever and swelling. AI escalated to doctor.',
      analysis: {
        symptoms: ['fever', 'swelling'],
        painLevel: 6,
        riskLevel: 'high',
        recommendations: ['contact doctor'],
        sentiment: 'negative'
      },
      duration: 180,
      timestamp: new Date('2024-06-26T09:15:00Z'),
      providerId: 'AI',
      followUpRequired: true
    }
  ];

  const recoveryData = [
    { day: 'Day 1', pain: 8, mobility: 10 },
    { day: 'Day 3', pain: 7, mobility: 20 },
    { day: 'Day 5', pain: 6, mobility: 35 },
    { day: 'Day 7', pain: 5, mobility: 50 },
    { day: 'Day 10', pain: 4, mobility: 65 },
    { day: 'Day 14', pain: 3, mobility: 80 },
    { day: 'Day 18', pain: 2, mobility: 90 }
  ];

  const callVolumeData = [
    { hour: '8AM', calls: 4 },
    { hour: '10AM', calls: 8 },
    { hour: '12PM', calls: 12 },
    { hour: '2PM', calls: 15 },
    { hour: '4PM', calls: 10 },
    { hour: '6PM', calls: 6 },
    { hour: '8PM', calls: 3 }
  ];

  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedTab('reports');
    // Filter dummy reports based on patient ID
    const reports = dummyReports.filter(report => report.patientId === patient.id);
    setPatientReports(reports);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500 text-red-50';
      case 'medium': return 'bg-yellow-500 text-yellow-50';
      case 'low': return 'bg-green-500 text-green-50';
      default: return 'bg-gray-500 text-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'acknowledged': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Dashboard</h1>
        <p className="text-gray-600">Monitor patient recovery and manage alerts</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <ModernCard><div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-3xl font-bold text-red-600">3</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div></ModernCard>
        <ModernCard><div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-3xl font-bold text-blue-600">247</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div></ModernCard>
        <ModernCard onClick={() => setShowCallHistory(true)} className="cursor-pointer"><div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Calls</p>
              <p className="text-3xl font-bold text-green-600">34</p>
            </div>
            <Phone className="w-8 h-8 text-green-500" />
          </div></ModernCard>
        <ModernCard><div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Recovery</p>
              <p className="text-3xl font-bold text-purple-600">94%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div></ModernCard>
      </div>

      {/* Tab Navigation */}
      <ModernCard className='mb-8'>
        <div className="border-b border-gray-100">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'alerts', name: 'Priority Alerts', count: alerts.filter(a => a.status === 'open').length },
              { id: 'patients', name: 'Patient Monitor', count: patients.length },
              { id: 'analytics', name: 'Analytics', count: null },
              { id: 'reports', name: 'Patient Reports', count: null },
              { id: 'callHistory', name: 'Call History', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count !== null && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    selectedTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Alerts Tab */}
          {selectedTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Priority Alerts</h2>
                <ModernButton>Mark All Read</ModernButton>
              </div>
              
              {alerts.map((alert) => (
                <ModernCard
                  key={alert.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{alert.patientName}</h3>
                          {getStatusIcon(alert.status)}
                        </div>
                        <p className="text-gray-600 mb-2">{alert.message}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(alert.timestamp)}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <ModernButton onClick={() => alert('Call feature coming soon!')} variant='ghost' size='sm'><Phone className="w-4 h-4" /></ModernButton>
                      <ModernButton onClick={() => alert('Message feature coming soon!')} variant='ghost' size='sm'><MessageSquare className="w-4 h-4" /></ModernButton>
                    </div>
                  </div>
                </ModernCard>
              ))}
            </div>
          )}

          {/* Patients Tab */}
          {selectedTab === 'patients' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Patient Monitor</h2>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Patients</option>
                    <option>High Risk</option>
                    <option>Medium Risk</option>
                    <option>Low Risk</option>
                  </select>
                </div>
              </div>
              
              <div className="grid gap-4">
                {patients.map((patient) => (
                  <ModernCard
                    key={patient.id}
                    className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                          <p className="text-sm text-gray-600">{patient.surgery} • {patient.age} years</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          patient.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                          patient.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {patient.riskLevel.toUpperCase()} RISK
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Last Contact</p>
                        <p className="font-medium">{patient.lastContact}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Days Post-Op</p>
                        <p className="text-xl font-bold text-gray-900">{patient.daysSinceSurgery}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Pain Level</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xl font-bold text-gray-900">{patient.painLevel}/10</p>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                patient.painLevel >= 7 ? 'bg-red-500' :
                                patient.painLevel >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(patient.painLevel / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Recovery Progress</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xl font-bold text-gray-900">{patient.recoveryProgress}%</p>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 bg-blue-500 rounded-full"
                              style={{ width: `${patient.recoveryProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </ModernCard>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {selectedTab === 'analytics' && (
            <div className="space-y-8">
              <ModernCard>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recovery Trends</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={recoveryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="pain" stroke="#ef4444" strokeWidth={2} name="Pain Level" />
                      <Line type="monotone" dataKey="mobility" stroke="#3b82f6" strokeWidth={2} name="Mobility %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ModernCard>

              <ModernCard>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Call Volume</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={callVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="calls" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ModernCard>
            </div>
          )}

          {/* Reports Tab */}
          {selectedTab === 'reports' && (
            <div>
              {selectedPatient ? (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Viewing Reports for {selectedPatient.name}</h2>
                  {patientReports.length > 0 ? (
                    <div className="space-y-4">
                      {patientReports.map(report => (
                        <ModernCard key={report.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-6 h-6 text-blue-500" />
                              <div>
                                <p className="font-semibold">{report.fileName}</p>
                                <p className="text-sm text-gray-500">Analyzed on: {new Date(report.analysisDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <ModernButton
                              onClick={() => {
                                const printWindow = window.open("", "_blank");
                                printWindow?.document.write(report.formattedReport);
                                printWindow?.document.close();
                                printWindow?.print();
                              }}
                            >
                              View Report
                            </ModernButton>
                          </div>
                        </ModernCard>
                      ))}
                    </div>
                  ) : (
                    <p>No reports found for this patient.</p>
                  )}
                </div>
              ) : (
                <p>Please select a patient to view their reports.</p>
              )}
            </div>
          )}

          {/* Call History Tab */}
          {selectedTab === 'callHistory' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Patient Calls</h2>
              {dummyCallHistory.length > 0 ? (
                <div className="grid gap-4">
                  {dummyCallHistory.map(call => (
                    <ModernCard key={call.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{patients.find(p => p.id === call.patientId)?.name || 'Unknown Patient'}</p>
                          <p className="text-sm text-gray-600">{new Date(call.timestamp).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duration: {Math.floor(call.duration / 60)} min {call.duration % 60} sec</p>
                          <ModernButton onClick={() => alert(`Transcript:\n${call.transcript}`)} variant="ghost" size="sm">View Transcript</ModernButton>
                        </div>
                      </div>
                    </ModernCard>
                  ))}
                </div>
              ) : (
                <p>No call history available.</p>
              )}
            </div>
          )}
        </div>
      </ModernCard>
    </div>
  );
};

export default ProviderDashboard;

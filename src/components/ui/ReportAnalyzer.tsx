import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Brain, 
  Download, 
  Save, 
  Eye, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Activity,
  TrendingUp,
  FileCheck,
  X
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { enhancedAIAnalysisService } from '../../services/enhancedAIAnalysisService';
import { useVoice } from '../../contexts/VoiceContext';
import ModernButton from './ModernButton';
import ModernCard from './ModernCard';
import toast from 'react-hot-toast';

import { dataService, MedicalReport } from '../../services/dataService';

interface ReportAnalyzerProps {
  patientId: string;
  onReportSaved?: (report: MedicalReport) => void;
}

const ReportAnalyzer: React.FC<ReportAnalyzerProps> = ({ patientId, onReportSaved }) => {
  const { speak } = useVoice();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentReport, setCurrentReport] = useState<MedicalReport | null>(null);
  const [showFormattedReport, setShowFormattedReport] = useState(false);
  const [savedReports, setSavedReports] = useState<MedicalReport[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (patientId) {
      loadSavedReports();
    }
  }, [patientId]);

  const loadSavedReports = async () => {
    try {
      const reports = await dataService.getMedicalReports(patientId);
      setSavedReports(reports);
    } catch (error) {
      console.error('Error loading saved reports:', error);
      toast.error('Failed to load saved reports.');
    }
  };

  const saveReport = async (report: MedicalReport) => {
    try {
      await dataService.saveMedicalReport({ ...report, saved: true });
      await loadSavedReports(); // Refresh the list
      onReportSaved?.(report);
      toast.success('Report saved successfully!');
      speak('Medical report has been analyzed and saved to your portal.');
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report.');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    maxFiles: 1,
    onDrop: handleFileUpload
  });

  async function handleFileUpload(acceptedFiles: File[]) {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsAnalyzing(true);
    
    try {
      await speak('Analyzing your medical report. This may take a moment.');
      
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      // Extract text from PDF or image
      const extractedText = await extractTextFromFile(file, base64);
      
      // Analyze with AI
      const aiAnalysis = await analyzeWithAI(extractedText, file.type.startsWith('image') ? base64 : undefined);
      
      // Generate formatted report
      const formattedReport = generateFormattedReport(aiAnalysis, extractedText, file.name);
      
      const report: MedicalReport = {
        id: `report-${Date.now()}`,
        fileName: file.name,
        fileType: file.type === 'application/pdf' ? 'pdf' : 'image',
        uploadDate: new Date(),
        analysisDate: new Date(),
        originalFile: base64,
        extractedText,
        aiAnalysis,
        formattedReport,
        saved: false
      };
      
      setCurrentReport(report);
      setShowFormattedReport(true);
      
      toast.success('Report analyzed successfully!');
      await speak('Analysis complete. Your medical report has been processed and is ready for review.');
      
    } catch (error) {
      console.error('Error analyzing report:', error);
      toast.error('Failed to analyze report. Please try again.');
      await speak('Sorry, I encountered an error analyzing your report. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const extractTextFromFile = async (file: File, base64: string): Promise<string> => {
    if (file.type === 'application/pdf') {
      // For PDF files, we'll use AI to extract text
      return await extractTextFromPDF(base64);
    } else {
      // For images, use OCR via AI
      return await extractTextFromImage(base64);
    }
  };

  const extractTextFromPDF = async (base64: string): Promise<string> => {
    // Use AI to extract text from PDF
    const prompt = `Extract all text content from this PDF medical report. Return only the extracted text without any additional commentary.`;
    
    try {
      const result = await enhancedAIAnalysisService.analyzeText(prompt, { 
        fileType: 'pdf',
        base64Data: base64 
      });
      return result.analysis.medicalFindings.join('\n') || 'Unable to extract text from PDF';
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      return 'PDF text extraction failed. Please try uploading as an image.';
    }
  };

  const extractTextFromImage = async (base64: string): Promise<string> => {
    // Use AI vision models to extract text from image
    try {
      const result = await enhancedAIAnalysisService.analyzeImage(base64, {
        analysisType: 'text_extraction',
        medicalContext: true
      });
      return result.analysis.medicalFindings.join('\n') || 'Unable to extract text from image';
    } catch (error) {
      console.error('Image text extraction failed:', error);
      return 'Image text extraction failed. Please ensure the image is clear and readable.';
    }
  };

  const analyzeWithAI = async (extractedText: string, imageData?: string) => {
    const analysisPrompt = `Analyze this medical report and provide a comprehensive analysis:

Medical Report Text:
${extractedText}

Please provide:
1. Summary of the report
2. List of symptoms mentioned
3. Diagnosis or conditions identified
4. Medications prescribed or mentioned
5. Test results with normal ranges and status
6. Doctor's recommendations
7. Follow-up requirements
8. Urgency level assessment
9. Estimated recovery time
10. Important notes for the patient

Format as a detailed medical analysis suitable for patient understanding.`;

    let result;
    if (imageData) {
      result = await enhancedAIAnalysisService.analyzeMultimodal(analysisPrompt, [imageData]);
    } else {
      result = await enhancedAIAnalysisService.analyzeText(analysisPrompt);
    }

    // Parse AI response into structured format
    return parseAIAnalysis(result.analysis, extractedText);
  };

  const parseAIAnalysis = (aiResponse: any, originalText: string) => {
    // Extract structured information from AI response
    const analysis = {
      summary: aiResponse.medicalFindings?.join(' ') || 'Medical report analysis completed.',
      symptoms: extractSymptoms(originalText),
      diagnosis: extractDiagnosis(originalText),
      recommendations: aiResponse.recommendations || [],
      medications: extractMedications(originalText),
      testResults: extractTestResults(originalText),
      followUpRequired: aiResponse.followUpRequired || false,
      urgencyLevel: aiResponse.riskAssessment || 'low',
      estimatedRecoveryTime: estimateRecoveryTime(originalText),
      doctorNotes: extractDoctorNotes(originalText)
    };

    return analysis;
  };

  const extractSymptoms = (text: string): string[] => {
    const symptomKeywords = [
      'pain', 'ache', 'fever', 'nausea', 'vomiting', 'headache', 'dizziness',
      'fatigue', 'weakness', 'shortness of breath', 'cough', 'swelling',
      'rash', 'itching', 'bleeding', 'discharge', 'inflammation'
    ];
    
    const foundSymptoms: string[] = [];
    const lowerText = text.toLowerCase();
    
    symptomKeywords.forEach(symptom => {
      if (lowerText.includes(symptom)) {
        foundSymptoms.push(symptom);
      }
    });
    
    return foundSymptoms;
  };

  const extractDiagnosis = (text: string): string[] => {
    const diagnosisPatterns = [
      /diagnosis:?\s*([^.\n]+)/gi,
      /condition:?\s*([^.\n]+)/gi,
      /impression:?\s*([^.\n]+)/gi
    ];
    
    const diagnoses: string[] = [];
    
    diagnosisPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const diagnosis = match.replace(/^(diagnosis|condition|impression):?\s*/i, '').trim();
          if (diagnosis) diagnoses.push(diagnosis);
        });
      }
    });
    
    return diagnoses;
  };

  const extractMedications = (text: string): string[] => {
    const medicationPatterns = [
      /medication:?\s*([^.\n]+)/gi,
      /prescribed:?\s*([^.\n]+)/gi,
      /rx:?\s*([^.\n]+)/gi
    ];
    
    const medications: string[] = [];
    
    medicationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const medication = match.replace(/^(medication|prescribed|rx):?\s*/i, '').trim();
          if (medication) medications.push(medication);
        });
      }
    });
    
    return medications;
  };

  const extractTestResults = (text: string) => {
    // Simple test result extraction - in production, this would be more sophisticated
    const testResults = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      const testMatch = line.match(/([A-Za-z\s]+):\s*([0-9.]+)\s*([A-Za-z/]+)?/);
      if (testMatch) {
        testResults.push({
          test: testMatch[1].trim(),
          value: testMatch[2],
          normalRange: testMatch[3] || 'N/A',
          status: 'normal' as const // Would need more logic to determine actual status
        });
      }
    });
    
    return testResults;
  };

  const estimateRecoveryTime = (text: string): string => {
    const timePatterns = [
      /(\d+)\s*(days?|weeks?|months?)/gi,
      /recovery.*?(\d+)\s*(days?|weeks?|months?)/gi
    ];
    
    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return 'Recovery time not specified';
  };

  const extractDoctorNotes = (text: string): string[] => {
    const notePatterns = [
      /note:?\s*([^.\n]+)/gi,
      /recommendation:?\s*([^.\n]+)/gi,
      /advice:?\s*([^.\n]+)/gi
    ];
    
    const notes: string[] = [];
    
    notePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const note = match.replace(/^(note|recommendation|advice):?\s*/i, '').trim();
          if (note) notes.push(note);
        });
      }
    });
    
    return notes;
  };

  const generateFormattedReport = (analysis: any, originalText: string, fileName: string): string => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Times+New+Roman:wght@400;700&display=swap');
        
        body {
            font-family: 'Courier Prime', 'Times New Roman', serif;
            line-height: 1.8;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: #fefefe;
            color: #2c2c2c;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px double #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .title {
            font-size: 24px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 16px;
            color: #666;
            font-style: italic;
        }
        
        .section {
            margin: 25px 0;
            padding: 15px 0;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 700;
            text-transform: uppercase;
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
            margin-bottom: 15px;
            letter-spacing: 1px;
        }
        
        .content {
            font-size: 14px;
            text-align: justify;
        }
        
        .highlight {
            background: #fff3cd;
            padding: 2px 4px;
            border-radius: 2px;
        }
        
        .urgent {
            background: #f8d7da;
            padding: 10px;
            border-left: 4px solid #dc3545;
            margin: 10px 0;
        }
        
        .normal {
            background: #d4edda;
            padding: 10px;
            border-left: 4px solid #28a745;
            margin: 10px 0;
        }
        
        .list-item {
            margin: 8px 0;
            padding-left: 20px;
            position: relative;
        }
        
        .list-item:before {
            content: "▸";
            position: absolute;
            left: 0;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        
        .test-result {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            margin: 5px 0;
            background: #f8f9fa;
            border-radius: 4px;
        }
        
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
            <strong>Report Date:</strong> ${currentDate}<br>
            <strong>Source File:</strong> ${fileName}<br>
            <strong>Analysis ID:</strong> ${Date.now().toString(36).toUpperCase()}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Executive Summary</div>
        <div class="content">
            ${analysis.summary}
        </div>
    </div>

    ${analysis.symptoms.length > 0 ? `
    <div class="section">
        <div class="section-title">Reported Symptoms</div>
        <div class="content">
            ${analysis.symptoms.map(symptom => `<div class="list-item">${symptom}</div>`).join('')}
        </div>
    </div>
    ` : ''}

    ${analysis.diagnosis.length > 0 ? `
    <div class="section">
        <div class="section-title">Diagnosis & Conditions</div>
        <div class="content">
            ${analysis.diagnosis.map(diagnosis => `<div class="list-item">${diagnosis}</div>`).join('')}
        </div>
    </div>
    ` : ''}

    ${analysis.testResults.length > 0 ? `
    <div class="section">
        <div class="section-title">Laboratory Results</div>
        <div class="content">
            ${analysis.testResults.map(result => `
                <div class="test-result status-${result.status}">
                    <span><strong>${result.test}:</strong> ${result.value}</span>
                    <span>Normal: ${result.normalRange}</span>
                    <span class="highlight">${result.status.toUpperCase()}</span>
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    ${analysis.medications.length > 0 ? `
    <div class="section">
        <div class="section-title">Prescribed Medications</div>
        <div class="content">
            ${analysis.medications.map(medication => `<div class="list-item">${medication}</div>`).join('')}
        </div>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">Medical Recommendations</div>
        <div class="content">
            ${analysis.recommendations.map(rec => `<div class="list-item">${rec}</div>`).join('')}
        </div>
    </div>

    ${analysis.urgencyLevel !== 'low' ? `
    <div class="urgent">
        <strong>⚠️ ATTENTION REQUIRED:</strong> This report indicates ${analysis.urgencyLevel} priority. 
        ${analysis.followUpRequired ? 'Follow-up appointment recommended.' : ''}
    </div>
    ` : `
    <div class="normal">
        <strong>✓ NORMAL STATUS:</strong> No immediate concerns identified. Continue regular care as advised.
    </div>
    `}

    <div class="section">
        <div class="section-title">Recovery Timeline</div>
        <div class="content">
            <strong>Estimated Recovery Period:</strong> ${analysis.estimatedRecoveryTime}
            <br><br>
            <em>Note: Recovery times are estimates based on typical cases. Individual results may vary based on adherence to treatment, overall health, and other factors.</em>
        </div>
    </div>

    ${analysis.doctorNotes.length > 0 ? `
    <div class="section">
        <div class="section-title">Healthcare Provider Notes</div>
        <div class="content">
            ${analysis.doctorNotes.map(note => `<div class="list-item">${note}</div>`).join('')}
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <p><strong>DISCLAIMER:</strong> This analysis is generated by AI and is for informational purposes only. 
        It should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified 
        healthcare professionals for medical decisions.</p>
        
        <p>Generated by Sehat AI Healthcare Platform | ${currentDate}</p>
    </div>
</body>
</html>
    `;
  };

  const downloadReportAsPDF = (report: MedicalReport) => {
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(report.formattedReport);
    printWindow?.document.close();
    printWindow?.print();

    toast.success('Report download initiated!');
    speak('Medical report is being prepared for download.');
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <ModernCard>
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Brain className="w-7 h-7 text-purple-600" />
          <span>AI Medical Report Analyzer</span>
        </h3>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <input {...getInputProps()} />
          
          {isAnalyzing ? (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
              <div>
                <p className="text-xl font-semibold text-blue-800">Analyzing Your Medical Report</p>
                <p className="text-blue-600">Using multiple AI models for comprehensive analysis...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center space-x-4">
                <FileText className="w-16 h-16 text-gray-400" />
                <ImageIcon className="w-16 h-16 text-gray-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  Upload Medical Report (PDF or Image)
                </p>
                <p className="text-gray-500">
                  Drag and drop your medical report here, or click to browse
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Supports: PDF, PNG, JPG, JPEG, GIF, BMP, WebP
                </p>
              </div>
            </div>
          )}
        </div>
      </ModernCard>

      {/* Current Report Analysis */}
      <AnimatePresence>
        {currentReport && showFormattedReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ModernCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <FileCheck className="w-7 h-7 text-green-600" />
                  <span>Analysis Results</span>
                </h3>
                <button
                  onClick={() => setShowFormattedReport(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Report Preview */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 max-h-96 overflow-y-auto">
                <div 
                  dangerouslySetInnerHTML={{ __html: currentReport.formattedReport }}
                  className="prose prose-sm max-w-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <ModernButton
                    onClick={() => saveReport(currentReport)}
                    variant="primary"
                    icon={Save}
                    voiceCommand="save report"
                  >
                    Save to Portal
                  </ModernButton>
                  
                  <ModernButton
                    onClick={() => downloadReportAsPDF(currentReport)}
                    variant="secondary"
                    icon={Download}
                    voiceCommand="download report"
                  >
                    Download PDF
                  </ModernButton>
                </div>

                <div className="text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Analyzed: {currentReport.analysisDate.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </ModernCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Reports */}
      {savedReports.length > 0 && (
        <ModernCard>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Activity className="w-7 h-7 text-blue-600" />
            <span>Saved Medical Reports</span>
          </h3>
          
          <div className="space-y-4">
            {savedReports.map((report) => (
              <div
                key={report.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {report.fileType === 'pdf' ? (
                      <FileText className="w-8 h-8 text-red-500" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-blue-500" />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">{report.fileName}</h4>
                      <p className="text-sm text-gray-500">
                        Uploaded: {report.uploadDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.aiAnalysis.urgencyLevel === 'urgent' ? 'bg-red-100 text-red-800' :
                      report.aiAnalysis.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                      report.aiAnalysis.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {report.aiAnalysis.urgencyLevel.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Symptoms</p>
                    <p className="text-sm text-gray-900">
                      {report.aiAnalysis.symptoms.slice(0, 3).join(', ')}
                      {report.aiAnalysis.symptoms.length > 3 && '...'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Recovery Time</p>
                    <p className="text-sm text-gray-900">{report.aiAnalysis.estimatedRecoveryTime}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Follow-up</p>
                    <p className="text-sm text-gray-900">
                      {report.aiAnalysis.followUpRequired ? 'Required' : 'Not Required'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Analysis ID: {report.id.toUpperCase()}
                  </div>
                  
                  <div className="flex space-x-2">
                    <ModernButton
                      onClick={() => {
                        setCurrentReport(report);
                        setShowFormattedReport(true);
                      }}
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                    >
                      View
                    </ModernButton>
                    
                    <ModernButton
                      onClick={() => downloadReportAsPDF(report)}
                      variant="ghost"
                      size="sm"
                      icon={Download}
                    >
                      Download
                    </ModernButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>
      )}
    </div>
  );
};

export default ReportAnalyzer;
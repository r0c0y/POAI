// Advanced Health Intelligence Service with Predictive Analytics
interface HealthMetrics {
  painLevel: number;
  mobilityScore: number;
  medicationAdherence: number;
  exerciseCompliance: number;
  sleepQuality: number;
  stressLevel: number;
  vitalSigns: {
    bloodPressure?: { systolic: number; diastolic: number };
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
  };
  environmentalFactors: {
    weather?: string;
    airQuality?: number;
    pollenCount?: number;
    humidity?: number;
  };
}

interface HealthScore {
  overall: number; // 0-100
  breakdown: {
    physical: number;
    mental: number;
    compliance: number;
    recovery: number;
  };
  trends: {
    direction: 'improving' | 'stable' | 'declining';
    changePercent: number;
    timeframe: string;
  };
  recommendations: string[];
  alerts: HealthAlert[];
}

interface HealthAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'medication' | 'symptom' | 'vital' | 'appointment' | 'emergency';
  message: string;
  actionRequired: boolean;
  timestamp: Date;
  resolved: boolean;
}

interface RiskPrediction {
  condition: string;
  riskPercentage: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
  timeframe: string;
  severity: 'low' | 'medium' | 'high';
}

interface HealthTrend {
  metric: string;
  values: Array<{ date: Date; value: number }>;
  trend: 'improving' | 'stable' | 'declining';
  prediction: Array<{ date: Date; predictedValue: number; confidence: number }>;
}

class HealthIntelligenceService {
  private patientHistory: Map<string, HealthMetrics[]> = new Map();
  private riskModels: Map<string, any> = new Map();

  constructor() {
    this.initializeRiskModels();
  }

  private initializeRiskModels() {
    // Initialize AI models for different health conditions
    this.riskModels.set('migraine', {
      factors: ['weather_pressure', 'stress_level', 'sleep_quality', 'caffeine_intake'],
      weights: [0.3, 0.25, 0.25, 0.2],
      baselineRisk: 0.15
    });

    this.riskModels.set('hypertension_crisis', {
      factors: ['blood_pressure_trend', 'medication_adherence', 'sodium_intake', 'stress_level'],
      weights: [0.4, 0.3, 0.2, 0.1],
      baselineRisk: 0.05
    });

    this.riskModels.set('diabetes_complication', {
      factors: ['blood_sugar_trend', 'medication_adherence', 'diet_compliance', 'exercise_frequency'],
      weights: [0.35, 0.25, 0.25, 0.15],
      baselineRisk: 0.08
    });

    this.riskModels.set('infection', {
      factors: ['wound_healing_rate', 'temperature_trend', 'white_blood_cell_count', 'antibiotic_adherence'],
      weights: [0.3, 0.3, 0.25, 0.15],
      baselineRisk: 0.12
    });
  }

  // Calculate comprehensive health score
  async calculateHealthScore(patientId: string, currentMetrics: HealthMetrics): Promise<HealthScore> {
    try {
      const history = this.getPatientHistory(patientId);
      
      // Calculate component scores
      const physical = this.calculatePhysicalScore(currentMetrics);
      const mental = this.calculateMentalScore(currentMetrics);
      const compliance = this.calculateComplianceScore(currentMetrics);
      const recovery = this.calculateRecoveryScore(currentMetrics, history);

      // Weighted overall score
      const overall = Math.round(
        physical * 0.3 + 
        mental * 0.2 + 
        compliance * 0.25 + 
        recovery * 0.25
      );

      // Calculate trends
      const trends = this.calculateTrends(history);
      
      // Generate recommendations using AI
      const recommendations = await this.generateRecommendationsAI(currentMetrics, overall, history);
      
      // Check for alerts
      const alerts = await this.generateHealthAlerts(patientId, currentMetrics);

      return {
        overall,
        breakdown: { physical, mental, compliance, recovery },
        trends,
        recommendations,
        alerts
      };
    } catch (error) {
      console.error('Error calculating health score:', error);
      throw error;
    }
  }

  private calculatePhysicalScore(metrics: HealthMetrics): number {
    let score = 100;
    
    // Pain level impact (0-10 scale, lower is better)
    score -= metrics.painLevel * 8;
    
    // Mobility score impact (0-100 scale, higher is better)
    score = score * 0.7 + metrics.mobilityScore * 0.3;
    
    // Vital signs impact
    if (metrics.vitalSigns.bloodPressure) {
      const { systolic, diastolic } = metrics.vitalSigns.bloodPressure;
      if (systolic > 140 || diastolic > 90) score -= 15;
      if (systolic > 160 || diastolic > 100) score -= 25;
    }
    
    if (metrics.vitalSigns.heartRate) {
      if (metrics.vitalSigns.heartRate > 100 || metrics.vitalSigns.heartRate < 60) {
        score -= 10;
      }
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateMentalScore(metrics: HealthMetrics): number {
    let score = 100;
    
    // Stress level impact (0-10 scale, lower is better)
    score -= metrics.stressLevel * 10;
    
    // Sleep quality impact (0-100 scale, higher is better)
    score = score * 0.6 + metrics.sleepQuality * 0.4;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateComplianceScore(metrics: HealthMetrics): number {
    const medicationWeight = 0.6;
    const exerciseWeight = 0.4;
    
    const score = 
      metrics.medicationAdherence * medicationWeight + 
      metrics.exerciseCompliance * exerciseWeight;

    return Math.round(score);
  }

  private calculateRecoveryScore(metrics: HealthMetrics, history: HealthMetrics[]): number {
    if (history.length < 2) return 70; // Default for new patients
    
    const recent = history.slice(-7); // Last 7 days
    const older = history.slice(-14, -7); // Previous 7 days
    
    if (recent.length === 0 || older.length === 0) return 70;
    
    const recentAvg = recent.reduce((sum, m) => sum + (100 - m.painLevel * 10), 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + (100 - m.painLevel * 10), 0) / older.length;
    
    const improvement = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return Math.max(0, Math.min(100, Math.round(70 + improvement)));
  }

  private calculateTrends(history: HealthMetrics[]): HealthScore['trends'] {
    if (history.length < 7) {
      return {
        direction: 'stable',
        changePercent: 0,
        timeframe: 'insufficient data'
      };
    }

    const recent = history.slice(-3);
    const previous = history.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, m) => sum + (100 - m.painLevel * 10), 0) / recent.length;
    const previousAvg = previous.reduce((sum, m) => sum + (100 - m.painLevel * 10), 0) / previous.length;
    
    const changePercent = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    let direction: 'improving' | 'stable' | 'declining';
    if (changePercent > 5) direction = 'improving';
    else if (changePercent < -5) direction = 'declining';
    else direction = 'stable';

    return {
      direction,
      changePercent: Math.round(changePercent),
      timeframe: 'last 7 days'
    };
  }

  private async generateRecommendationsAI(metrics: HealthMetrics, overallScore: number, history: HealthMetrics[]): Promise<string[]> {
    const prompt = `Given the patient's current health metrics and historical data, provide 3-5 concise, actionable health recommendations. 
    Focus on improving their overall health score and addressing any identified risks. 
    
    Current Metrics: ${JSON.stringify(metrics)}
    Overall Health Score: ${overallScore}
    Recent History (last 7 days): ${JSON.stringify(history.slice(-7))}

    Provide recommendations as a JSON array of strings.`;

    try {
      const aiResponse = await enhancedAIAnalysisService.analyzeText(prompt);
      // Assuming aiResponse.analysis.recommendations is an array of strings
      return aiResponse.analysis.recommendations || [];
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return ['Consult your healthcare provider for personalized advice.'];
    }
  }

  // Predictive risk analysis
  async predictHealthRisks(patientId: string, currentMetrics: HealthMetrics): Promise<RiskPrediction[]> {
    const predictions: RiskPrediction[] = [];
    const history = this.getPatientHistory(patientId);

    // Migraine risk prediction
    const migrainePrediction = await this.predictMigrainRisk(currentMetrics, history);
    if (migrainePrediction.riskPercentage > 10) {
      predictions.push(migrainePrediction);
    }

    // Hypertension crisis risk
    const hypertensionPrediction = await this.predictHypertensionRisk(currentMetrics, history);
    if (hypertensionPrediction.riskPercentage > 5) {
      predictions.push(hypertensionPrediction);
    }

    // Infection risk
    const infectionPrediction = await this.predictInfectionRisk(currentMetrics, history);
    if (infectionPrediction.riskPercentage > 8) {
      predictions.push(infectionPrediction);
    }

    return predictions.sort((a, b) => b.riskPercentage - a.riskPercentage);
  }

  private async predictMigrainRisk(metrics: HealthMetrics, history: HealthMetrics[]): Promise<RiskPrediction> {
    const model = this.riskModels.get('migraine')!;
    let risk = model.baselineRisk;

    // Weather factor
    if (metrics.environmentalFactors.weather === 'stormy' || 
        (metrics.environmentalFactors.humidity && metrics.environmentalFactors.humidity > 80)) {
      risk += 0.15;
    }

    // Stress factor
    risk += (metrics.stressLevel / 10) * 0.2;

    // Sleep quality factor
    risk += ((100 - metrics.sleepQuality) / 100) * 0.15;

    // Historical pattern
    const recentMigraines = history.filter(h => h.painLevel > 7).length;
    if (recentMigraines > 2) risk += 0.1;

    const riskPercentage = Math.min(85, risk * 100);

    return {
      condition: 'Migraine',
      riskPercentage: Math.round(riskPercentage),
      confidence: 0.85,
      factors: ['Weather patterns', 'Stress level', 'Sleep quality'],
      recommendations: [
        'Stay hydrated and avoid known triggers',
        'Practice stress reduction techniques',
        'Ensure adequate sleep tonight'
      ],
      timeframe: 'next 24 hours',
      severity: riskPercentage > 30 ? 'high' : riskPercentage > 15 ? 'medium' : 'low'
    };
  }

  private async predictHypertensionRisk(metrics: HealthMetrics, history: HealthMetrics[]): Promise<RiskPrediction> {
    const model = this.riskModels.get('hypertension_crisis')!;
    let risk = model.baselineRisk;

    // Blood pressure trend
    if (metrics.vitalSigns.bloodPressure) {
      const { systolic, diastolic } = metrics.vitalSigns.bloodPressure;
      if (systolic > 140 || diastolic > 90) risk += 0.2;
      if (systolic > 160 || diastolic > 100) risk += 0.3;
    }

    // Medication adherence
    risk += ((100 - metrics.medicationAdherence) / 100) * 0.25;

    // Stress level
    risk += (metrics.stressLevel / 10) * 0.1;

    const riskPercentage = Math.min(90, risk * 100);

    return {
      condition: 'Hypertension Crisis',
      riskPercentage: Math.round(riskPercentage),
      confidence: 0.9,
      factors: ['Blood pressure readings', 'Medication adherence', 'Stress level'],
      recommendations: [
        'Take prescribed blood pressure medication as directed',
        'Reduce sodium intake',
        'Monitor blood pressure regularly',
        'Contact healthcare provider if readings remain high'
      ],
      timeframe: 'next 48 hours',
      severity: riskPercentage > 25 ? 'high' : riskPercentage > 10 ? 'medium' : 'low'
    };
  }

  private async predictInfectionRisk(metrics: HealthMetrics, history: HealthMetrics[]): Promise<RiskPrediction> {
    const model = this.riskModels.get('infection')!;
    let risk = model.baselineRisk;

    // Temperature trend
    if (metrics.vitalSigns.temperature && metrics.vitalSigns.temperature > 100.4) {
      risk += 0.3;
    }

    // Pain level (could indicate infection)
    if (metrics.painLevel > 7) risk += 0.15;

    // Medication adherence (antibiotics)
    risk += ((100 - metrics.medicationAdherence) / 100) * 0.2;

    const riskPercentage = Math.min(80, risk * 100);

    return {
      condition: 'Post-Surgical Infection',
      riskPercentage: Math.round(riskPercentage),
      confidence: 0.8,
      factors: ['Temperature elevation', 'Pain level', 'Antibiotic adherence'],
      recommendations: [
        'Monitor temperature regularly',
        'Keep incision site clean and dry',
        'Take antibiotics as prescribed',
        'Contact surgeon if symptoms worsen'
      ],
      timeframe: 'next 72 hours',
      severity: riskPercentage > 20 ? 'high' : riskPercentage > 10 ? 'medium' : 'low'
    };
  }

  // Generate health alerts
  private async generateHealthAlerts(patientId: string, metrics: HealthMetrics): Promise<HealthAlert[]> {
    const alerts: HealthAlert[] = [];

    // Critical vital signs
    if (metrics.vitalSigns.bloodPressure) {
      const { systolic, diastolic } = metrics.vitalSigns.bloodPressure;
      if (systolic > 180 || diastolic > 110) {
        alerts.push({
          id: `bp-critical-${Date.now()}`,
          severity: 'critical',
          type: 'vital',
          message: 'Blood pressure is critically high. Seek immediate medical attention.',
          actionRequired: true,
          timestamp: new Date(),
          resolved: false
        });
      } else if (systolic > 160 || diastolic > 100) {
        alerts.push({
          id: `bp-high-${Date.now()}`,
          severity: 'high',
          type: 'vital',
          message: 'Blood pressure is elevated. Contact your healthcare provider.',
          actionRequired: true,
          timestamp: new Date(),
          resolved: false
        });
      }
    }

    // High pain levels
    if (metrics.painLevel >= 8) {
      alerts.push({
        id: `pain-high-${Date.now()}`,
        severity: 'high',
        type: 'symptom',
        message: 'Severe pain detected. Consider contacting your healthcare provider.',
        actionRequired: true,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Low medication adherence
    if (metrics.medicationAdherence < 60) {
      alerts.push({
        id: `med-adherence-${Date.now()}`,
        severity: 'medium',
        type: 'medication',
        message: 'Medication adherence is low. This may affect your recovery.',
        actionRequired: true,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Temperature alerts
    if (metrics.vitalSigns.temperature && metrics.vitalSigns.temperature > 101.5) {
      alerts.push({
        id: `temp-high-${Date.now()}`,
        severity: 'high',
        type: 'vital',
        message: 'High fever detected. Contact your healthcare provider immediately.',
        actionRequired: true,
        timestamp: new Date(),
        resolved: false
      });
    }

    return alerts;
  }

  // Generate health trends for visualization
  generateHealthTrends(patientId: string, days: number = 30): HealthTrend[] {
    const history = this.getPatientHistory(patientId).slice(-days);
    const trends: HealthTrend[] = [];

    if (history.length < 3) return trends;

    // Pain trend
    const painTrend = this.calculateMetricTrend(history, 'painLevel');
    trends.push({
      metric: 'Pain Level',
      values: painTrend.values,
      trend: painTrend.trend,
      prediction: this.predictMetricValues(painTrend.values, 7)
    });

    // Mobility trend
    const mobilityTrend = this.calculateMetricTrend(history, 'mobilityScore');
    trends.push({
      metric: 'Mobility Score',
      values: mobilityTrend.values,
      trend: mobilityTrend.trend,
      prediction: this.predictMetricValues(mobilityTrend.values, 7)
    });

    // Medication adherence trend
    const medicationTrend = this.calculateMetricTrend(history, 'medicationAdherence');
    trends.push({
      metric: 'Medication Adherence',
      values: medicationTrend.values,
      trend: medicationTrend.trend,
      prediction: this.predictMetricValues(medicationTrend.values, 7)
    });

    return trends;
  }

  private calculateMetricTrend(history: HealthMetrics[], metric: keyof HealthMetrics): {
    values: Array<{ date: Date; value: number }>;
    trend: 'improving' | 'stable' | 'declining';
  } {
    const values = history.map((h, index) => ({
      date: new Date(Date.now() - (history.length - index) * 24 * 60 * 60 * 1000),
      value: h[metric] as number
    }));

    // Calculate trend using linear regression
    const n = values.length;
    const sumX = values.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, v) => sum + v.value, 0);
    const sumXY = values.reduce((sum, v, i) => sum + i * v.value, 0);
    const sumXX = values.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    let trend: 'improving' | 'stable' | 'declining';
    if (metric === 'painLevel') {
      // For pain, decreasing is improving
      trend = slope < -0.1 ? 'improving' : slope > 0.1 ? 'declining' : 'stable';
    } else {
      // For other metrics, increasing is improving
      trend = slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable';
    }

    return { values, trend };
  }

  private predictMetricValues(values: Array<{ date: Date; value: number }>, days: number): Array<{ date: Date; predictedValue: number; confidence: number }> {
    if (values.length < 3) return [];

    // Simple linear prediction
    const n = values.length;
    const sumX = values.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, v) => sum + v.value, 0);
    const sumXY = values.reduce((sum, v, i) => sum + i * v.value, 0);
    const sumXX = values.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predictions: Array<{ date: Date; predictedValue: number; confidence: number }> = [];
    
    for (let i = 1; i <= days; i++) {
      const predictedValue = slope * (n + i - 1) + intercept;
      const confidence = Math.max(0.3, 0.9 - (i * 0.1)); // Confidence decreases over time
      
      predictions.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        predictedValue: Math.max(0, Math.min(100, predictedValue)),
        confidence
      });
    }

    return predictions;
  }

  // Helper methods
  private getPatientHistory(patientId: string): HealthMetrics[] {
    return this.patientHistory.get(patientId) || [];
  }

  addHealthMetrics(patientId: string, metrics: HealthMetrics): void {
    const history = this.getPatientHistory(patientId);
    history.push(metrics);
    
    // Keep only last 90 days
    if (history.length > 90) {
      history.splice(0, history.length - 90);
    }
    
    this.patientHistory.set(patientId, history);
  }

  // Voice command processing for health intelligence
  async processHealthVoiceCommand(command: string, patientId: string): Promise<string> {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('health score')) {
      const currentMetrics = await this.getCurrentMetrics(patientId);
      const healthScore = await this.calculateHealthScore(patientId, currentMetrics);
      return `Your current health score is ${healthScore.overall} out of 100. Your recovery is ${healthScore.trends.direction}. ${healthScore.recommendations[0] || 'Keep following your recovery plan.'}`;
    }

    if (lowerCommand.includes('pain trends') || lowerCommand.includes('pain pattern')) {
      const trends = this.generateHealthTrends(patientId, 30);
      const painTrend = trends.find(t => t.metric === 'Pain Level');
      if (painTrend) {
        return `Your pain levels are ${painTrend.trend} over the last month. ${painTrend.trend === 'improving' ? 'Great progress!' : painTrend.trend === 'declining' ? 'Consider discussing this with your doctor.' : 'Your pain levels are stable.'}`;
      }
      return 'I need more data to analyze your pain trends. Please continue logging your daily symptoms.';
    }

    if (lowerCommand.includes('risk') || lowerCommand.includes('health issues')) {
      const currentMetrics = await this.getCurrentMetrics(patientId);
      const risks = await this.predictHealthRisks(patientId, currentMetrics);
      
      if (risks.length === 0) {
        return 'Good news! I don\'t detect any significant health risks at this time. Keep following your recovery plan.';
      }
      
      const highestRisk = risks[0];
      return `You have a ${highestRisk.riskPercentage}% risk of ${highestRisk.condition.toLowerCase()} in the ${highestRisk.timeframe}. ${highestRisk.recommendations[0]}`;
    }

    return 'I can help you check your health score, analyze pain trends, or assess health risks. What would you like to know?';
  }

  private async getCurrentMetrics(patientId: string): Promise<HealthMetrics> {
    // This would typically fetch from database or sensors
    // For demo, return sample data
    return {
      painLevel: 4,
      mobilityScore: 75,
      medicationAdherence: 85,
      exerciseCompliance: 70,
      sleepQuality: 80,
      stressLevel: 3,
      vitalSigns: {
        bloodPressure: { systolic: 125, diastolic: 80 },
        heartRate: 72,
        temperature: 98.6
      },
      environmentalFactors: {
        weather: 'clear',
        airQuality: 85,
        humidity: 45
      }
    };
  }
}

export const healthIntelligenceService = new HealthIntelligenceService();
export default healthIntelligenceService;
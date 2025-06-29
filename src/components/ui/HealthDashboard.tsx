import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Brain,
  Shield,
  Zap,
  Target,
  Clock,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell } from 'recharts';
import { healthIntelligenceService } from '../../services/healthIntelligenceService';
import { useVoice } from '../../contexts/VoiceContext';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';

interface HealthDashboardProps {
  patientId: string;
}

const HealthDashboard: React.FC<HealthDashboardProps> = ({ patientId }) => {
  const { speak } = useVoice();
  const [healthScore, setHealthScore] = useState<any>(null);
  const [riskPredictions, setRiskPredictions] = useState<any[]>([]);
  const [healthTrends, setHealthTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHealthData();
  }, [patientId]);

  const loadHealthData = async () => {
    try {
      setIsLoading(true);
      
      // Mock current metrics - in real app, this would come from sensors/user input
      const currentMetrics = {
        painLevel: 4,
        mobilityScore: 75,
        medicationAdherence: 85,
        exerciseCompliance: 70,
        sleepQuality: 80,
        stressLevel: 3,
        vitalSigns: {
          bloodPressure: { systolic: 125, diastolic: 80 },
          heartRate: 72,
          temperature: 98.6,
          oxygenSaturation: 98
        },
        environmentalFactors: {
          weather: 'clear',
          airQuality: 85,
          pollenCount: 20,
          humidity: 45
        }
      };

      // Add metrics to service
      healthIntelligenceService.addHealthMetrics(patientId, currentMetrics);

      // Calculate health score
      const score = await healthIntelligenceService.calculateHealthScore(patientId, currentMetrics);
      setHealthScore(score);

      // Get risk predictions
      const risks = await healthIntelligenceService.predictHealthRisks(patientId, currentMetrics);
      setRiskPredictions(risks);

      // Generate health trends
      const trends = healthIntelligenceService.generateHealthTrends(patientId, 30);
      setHealthTrends(trends);

    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceQuery = async (query: string) => {
    const response = await healthIntelligenceService.processHealthVoiceCommand(query, patientId);
    await speak(response);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    if (score >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'declining': return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-blue-600" />;
    }
  };

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <CheckCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-3xl"></div>
          </div>
        ))}
      </div>
    );
  }

  const scoreData = healthScore ? [
    { name: 'Physical', value: healthScore.breakdown.physical, fill: '#3b82f6' },
    { name: 'Mental', value: healthScore.breakdown.mental, fill: '#10b981' },
    { name: 'Compliance', value: healthScore.breakdown.compliance, fill: '#8b5cf6' },
    { name: 'Recovery', value: healthScore.breakdown.recovery, fill: '#f59e0b' }
  ] : [];

  return (
    <div className="space-y-8">
      {/* Health Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ModernCard className="overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <Heart className="w-7 h-7 text-red-500" />
                <span>Health Intelligence Dashboard</span>
              </h2>
              <p className="text-gray-600 mt-1">AI-powered health analysis and predictions</p>
            </div>
            
            <div className="flex space-x-2">
              <ModernButton
                onClick={() => handleVoiceQuery('What\'s my health score today?')}
                variant="ghost"
                size="sm"
                icon={Brain}
                voiceCommand="what's my health score"
              >
                Ask AI
              </ModernButton>
              <ModernButton
                onClick={loadHealthData}
                variant="secondary"
                size="sm"
                icon={Zap}
              >
                Refresh
              </ModernButton>
            </div>
          </div>

          {healthScore && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Overall Health Score */}
              <div className="lg:col-span-1">
                <div className="text-center">
                  <div className={`text-6xl font-bold mb-2 bg-gradient-to-r ${getScoreGradient(healthScore.overall)} bg-clip-text text-transparent`}>
                    {healthScore.overall}
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mb-4">Overall Health Score</div>
                  
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    {getTrendIcon(healthScore.trends.direction)}
                    <span className={`font-medium ${
                      healthScore.trends.direction === 'improving' ? 'text-green-600' :
                      healthScore.trends.direction === 'declining' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {healthScore.trends.direction} {Math.abs(healthScore.trends.changePercent)}%
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {healthScore.trends.timeframe}
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Score Breakdown</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {Object.entries(healthScore.breakdown).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 capitalize">{key}</span>
                        <span className={`text-lg font-bold ${getScoreColor(value as number)}`}>
                          {value}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(value as number)}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pie Chart */}
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scoreData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {scoreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </ModernCard>
      </motion.div>

      {/* Health Alerts */}
      {healthScore?.alerts && healthScore.alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ModernCard>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="w-6 h-6 text-orange-500" />
              <span>Health Alerts</span>
            </h3>
            
            <div className="space-y-3">
              {healthScore.alerts.map((alert: any, index: number) => (
                <div key={alert.id} className={`p-4 rounded-xl border ${getRiskColor(alert.severity)}`}>
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold capitalize">{alert.type} Alert</span>
                        <span className="text-xs opacity-75">
                          {alert.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{alert.message}</p>
                      {alert.actionRequired && (
                        <div className="mt-2">
                          <ModernButton
                            size="sm"
                            variant="primary"
                            onClick={() => handleVoiceQuery(`Tell me about ${alert.type} alert`)}
                          >
                            Take Action
                          </ModernButton>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        </motion.div>
      )}

      {/* Risk Predictions */}
      {riskPredictions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ModernCard>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Target className="w-6 h-6 text-purple-500" />
              <span>Predictive Risk Analysis</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riskPredictions.map((risk, index) => (
                <div key={index} className={`p-4 rounded-xl border ${getRiskColor(risk.severity)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{risk.condition}</h4>
                    <span className="text-lg font-bold">{risk.riskPercentage}%</span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          risk.severity === 'high' ? 'bg-red-500' :
                          risk.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${risk.riskPercentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Timeframe:</strong> {risk.timeframe}
                  </p>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Key factors:</strong> {risk.factors.join(', ')}
                  </p>
                  
                  <div className="space-y-1">
                    {risk.recommendations.slice(0, 2).map((rec: string, i: number) => (
                      <p key={i} className="text-xs text-gray-700">• {rec}</p>
                    ))}
                  </div>
                  
                  <ModernButton
                    size="sm"
                    variant="ghost"
                    className="mt-2 !text-xs"
                    onClick={() => handleVoiceQuery(`Tell me about ${risk.condition} risk`)}
                  >
                    Learn More
                  </ModernButton>
                </div>
              ))}
            </div>
          </ModernCard>
        </motion.div>
      )}

      {/* Health Trends */}
      {healthTrends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <ModernCard>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              <span>Health Trends & Predictions</span>
            </h3>
            
            <div className="space-y-6">
              {healthTrends.map((trend, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{trend.metric}</h4>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(trend.trend)}
                      <span className={`text-sm font-medium ${
                        trend.trend === 'improving' ? 'text-green-600' :
                        trend.trend === 'declining' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {trend.trend}
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trend.values}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                        {trend.prediction && trend.prediction.length > 0 && (
                          <Line 
                            type="monotone" 
                            dataKey="predictedValue" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                            data={trend.prediction}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        </motion.div>
      )}

      {/* Recommendations */}
      {healthScore?.recommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <ModernCard>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Brain className="w-6 h-6 text-green-500" />
              <span>AI Recommendations</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthScore.recommendations.map((recommendation: string, index: number) => (
                <div key={index} className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-green-800">{recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <ModernButton
                onClick={() => handleVoiceQuery('Give me personalized health recommendations')}
                variant="primary"
                icon={Brain}
                voiceCommand="give me health recommendations"
              >
                Get Personalized Recommendations
              </ModernButton>
            </div>
          </ModernCard>
        </motion.div>
      )}
    </div>
  );
};

export default HealthDashboard;
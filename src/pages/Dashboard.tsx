import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Users, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  ArrowRight, 
  Zap,
  Heart,
  Brain,
  Shield,
  Globe,
  Smartphone,
  MessageCircle,
  Video,
  Camera,
  Stethoscope,
  Plus,
  Star,
  Award,
  Target
} from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';
import { authService } from '../services/authService';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { speak, updateScreenContext, voiceState } = useVoice();
  const [currentTime, setCurrentTime] = useState(new Date());
  const userProfile = authService.getUserProfile();

  useEffect(() => {
    updateScreenContext('dashboard', [
      'start patient call',
      'open provider dashboard', 
      'open patient portal',
      'view statistics',
      'read activities',
      'emergency help',
      'health dashboard'
    ]);

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [updateScreenContext]);

  const stats = [
    { 
      name: 'Active Patients', 
      value: '247', 
      change: '+12%', 
      icon: Users, 
      color: 'blue',
      trend: 'up',
      voiceCommand: 'view active patients'
    },
    { 
      name: 'Today\'s Calls', 
      value: '34', 
      change: '+8%', 
      icon: Phone, 
      color: 'green',
      trend: 'up',
      voiceCommand: 'view today calls'
    },
    { 
      name: 'High-Risk Cases', 
      value: '3', 
      change: '-2%', 
      icon: AlertTriangle, 
      color: 'red',
      trend: 'down',
      voiceCommand: 'view high risk cases'
    },
    { 
      name: 'Recovery Rate', 
      value: '94%', 
      change: '+5%', 
      icon: TrendingUp, 
      color: 'purple',
      trend: 'up',
      voiceCommand: 'view recovery rate'
    },
  ];

  const recentActivities = [
    { 
      id: 1, 
      patient: 'Mrs. Sharma', 
      action: 'Completed AI-powered wound analysis', 
      time: '2 min ago', 
      status: 'success',
      priority: 'normal',
      type: 'ai-analysis'
    },
    { 
      id: 2, 
      patient: 'Mr. Patel', 
      action: 'Emergency alert: High pain levels detected', 
      time: '15 min ago', 
      status: 'warning',
      priority: 'high',
      type: 'emergency'
    },
    { 
      id: 3, 
      patient: 'Mrs. Singh', 
      action: 'Voice consultation completed successfully', 
      time: '1 hour ago', 
      status: 'success',
      priority: 'normal',
      type: 'voice-call'
    },
    { 
      id: 4, 
      patient: 'Mr. Kumar', 
      action: 'WhatsApp reminder sent for medication', 
      time: '2 hours ago', 
      status: 'info',
      priority: 'low',
      type: 'whatsapp'
    },
  ];

  const quickActions = [
    {
      title: 'Start Voice Call',
      description: 'AI-powered patient consultation',
      icon: Phone,
      gradient: 'from-blue-500 to-blue-600',
      action: () => navigate('/patient-call'),
      voiceCommand: 'start patient call',
      featured: true
    },
    {
      title: 'Health AI Dashboard',
      description: 'Predictive health analytics',
      icon: Brain,
      gradient: 'from-purple-500 to-purple-600',
      action: () => navigate('/patient-portal'),
      voiceCommand: 'open health dashboard',
      featured: true
    },
    {
      title: 'Emergency System',
      description: 'Smart emergency detection',
      icon: Shield,
      gradient: 'from-red-500 to-red-600',
      action: () => handleEmergencyDemo(),
      voiceCommand: 'emergency help',
      featured: true
    },
    {
      title: 'Provider Dashboard',
      description: 'Monitor all patients',
      icon: Activity,
      gradient: 'from-green-500 to-green-600',
      action: () => navigate('/provider-dashboard'),
      voiceCommand: 'open provider dashboard'
    },
    {
      title: 'Patient Portal',
      description: 'Complete patient tools',
      icon: Calendar,
      gradient: 'from-orange-500 to-orange-600',
      action: () => navigate('/patient-portal'),
      voiceCommand: 'open patient portal'
    },
    {
      title: 'WhatsApp Integration',
      description: 'Smart notifications & updates',
      icon: MessageCircle,
      gradient: 'from-green-400 to-green-500',
      action: () => handleWhatsAppDemo(),
      voiceCommand: 'whatsapp features'
    }
  ];

  const features = [
    {
      title: 'Multi-AI Analysis',
      description: 'GPT-4V, Gemini Pro Vision, Claude 3.5 Sonnet consensus',
      icon: Brain,
      color: 'purple'
    },
    {
      title: 'Voice-First Design',
      description: 'Complete hands-free operation in English & Hindi',
      icon: Smartphone,
      color: 'blue'
    },
    {
      title: 'Emergency Intelligence',
      description: 'Smart detection with automatic 911 & family alerts',
      icon: Shield,
      color: 'red'
    },
    {
      title: 'WhatsApp Integration',
      description: 'Daily updates, reminders & direct communication',
      icon: MessageCircle,
      color: 'green'
    },
    {
      title: 'Predictive Analytics',
      description: 'Health risk prediction 24-72 hours ahead',
      icon: TrendingUp,
      color: 'orange'
    },
    {
      title: 'Global Accessibility',
      description: 'Works in 50+ languages with cultural adaptation',
      icon: Globe,
      color: 'indigo'
    }
  ];

  const handleVoiceAction = async (action: string, route?: string) => {
    await speak(`Opening ${action}`);
    if (route) navigate(route);
  };

  const handleEmergencyDemo = async () => {
    await speak('Emergency system activated. This would detect medical emergencies from voice patterns and automatically contact emergency services and family members.');
  };

  const handleWhatsAppDemo = async () => {
    await speak('WhatsApp integration allows patients to receive daily health updates, medication reminders, and communicate directly with their healthcare team.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high': return 'w-2 h-2 bg-red-500 rounded-full animate-pulse';
      case 'normal': return 'w-2 h-2 bg-blue-500 rounded-full';
      case 'low': return 'w-2 h-2 bg-gray-400 rounded-full';
      default: return 'w-2 h-2 bg-gray-400 rounded-full';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ai-analysis': return Brain;
      case 'emergency': return AlertTriangle;
      case 'voice-call': return Phone;
      case 'whatsapp': return MessageCircle;
      default: return Activity;
    }
  };

  const greeting = () => {
    const hour = currentTime.getHours();
    const name = userProfile?.displayName?.split(' ')[0] || 'there';
    
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <Heart className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {greeting()}
            </motion.h1>
            
            <motion.p 
              className="text-2xl text-gray-600 max-w-3xl mx-auto mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Welcome to Sehat AI - The Future of Healthcare
            </motion.p>
            
            <motion.p 
              className="text-lg text-gray-500 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Voice-first post-operative care with multi-AI analysis, emergency intelligence, and WhatsApp integration
            </motion.p>
          </div>

          {/* Language & Voice Status */}
          <motion.div
            className="flex items-center justify-center space-x-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="flex items-center space-x-2 bg-white rounded-xl px-4 py-2 shadow-md">
              <Globe className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {voiceState.language === 'hi-IN' ? 'हिंदी में उपलब्ध' : 'Available in English'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 bg-white rounded-xl px-4 py-2 shadow-md">
              <div className={`w-2 h-2 rounded-full ${voiceState.isInitialized ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium text-gray-700">
                {voiceState.isInitialized ? 'Voice AI Ready' : 'Initializing...'}
              </span>
            </div>
          </motion.div>

          {/* Featured Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {quickActions.filter(action => action.featured).map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                >
                  <ModernCard
                    className={`bg-gradient-to-r ${action.gradient} text-white cursor-pointer group relative overflow-hidden`}
                    onClick={action.action}
                    voiceCommand={action.voiceCommand}
                    hover={true}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-7 h-7" />
                        </div>
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="font-bold text-xl mb-2">{action.title}</h3>
                      <p className="text-white/90">{action.description}</p>
                    </div>
                  </ModernCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.7 + index * 0.1 }}
              >
                <ModernCard 
                  className="group cursor-pointer"
                  voiceCommand={stat.voiceCommand}
                  gradient={true}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      stat.color === 'green' ? 'bg-green-100 text-green-600' :
                      stat.color === 'red' ? 'bg-red-100 text-red-600' :
                      'bg-purple-100 text-purple-600'
                    } group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className={`flex items-center space-x-1 text-sm font-semibold ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className={`w-4 h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">from last week</p>
                  </div>
                </ModernCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Platform Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          className="mb-12"
        >
          <ModernCard className="overflow-hidden">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Revolutionary Healthcare Features</h2>
              <p className="text-gray-600 text-lg">Powered by cutting-edge AI and designed for accessibility</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 2.0 + index * 0.1 }}
                    className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                      feature.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      feature.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      feature.color === 'red' ? 'bg-red-100 text-red-600' :
                      feature.color === 'green' ? 'bg-green-100 text-green-600' :
                      feature.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                      'bg-indigo-100 text-indigo-600'
                    }`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </ModernCard>
        </motion.div>

        {/* All Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.2 }}
          className="mb-12"
        >
          <ModernCard>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              <span>Quick Actions</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 2.4 + index * 0.05 }}
                  >
                    <ModernButton
                      onClick={action.action}
                      variant="ghost"
                      className="!w-full !h-auto !p-6 !flex-col !space-y-3 hover:!bg-gray-50"
                      voiceCommand={action.voiceCommand}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${action.gradient}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{action.title}</div>
                        <div className="text-sm text-gray-600">{action.description}</div>
                      </div>
                    </ModernButton>
                  </motion.div>
                );
              })}
            </div>
          </ModernCard>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.6 }}
        >
          <ModernCard className="overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <Activity className="w-6 h-6 text-blue-600" />
                  <span>Recent Activities</span>
                </h2>
                <p className="text-gray-600 mt-1">Latest AI-powered patient interactions and system updates</p>
              </div>
              <ModernButton
                variant="ghost"
                size="sm"
                voiceCommand="view all activities"
              >
                View All
              </ModernButton>
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.type);
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 2.8 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group cursor-pointer"
                    data-voice-command={`view activity ${activity.patient}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={getPriorityIndicator(activity.priority)} />
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <ActivityIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {activity.patient}
                        </p>
                        <p className="text-gray-600 text-sm">{activity.action}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      <span className="text-sm text-gray-500 min-w-max">{activity.time}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ModernCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
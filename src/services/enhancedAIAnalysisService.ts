// Enhanced Multi-AI Analysis Service with Consensus and Advanced Features
interface AIProvider {
  name: string;
  apiKey: string;
  baseUrl: string;
  models: {
    text: string;
    vision: string;
    multimodal: string;
  };
  capabilities: string[];
  reliability: number; // 0-1 score
}

interface AnalysisResult {
  provider: string;
  confidence: number;
  analysis: {
    medicalFindings: string[];
    riskAssessment: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
    followUpRequired: boolean;
    urgentCare: boolean;
    healingProgress?: number; // 0-100% for wound healing
    infectionRisk?: number; // 0-100%
    painAssessment?: {
      estimatedLevel: number; // 1-10
      type: string; // 'acute', 'chronic', 'neuropathic'
      location: string[];
    };
    symptomSeverity?: {
      overall: number; // 1-10
      individual: Array<{ symptom: string; severity: number }>;
    };
  };
  imageAnalysis?: {
    woundHealing: 'excellent' | 'good' | 'concerning' | 'poor';
    infectionSigns: boolean;
    healingProgress: number; // 0-100%
    visualChanges: string[];
    comparisonWithPrevious?: {
      improvement: boolean;
      changePercentage: number;
      keyChanges: string[];
    };
  };
  textAnalysis?: {
    sentiment: 'positive' | 'negative' | 'neutral';
    emotionalState: string;
    comprehensionLevel: number; // 0-1
    linguisticMarkers: string[];
  };
  rawResponse: any;
  processingTime: number;
  timestamp: Date;
}

interface ConsensusAnalysis {
  provider: 'Consensus';
  confidence: number;
  analysis: AnalysisResult['analysis'];
  imageAnalysis?: AnalysisResult['imageAnalysis'];
  textAnalysis?: AnalysisResult['textAnalysis'];
  consensusMetrics: {
    agreementLevel: number; // 0-1
    conflictingFindings: string[];
    reliabilityScore: number; // 0-1
    recommendationStrength: number; // 0-1
  };
  individualResults: AnalysisResult[];
  processingTime: number;
  timestamp: Date;
}

interface ProgressComparison {
  currentAnalysis: AnalysisResult;
  previousAnalysis: AnalysisResult[];
  progressMetrics: {
    healingRate: number; // -100 to +100 (negative = worse, positive = better)
    trendDirection: 'improving' | 'stable' | 'declining';
    keyChanges: string[];
    timeToHealing?: number; // estimated days
    riskFactors: string[];
  };
  visualComparison?: {
    sizeChange: number; // percentage change in wound size
    colorChange: string; // description of color changes
    textureChange: string; // description of texture changes
    edgeDefinition: string; // wound edge characteristics
  };
}

class EnhancedAIAnalysisService {
  private providers: Map<string, AIProvider> = new Map();
  private analysisHistory: Map<string, AnalysisResult[]> = new Map();
  private progressTracking: Map<string, ProgressComparison[]> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Groq - Fast inference with Llama models
    this.providers.set('groq', {
      name: 'Groq',
      apiKey: import.meta.env.VITE_GROQ_API_KEY || 'gsk_placeholder',
      baseUrl: 'https://api.groq.com/openai/v1',
      models: {
        text: 'llama-3.1-70b-versatile',
        vision: 'llama-3.2-11b-vision-preview',
        multimodal: 'llama-3.2-90b-vision-preview'
      },
      capabilities: ['text', 'vision', 'medical_analysis', 'fast_inference'],
      reliability: 0.85
    });

    // OpenAI - High quality analysis
    this.providers.set('openai', {
      name: 'OpenAI',
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'sk-placeholder',
      baseUrl: 'https://api.openai.com/v1',
      models: {
        text: 'gpt-4o',
        vision: 'gpt-4o',
        multimodal: 'gpt-4o'
      },
      capabilities: ['text', 'vision', 'medical_analysis', 'high_accuracy'],
      reliability: 0.95
    });

    // Gemini - Google's advanced model
    this.providers.set('gemini', {
      name: 'Gemini',
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'placeholder',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      models: {
        text: 'gemini-1.5-pro',
        vision: 'gemini-1.5-pro-vision',
        multimodal: 'gemini-1.5-pro'
      },
      capabilities: ['text', 'vision', 'medical_analysis', 'multimodal'],
      reliability: 0.90
    });

    // OpenRouter - Access to Claude and other models
    this.providers.set('openrouter', {
      name: 'OpenRouter',
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || 'sk-or-placeholder',
      baseUrl: 'https://openrouter.ai/api/v1',
      models: {
        text: 'anthropic/claude-3.5-sonnet',
        vision: 'anthropic/claude-3.5-sonnet',
        multimodal: 'anthropic/claude-3.5-sonnet'
      },
      capabilities: ['text', 'vision', 'medical_analysis', 'reasoning'],
      reliability: 0.92
    });

    // Hugging Face - Open source models
    this.providers.set('huggingface', {
      name: 'Hugging Face',
      apiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY || 'hf_placeholder',
      baseUrl: 'https://api-inference.huggingface.co/models',
      models: {
        text: 'microsoft/DialoGPT-large',
        vision: 'microsoft/git-base-coco',
        multimodal: 'microsoft/git-large-coco'
      },
      capabilities: ['text', 'vision', 'open_source'],
      reliability: 0.75
    });
  }

  // Enhanced medical text analysis with multiple AI models
  async analyzeText(text: string, context?: any): Promise<ConsensusAnalysis> {
    const startTime = Date.now();
    const results: AnalysisResult[] = [];
    
    // Use top 3 providers for text analysis
    const providers = ['openai', 'groq', 'openrouter'];
    const prompt = this.buildAdvancedMedicalPrompt(text, context);

    // Run analyses in parallel
    const analysisPromises = providers.map(async (providerName) => {
      try {
        return await this.callProvider(providerName, 'text', prompt);
      } catch (error) {
        console.error(`${providerName} text analysis failed:`, error);
        return null;
      }
    });

    const analysisResults = await Promise.all(analysisPromises);
    results.push(...analysisResults.filter(result => result !== null) as AnalysisResult[]);

    // Generate consensus
    const consensus = this.generateConsensusAnalysis(results);
    consensus.processingTime = Date.now() - startTime;

    // Store in history
    this.storeAnalysisHistory(context?.patientId || 'unknown', results);

    return consensus;
  }

  // Enhanced medical image analysis with multiple AI models
  async analyzeImage(imageData: string, context?: any): Promise<ConsensusAnalysis> {
    const startTime = Date.now();
    const results: AnalysisResult[] = [];
    
    // Use vision-capable providers
    const providers = ['openai', 'gemini', 'groq'];
    const prompt = this.buildAdvancedImageAnalysisPrompt(context);

    // Run analyses in parallel
    const analysisPromises = providers.map(async (providerName) => {
      try {
        return await this.callProviderWithImage(providerName, prompt, imageData);
      } catch (error) {
        console.error(`${providerName} image analysis failed:`, error);
        return null;
      }
    });

    const analysisResults = await Promise.all(analysisPromises);
    results.push(...analysisResults.filter(result => result !== null) as AnalysisResult[]);

    // Generate consensus
    const consensus = this.generateConsensusAnalysis(results);
    consensus.processingTime = Date.now() - startTime;

    // Store in history and track progress
    if (context?.patientId) {
      this.storeAnalysisHistory(context.patientId, results);
      await this.trackHealingProgress(context.patientId, consensus);
    }

    return consensus;
  }

  // Advanced multimodal analysis (text + images)
  async analyzeMultimodal(text: string, images: string[], context?: any): Promise<ConsensusAnalysis> {
    const startTime = Date.now();
    const results: AnalysisResult[] = [];
    
    // Use multimodal-capable providers
    const providers = ['openai', 'gemini'];
    const prompt = this.buildAdvancedMultimodalPrompt(text, context);

    // Run analyses in parallel
    const analysisPromises = providers.map(async (providerName) => {
      try {
        return await this.callProviderMultimodal(providerName, prompt, images);
      } catch (error) {
        console.error(`${providerName} multimodal analysis failed:`, error);
        return null;
      }
    });

    const analysisResults = await Promise.all(analysisPromises);
    results.push(...analysisResults.filter(result => result !== null) as AnalysisResult[]);

    // Generate consensus
    const consensus = this.generateConsensusAnalysis(results);
    consensus.processingTime = Date.now() - startTime;

    // Store in history
    this.storeAnalysisHistory(context?.patientId || 'unknown', results);

    return consensus;
  }

  private buildAdvancedMedicalPrompt(text: string, context?: any): string {
    return `You are an advanced medical AI assistant analyzing patient information. Provide a comprehensive structured analysis.

Patient Context: ${context ? JSON.stringify(context) : 'Not provided'}
Medical Content: "${text}"

Analyze and provide detailed assessment including:

1. MEDICAL FINDINGS:
   - Identify all symptoms, conditions, and medical concerns
   - Note any red flags or concerning patterns
   - Assess symptom severity and progression

2. RISK ASSESSMENT:
   - Overall risk level (low/medium/high/critical)
   - Specific risk factors identified
   - Potential complications

3. PAIN ASSESSMENT (if applicable):
   - Estimated pain level (1-10)
   - Pain type (acute/chronic/neuropathic)
   - Pain location and characteristics

4. RECOMMENDATIONS:
   - Immediate actions needed
   - Follow-up care requirements
   - Lifestyle modifications
   - When to seek urgent care

5. EMOTIONAL/PSYCHOLOGICAL STATE:
   - Patient's emotional state
   - Anxiety or depression indicators
   - Coping mechanisms

Respond in JSON format:
{
  "medicalFindings": ["finding1", "finding2"],
  "riskAssessment": "low|medium|high|critical",
  "recommendations": ["rec1", "rec2"],
  "followUpRequired": true|false,
  "urgentCare": true|false,
  "painAssessment": {
    "estimatedLevel": 1-10,
    "type": "acute|chronic|neuropathic",
    "location": ["location1", "location2"]
  },
  "symptomSeverity": {
    "overall": 1-10,
    "individual": [{"symptom": "name", "severity": 1-10}]
  },
  "textAnalysis": {
    "sentiment": "positive|negative|neutral",
    "emotionalState": "description",
    "comprehensionLevel": 0-1,
    "linguisticMarkers": ["marker1", "marker2"]
  },
  "reasoning": "detailed explanation"
}`;
  }

  private buildAdvancedImageAnalysisPrompt(context?: any): string {
    return `You are an advanced medical AI analyzing a wound/medical image for post-operative care. Provide comprehensive analysis.

Patient Context: ${context ? JSON.stringify(context) : 'Post-operative patient'}

Analyze the image for:

1. WOUND HEALING ASSESSMENT:
   - Overall healing status (excellent/good/concerning/poor)
   - Healing progress percentage (0-100%)
   - Wound characteristics (size, depth, edges)

2. INFECTION INDICATORS:
   - Signs of infection (redness, swelling, discharge)
   - Infection risk level (0-100%)
   - Specific concerning features

3. VISUAL CHANGES:
   - Color changes from normal healing
   - Texture and surface characteristics
   - Surrounding tissue condition

4. PROGRESS TRACKING:
   - Improvement indicators
   - Areas of concern
   - Expected healing timeline

5. RECOMMENDATIONS:
   - Immediate care instructions
   - When to contact healthcare provider
   - Follow-up imaging needs

Respond in JSON format:
{
  "woundHealing": "excellent|good|concerning|poor",
  "infectionSigns": true|false,
  "healingProgress": 0-100,
  "visualChanges": ["change1", "change2"],
  "medicalFindings": ["finding1"],
  "riskAssessment": "low|medium|high|critical",
  "recommendations": ["rec1", "rec2"],
  "urgentCare": true|false,
  "imageAnalysis": {
    "woundHealing": "excellent|good|concerning|poor",
    "infectionSigns": true|false,
    "healingProgress": 0-100,
    "visualChanges": ["change1", "change2"]
  },
  "reasoning": "detailed analysis explanation"
}`;
  }

  private buildAdvancedMultimodalPrompt(text: string, context?: any): string {
    return `Analyze both the patient's description and the provided images for comprehensive medical assessment.

Patient Description: "${text}"
Context: ${context ? JSON.stringify(context) : 'Post-operative care'}

Provide comprehensive analysis combining text and visual information:

1. CORRELATION ANALYSIS:
   - How patient description matches visual findings
   - Discrepancies between reported and observed symptoms
   - Reliability of patient self-assessment

2. COMPREHENSIVE MEDICAL ASSESSMENT:
   - Combined findings from text and images
   - Risk assessment based on all available data
   - Prioritized recommendations

3. PROGRESS EVALUATION:
   - Healing progress based on visual and reported data
   - Patient understanding of their condition
   - Compliance indicators

Respond in JSON format with complete medical assessment combining all modalities.`;
  }

  private async callProvider(providerName: string, type: 'text' | 'vision' | 'multimodal', prompt: string): Promise<AnalysisResult> {
    const startTime = Date.now();
    const provider = this.providers.get(providerName);
    if (!provider) throw new Error(`Provider ${providerName} not found`);

    // Handle different provider APIs
    let response;
    if (providerName === 'gemini') {
      response = await this.callGeminiAPI(provider, prompt);
    } else if (providerName === 'huggingface') {
      response = await this.callHuggingFaceAPI(provider, prompt);
    } else {
      response = await this.callOpenAICompatibleAPI(provider, type, prompt);
    }

    const processingTime = Date.now() - startTime;
    const content = this.extractContentFromResponse(response, providerName);

    try {
      const analysis = JSON.parse(content);
      return {
        provider: provider.name,
        confidence: provider.reliability,
        analysis,
        rawResponse: response,
        processingTime,
        timestamp: new Date()
      };
    } catch (error) {
      // Fallback parsing if JSON is malformed
      return {
        provider: provider.name,
        confidence: provider.reliability * 0.7,
        analysis: this.parseNonJsonResponse(content),
        rawResponse: response,
        processingTime,
        timestamp: new Date()
      };
    }
  }

  private async callProviderWithImage(providerName: string, prompt: string, imageData: string): Promise<AnalysisResult> {
    const startTime = Date.now();
    const provider = this.providers.get(providerName);
    if (!provider) throw new Error(`Provider ${providerName} not found`);

    let response;
    if (providerName === 'gemini') {
      response = await this.callGeminiVisionAPI(provider, prompt, imageData);
    } else {
      response = await this.callOpenAIVisionAPI(provider, prompt, imageData);
    }

    const processingTime = Date.now() - startTime;
    const content = this.extractContentFromResponse(response, providerName);

    try {
      const analysis = JSON.parse(content);
      return {
        provider: provider.name,
        confidence: provider.reliability,
        analysis,
        imageAnalysis: analysis.imageAnalysis || analysis,
        rawResponse: response,
        processingTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        provider: provider.name,
        confidence: provider.reliability * 0.7,
        analysis: this.parseNonJsonResponse(content),
        rawResponse: response,
        processingTime,
        timestamp: new Date()
      };
    }
  }

  private async callProviderMultimodal(providerName: string, prompt: string, images: string[]): Promise<AnalysisResult> {
    const startTime = Date.now();
    const provider = this.providers.get(providerName);
    if (!provider) throw new Error(`Provider ${providerName} not found`);

    const content = [
      { type: 'text', text: prompt },
      ...images.map(img => ({
        type: 'image_url',
        image_url: { url: img }
      }))
    ];

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.models.multimodal,
        messages: [{ role: 'user', content }],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`${provider.name} API error: ${response.statusText}`);
    }

    const data = await response.json();
    const processingTime = Date.now() - startTime;
    const responseContent = data.choices[0].message.content;

    try {
      const analysis = JSON.parse(responseContent);
      return {
        provider: provider.name,
        confidence: provider.reliability,
        analysis,
        imageAnalysis: analysis.imageAnalysis || analysis,
        textAnalysis: analysis.textAnalysis,
        rawResponse: data,
        processingTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        provider: provider.name,
        confidence: provider.reliability * 0.8,
        analysis: this.parseNonJsonResponse(responseContent),
        rawResponse: data,
        processingTime,
        timestamp: new Date()
      };
    }
  }

  private async callOpenAICompatibleAPI(provider: AIProvider, type: string, prompt: string): Promise<any> {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.models[type as keyof typeof provider.models],
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`${provider.name} API error: ${response.statusText}`);
    }

    return await response.json();
  }

  private async callOpenAIVisionAPI(provider: AIProvider, prompt: string, imageData: string): Promise<any> {
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageData } }
        ]
      }
    ];

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.models.vision,
        messages,
        temperature: 0.1,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`${provider.name} API error: ${response.statusText}`);
    }

    return await response.json();
  }

  private async callGeminiAPI(provider: AIProvider, prompt: string): Promise<any> {
    // Simplified Gemini API call - in real implementation, use proper Gemini SDK
    const response = await fetch(`${provider.baseUrl}/models/${provider.models.text}:generateContent?key=${provider.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1500 }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    return await response.json();
  }

  private async callGeminiVisionAPI(provider: AIProvider, prompt: string, imageData: string): Promise<any> {
    // Extract base64 data from data URL
    const base64Data = imageData.split(',')[1];
    
    const response = await fetch(`${provider.baseUrl}/models/${provider.models.vision}:generateContent?key=${provider.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: 'image/jpeg', data: base64Data } }
          ]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1500 }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini Vision API error: ${response.statusText}`);
    }

    return await response.json();
  }

  private async callHuggingFaceAPI(provider: AIProvider, prompt: string): Promise<any> {
    const response = await fetch(`${provider.baseUrl}/${provider.models.text}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    return await response.json();
  }

  private extractContentFromResponse(response: any, providerName: string): string {
    switch (providerName) {
      case 'gemini':
        return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      case 'huggingface':
        return response[0]?.generated_text || '';
      default:
        return response.choices?.[0]?.message?.content || '';
    }
  }

  private generateConsensusAnalysis(results: AnalysisResult[]): ConsensusAnalysis {
    if (results.length === 0) {
      throw new Error('No analysis results provided');
    }

    if (results.length === 1) {
      return {
        provider: 'Consensus',
        confidence: results[0].confidence,
        analysis: results[0].analysis,
        imageAnalysis: results[0].imageAnalysis,
        textAnalysis: results[0].textAnalysis,
        consensusMetrics: {
          agreementLevel: 1.0,
          conflictingFindings: [],
          reliabilityScore: results[0].confidence,
          recommendationStrength: results[0].confidence
        },
        individualResults: results,
        processingTime: results[0].processingTime,
        timestamp: new Date()
      };
    }

    // Combine findings from all providers
    const allFindings = results.flatMap(r => r.analysis.medicalFindings);
    const uniqueFindings = [...new Set(allFindings)];

    // Get consensus risk assessment
    const riskLevels = results.map(r => r.analysis.riskAssessment);
    const consensusRisk = this.getConsensusRisk(riskLevels);

    // Combine recommendations with confidence weighting
    const weightedRecommendations = this.getWeightedRecommendations(results);

    // Check for urgent care consensus
    const urgentCareVotes = results.filter(r => r.analysis.urgentCare).length;
    const urgentCare = urgentCareVotes > results.length / 2;

    // Check for follow-up consensus
    const followUpVotes = results.filter(r => r.analysis.followUpRequired).length;
    const followUpRequired = followUpVotes > results.length / 2;

    // Calculate consensus metrics
    const agreementLevel = this.calculateAgreementLevel(results);
    const conflictingFindings = this.identifyConflictingFindings(results);
    const reliabilityScore = this.calculateReliabilityScore(results);

    // Average confidence weighted by provider reliability
    const totalWeight = results.reduce((sum, r) => sum + r.confidence, 0);
    const avgConfidence = totalWeight / results.length;

    // Combine image analysis if available
    const imageAnalyses = results.filter(r => r.imageAnalysis);
    const consensusImageAnalysis = imageAnalyses.length > 0 ? 
      this.generateConsensusImageAnalysis(imageAnalyses) : undefined;

    // Combine text analysis if available
    const textAnalyses = results.filter(r => r.textAnalysis);
    const consensusTextAnalysis = textAnalyses.length > 0 ? 
      this.generateConsensusTextAnalysis(textAnalyses) : undefined;

    return {
      provider: 'Consensus',
      confidence: avgConfidence,
      analysis: {
        medicalFindings: uniqueFindings,
        riskAssessment: consensusRisk,
        recommendations: weightedRecommendations,
        followUpRequired,
        urgentCare,
        healingProgress: this.getAverageHealingProgress(results),
        infectionRisk: this.getAverageInfectionRisk(results),
        painAssessment: this.getConsensusPainAssessment(results),
        symptomSeverity: this.getConsensusSymptomSeverity(results)
      },
      imageAnalysis: consensusImageAnalysis,
      textAnalysis: consensusTextAnalysis,
      consensusMetrics: {
        agreementLevel,
        conflictingFindings,
        reliabilityScore,
        recommendationStrength: avgConfidence
      },
      individualResults: results,
      processingTime: Math.max(...results.map(r => r.processingTime)),
      timestamp: new Date()
    };
  }

  private getConsensusRisk(risks: string[]): 'low' | 'medium' | 'high' | 'critical' {
    const riskScores = { low: 1, medium: 2, high: 3, critical: 4 };
    const avgScore = risks.reduce((sum, risk) => sum + riskScores[risk as keyof typeof riskScores], 0) / risks.length;
    
    if (avgScore >= 3.5) return 'critical';
    if (avgScore >= 2.5) return 'high';
    if (avgScore >= 1.5) return 'medium';
    return 'low';
  }

  private getWeightedRecommendations(results: AnalysisResult[]): string[] {
    const recommendationCounts = new Map<string, number>();
    
    results.forEach(result => {
      result.analysis.recommendations.forEach(rec => {
        const current = recommendationCounts.get(rec) || 0;
        recommendationCounts.set(rec, current + result.confidence);
      });
    });

    // Sort by weighted count and return top recommendations
    return Array.from(recommendationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([rec]) => rec);
  }

  private calculateAgreementLevel(results: AnalysisResult[]): number {
    if (results.length < 2) return 1.0;

    let agreements = 0;
    let totalComparisons = 0;

    // Compare risk assessments
    const riskLevels = results.map(r => r.analysis.riskAssessment);
    const mostCommonRisk = this.getMostCommon(riskLevels);
    agreements += riskLevels.filter(risk => risk === mostCommonRisk).length;
    totalComparisons += riskLevels.length;

    // Compare urgent care recommendations
    const urgentCareRecommendations = results.map(r => r.analysis.urgentCare);
    const mostCommonUrgent = this.getMostCommon(urgentCareRecommendations);
    agreements += urgentCareRecommendations.filter(urgent => urgent === mostCommonUrgent).length;
    totalComparisons += urgentCareRecommendations.length;

    return agreements / totalComparisons;
  }

  private identifyConflictingFindings(results: AnalysisResult[]): string[] {
    const conflicts: string[] = [];
    
    // Check for conflicting risk assessments
    const riskLevels = [...new Set(results.map(r => r.analysis.riskAssessment))];
    if (riskLevels.length > 2) {
      conflicts.push(`Risk assessment varies: ${riskLevels.join(', ')}`);
    }

    // Check for conflicting urgent care recommendations
    const urgentCareRecommendations = results.map(r => r.analysis.urgentCare);
    const urgentTrue = urgentCareRecommendations.filter(u => u).length;
    const urgentFalse = urgentCareRecommendations.filter(u => !u).length;
    if (urgentTrue > 0 && urgentFalse > 0) {
      conflicts.push('Conflicting urgent care recommendations');
    }

    return conflicts;
  }

  private calculateReliabilityScore(results: AnalysisResult[]): number {
    const avgReliability = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    const agreementLevel = this.calculateAgreementLevel(results);
    return (avgReliability + agreementLevel) / 2;
  }

  private generateConsensusImageAnalysis(imageAnalyses: AnalysisResult[]): AnalysisResult['imageAnalysis'] {
    const healingProgresses = imageAnalyses
      .map(r => r.imageAnalysis?.healingProgress)
      .filter(p => p !== undefined) as number[];
    
    const avgHealingProgress = healingProgresses.length > 0 ? 
      healingProgresses.reduce((sum, p) => sum + p, 0) / healingProgresses.length : 0;

    const infectionSigns = imageAnalyses.filter(r => r.imageAnalysis?.infectionSigns).length > 
                          imageAnalyses.length / 2;

    const allVisualChanges = imageAnalyses.flatMap(r => r.imageAnalysis?.visualChanges || []);
    const uniqueVisualChanges = [...new Set(allVisualChanges)];

    const healingStatuses = imageAnalyses.map(r => r.imageAnalysis?.woundHealing).filter(Boolean);
    const consensusHealing = this.getMostCommon(healingStatuses) as 'excellent' | 'good' | 'concerning' | 'poor';

    return {
      woundHealing: consensusHealing || 'good',
      infectionSigns,
      healingProgress: Math.round(avgHealingProgress),
      visualChanges: uniqueVisualChanges
    };
  }

  private generateConsensusTextAnalysis(textAnalyses: AnalysisResult[]): AnalysisResult['textAnalysis'] {
    const sentiments = textAnalyses.map(r => r.textAnalysis?.sentiment).filter(Boolean);
    const consensusSentiment = this.getMostCommon(sentiments) as 'positive' | 'negative' | 'neutral';

    const comprehensionLevels = textAnalyses
      .map(r => r.textAnalysis?.comprehensionLevel)
      .filter(l => l !== undefined) as number[];
    
    const avgComprehension = comprehensionLevels.length > 0 ? 
      comprehensionLevels.reduce((sum, l) => sum + l, 0) / comprehensionLevels.length : 0.8;

    const allMarkers = textAnalyses.flatMap(r => r.textAnalysis?.linguisticMarkers || []);
    const uniqueMarkers = [...new Set(allMarkers)];

    const emotionalStates = textAnalyses.map(r => r.textAnalysis?.emotionalState).filter(Boolean);
    const consensusEmotion = this.getMostCommon(emotionalStates) || 'neutral';

    return {
      sentiment: consensusSentiment || 'neutral',
      emotionalState: consensusEmotion,
      comprehensionLevel: avgComprehension,
      linguisticMarkers: uniqueMarkers
    };
  }

  private getAverageHealingProgress(results: AnalysisResult[]): number | undefined {
    const progresses = results
      .map(r => r.analysis.healingProgress)
      .filter(p => p !== undefined) as number[];
    
    return progresses.length > 0 ? 
      Math.round(progresses.reduce((sum, p) => sum + p, 0) / progresses.length) : undefined;
  }

  private getAverageInfectionRisk(results: AnalysisResult[]): number | undefined {
    const risks = results
      .map(r => r.analysis.infectionRisk)
      .filter(r => r !== undefined) as number[];
    
    return risks.length > 0 ? 
      Math.round(risks.reduce((sum, r) => sum + r, 0) / risks.length) : undefined;
  }

  private getConsensusPainAssessment(results: AnalysisResult[]): AnalysisResult['analysis']['painAssessment'] {
    const painAssessments = results
      .map(r => r.analysis.painAssessment)
      .filter(p => p !== undefined);
    
    if (painAssessments.length === 0) return undefined;

    const avgLevel = painAssessments.reduce((sum, p) => sum + (p?.estimatedLevel || 0), 0) / painAssessments.length;
    const types = painAssessments.map(p => p?.type).filter(Boolean);
    const consensusType = this.getMostCommon(types) || 'acute';
    const allLocations = painAssessments.flatMap(p => p?.location || []);
    const uniqueLocations = [...new Set(allLocations)];

    return {
      estimatedLevel: Math.round(avgLevel),
      type: consensusType,
      location: uniqueLocations
    };
  }

  private getConsensusSymptomSeverity(results: AnalysisResult[]): AnalysisResult['analysis']['symptomSeverity'] {
    const severities = results
      .map(r => r.analysis.symptomSeverity)
      .filter(s => s !== undefined);
    
    if (severities.length === 0) return undefined;

    const avgOverall = severities.reduce((sum, s) => sum + (s?.overall || 0), 0) / severities.length;
    
    // Combine individual symptom severities
    const symptomMap = new Map<string, number[]>();
    severities.forEach(s => {
      s?.individual?.forEach(symptom => {
        if (!symptomMap.has(symptom.symptom)) {
          symptomMap.set(symptom.symptom, []);
        }
        symptomMap.get(symptom.symptom)!.push(symptom.severity);
      });
    });

    const individual = Array.from(symptomMap.entries()).map(([symptom, severityList]) => ({
      symptom,
      severity: Math.round(severityList.reduce((sum, s) => sum + s, 0) / severityList.length)
    }));

    return {
      overall: Math.round(avgOverall),
      individual
    };
  }

  private getMostCommon<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    
    const counts = new Map<T, number>();
    array.forEach(item => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });
    
    let mostCommon = array[0];
    let maxCount = 0;
    
    counts.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    });
    
    return mostCommon;
  }

  private parseNonJsonResponse(content: string): any {
    // Enhanced fallback parser for non-JSON responses
    const findings = this.extractFindings(content);
    const riskLevel = this.extractRiskLevel(content);
    const recommendations = this.extractRecommendations(content);
    const urgentCare = this.extractUrgentCare(content);
    const healingProgress = this.extractHealingProgress(content);

    return {
      medicalFindings: findings,
      riskAssessment: riskLevel,
      recommendations,
      followUpRequired: content.toLowerCase().includes('follow-up') || content.toLowerCase().includes('follow up'),
      urgentCare,
      healingProgress,
      reasoning: content
    };
  }

  private extractFindings(content: string): string[] {
    const findings: string[] = [];
    const medicalTerms = [
      'pain', 'swelling', 'redness', 'discharge', 'fever', 'infection', 
      'healing', 'inflammation', 'bruising', 'tenderness', 'stiffness',
      'bleeding', 'drainage', 'warmth', 'numbness', 'tingling'
    ];
    
    medicalTerms.forEach(term => {
      if (content.toLowerCase().includes(term)) {
        findings.push(term);
      }
    });

    return findings;
  }

  private extractRiskLevel(content: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('critical') || lowerContent.includes('emergency') || lowerContent.includes('severe')) return 'critical';
    if (lowerContent.includes('high risk') || lowerContent.includes('concerning') || lowerContent.includes('urgent')) return 'high';
    if (lowerContent.includes('moderate') || lowerContent.includes('medium') || lowerContent.includes('caution')) return 'medium';
    return 'low';
  }

  private extractRecommendations(content: string): string[] {
    const recommendations: string[] = [];
    const commonRecs = [
      'continue medication', 'apply ice', 'keep wound clean', 'contact doctor',
      'monitor symptoms', 'rest and elevate', 'follow up', 'take antibiotics',
      'change dressing', 'avoid activity', 'increase fluids', 'pain management'
    ];

    commonRecs.forEach(rec => {
      if (content.toLowerCase().includes(rec)) {
        recommendations.push(rec);
      }
    });

    return recommendations.length > 0 ? recommendations : ['Follow your recovery plan'];
  }

  private extractUrgentCare(content: string): boolean {
    const urgentKeywords = ['urgent', 'emergency', 'immediate', 'call doctor', 'seek care', 'hospital'];
    return urgentKeywords.some(keyword => content.toLowerCase().includes(keyword));
  }

  private extractHealingProgress(content: string): number | undefined {
    const progressMatch = content.match(/(\d+)%?\s*(?:healed|healing|progress)/i);
    return progressMatch ? parseInt(progressMatch[1]) : undefined;
  }

  // Progress tracking methods
  private async trackHealingProgress(patientId: string, analysis: ConsensusAnalysis): Promise<void> {
    const history = this.analysisHistory.get(patientId) || [];
    const previousAnalyses = history.filter(h => h.imageAnalysis);

    if (previousAnalyses.length > 0) {
      const progressComparison = this.generateProgressComparison(analysis, previousAnalyses);
      
      const progressHistory = this.progressTracking.get(patientId) || [];
      progressHistory.push(progressComparison);
      
      // Keep only last 30 comparisons
      if (progressHistory.length > 30) {
        progressHistory.splice(0, progressHistory.length - 30);
      }
      
      this.progressTracking.set(patientId, progressHistory);
    }
  }

  private generateProgressComparison(current: ConsensusAnalysis, previous: AnalysisResult[]): ProgressComparison {
    const mostRecent = previous[previous.length - 1];
    
    const currentHealing = current.analysis.healingProgress || 0;
    const previousHealing = mostRecent.analysis.healingProgress || 0;
    const healingRate = currentHealing - previousHealing;

    let trendDirection: 'improving' | 'stable' | 'declining';
    if (healingRate > 5) trendDirection = 'improving';
    else if (healingRate < -5) trendDirection = 'declining';
    else trendDirection = 'stable';

    const keyChanges: string[] = [];
    if (current.imageAnalysis && mostRecent.imageAnalysis) {
      if (current.imageAnalysis.infectionSigns !== mostRecent.imageAnalysis.infectionSigns) {
        keyChanges.push(current.imageAnalysis.infectionSigns ? 'Infection signs detected' : 'Infection signs resolved');
      }
      
      if (current.imageAnalysis.woundHealing !== mostRecent.imageAnalysis.woundHealing) {
        keyChanges.push(`Healing status changed from ${mostRecent.imageAnalysis.woundHealing} to ${current.imageAnalysis.woundHealing}`);
      }
    }

    const riskFactors: string[] = [];
    if (current.analysis.riskAssessment === 'high' || current.analysis.riskAssessment === 'critical') {
      riskFactors.push('High risk assessment');
    }
    if (current.imageAnalysis?.infectionSigns) {
      riskFactors.push('Signs of infection');
    }

    return {
      currentAnalysis: current as any, // Type conversion for compatibility
      previousAnalysis: previous,
      progressMetrics: {
        healingRate,
        trendDirection,
        keyChanges,
        timeToHealing: this.estimateTimeToHealing(currentHealing, healingRate),
        riskFactors
      }
    };
  }

  private estimateTimeToHealing(currentProgress: number, healingRate: number): number | undefined {
    if (healingRate <= 0 || currentProgress >= 95) return undefined;
    
    const remainingProgress = 100 - currentProgress;
    const estimatedDays = Math.round(remainingProgress / healingRate);
    
    return estimatedDays > 0 && estimatedDays < 365 ? estimatedDays : undefined;
  }

  private storeAnalysisHistory(patientId: string, results: AnalysisResult[]): void {
    const history = this.analysisHistory.get(patientId) || [];
    history.push(...results);
    
    // Keep only last 100 analyses
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.analysisHistory.set(patientId, history);
  }

  // Public methods for getting analysis history and progress
  getAnalysisHistory(patientId: string): AnalysisResult[] {
    return this.analysisHistory.get(patientId) || [];
  }

  getProgressHistory(patientId: string): ProgressComparison[] {
    return this.progressTracking.get(patientId) || [];
  }

  // Voice command processing
  async processAnalysisVoiceCommand(command: string, patientId: string): Promise<string> {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('analyze') && lowerCommand.includes('photo')) {
      return 'Please take or upload a photo, and I\'ll analyze it using multiple AI models for the most accurate assessment.';
    }

    if (lowerCommand.includes('progress') || lowerCommand.includes('healing')) {
      const progressHistory = this.getProgressHistory(patientId);
      if (progressHistory.length > 0) {
        const latest = progressHistory[progressHistory.length - 1];
        return `Your healing is ${latest.progressMetrics.trendDirection}. ${latest.progressMetrics.keyChanges[0] || 'Continue following your recovery plan.'}`;
      }
      return 'I need more photos to track your healing progress. Please take regular photos of your wound.';
    }

    if (lowerCommand.includes('infection') || lowerCommand.includes('signs')) {
      const history = this.getAnalysisHistory(patientId);
      const recentImageAnalysis = history.filter(h => h.imageAnalysis).slice(-1)[0];
      if (recentImageAnalysis?.imageAnalysis) {
        return recentImageAnalysis.imageAnalysis.infectionSigns ? 
          'Recent analysis detected possible signs of infection. Please contact your healthcare provider.' :
          'No signs of infection detected in your recent photos. Continue monitoring.';
      }
      return 'Please take a photo of your wound so I can check for signs of infection.';
    }

    return 'I can analyze photos, track healing progress, and check for infection signs. What would you like me to help you with?';
  }
}

export const enhancedAIAnalysisService = new EnhancedAIAnalysisService();
export default enhancedAIAnalysisService;
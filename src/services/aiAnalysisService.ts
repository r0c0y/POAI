// Multi-Modal AI Analysis Service for Medical Reports and Images
interface AIProvider {
  name: string;
  apiKey: string;
  baseUrl: string;
  models: {
    text: string;
    vision: string;
    multimodal: string;
  };
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
  };
  imageAnalysis?: {
    woundHealing: 'excellent' | 'good' | 'concerning' | 'poor';
    infectionSigns: boolean;
    healingProgress: number; // 0-100%
    visualChanges: string[];
  };
  rawResponse: any;
}

class AIAnalysisService {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Groq - Fast inference
    this.providers.set('groq', {
      name: 'Groq',
      apiKey: import.meta.env.VITE_GROQ_API_KEY || 'gsk_placeholder',
      baseUrl: 'https://api.groq.com/openai/v1',
      models: {
        text: 'llama-3.1-70b-versatile',
        vision: 'llama-3.2-11b-vision-preview',
        multimodal: 'llama-3.2-90b-vision-preview'
      }
    });

    // OpenAI - High quality
    this.providers.set('openai', {
      name: 'OpenAI',
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'sk-placeholder',
      baseUrl: 'https://api.openai.com/v1',
      models: {
        text: 'gpt-4o',
        vision: 'gpt-4o',
        multimodal: 'gpt-4o'
      }
    });

    // Gemini - Google's model
    this.providers.set('gemini', {
      name: 'Gemini',
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'placeholder',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      models: {
        text: 'gemini-1.5-pro',
        vision: 'gemini-1.5-pro-vision',
        multimodal: 'gemini-1.5-pro'
      }
    });

    // OpenRouter - Multiple models
    this.providers.set('openrouter', {
      name: 'OpenRouter',
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || 'sk-or-placeholder',
      baseUrl: 'https://openrouter.ai/api/v1',
      models: {
        text: 'anthropic/claude-3.5-sonnet',
        vision: 'anthropic/claude-3.5-sonnet',
        multimodal: 'anthropic/claude-3.5-sonnet'
      }
    });
  }

  // Analyze medical text (symptoms, reports, etc.)
  async analyzeText(text: string, context?: any): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    const providers = ['groq', 'openai']; // Use fastest providers for text

    const prompt = this.buildMedicalPrompt(text, context);

    for (const providerName of providers) {
      try {
        const result = await this.callProvider(providerName, 'text', prompt);
        results.push(result);
      } catch (error) {
        console.error(`${providerName} analysis failed:`, error);
      }
    }

    return results;
  }

  // Analyze medical images (wounds, X-rays, etc.)
  async analyzeImage(imageData: string, context?: any): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    const providers = ['openai', 'gemini']; // Use vision-capable models

    const prompt = this.buildImageAnalysisPrompt(context);

    for (const providerName of providers) {
      try {
        const result = await this.callProviderWithImage(providerName, prompt, imageData);
        results.push(result);
      } catch (error) {
        console.error(`${providerName} image analysis failed:`, error);
      }
    }

    return results;
  }

  // Analyze multimodal content (text + images)
  async analyzeMultimodal(text: string, images: string[], context?: any): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    const providers = ['openai', 'gemini'];

    const prompt = this.buildMultimodalPrompt(text, context);

    for (const providerName of providers) {
      try {
        const result = await this.callProviderMultimodal(providerName, prompt, images);
        results.push(result);
      } catch (error) {
        console.error(`${providerName} multimodal analysis failed:`, error);
      }
    }

    return results;
  }

  private buildMedicalPrompt(text: string, context?: any): string {
    return `You are a medical AI assistant analyzing patient information. Provide a structured analysis of the following medical content:

Patient Context: ${context ? JSON.stringify(context) : 'Not provided'}
Medical Content: "${text}"

Please analyze and provide:
1. Medical findings and symptoms identified
2. Risk assessment (low/medium/high/critical)
3. Specific recommendations
4. Whether follow-up is required
5. Whether urgent care is needed

Respond in JSON format:
{
  "medicalFindings": ["finding1", "finding2"],
  "riskAssessment": "low|medium|high|critical",
  "recommendations": ["rec1", "rec2"],
  "followUpRequired": true|false,
  "urgentCare": true|false,
  "reasoning": "explanation of assessment"
}`;
  }

  private buildImageAnalysisPrompt(context?: any): string {
    return `You are a medical AI analyzing a wound/incision image for post-operative care. Analyze the image for:

1. Wound healing progress (excellent/good/concerning/poor)
2. Signs of infection (redness, swelling, discharge)
3. Healing percentage (0-100%)
4. Visual changes from normal healing

Patient Context: ${context ? JSON.stringify(context) : 'Post-operative patient'}

Respond in JSON format:
{
  "woundHealing": "excellent|good|concerning|poor",
  "infectionSigns": true|false,
  "healingProgress": 0-100,
  "visualChanges": ["change1", "change2"],
  "medicalFindings": ["finding1"],
  "riskAssessment": "low|medium|high|critical",
  "recommendations": ["rec1", "rec2"],
  "urgentCare": true|false
}`;
  }

  private buildMultimodalPrompt(text: string, context?: any): string {
    return `Analyze both the patient's description and the provided images for comprehensive medical assessment:

Patient Description: "${text}"
Context: ${context ? JSON.stringify(context) : 'Post-operative care'}

Provide comprehensive analysis combining text and visual information.

Respond in JSON format with complete medical assessment.`;
  }

  private async callProvider(providerName: string, type: 'text' | 'vision' | 'multimodal', prompt: string): Promise<AnalysisResult> {
    const provider = this.providers.get(providerName);
    if (!provider) throw new Error(`Provider ${providerName} not found`);

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.models[type],
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`${provider.name} API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      const analysis = JSON.parse(content);
      return {
        provider: provider.name,
        confidence: 0.9,
        analysis,
        rawResponse: data
      };
    } catch (error) {
      // Fallback parsing if JSON is malformed
      return {
        provider: provider.name,
        confidence: 0.7,
        analysis: this.parseNonJsonResponse(content),
        rawResponse: data
      };
    }
  }

  private async callProviderWithImage(providerName: string, prompt: string, imageData: string): Promise<AnalysisResult> {
    const provider = this.providers.get(providerName);
    if (!provider) throw new Error(`Provider ${providerName} not found`);

    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: imageData
            }
          }
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
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`${provider.name} API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      const analysis = JSON.parse(content);
      return {
        provider: provider.name,
        confidence: 0.9,
        analysis,
        imageAnalysis: analysis,
        rawResponse: data
      };
    } catch (error) {
      return {
        provider: provider.name,
        confidence: 0.7,
        analysis: this.parseNonJsonResponse(content),
        rawResponse: data
      };
    }
  }

  private async callProviderMultimodal(providerName: string, prompt: string, images: string[]): Promise<AnalysisResult> {
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
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`${provider.name} API error: ${response.statusText}`);
    }

    const data = await response.json();
    const responseContent = data.choices[0].message.content;

    try {
      const analysis = JSON.parse(responseContent);
      return {
        provider: provider.name,
        confidence: 0.95,
        analysis,
        imageAnalysis: analysis,
        rawResponse: data
      };
    } catch (error) {
      return {
        provider: provider.name,
        confidence: 0.8,
        analysis: this.parseNonJsonResponse(responseContent),
        rawResponse: data
      };
    }
  }

  private parseNonJsonResponse(content: string): any {
    // Fallback parser for non-JSON responses
    const findings = this.extractFindings(content);
    const riskLevel = this.extractRiskLevel(content);
    const recommendations = this.extractRecommendations(content);

    return {
      medicalFindings: findings,
      riskAssessment: riskLevel,
      recommendations,
      followUpRequired: content.toLowerCase().includes('follow-up') || content.toLowerCase().includes('follow up'),
      urgentCare: content.toLowerCase().includes('urgent') || content.toLowerCase().includes('emergency'),
      reasoning: content
    };
  }

  private extractFindings(content: string): string[] {
    const findings: string[] = [];
    const medicalTerms = ['pain', 'swelling', 'redness', 'discharge', 'fever', 'infection', 'healing', 'inflammation'];
    
    medicalTerms.forEach(term => {
      if (content.toLowerCase().includes(term)) {
        findings.push(term);
      }
    });

    return findings;
  }

  private extractRiskLevel(content: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('critical') || lowerContent.includes('emergency')) return 'critical';
    if (lowerContent.includes('high risk') || lowerContent.includes('concerning')) return 'high';
    if (lowerContent.includes('moderate') || lowerContent.includes('medium')) return 'medium';
    return 'low';
  }

  private extractRecommendations(content: string): string[] {
    const recommendations: string[] = [];
    const commonRecs = [
      'continue medication',
      'apply ice',
      'keep wound clean',
      'contact doctor',
      'monitor symptoms',
      'rest and elevate',
      'follow up'
    ];

    commonRecs.forEach(rec => {
      if (content.toLowerCase().includes(rec)) {
        recommendations.push(rec);
      }
    });

    return recommendations.length > 0 ? recommendations : ['Follow your recovery plan'];
  }

  // Get consensus from multiple AI providers
  getConsensusAnalysis(results: AnalysisResult[]): AnalysisResult {
    if (results.length === 0) {
      throw new Error('No analysis results provided');
    }

    if (results.length === 1) {
      return results[0];
    }

    // Combine findings from all providers
    const allFindings = results.flatMap(r => r.analysis.medicalFindings);
    const uniqueFindings = [...new Set(allFindings)];

    // Get highest risk assessment
    const riskLevels = results.map(r => r.analysis.riskAssessment);
    const highestRisk = this.getHighestRisk(riskLevels);

    // Combine recommendations
    const allRecommendations = results.flatMap(r => r.analysis.recommendations);
    const uniqueRecommendations = [...new Set(allRecommendations)];

    // Check if any provider suggests urgent care
    const urgentCare = results.some(r => r.analysis.urgentCare);
    const followUpRequired = results.some(r => r.analysis.followUpRequired);

    // Calculate average confidence
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

    return {
      provider: 'Consensus',
      confidence: avgConfidence,
      analysis: {
        medicalFindings: uniqueFindings,
        riskAssessment: highestRisk,
        recommendations: uniqueRecommendations,
        followUpRequired,
        urgentCare
      },
      rawResponse: results
    };
  }

  private getHighestRisk(risks: string[]): 'low' | 'medium' | 'high' | 'critical' {
    if (risks.includes('critical')) return 'critical';
    if (risks.includes('high')) return 'high';
    if (risks.includes('medium')) return 'medium';
    return 'low';
  }
}

export const aiAnalysisService = new AIAnalysisService();
export default aiAnalysisService;
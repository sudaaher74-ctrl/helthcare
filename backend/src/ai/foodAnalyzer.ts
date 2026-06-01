// LifeOS AI Food Analyzer — Orchestrates provider selection and fallback
import { AIProvider, FoodAnalysisResult } from './types';
import { MockAIProvider } from './providers/mockProvider';
import { OpenAIProvider } from './providers/openaiProvider';

class FoodAnalyzerService {
  private provider: AIProvider;

  constructor() {
    const selected = process.env.AI_PROVIDER || 'mock';

    if (selected === 'openai' && process.env.OPENAI_API_KEY) {
      this.provider = new OpenAIProvider(process.env.OPENAI_API_KEY);
      console.log('[AI] Using OpenAI GPT-4o Vision provider');
    } else {
      this.provider = new MockAIProvider();
      console.log('[AI] Using Mock provider (set AI_PROVIDER + API key to activate real AI)');
    }
  }

  async analyze(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<FoodAnalysisResult> {
    try {
      return await this.provider.analyzeFood(imageBase64, mimeType);
    } catch (error) {
      console.error('[AI] Primary provider failed, falling back to mock:', error);
      const mock = new MockAIProvider();
      return mock.analyzeFood(imageBase64, mimeType);
    }
  }
}

export const foodAnalyzer = new FoodAnalyzerService();

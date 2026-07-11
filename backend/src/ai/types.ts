// LifeOS — Modular AI Food Analyzer Service
// Supports: OpenAI GPT-4o Vision, Google Gemini Vision, Anthropic Claude Vision, Mock

export interface FoodAnalysisResult {
  foods: {
    name: string;
    portionSize: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    confidence: number;
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  analysisNotes: string;
  provider: string;
}

export interface ParsedCommand {
  intent: 'CREATE_WORKOUT' | 'CREATE_TASK' | 'LOG_WATER' | 'LOG_MEAL' | 'LOG_EXPENSE' | 'UNKNOWN';
  data: any;
  message?: string;
}

export interface AIProvider {
  analyzeFood(imageBase64: string, mimeType: string): Promise<FoodAnalysisResult>;
  parseVoiceCommand?(text: string): Promise<ParsedCommand>;
  generateCrossPillarInsights?(weeklyData: any): Promise<string[]>;
}

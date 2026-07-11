// Mock AI Provider — Returns realistic nutrition estimates for demonstration
// Replace with real OpenAI/Gemini/Claude provider when API keys are available

import { AIProvider, FoodAnalysisResult, ParsedCommand } from '../types';

const MOCK_FOODS = [
  { name: 'Rice (White, Cooked)', portionSize: '1 cup (186g)', calories: 242, protein: 4.4, carbs: 53.2, fat: 0.4, fiber: 0.6, sugar: 0.1 },
  { name: 'Chicken Breast (Grilled)', portionSize: '150g', calories: 248, protein: 46.5, carbs: 0, fat: 5.4, fiber: 0, sugar: 0 },
  { name: 'Roti (Whole Wheat)', portionSize: '2 pieces (60g)', calories: 198, protein: 6.2, carbs: 38.4, fat: 3.6, fiber: 4.2, sugar: 0.8 },
  { name: 'Dal (Lentil Curry)', portionSize: '1 bowl (200g)', calories: 176, protein: 12.4, carbs: 28.8, fat: 2.2, fiber: 8.6, sugar: 2.4 },
  { name: 'Paneer Curry', portionSize: '150g', calories: 312, protein: 18.6, carbs: 8.4, fat: 22.8, fiber: 1.2, sugar: 3.6 },
  { name: 'Salad (Mixed Vegetables)', portionSize: '1 plate (200g)', calories: 52, protein: 2.8, carbs: 10.4, fat: 0.4, fiber: 3.8, sugar: 5.6 },
  { name: 'Banana', portionSize: '1 medium (120g)', calories: 107, protein: 1.3, carbs: 27.5, fat: 0.4, fiber: 3.1, sugar: 14.8 },
  { name: 'Egg (Boiled)', portionSize: '2 eggs (100g)', calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6, fiber: 0, sugar: 1.1 },
  { name: 'Oatmeal with Milk', portionSize: '1 bowl (300g)', calories: 296, protein: 12.4, carbs: 52.6, fat: 6.2, fiber: 5.4, sugar: 8.8 },
  { name: 'Mixed Meal', portionSize: 'Regular serving', calories: 380, protein: 18.2, carbs: 52.4, fat: 10.6, fiber: 5.2, sugar: 6.8 },
];

export class MockAIProvider implements AIProvider {
  async analyzeFood(_imageBase64: string, _mimeType: string): Promise<FoodAnalysisResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Return 1-3 random food items
    const count = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...MOCK_FOODS].sort(() => Math.random() - 0.5);
    const foods = shuffled.slice(0, count).map((f) => ({ ...f, confidence: 0.75 + Math.random() * 0.2 }));

    const totals = foods.reduce(
      (acc, f) => ({
        totalCalories: acc.totalCalories + f.calories,
        totalProtein: acc.totalProtein + f.protein,
        totalCarbs: acc.totalCarbs + f.carbs,
        totalFat: acc.totalFat + f.fat,
        totalFiber: acc.totalFiber + f.fiber,
        totalSugar: acc.totalSugar + f.sugar,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalFiber: 0, totalSugar: 0 }
    );

    return {
      foods,
      ...totals,
      analysisNotes: 'This is a demo analysis. Connect OpenAI, Gemini, or Claude API for real food recognition.',
      provider: 'mock',
    };
  }

  async parseVoiceCommand(text: string): Promise<ParsedCommand> {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate AI delay
    const lowerText = text.toLowerCase();

    // Simple keyword matching to mock an AI NLP intent parser
    if (lowerText.includes('workout') || lowerText.includes('gym')) {
      return {
        intent: 'CREATE_WORKOUT',
        data: {
          name: 'AI Generated Workout',
          duration: parseInt(lowerText.match(/(\d+)\s*(min|minute)/)?.[1] || '60', 10),
          notes: `Parsed from voice: "${text}"`,
        },
        message: 'Understood. Adding a workout.',
      };
    }
    
    if (lowerText.includes('water') || lowerText.includes('drink')) {
      return {
        intent: 'LOG_WATER',
        data: {
          amountML: parseInt(lowerText.match(/(\d+)\s*(ml|glass|liter)/)?.[1] || '250', 10),
        },
        message: 'Got it. Logging water.',
      };
    }

    // Default to creating a task if not specifically a workout or water
    return {
      intent: 'CREATE_TASK',
      data: {
        title: text.trim(),
      },
      message: 'Task added successfully.',
    };
  }
}

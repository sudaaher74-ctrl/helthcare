// OpenAI GPT-4o Vision Provider
import { AIProvider, FoodAnalysisResult } from '../types';

export class OpenAIProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeFood(imageBase64: string, mimeType: string): Promise<FoodAnalysisResult> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this food image and provide detailed nutritional information. 
                Return ONLY a valid JSON object with this exact structure:
                {
                  "foods": [{"name": "string", "portionSize": "string", "calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number, "sugar": number, "confidence": number}],
                  "totalCalories": number, "totalProtein": number, "totalCarbs": number, "totalFat": number, "totalFiber": number, "totalSugar": number,
                  "analysisNotes": "string"
                }
                Confidence should be between 0 and 1. All macros in grams.`,
              },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${imageBase64}` },
              },
            ],
          },
        ],
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
    const data: any = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return { ...result, provider: 'openai' };
  }
}

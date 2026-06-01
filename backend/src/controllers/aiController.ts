import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { foodAnalyzer } from '../ai/foodAnalyzer';

// POST /api/ai/analyze-food
export const analyzeFood = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'imageBase64 is required' });
    }
    const result = await foodAnalyzer.analyze(imageBase64, mimeType || 'image/jpeg');
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
};

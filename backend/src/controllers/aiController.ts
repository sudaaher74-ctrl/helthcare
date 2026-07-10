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

// POST /api/ai/process-voice-command
export const processVoiceCommand = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }

    const parsed = await foodAnalyzer.parseVoiceCommand(text);

    if (parsed.intent === 'UNKNOWN') {
      return res.json({ success: false, message: parsed.message, parsed });
    }

    // Execute actions based on intent
    if (parsed.intent === 'CREATE_WORKOUT') {
      await prisma.workoutSession.create({
        data: {
          userId: req.user!.id,
          date: new Date(),
          name: parsed.data.name || 'Voice Workout',
          category: parsed.data.category || 'FULL_BODY',
          durationMinutes: parsed.data.duration || 60,
          notes: parsed.data.notes,
        }
      });
    } else if (parsed.intent === 'LOG_WATER') {
      await prisma.waterLog.create({
        data: {
          userId: req.user!.id,
          date: new Date(),
          amountML: parsed.data.amountML || 250,
        }
      });
    } else if (parsed.intent === 'CREATE_TASK') {
      await prisma.task.create({
        data: {
          userId: req.user!.id,
          title: parsed.data.title,
          status: 'BACKLOG',
          dueDate: new Date(),
        }
      });
    }

    res.json({ success: true, message: parsed.message, parsed });
  } catch (e) {
    next(e);
  }
};

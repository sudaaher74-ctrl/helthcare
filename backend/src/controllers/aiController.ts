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
      const todayWeekday = ((new Date().getDay() + 6) % 7) + 1;
      const plan = await prisma.workoutPlan.findFirst({ where: { userId: req.user!.id, active: true } });
      
      if (plan) {
        const days = plan.days as any[];
        const dayIdx = days.findIndex(d => d.weekday === todayWeekday);
        
        if (dayIdx >= 0) {
          const workoutName = parsed.data.name?.toLowerCase() || '';
          let selectedExercises = [];
          let focus = parsed.data.category || 'Strength';
          
          if (workoutName.includes('chest') || workoutName.includes('push')) {
            focus = 'Chest Focus';
            selectedExercises = [
              { name: 'Barbell Bench Press', muscleGroup: 'CHEST', sets: 4, reps: '8-12', restSeconds: 90, steps: ['Lie flat on bench', 'Lower bar under control', 'Press back up explosively'] },
              { name: 'Incline Dumbbell Press', muscleGroup: 'CHEST', sets: 3, reps: '10-15', restSeconds: 60, steps: ['Sit on incline bench', 'Lower dumbbells to chest level', 'Press up and together'] },
              { name: 'Triceps Pushdown', muscleGroup: 'TRICEPS', sets: 3, reps: '12-15', restSeconds: 60, steps: ['Attach rope to high cable', 'Keep elbows pinned to sides', 'Extend arms downward'] }
            ];
          } else if (workoutName.includes('leg') || workoutName.includes('lower')) {
            focus = 'Legs Focus';
            selectedExercises = [
              { name: 'Barbell Back Squat', muscleGroup: 'LEGS', sets: 4, reps: '8-12', restSeconds: 120, steps: ['Bar on upper back', 'Brace core and sit back', 'Drive through heels to stand up'] },
              { name: 'Leg Press', muscleGroup: 'LEGS', sets: 3, reps: '10-15', restSeconds: 90, steps: ['Sit in machine', 'Lower platform by bending knees', 'Press back up without locking knees'] },
              { name: 'Standing Calf Raise', muscleGroup: 'CALVES', sets: 3, reps: '15-20', restSeconds: 45, steps: ['Stand on raised edge', 'Let heels drop for a stretch', 'Push up on toes'] }
            ];
          } else if (workoutName.includes('back') || workoutName.includes('pull')) {
            focus = 'Back Focus';
            selectedExercises = [
              { name: 'Lat Pulldown', muscleGroup: 'BACK', sets: 4, reps: '8-12', restSeconds: 90, steps: ['Sit at machine', 'Pull bar to upper chest', 'Control bar back up'] },
              { name: 'Seated Cable Row', muscleGroup: 'BACK', sets: 3, reps: '10-12', restSeconds: 90, steps: ['Sit tall with flat back', 'Pull handle to belly', 'Extend arms back slowly'] },
              { name: 'Barbell Bicep Curl', muscleGroup: 'BICEPS', sets: 3, reps: '10-15', restSeconds: 60, steps: ['Stand holding barbell', 'Curl bar to shoulders', 'Lower slowly'] }
            ];
          } else {
            focus = 'Full Body';
            selectedExercises = [
              { name: 'Push-ups', muscleGroup: 'CHEST', sets: 3, reps: 'AMRAP', restSeconds: 60, steps: ['Plank position', 'Lower body', 'Push up'] },
              { name: 'Bodyweight Squats', muscleGroup: 'LEGS', sets: 3, reps: '20', restSeconds: 60, steps: ['Stand tall', 'Squat down', 'Stand up'] },
              { name: 'Plank', muscleGroup: 'CORE', sets: 3, reps: '60s', restSeconds: 45, steps: ['Rest on forearms', 'Form straight line', 'Hold position'] }
            ];
          }
          
          days[dayIdx] = {
            weekday: todayWeekday,
            title: parsed.data.name || 'AI Planned Workout',
            focus: focus,
            isRest: false,
            exercises: selectedExercises
          };
          
          await prisma.workoutPlan.update({
            where: { id: plan.id },
            data: { days }
          });
        }
      }
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

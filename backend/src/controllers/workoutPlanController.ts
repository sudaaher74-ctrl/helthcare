import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { EXERCISES, buildDefaultPlanDays } from '../data/exerciseLibrary';

// GET /api/workout-plan — returns the user's active weekly plan, seeding a
// sensible default the first time.
export const getPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    let plan = await prisma.workoutPlan.findFirst({ where: { userId, active: true } });

    if (!plan) {
      plan = await prisma.workoutPlan.create({
        data: {
          userId,
          name: 'My Weekly Plan',
          goal: 'GENERAL',
          level: 'BEGINNER',
          active: true,
          days: buildDefaultPlanDays() as any,
        },
      });
    }

    res.json({ success: true, data: plan });
  } catch (e) { next(e); }
};

// PUT /api/workout-plan — replace the plan's meta + days.
export const updatePlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { name, goal, level, days } = req.body;

    const existing = await prisma.workoutPlan.findFirst({ where: { userId, active: true } });
    if (!existing) return res.status(404).json({ success: false, message: 'No active plan' });

    const plan = await prisma.workoutPlan.update({
      where: { id: existing.id },
      data: {
        ...(name !== undefined && { name }),
        ...(goal !== undefined && { goal }),
        ...(level !== undefined && { level }),
        ...(days !== undefined && { days }),
      },
    });

    res.json({ success: true, data: plan });
  } catch (e) { next(e); }
};

// POST /api/workout-plan/reset — restore the default Mon–Sat split.
export const resetPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const existing = await prisma.workoutPlan.findFirst({ where: { userId, active: true } });

    if (existing) {
      const plan = await prisma.workoutPlan.update({
        where: { id: existing.id },
        data: { days: buildDefaultPlanDays() as any },
      });
      return res.json({ success: true, data: plan });
    }

    const plan = await prisma.workoutPlan.create({
      data: { userId, active: true, days: buildDefaultPlanDays() as any },
    });
    res.json({ success: true, data: plan });
  } catch (e) { next(e); }
};

// GET /api/workout-plan/library — the exercise catalog for building/editing days.
export const getLibrary = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: Object.values(EXERCISES) });
  } catch (e) { next(e); }
};
export const manualPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { weekday, focus } = req.body;
    
    if (!weekday || !focus) {
      return res.status(400).json({ success: false, message: 'weekday and focus are required' });
    }

    const plan = await prisma.workoutPlan.findFirst({ where: { userId, active: true } });
    if (!plan) return res.status(404).json({ success: false, message: 'No active plan' });

    const days = plan.days as any[];
    const dayIdx = days.findIndex(d => d.weekday === weekday);
    
    if (dayIdx >= 0) {
      let selectedExercises = [];
      let focusLabel = focus;
      
      const workoutName = focus.toLowerCase();
      
      if (workoutName.includes('chest') || workoutName.includes('push')) {
        focusLabel = 'Chest Focus';
        selectedExercises = [
          { name: 'Barbell Bench Press', muscleGroup: 'CHEST', sets: 4, reps: '8-12', restSeconds: 90, steps: ['Lie flat on bench', 'Lower bar under control', 'Press back up explosively'] },
          { name: 'Incline Dumbbell Press', muscleGroup: 'CHEST', sets: 3, reps: '10-15', restSeconds: 60, steps: ['Sit on incline bench', 'Lower dumbbells to chest level', 'Press up and together'] },
          { name: 'Triceps Pushdown', muscleGroup: 'TRICEPS', sets: 3, reps: '12-15', restSeconds: 60, steps: ['Attach rope to high cable', 'Keep elbows pinned to sides', 'Extend arms downward'] }
        ];
      } else if (workoutName.includes('leg') || workoutName.includes('lower')) {
        focusLabel = 'Legs Focus';
        selectedExercises = [
          { name: 'Barbell Back Squat', muscleGroup: 'LEGS', sets: 4, reps: '8-12', restSeconds: 120, steps: ['Bar on upper back', 'Brace core and sit back', 'Drive through heels to stand up'] },
          { name: 'Leg Press', muscleGroup: 'LEGS', sets: 3, reps: '10-15', restSeconds: 90, steps: ['Sit in machine', 'Lower platform by bending knees', 'Press back up without locking knees'] },
          { name: 'Standing Calf Raise', muscleGroup: 'CALVES', sets: 3, reps: '15-20', restSeconds: 45, steps: ['Stand on raised edge', 'Let heels drop for a stretch', 'Push up on toes'] }
        ];
      } else if (workoutName.includes('back') || workoutName.includes('pull')) {
        focusLabel = 'Back Focus';
        selectedExercises = [
          { name: 'Lat Pulldown', muscleGroup: 'BACK', sets: 4, reps: '8-12', restSeconds: 90, steps: ['Sit at machine', 'Pull bar to upper chest', 'Control bar back up'] },
          { name: 'Seated Cable Row', muscleGroup: 'BACK', sets: 3, reps: '10-12', restSeconds: 90, steps: ['Sit tall with flat back', 'Pull handle to belly', 'Extend arms back slowly'] },
          { name: 'Barbell Bicep Curl', muscleGroup: 'BICEPS', sets: 3, reps: '10-15', restSeconds: 60, steps: ['Stand holding barbell', 'Curl bar to shoulders', 'Lower slowly'] }
        ];
      } else {
        focusLabel = 'Full Body';
        selectedExercises = [
          { name: 'Push-ups', muscleGroup: 'CHEST', sets: 3, reps: 'AMRAP', restSeconds: 60, steps: ['Plank position', 'Lower body', 'Push up'] },
          { name: 'Bodyweight Squats', muscleGroup: 'LEGS', sets: 3, reps: '20', restSeconds: 60, steps: ['Stand tall', 'Squat down', 'Stand up'] },
          { name: 'Plank', muscleGroup: 'CORE', sets: 3, reps: '60s', restSeconds: 45, steps: ['Rest on forearms', 'Form straight line', 'Hold position'] }
        ];
      }
      
      days[dayIdx] = {
        weekday: weekday,
        title: focusLabel,
        focus: focusLabel,
        isRest: false,
        exercises: selectedExercises
      };
      
      const updated = await prisma.workoutPlan.update({
        where: { id: plan.id },
        data: { days }
      });
      return res.json({ success: true, data: updated });
    }
    
    res.status(404).json({ success: false, message: 'Day not found in plan' });
  } catch (e) { next(e); }
};

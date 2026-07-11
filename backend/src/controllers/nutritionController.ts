import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

// GET /api/nutrition/meals?date=YYYY-MM-DD
export const getMeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const meals = await prisma.meal.findMany({
      where: { userId: req.user!.id, date: targetDate },
      include: { foodEntries: true },
      orderBy: { mealType: 'asc' },
    });

    // Daily totals
    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.totalCalories,
        protein: acc.protein + meal.totalProtein,
        carbs: acc.carbs + meal.totalCarbs,
        fat: acc.fat + meal.totalFat,
        fiber: acc.fiber + meal.totalFiber,
        sugar: acc.sugar + meal.totalSugar,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
    );

    // Water
    const waterLogs = await prisma.waterLog.findMany({
      where: { userId: req.user!.id, date: targetDate },
    });
    const totalWaterML = waterLogs.reduce((acc, w) => acc + w.amountML, 0);

    res.json({ success: true, data: { meals, totals, waterML: totalWaterML } });
  } catch (e) { next(e); }
};

// POST /api/nutrition/meals
export const createMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, mealType, name, notes, foodEntries } = req.body;
    const mealDate = date ? new Date(date) : new Date();
    mealDate.setHours(0, 0, 0, 0);

    // Calculate totals from food entries
    const totals = (foodEntries || []).reduce(
      (acc: any, f: any) => {
        const ratio = (f.quantity * f.servingSize) / 100;
        return {
          calories: acc.calories + f.calories * ratio,
          protein: acc.protein + f.protein * ratio,
          carbs: acc.carbs + f.carbs * ratio,
          fat: acc.fat + f.fat * ratio,
          fiber: acc.fiber + (f.fiber || 0) * ratio,
          sugar: acc.sugar + (f.sugar || 0) * ratio,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
    );

    const meal = await prisma.meal.create({
      data: {
        userId: req.user!.id,
        date: mealDate,
        mealType,
        name,
        notes,
        ...Object.fromEntries(Object.entries(totals).map(([k, v]) => [`total${k.charAt(0).toUpperCase() + k.slice(1)}`, v])),
        foodEntries: {
          create: (foodEntries || []).map((f: any) => ({
            foodName: f.foodName,
            brand: f.brand,
            quantity: f.quantity || 1,
            servingSize: f.servingSize || 100,
            servingUnit: f.servingUnit || 'g',
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat,
            fiber: f.fiber || 0,
            sugar: f.sugar || 0,
            sodium: f.sodium || 0,
          })),
        },
      },
      include: { foodEntries: true },
    });

    res.status(201).json({ success: true, data: meal });
  } catch (e) { next(e); }
};

// PUT /api/nutrition/meals/:id
export const updateMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const meal = await prisma.meal.updateMany({
      where: { id, userId: req.user!.id },
      data: req.body,
    });
    res.json({ success: true, data: meal });
  } catch (e) { next(e); }
};

// DELETE /api/nutrition/meals/:id
export const deleteMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.meal.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
    res.json({ success: true, message: 'Meal deleted' });
  } catch (e) { next(e); }
};

// POST /api/nutrition/water
export const logWater = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amountML, date } = req.body;
    const logDate = date ? new Date(date) : new Date();
    logDate.setHours(0, 0, 0, 0);
    const log = await prisma.waterLog.create({
      data: { userId: req.user!.id, amountML, date: logDate },
    });
    res.status(201).json({ success: true, data: log });
  } catch (e) { next(e); }
};

// GET /api/nutrition/coach — AI Diet Coach recommendations
export const getDietCoach = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { dailyCalorieGoal: true, dailyProteinGoal: true, dailyWaterGoal: true,
                dailyCarbGoal: true, dailyFatGoal: true, currentWeight: true, targetWeight: true },
    });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const meals = await prisma.meal.findMany({ where: { userId: req.user!.id, date: today } });
    const waterLogs = await prisma.waterLog.findMany({ where: { userId: req.user!.id, date: today } });

    const consumed = {
      calories: meals.reduce((a, m) => a + m.totalCalories, 0),
      protein: meals.reduce((a, m) => a + m.totalProtein, 0),
      water: waterLogs.reduce((a, w) => a + w.amountML, 0) / 1000,
    };

    const goals = { calories: user?.dailyCalorieGoal || 2800, protein: user?.dailyProteinGoal || 150, water: user?.dailyWaterGoal || 3 };
    const gaps = { calories: goals.calories - consumed.calories, protein: goals.protein - consumed.protein, water: goals.water - consumed.water };

    const recommendations: string[] = [];
    const suggestions: { food: string; reason: string; calories: number; protein: number }[] = [];

    if (gaps.calories > 300) {
      recommendations.push(`🔥 You need ${Math.round(gaps.calories)} more calories today. Add a high-calorie snack!`);
      suggestions.push({ food: 'Peanut Butter (2 tbsp)', reason: 'High calorie, healthy fats', calories: 188, protein: 8 });
      suggestions.push({ food: 'Banana + Milk Shake', reason: 'Quick calorie boost', calories: 250, protein: 10 });
    }
    if (gaps.protein > 20) {
      recommendations.push(`💪 You need ${Math.round(gaps.protein)}g more protein. Focus on protein-rich foods.`);
      suggestions.push({ food: 'Chicken Breast (150g)', reason: 'Lean protein for muscle gain', calories: 248, protein: 46 });
      suggestions.push({ food: 'Paneer (100g)', reason: 'High protein vegetarian option', calories: 265, protein: 18 });
      suggestions.push({ food: 'Eggs (3 whole)', reason: 'Complete amino acid profile', calories: 216, protein: 18 });
    }
    if (gaps.water > 0.5) {
      recommendations.push(`💧 Drink ${gaps.water.toFixed(1)}L more water today.`);
    }

    const nutritionScore = Math.round(
      ((Math.min(consumed.calories, goals.calories) / goals.calories) * 40 +
       (Math.min(consumed.protein, goals.protein) / goals.protein) * 40 +
       (Math.min(consumed.water, goals.water) / goals.water) * 20)
    );

    res.json({
      success: true,
      data: { consumed, goals, gaps, recommendations, suggestions, nutritionScore },
    });
  } catch (e) { next(e); }
};

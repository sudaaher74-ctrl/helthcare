import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

// GET /api/dashboard
export const getDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [user, todayHabits, habitLogs, meals, waterLogs, weightLogs, sleepLogs,
           tasks, streaks, workoutSessions, userAchievements] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId },
        select: { name: true, currentWeight: true, targetWeight: true, dailyCalorieGoal: true,
                  dailyProteinGoal: true, dailyWaterGoal: true, avatar: true,
                  xp: true, level: true, lifePoints: true } }),
      prisma.habit.findMany({ where: { userId, isActive: true },
        include: { logs: { where: { date: today } } } }),
      prisma.habitLog.findMany({ where: { userId, date: { gte: sevenDaysAgo }, completed: true } }),
      prisma.meal.findMany({ where: { userId, date: today } }),
      prisma.waterLog.findMany({ where: { userId, date: today } }),
      prisma.weightLog.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 14 }),
      prisma.sleepLog.findUnique({ where: { userId_date: { userId, date: today } } }),
      prisma.task.findMany({ where: { userId, status: { notIn: ['DONE', 'CANCELLED'] } }, orderBy: { createdAt: 'desc' } }),
      prisma.streak.findMany({ where: { userId } }),
      prisma.workoutSession.findMany({ where: { userId, date: today, isCompleted: true } }),
      prisma.userAchievement.findMany({ where: { userId }, include: { achievement: true },
        orderBy: { unlockedAt: 'desc' }, take: 5 }),
    ]);

    // Calculate today's nutrition
    const todayCalories = meals.reduce((a, m) => a + m.totalCalories, 0);
    const todayProtein = meals.reduce((a, m) => a + m.totalProtein, 0);
    const todayWater = waterLogs.reduce((a, w) => a + w.amountML, 0) / 1000;

    // Habit completion
    const totalHabits = todayHabits.length;
    const completedHabits = todayHabits.filter((h) => h.logs.length > 0 && h.logs[0].completed).length;
    const habitRate = totalHabits ? Math.round((completedHabits / totalHabits) * 100) : 0;

    // Weekly habit rate
    const weeklyHabitRate = Math.round((habitLogs.length / Math.max(totalHabits * 7, 1)) * 100);

    // Scores (0-100)
    const nutritionScore = Math.round(
      Math.min(((todayCalories / (user?.dailyCalorieGoal || 2800)) * 40 +
               (todayProtein / (user?.dailyProteinGoal || 150)) * 40 +
               (todayWater / (user?.dailyWaterGoal || 3)) * 20), 100)
    );
    const healthScore = Math.round(
      (workoutSessions.length > 0 ? 40 : 0) +
      (sleepLogs ? Math.min((sleepLogs.durationMinutes / 480) * 35, 35) : 0) +
      (user?.currentWeight && user?.targetWeight ? Math.min(25, Math.max(0, 25 - Math.abs(user.targetWeight - user.currentWeight) * 5)) : 0)
    );
    const disciplineScore = Math.round(
      habitRate * 0.6 + weeklyHabitRate * 0.4
    );
    const productivityScore = Math.min(100, Math.round(
      (tasks.filter((t) => t.status === 'DONE').length / Math.max(tasks.length, 1)) * 100
    ));
    const lifeScore = Math.round(
      healthScore * 0.3 + nutritionScore * 0.25 + disciplineScore * 0.25 + productivityScore * 0.2
    );

    const MOTIVATIONAL_QUOTES = [
      { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
      { quote: "It's not about having time, it's about making time.", author: "Unknown" },
      { quote: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
      { quote: "Discipline is doing what needs to be done, even when you don't want to.", author: "Unknown" },
      { quote: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Unknown" },
      { quote: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
      { quote: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    ];
    const todayQuote = MOTIVATIONAL_QUOTES[new Date().getDay() % MOTIVATIONAL_QUOTES.length];

    // Gamification - calculate next level XP
    const nextLevelXp = Math.floor(1000 * Math.pow(1.5, (user?.level || 1) - 1));

    // Today's Mission (Non-negotiables)
    const missionItems = [
      { id: 'water', label: `Drink ${user?.dailyWaterGoal || 3}L Water`, completed: todayWater >= (user?.dailyWaterGoal || 3) },
      { id: 'protein', label: `Eat ${user?.dailyProteinGoal || 150}g Protein`, completed: todayProtein >= (user?.dailyProteinGoal || 150) },
      { id: 'workout', label: 'Complete Workout', completed: workoutSessions.length > 0 },
      { id: 'habits', label: 'Complete Daily Habits', completed: habitRate >= 80 }
    ];
    const missionProgress = missionItems.filter(m => m.completed).length;

    // AI Coach Message Generation
    let aiCoachMessage = `Good ${getGreeting()} ${user?.name?.split(' ')[0] || ''} 👋\n\nToday you still need:\n`;
    let needsAdded = false;
    if (todayWater < (user?.dailyWaterGoal || 3)) {
      aiCoachMessage += `💧 ${parseFloat(((user?.dailyWaterGoal || 3) - todayWater).toFixed(1))}L Water\n`;
      needsAdded = true;
    }
    if (todayProtein < (user?.dailyProteinGoal || 150)) {
      aiCoachMessage += `🥩 ${Math.round((user?.dailyProteinGoal || 150) - todayProtein)}g Protein\n`;
      needsAdded = true;
    }
    if (workoutSessions.length === 0) {
      aiCoachMessage += `🏋️ Workout Session\n`;
      needsAdded = true;
    }
    
    if (!needsAdded) {
      aiCoachMessage = `Amazing work ${user?.name?.split(' ')[0] || ''}! 🔥\nYou have completed all your core daily goals. Keep this momentum going!`;
    } else {
      aiCoachMessage += `\nCompleting these tasks will increase your Life Score and earn you +50 XP.`;
    }

    res.json({
      success: true,
      data: {
        user,
        scores: { lifeScore, healthScore, nutritionScore, disciplineScore, productivityScore },
        todayStats: {
          calories: Math.round(todayCalories),
          calorieGoal: user?.dailyCalorieGoal || 2800,
          protein: Math.round(todayProtein),
          proteinGoal: user?.dailyProteinGoal || 150,
          water: parseFloat(todayWater.toFixed(1)),
          waterGoal: user?.dailyWaterGoal || 3,
          habitsCompleted: completedHabits,
          habitsTotal: totalHabits,
          habitRate,
          hasWorkedOut: workoutSessions.length > 0,
          sleepHours: sleepLogs ? parseFloat((sleepLogs.durationMinutes / 60).toFixed(1)) : null,
          currentWeight: user?.currentWeight,
          targetWeight: user?.targetWeight,
          weightRemaining: user?.currentWeight && user?.targetWeight
            ? parseFloat((user.targetWeight - user.currentWeight).toFixed(1))
            : null,
        },
        habits: todayHabits.map((h) => ({
          id: h.id,
          name: h.name,
          icon: h.icon,
          color: h.color,
          category: h.category,
          completed: h.logs.length > 0 && h.logs[0].completed,
          logId: h.logs[0]?.id,
        })),
        weightHistory: weightLogs.map((w) => ({ date: w.date, weight: w.weight })).reverse(),
        streaks,
        recentAchievements: userAchievements,
        motivationalQuote: todayQuote,
        upcomingTasks: tasks.slice(0, 5),
        gamification: {
          xp: user?.xp || 0,
          level: user?.level || 1,
          lifePoints: user?.lifePoints || 0,
          nextLevelXp,
          progressPercent: Math.min(100, ((user?.xp || 0) / nextLevelXp) * 100)
        },
        todaysMission: {
          items: missionItems,
          progress: missionProgress,
          total: missionItems.length
        },
        aiCoach: {
          message: aiCoachMessage
        }
      },
    });
  } catch (e) { next(e); }
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

// ─── GET EXPENSES ─────────────────────────────────────────────────────────────
export const getExpenses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { month } = req.query; // optional 'YYYY-MM' format
    
    let dateFilter = {};
    if (month && typeof month === 'string') {
      const date = new Date(`${month}-01T00:00:00Z`);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate,
        }
      };
    }

    const expenses = await prisma.expense.findMany({
      where: { userId, ...dateFilter },
      orderBy: { date: 'desc' }
    });

    // Compute totals
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Group by category
    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        expenses,
        summary: {
          totalAmount,
          byCategory
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADD EXPENSE ──────────────────────────────────────────────────────────────
export const addExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { amount, category, description, date } = req.body;

    if (amount == null || !category || !description) {
      return res.status(400).json({ success: false, message: 'Amount, category, and description are required' });
    }

    const expense = await prisma.expense.create({
      data: {
        userId,
        amount: Number(amount),
        category,
        description,
        date: date ? new Date(date) : new Date()
      }
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE EXPENSE ───────────────────────────────────────────────────────────
export const deleteExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;

    // Verify ownership
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    if (expense.userId !== userId) return res.status(403).json({ success: false, message: 'Forbidden' });

    await prisma.expense.delete({ where: { id } });

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};

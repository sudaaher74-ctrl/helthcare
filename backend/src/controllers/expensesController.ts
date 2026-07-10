import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { parseSms } from '../sms/parseSms';
import { categorizeExpense } from '../ai/expenseCategorizer';

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

// ─── SMS AUTO-IMPORT ──────────────────────────────────────────────────────────

// Parse + categorize a single SMS and (if it is a spend) create an expense,
// skipping non-transactions, credits, and already-imported messages.
async function ingestOne(userId: string, message: string, receivedAt?: string) {
  const parsed = parseSms(message, receivedAt);

  if (!parsed.isTransaction) {
    return { status: 'skipped' as const, reason: 'Not a transaction SMS', parsed };
  }
  if (parsed.direction === 'CREDIT') {
    return { status: 'skipped' as const, reason: 'Money received (not an expense)', parsed };
  }

  const existing = await prisma.expense.findFirst({ where: { userId, smsRef: parsed.smsRef } });
  if (existing) {
    return { status: 'duplicate' as const, reason: 'Already imported', expense: existing, parsed };
  }

  const category = await categorizeExpense(parsed.merchant, message);
  const expense = await prisma.expense.create({
    data: {
      userId,
      amount: parsed.amount,
      category: category as any,
      description: parsed.merchant ? `Paid to ${parsed.merchant}` : 'UPI / card payment',
      date: receivedAt ? new Date(receivedAt) : new Date(),
      source: 'SMS',
      merchant: parsed.merchant,
      smsRef: parsed.smsRef,
    },
  });

  return { status: 'imported' as const, expense, parsed };
}

// POST /api/expenses/sms/preview — parse only, no write (used by the UI preview).
export const previewSms = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message, receivedAt } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'message is required' });

    const parsed = parseSms(message, receivedAt);
    const category = parsed.isTransaction ? await categorizeExpense(parsed.merchant, message) : null;
    res.json({ success: true, data: { ...parsed, category } });
  } catch (error) {
    next(error);
  }
};

// POST /api/expenses/sms/ingest — ingest one SMS (webhook target for an
// Android SMS-forwarder / Tasker / MacroDroid, or the manual paste box).
export const ingestSms = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { message, receivedAt } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'message is required' });

    const result = await ingestOne(userId, message, receivedAt);
    res.status(result.status === 'imported' ? 201 : 200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// POST /api/expenses/sms/batch — ingest many at once { messages: [{message, receivedAt}] }.
export const ingestSmsBatch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'messages array is required' });
    }

    const results = [];
    for (const m of messages) {
      const msg = typeof m === 'string' ? m : m?.message;
      const receivedAt = typeof m === 'string' ? undefined : m?.receivedAt;
      if (!msg) continue;
      results.push(await ingestOne(userId, msg, receivedAt));
    }

    const summary = {
      imported: results.filter((r) => r.status === 'imported').length,
      duplicates: results.filter((r) => r.status === 'duplicate').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
    };
    res.json({ success: true, data: { summary, results } });
  } catch (error) {
    next(error);
  }
};
